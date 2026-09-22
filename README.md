# ERP GYM

O ERP GYM é um sistema de gestão para academias. Ele centraliza o cadastro de alunos, a operação da academia e o acompanhamento financeiro em uma aplicação web conectada a uma API.

## Funcionalidades

- Login com JWT e permissões por perfil.
- Separação dos dados por academia usando `tenantId`.
- Cadastro de alunos e usuários internos.
- Criação de planos e matrículas.
- Controle de cobranças e pagamentos.
- Registro de presença e check-in.
- Gestão de modalidades, turmas e horários.
- Criação de fichas de treino e exercícios.
- Registro de avaliações físicas e evolução.
- Dashboard com indicadores da academia.
- Auditoria de operações importantes.
- Relatórios em CSV.

## Estrutura do projeto

```text
erp-gym/
├── apps/api/       # API NestJS e regras de negócio
├── apps/web/       # Interface Next.js
├── packages/       # Código compartilhado
├── docker/         # Configuração do banco local
├── scripts/        # Seeds e tarefas auxiliares
└── docs/           # Materiais complementares
```

O projeto usa pnpm workspaces. A API atende na porta `3000` e o frontend na porta `3001`.

## Funcionamento geral

1. O usuário acessa o frontend e faz login.
2. A API valida as credenciais e retorna um JWT.
3. O frontend envia o token nas próximas requisições.
4. A API valida autenticação, perfil, dados e academia do usuário.
5. O service do backend executa a regra de negócio.
6. O TypeORM consulta ou altera o MySQL.
7. A resposta volta para o frontend e atualiza a tela.
8. Ações críticas são registradas no módulo de auditoria.

## Tecnologias

**Backend:** NestJS 11, TypeScript, TypeORM, MySQL, Passport, JWT, bcrypt e Swagger.

**Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Axios, React Hook Form, Zod, TanStack Query, Recharts e Lucide React.

## Pré-requisitos

- Node.js;
- pnpm;
- Docker e Docker Compose;
- MySQL, preferencialmente pelo compose do projeto.

## Instalação

```bash
pnpm install
docker compose -f docker/docker-compose.yml up -d
```

Configure o backend no `.env`:

```env
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USERNAME=root
DATABASE_PASSWORD=senha
DATABASE_NAME=erp_gym
JWT_SECRET=chave-secreta
JWT_EXPIRATION=24h
PORT=3000
CORS_ORIGIN=http://localhost:3001
```

Configure o frontend no `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Executar

```bash
pnpm dev:api
pnpm dev:web
```

Endereços:

- Web: `http://localhost:3001`
- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/api/docs`

## Comandos úteis

```bash
pnpm build:api
pnpm build:web
pnpm lint
pnpm test
pnpm seed
```

## Documentação

- [DOCUMENTATION_API.md](DOCUMENTATION_API.md): funcionamento do backend e seus módulos.
- [DOCUMENTATION_WEB.md](DOCUMENTATION_WEB.md): funcionamento do frontend e suas telas.
- [ARQUITETURA.md](ARQUITETURA.md): visão arquitetural.
- [DEPLOYMENT.md](DEPLOYMENT.md): implantação.
