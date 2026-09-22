# Frontend Web

## Papel do frontend

O frontend é a camada usada pela equipe da academia. Ele apresenta as informações, recebe as ações do usuário, chama a API e mostra os resultados sem concentrar as regras de segurança do sistema.

**Tecnologias:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Axios, React Hook Form, Zod, TanStack Query, Recharts e Lucide React.

- Código: `apps/web/src`
- Aplicação: `http://localhost:3001`

## Ordem de funcionamento

1. O Next carrega o layout raiz e o `AuthProvider`.
2. `app/page.tsx` verifica se existe uma sessão.
3. Sem sessão, o usuário vai para `/login`; com sessão, vai para o dashboard.
4. O login valida email e senha e chama `authService`.
5. O token fica disponível no contexto e no `localStorage`.
6. O layout autenticado monta o `Sidebar`, o `Header` e a página escolhida.
7. A página chama o service do seu módulo.
8. `lib/api.ts` adiciona o JWT e envia a requisição para a API.
9. A resposta atualiza tabela, cards, gráficos ou mensagens da tela.

## Organização das pastas

```text
apps/web/src/
├── app/          # Rotas, layouts e páginas
├── components/   # Componentes de layout, UI e modais
├── contexts/     # Estado global, como autenticação
├── hooks/        # useAuth, useRole e hooks auxiliares
├── lib/          # Axios e funções utilitárias
├── services/     # Chamadas separadas por módulo da API
└── types/        # Tipos compartilhados do frontend
```

## Autenticação e acesso

O `AuthProvider` mantém usuário, token, carregamento, login e logout. O `useAuth()` permite acessar esses dados nos componentes.

- `useRole()` controla menus e ações por perfil.
- O Axios envia `Authorization: Bearer <token>` automaticamente.
- Uma sessão inválida direciona o usuário para `/login`.
- A proteção verdadeira é feita pela API; o frontend apenas orienta a experiência.

## Telas e funções

| Tela | Responsabilidade |
|---|---|
| Dashboard | Exibir KPIs, gráficos e resumos por perfil |
| Alunos | Cadastrar, editar, filtrar e consultar alunos |
| Planos | Criar e manter planos e preços |
| Matrículas | Vincular alunos a planos e cancelar matrículas |
| Financeiro | Consultar cobranças e registrar pagamentos |
| Check-in | Registrar presença e consultar histórico |
| Turmas | Organizar modalidades, horários e inscritos |
| Treinos | Criar fichas e exercícios |
| Avaliações | Registrar medidas e acompanhar evolução |
| Usuários | Administrar usuários, perfis e senhas |
| Auditoria | Consultar ações registradas pela API |
| Relatórios | Gerar arquivos CSV por período |

## Comunicação com a API

`lib/api.ts` mantém uma instância Axios com a URL definida por `NEXT_PUBLIC_API_URL`. Os arquivos em `services/` escondem os detalhes HTTP das páginas, por exemplo:

- `auth.service.ts`: login;
- `students.service.ts`: alunos;
- `finance.service.ts`: cobranças e pagamentos;
- `dashboard.service.ts`: indicadores;
- demais services: seus respectivos módulos.

## Componentes reutilizáveis

- **Sidebar e Header:** navegação, usuário atual e logout.
- **Table e Pagination:** listagens com paginação.
- **Modal e ConfirmModal:** criação, edição e confirmação de ações.
- **Button, FormField e Loading:** controles e estados visuais.
- **useAuth e useRole:** sessão e permissões.

## Fluxo de uma operação

1. A página solicita os dados ao service.
2. A API responde e a página renderiza a lista.
3. O usuário abre um modal e preenche o formulário.
4. O formulário valida os campos.
5. O service envia `POST`, `PATCH` ou `DELETE`.
6. A página recarrega os dados e mostra sucesso ou erro.

## Executar o frontend

No `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

Depois:

```bash
pnpm install
pnpm dev:web
```

Validação:

```bash
pnpm --filter web lint
pnpm build:web
```
start: npm run dev
