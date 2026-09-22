# DEPLOYMENT - ERP GYM v1.0

## 1. Visão Geral

Este documento descreve os passos recomendados para realizar o deployment do ERP GYM em ambientes de desenvolvimento, homologação e produção.

O projeto é composto por:
- `apps/api` — backend NestJS
- `apps/web` — frontend Next.js
- `docker/docker-compose.yml` — infraestrutura local de banco de dados

## 2. Variáveis de Ambiente

### Backend (`apps/api`)

Crie um arquivo `.env` com as seguintes variáveis:

```env
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USERNAME=root
DATABASE_PASSWORD=senha
DATABASE_NAME=erp_gym
JWT_SECRET=sua-chave-secreta-super-segura
JWT_EXPIRATION=24h
PORT=3000
NODE_ENV=production
CORS_ORIGIN=http://localhost:3001
```

### Frontend (`apps/web`)

Crie um arquivo `.env.local` com a URL do backend:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

> Em produção, substitua `http://localhost:3000/api` pela URL pública segura do backend.

## 3. Preparação do Ambiente de Produção

### Dependências

No diretório raiz do monorepo:

```bash
pnpm install
```

### Banco de Dados

Certifique-se de que o banco MySQL está disponível e configurado.
Se você estiver usando Docker localmente, execute:

```bash
docker compose -f docker/docker-compose.yml up -d
```

### Script de Seed (opcional)

Caso exista seed para dados iniciais, execute:

```bash
pnpm seed
```

## 4. Build do Backend

No diretório raiz do repositório:

```bash
pnpm --filter api build
```

Isso irá compilar o NestJS e gerar os artefatos em `apps/api/dist`.

### Executar em produção

```bash
pnpm --filter api start:prod
```

A API ficará disponível em `http://localhost:3000`.

## 5. Build do Frontend

No diretório raiz do repositório:

```bash
pnpm --filter web build
```

### Executar em produção

```bash
pnpm --filter web start
```

O frontend ficará disponível em `http://localhost:3000` por padrão, dependendo da configuração do Next.js.

## 6. Deployment com Docker

### Docker Compose local

O arquivo `docker/docker-compose.yml` levanta apenas o MySQL:

```bash
docker compose -f docker/docker-compose.yml up -d
```

### Recomendações de containerização da aplicação

#### Backend Dockerfile sugerido

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml .
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
WORKDIR /app/apps/api
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "--filter", "api", "start:prod"]
```

#### Frontend Dockerfile sugerido

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml .
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
WORKDIR /app/apps/web
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "--filter", "web", "start"]
```

### Orquestração recomendada

Para ambientes de produção, considere usar:
- Docker Compose avançado com backend, frontend e banco
- Kubernetes com Deployments e Services
- AWS ECS/EKS, Azure Container Apps ou Google Cloud Run

## 7. Configurações de Produção

### Backend

Recomendações importantes:
- `NODE_ENV=production`
- `JWT_SECRET` forte e gerenciado fora do código
- `DATABASE_PASSWORD` armazenado em secret manager
- `CORS_ORIGIN` definido apenas para o domínio do frontend
- `PORT` configurado conforme a plataforma

### Frontend

- `NEXT_PUBLIC_API_URL` deve apontar para a API segura HTTPS
- `NODE_ENV=production` para otimizar a build

## 8. Monitoramento e Logs

### Backend

- Verifique logs de inicialização no console
- Registre erros e exceções
- Monitore uso de memória e CPU se disponível

### Frontend

- Monitore erros de frontend com ferramentas como Sentry ou LogRocket
- Verifique se as requisições ao backend retornam 200/401/403 adequados

## 9. Checklists de Deployment

### Pré-deployment
- [ ] Dependências instaladas
- [ ] Variáveis de ambiente definidas
- [ ] Banco de dados acessível
- [ ] Build do backend concluída
- [ ] Build do frontend concluída
- [ ] URLs de API e frontend configuradas corretamente
- [ ] Segredos não versionados

### Pós-deployment
- [ ] Aplicação autenticando usuários
- [ ] Escrita e leitura de dados funcionando
- [ ] Rotas protegidas funcionando por role
- [ ] Logs de auditoria gravando ações
- [ ] Relatórios exportando CSV corretamente
- [ ] Monitoramento ativo

## 10. Nota Final

Este documento oferece uma base para deployment local e em produção. Ajuste os passos de acordo com a plataforma de nuvem ou orquestração escolhida.
