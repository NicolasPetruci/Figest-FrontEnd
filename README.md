# Figest-FrontEnd

Este é o microserviço de Frontend da aplicação Figest. Ele é responsável pela interface de usuário (Dashboard) do sistema, construído com Next.js (App Router), Chakra UI, e TypeScript.

## Funcionalidades

- **Dashboard:** Interface principal para visualização de dados.
- **Gestão:** Sistema de gestão de transações e finanças.
- **Chakra UI:** Design system customizado para a identidade visual do Figest.
- **i18n:** Suporte a múltiplos idiomas com `next-intl`.

## Tecnologias

- Next.js 15 (App Router)
- React
- TypeScript
- Chakra UI
- Zustand (Gerenciamento de Estado)
- Framer Motion & Recharts
- Docker

## Como Rodar

### Pré-requisitos
- Node.js (v20+)
- NPM ou Yarn

### Desenvolvimento

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Crie um arquivo `.env.local` na raiz do projeto (use o `.env.local.example` como base):
   ```bash
   cp .env.local.example .env.local
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

4. Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

### Produção (Docker)

Para construir e rodar a imagem Docker:

```bash
docker build -t figest-frontend .
docker run -p 3000:3000 figest-frontend
```

## Estrutura do Projeto

- `/src/app`: Rotas e layouts do Next.js (App Router)
- `/src/components`: Componentes reutilizáveis (UI, layout, gráficos, etc)
- `/src/hooks`: Custom React hooks
- `/src/lib`: Utilitários e configurações
- `/src/stores`: Gerenciamento de estado global com Zustand
- `/src/theme`: Configuração e overrides do tema Chakra UI
- `/src/locales`: Dicionários de tradução (i18n)
