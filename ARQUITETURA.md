# ARQUITETURA - ERP GYM v1.0

## 1. Visão Geral

O ERP GYM é um sistema de gestão para academias construído como um **monorepo** com `pnpm` workspaces. O projeto contempla:

- **Backend:** API REST construída em **NestJS 11** com **TypeScript 5**
- **Frontend:** App web em **Next.js 16** com **React 19** e **Tailwind CSS**
- **Banco de dados:** MySQL 8 com modelagem relacional e `tenantId` para multi-tenancy
- **Docker:** composição de serviços para infraestrutura local
- **Multi-tenant:** cada academia é isolada por `tenantId`
- **Autenticação:** JWT com controle de roles e permissões
- **Auditoria:** registros automáticos de ações críticas

## 2. Estrutura do Monorepo

```
erp-gym/
├── apps/
│   ├── api/              # Backend NestJS
│   └── web/              # Frontend Next.js
├── packages/
│   ├── config/           # Configurações compartilhadas
│   ├── shared/           # Tipos e utilitários compartilhados
│   └── ui/               # Componentes UI reutilizáveis
├── docker/               # Docker Compose para infraestrutura local
├── scripts/              # Scripts auxiliares (seed, migração, etc.)
├── package.json          # Scripts de workspace
├── pnpm-workspace.yaml   # Configuração do monorepo
└── tsconfig.json         # Configuração TypeScript global
```

## 3. Backend - API NestJS

### 3.1. Conteúdo

O backend contém os principais módulos de negócio e funcionalidades de infraestrutura:

- `auth/` - autenticação e geração de JWT
- `users/` - gestão de usuários internos da academia
- `students/` - gestão de alunos e seus dados pessoais
- `plans/` - planos de assinatura e valores
- `enrollments/` - matrículas de alunos em planos
- `finance/` - cobranças, pagamentos e resumo financeiro
- `attendance/` - check-in e presença
- `dashboard/` - agregação de indicadores KPIs
- `classes/` - turmas, modalidades e horários
- `workouts/` - fichas de treino e exercícios
- `assessments/` - avaliações físicas
- `audit/` - logs de auditoria de ações críticas

### 3.2. Arquitetura de pastas

```
apps/api/src/
├── app.module.ts
├── main.ts
├── modules/
│   ├── auth/
│   ├── users/
│   ├── students/
│   ├── plans/
│   ├── enrollments/
│   ├── finance/
│   ├── attendance/
│   ├── dashboard/
│   ├── classes/
│   ├── workouts/
│   ├── assessments/
│   └── audit/
└── common/           # utilitários compartilhados, pipes, guards, interceptors
```

### 3.3. Componentes de infraestrutura

- `main.ts` inicializa o servidor, habilita `ValidationPipe` global e configura o Swagger em `/api/docs`
- `app.module.ts` registra `TypeORM`, configurações e módulos de negócio
- `AuditInterceptor` executa auditoria para POST/PATCH/DELETE
- `JwtAuthGuard` e `RolesGuard` cuidam da proteção de rotas
- `TypeORM` modela entidades e aplica soft delete com `deletedAt`

### 3.4. Configuração de banco de dados

O backend utiliza MySQL conectando-se via `TypeORM`.

Pontos importantes:
- todas as entidades relevantes possuem `tenantId`
- soft delete preserva histórico em tabelas como `users`, `students`, `plans`, `enrollments`, `workout_plans`, `assessments`
- índices críticos melhoram consultas por `tenantId`, `email`, `studentId` e `createdAt`

## 4. Frontend - Next.js

### 4.1. Conteúdo

O frontend apresenta:

- página de login e autenticação
- dashboard gerencial com gráficos e KPIs
- módulos de CRUD para alunos, planos, matrículas, finanças, presença, turmas, treinos, avaliações e usuários
- relatórios em CSV
- UI adaptativa e baseada em componentes

### 4.2. Estrutura de pastas

```
apps/web/src/
├── app/               # App Router e rotas da aplicação
│   ├── (auth)/
│   │   └── login/page.tsx
│   └── (dashboard)/
│       ├── dashboard/page.tsx
│       ├── students/page.tsx
│       ├── plans/page.tsx
│       ├── enrollments/page.tsx
│       ├── finance/page.tsx
│       ├── attendance/page.tsx
│       ├── classes/page.tsx
│       ├── workouts/page.tsx
│       ├── assessments/page.tsx
│       ├── audit/page.tsx
│       ├── reports/page.tsx
│       └── users/page.tsx
├── components/
│   ├── layout/
│   ├── modals/
│   └── ui/
├── contexts/          # AuthProvider
├── hooks/             # hooks de permissão e auth
├── lib/               # api.ts e utilitários
├── services/          # chamadas HTTP por domínio
└── types/             # tipos globais TypeScript
```

### 4.3. Fluxo de autenticação

- usuário envia credenciais para `POST /auth/login`
- backend retorna token JWT e dados do usuário
- token é armazenado no `localStorage`
- `AuthProvider` restaura sessão e provê estado global
- `api.ts` injeta o header `Authorization: Bearer <token>` em todas as requisições
- o fluxo de rotas privadas é protegido pelo componente de layout em `(dashboard)`

## 5. Modelo de Dados e MER

### 5.1. Entidades principais

- `Tenant` - representa uma academia com todos os dados isolados
- `User` - usuário interno com perfil e permissões
- `Student` - aluno da academia
- `Plan` - plano de assinatura
- `Enrollment` - matrícula atrelada a aluno e plano
- `Invoice` - cobrança vinculada a aluno
- `Payment` - pagamento realizado para cobrança
- `Attendance` - registro de presença
- `WorkoutPlan` - ficha de treino do aluno
- `Assessment` - avaliação física do aluno
- `ClassGroup` - turma ou modalidade de aula
- `Modality` - modalidade de atividade
- `AuditLog` - log de operação auditada

### 5.2. Relações principais

- `Tenant` 1:N `User`, `Student`, `Plan`, `Enrollment`, `Attendance`, `Invoice`, `Payment`, `WorkoutPlan`, `Assessment`, `ClassGroup`, `Modality`, `AuditLog`
- `Student` 1:N `Enrollment`, `Attendance`, `WorkoutPlan`, `Assessment`, `Invoice`
- `Plan` 1:N `Enrollment`
- `Enrollment` N:1 `Student`, `Plan`
- `Invoice` 1:N `Payment`
- `ClassGroup` N:1 `Modality`, N:1 `User` (professor)
- `WorkoutPlan` N:1 `Student`, N:1 `User` (professor)

## 6. Fluxos de Negócio

### 6.1. Login e autorização

1. Usuário acessa `/login`
2. Envia `email` e `password`
3. API valida credenciais
4. Retorna JWT + dados do usuário
5. Frontend armazena token e redireciona para `/dashboard`
6. Rotas são carregadas conforme `role`

### 6.2. Criação de matrícula

1. Frontend chama `POST /enrollments`
2. Backend valida `studentId` e `planId`
3. Verifica se o aluno e o plano pertencem ao mesmo `tenantId`
4. Calcula `endDate` com base em `durationDays`
5. Persiste matrícula e retorna registro

### 6.3. Pagamento e cobrança

1. Usuário cria cobrança em `POST /finance/invoices`
2. Pagamento é registrado em `POST /finance/payments`
3. Backend calcula saldo devedor e atualiza status da cobrança
4. Se pagamento quita o valor, `status` passa para `paid`

### 6.4. Auditoria

- `AuditInterceptor` registra ações críticas em rotas POST/PATCH/DELETE
- logger salva rota, usuário, payload sanitizado, status HTTP, tempo e IP
- logs podem ser consultados via `GET /audit/logs`

## 7. Deployment e Docker

### 7.1. Execução local

- `pnpm --filter api dev` - roda backend em `http://localhost:3000`
- `pnpm --filter web dev` - roda frontend em `http://localhost:3001`

### 7.2. Docker local

O `docker/docker-compose.yml` sobe MySQL local:

- `docker compose up -d`
- `docker compose down`

MySQL fica disponível em `localhost:3307`.

### 7.3. Build de produção

- Backend: `pnpm --filter api build`
- Frontend: `pnpm --filter web build`
- API de produção: `pnpm --filter api start:prod`

## 8. Segurança

### 8.1. Autenticação e autorização

- JWT com `JWT_SECRET`
- expiração de token curta
- proteção de rotas com `JwtAuthGuard` e `RolesGuard`

### 8.2. Proteção de dados

- senhas gravadas com `bcrypt`
- dados sensíveis não são retornados ao cliente
- uso de `ValidationPipe` global para sanitização
- CORS restrito ao frontend confiável

### 8.3. Boas práticas

- não versionar variáveis sensíveis em `.env`
- usar secrets manager em produção
- avaliar uso de `helmet` e rate limiting no backend

## 9. Documentação Relacionada

- `README.md` - visão geral e instruções de uso
- `DOCUMENTATION_API.md` - referenciação de endpoints e API
- `DOCUMENTATION_WEB.md` - arquitetura e fluxo do frontend
