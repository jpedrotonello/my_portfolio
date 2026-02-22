# Portfolio AI Chatbot - TODO

## Backend
- [x] Criar endpoint `/api/chat` com integração OpenAI via tRPC
- [x] Ler data.json e usar como contexto do sistema
- [x] Suporte a respostas da OpenAI (non-streaming via tRPC mutation)
- [x] Variável de ambiente OPENAI_API_KEY segura no servidor
- [x] Prompt de sistema com dados completos do portfólio

## Frontend - Portfolio
- [x] Copiar data.json do projeto anterior para client/public
- [x] Página principal com cabeçalho (foto, nome, título, LinkedIn)
- [x] Seção Portfolio com cards expansíveis (dropdown)
- [x] Seção Resume com About Me, experiências expansíveis
- [x] Skills/tecnologias como tags (Badge)
- [x] Modo escuro como padrão com botão para alternar
- [x] Rodapé com LinkedIn e localização

## Frontend - Chatbot Widget
- [x] Widget flutuante no canto inferior direito
- [x] Botão para abrir/fechar o chat
- [x] Interface de chat com histórico de mensagens
- [x] Campo de entrada com envio por Enter ou botão
- [x] Sugestões de perguntas iniciais
- [x] Responsivo para mobile

## Testes
- [x] Teste de configuração da OPENAI_API_KEY
- [x] Teste do chat router registrado
- [x] Teste de validação de schema
- [x] Teste de integração com OpenAI (quota ou sucesso)
- [x] Teste de logout (auth)

## Deploy
- [ ] Instruções de deploy para Render (backend)
- [ ] Instruções para GitHub Pages (frontend estático - não aplicável, app tem backend)

## Melhorias do Chatbot (v2)
- [x] Substituir ícone de robô pela foto do João no chat
- [x] Botão flutuante com mais destaque: texto "Ask about João" + ícone
- [x] Abertura automática do chat no desktop (tela > 768px)
- [x] Botão no header apenas em desktop, sem destaque em mobile
- [x] Engenharia de prompt "puxar saco" - IA entusiasmada e elogiosa
- [x] Rate limiting no backend para proteger a chave OpenAI

## Currículo v2
- [ ] Adicionar anos de experiência no resumo do About Me (8 anos em tech, 6 em dados)
- [ ] Adicionar seção de educação no data.json e no Resume
- [ ] Adicionar seção de key achievements no data.json e no Resume

## Currículo v2
- [x] Adicionar anos de experiência no resumo do About Me (8 anos em tech, 6 em dados)
- [x] Adicionar seção de educação no data.json e no Resume
- [x] Adicionar seção de key achievements no data.json e no Resume (4 achievements)

## Chatbot v3
- [x] Corrigir renderização de Markdown nas respostas do chatbot (negrito, quebras de linha, listas)
- [x] Mudar tema padrão para claro (light mode)

## Fix v1
- [x] Corrigir labels das seções de detalhes no portfolio para Title Case (Context & Problem, Constraints & Risks, etc.)

## Portfolio Images
- [x] Upload imagens para S3 e adicionar campo image no data.json
- [x] Exibir miniatura à esquerda no card recolhido
- [x] Exibir imagem grande dentro do dropdown expandido

## Fix v2 - Deploy ZIP
- [x] Corrigir bug de toggle de miniatura/imagem nos cards do portfolio no index.html standalone

## Redesign v1 - Chatbot como Hero
- [x] Mover chatbot para seção hero acima do portfolio (InlineChat component)
- [x] Remover widget flutuante (ChatWidget não está mais em uso)
- [x] Remover botão "Ask about João" do header
- [x] Adicionar testes de validação de schema e limite de mensagens

## Layout v2 - Reordenação e Contato
- [ ] Mover hero (foto/nome/cargo/localização/contato) para antes do InlineChat
- [ ] Mover InlineChat para depois do hero e antes do About Me
- [ ] Adicionar email e telefone na seção de contato do hero
- [ ] Atualizar data.json com campos email e phone

## Layout v2 - Reordenação, Contato e Chat no Resume
- [x] Adicionar email e telefone no data.json (personalInfo)
- [x] Reordenar Portfolio: hero (foto/nome/contato) → InlineChat → About Me → Projects
- [x] Adicionar email e telefone no hero section
- [x] Adicionar InlineChat no topo da aba Resume (após hero info)

## Fix v3 - Miniaturas do Portfolio
- [x] Aumentar tamanho das miniaturas nos cards do portfolio (muito cortadas no desktop)
- [x] Usar object-contain em vez de object-cover para não cortar as imagens

## Fix v4 - Imagem expandida no dropdown do Portfolio
- [x] Trocar object-cover por object-contain na imagem expandida do dropdown
- [x] Remover max-height restritivo que causava corte da imagem
