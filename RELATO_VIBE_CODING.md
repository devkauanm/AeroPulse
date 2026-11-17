# Relato do processo de vibe coding

O desenvolvimento foi feito no VS Code utilizando IA como apoio para estruturar componentes e resolver travas técnicas, com o código existente do projeto como contexto. Validei cada etapa rodando a aplicação no navegador e verificando integridade com `npm run lint` e `npm run build`.

**Principais prompts e ajustes ao longo do desenvolvimento:**

- *"Integre o modelo 3D à vitrine e permita girá-lo por arraste. Ajuste para que o mesmo não fique grande e cortado."*

**O que pegou na prática e como foi resolvido:**

- **Enquadramento e ajustes no Three.js:** O primeiro modelo 3D apareceu grande demais e cortado no quadro, exigindo reduções sucessivas de escala até chegar em `2.8`. Na parte técnica do build, precisei adicionar `@types/three` para corrigir erros de tipagem e trocar `THREE.Clock` (que estava depreciado) por `THREE.Timer` passando o timestamp esperado.
- **Liberação do formulário para auditoria:** Como o navegador bloqueava nativamente envios com campos vazios ou e-mail incompleto, os testes de erro nem chegavam no webhook. Adicionei `noValidate` no `<form>` e removi os atributos `required` para que o n8n recebesse esses payloads e registrasse o status `inválido` no log do Supabase.
- **Ajustes no fluxo do n8n:** Durante os testes de integração, a convergência dos diferentes caminhos do `Switch` (CRM, nutrição, erro e rejeitado) para o nó final do Supabase gerava `undefined` em alguns campos porque nós intermediários sobrescreviam o payload. Resolvi garantindo que os nós `Set` mantivessem os campos originais e ajustando o mapeamento final com `.first().json`. Também incluí um fallback em JavaScript no nó de classificação para não depender exclusivamente da resposta da API do Gemini.

**O que ficou de melhoria:**

O arquivo GLB e as bibliotecas 3D deixaram o bundle final acima de 500 kB no build. A otimização do modelo e o carregamento sob demanda (*lazy loading*) da vitrine 3D ficaram mapeados como próximos passos, junto com a substituição do login simples em `sessionStorage` por autenticação real no Supabase.