# AeroPulse — Documentação Técnica

## Visão geral

Aplicação de captação e triagem de leads. A interface pública coleta os dados de contato e envia para um webhook no n8n, que faz a validação, checa duplicidade, classifica o perfil com IA e grava o resultado no Supabase. O painel administrativo consulta essa base para exibir os registros e métricas.

## Fluxo da aplicação

1. **Captação (`/`):** O usuário preenche nome, e-mail, telefone, empresa e cargo. O formulário foi configurado com `noValidate` para permitir o envio de campos vazios ou e-mails mal formatados, garantindo que os cenários de erro sejam capturados e auditados no log.
2. **Disparo:** O front-end envia o JSON via `POST` para `VITE_N8N_WEBHOOK_URL`.
3. **Processamento no n8n:**
   - **Validação e Duplicidade:** Checa campos obrigatórios e consulta no Supabase se o e-mail já existe.
   - **Classificação:** Leads válidos passam pelo Google Gemini para serem rotulados como `quente`, `morno` ou `frio`. Caso a IA falhe ou retorne algo fora do padrão, um nó de código em JavaScript assume como fallback usando regras de Regex.
   - **Roteamento:** Leads quentes e mornos são enviados ao CRM via HTTP Request (com 3 tentativas em caso de falha) e disparam uma notificação por e-mail. Leads frios seguem para nutrição.
   - **Persistência:** Todos os fluxos convergem para gravar o status final (`enviado ao CRM`, `nutrição`, `inválido`, `duplicado` ou `erro`) na tabela `leads` do Supabase.
4. **Painel (`/login` e `/painel`):** Acesso restrito que lê os últimos 500 registros do Supabase, aplica filtros por classificação/status, busca textual e resume os indicadores.

## Critérios de classificação

A regra de negócio configurada no workflow avalia principalmente **cargo** e **segmento da empresa**:

- **Quente:** Cargos de alta decisão (`CEO`, `Diretor`, `Fundador`, `Sócio`, `Presidente`, `VP`, `Head`) ou empresas de setores com alta aderência (agro, engenharia, mineração, energia, construção, logística, segurança e tecnologia).
- **Morno:** Cargos de média gestão ou liderança técnica (`Gerente`, `Coordenador`, `Supervisor`, `Especialista`, `Engenheiro`).
- **Frio:** Cargos operacionais, estudantes, estagiários ou áreas sem fit imediato.
- **N/A:** Registros barrados na validação de campos ou duplicidade.

## Configuração e testes

### Preparação

Requisitos: Node.js 22.12+, projeto no Supabase com a tabela `leads` e o workflow importado/ativo no n8n.

```powershell
npm install
Copy-Item .env.example .env