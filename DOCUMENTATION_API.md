# Backend e API

## Papel do backend

O backend é a camada que protege e organiza os dados do ERP GYM. Ele recebe chamadas do frontend, valida as entradas, aplica as regras da academia, conversa com o MySQL e retorna o resultado.

**Tecnologias:** NestJS 11, TypeScript, TypeORM, MySQL, JWT, Passport, bcrypt e Swagger.

- Código: `apps/api/src`
- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/api/docs`

## Ordem de uma requisição

1. `main.ts` inicia a API e configura CORS, validação global e Swagger.
2. O controller identifica a rota e recebe os parâmetros.
3. O DTO valida corpo, query string e parâmetros.
4. O guard confere o JWT e o role exigido pela rota.
5. O service verifica `tenantId` e aplica a regra de negócio.
6. O TypeORM consulta ou grava no MySQL.
7. O interceptor registra a operação quando ela é crítica.
8. A API devolve os dados ou um erro HTTP.

## Partes do backend

Cada módulo em `apps/api/src/modules` representa uma área do sistema:

- **Module:** reúne as dependências do domínio.
- **Controller:** declara endpoints e direciona requisições.
- **Service:** executa regras, validações e operações de dados.
- **DTO:** descreve e valida os dados recebidos.
- **Entity:** representa tabelas e relacionamentos.
- **Guard/Strategy:** protege a rota e identifica o usuário.
- **Interceptor:** executa auditoria sem repetir lógica nos controllers.

O `tenantId` acompanha as operações para impedir que uma academia acesse dados de outra.

## Login e segurança

`POST /auth/login` recebe email e senha. O fluxo valida o usuário, compara a senha com bcrypt e retorna um JWT com `sub`, `email`, `role` e `tenantId`.

Nas demais rotas, o cliente envia:

```http
Authorization: Bearer <token>
```

O token expira em 24 horas. Senhas e segredos não são retornados nem gravados na auditoria.

## Módulos

| Módulo | O que faz |
|---|---|
| Auth | Login e emissão de token |
| Users | Usuários internos, perfis e redefinição de senha |
| Students | Cadastro, status e histórico de alunos |
| Plans | Planos, preços, duração e disponibilidade |
| Enrollments | Matrículas e vínculo entre aluno e plano |
| Finance | Cobranças, pagamentos e indicadores financeiros |
| Attendance | Check-ins e histórico de presença |
| Dashboard | Resumo de alunos, matrículas, presença e finanças |
| Classes | Modalidades, turmas, horários e inscritos |
| Workouts | Fichas de treino e exercícios |
| Assessments | Medidas, IMC e evolução física |
| Audit | Registro de ações críticas |

## Regras mais importantes

- Perfis disponíveis: `super_admin`, `admin`, `receptionist`, `financial` e `teacher`.
- Alunos podem estar como `lead`, `active`, `pending`, `blocked` ou `cancelled`.
- Matrículas só usam alunos e planos válidos; o vencimento considera a duração do plano.
- Pagamentos não podem ultrapassar o saldo da cobrança.
- Apenas alunos ativos podem fazer check-in.
- Turmas respeitam capacidade e não permitem inscrição duplicada.
- Avaliações calculam automaticamente IMC, massa gorda e massa magra.
- Exclusões são normalmente soft delete para preservar histórico.

## Padrão das rotas

Quando aplicável, os módulos seguem o CRUD:

```text
POST   /recurso       criar
GET    /recurso       listar
GET    /recurso/:id   consultar
PATCH  /recurso/:id   atualizar
DELETE /recurso/:id   remover
```

Listagens aceitam filtros e paginação. Os erros usam os status HTTP `400`, `401`, `403`, `404`, `409` e `500`, conforme o problema.

## Executar a API

```bash
pnpm install
docker compose -f docker/docker-compose.yml up -d
pnpm dev:api
```

Testes:

```bash
pnpm --filter api test
pnpm --filter api test:e2e
pnpm --filter api test:cov
```
start: pnpm start:dev
