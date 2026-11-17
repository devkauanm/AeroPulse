# AeroPulse

Aplicação web do case técnico: formulário público de captação, pipeline de automação com IA e painel interno de acompanhamento de leads.

## Entregáveis

- [Documentação do projeto](./DOCUMENTACAO.md)
- [Relato do processo de vibe coding](./RELATO_VIBE_CODING.md)
- [Workflow n8n exportado](./AeroPulse%20—%20Automação%20de%20leads.jsonworkflow.json) *(ajuste o caminho se salvar na raiz)*

## Requisitos

- Node.js 22.12 ou superior
- Projeto Supabase com a tabela `leads`
- Workflow ativo no n8n para processar os envios do formulário

## Executar localmente

```powershell
npm install
Copy-Item .env.example .env