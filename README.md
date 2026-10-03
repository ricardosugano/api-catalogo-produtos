# 🛒 API Catálogo de Produtos

API RESTful para gerenciamento de um catálogo de produtos, desenvolvida na disciplina de **Laboratório de Desenvolvimento Web (LDW)** e evoluída na **AT1 de Integração e Entrega Contínua (IEC)** com Docker, Docker Compose, ESLint, Prettier, Husky e GitHub Actions.

Permite cadastrar, listar (com filtros), consultar, atualizar e remover produtos, controlando preço e estoque, com persistência em **PostgreSQL** e documentação interativa em **Swagger UI**.

## Tecnologias

- Node.js + Express 5 + TypeScript (modo `strict`)
- Sequelize ORM + PostgreSQL (local via Docker ou Supabase)
- sequelize-cli (migrations)
- Swagger UI (`swagger-ui-express` + `swagger.json` OpenAPI 3)
- CORS, dotenv, pnpm
- Docker (Dockerfile multi-stage) e Docker Compose
- ESLint + Prettier (qualidade e formatação)
- Husky (hook de `pre-commit`)
- GitHub Actions (integração contínua)

## Entidade `Produto`

| Campo                     | Tipo (Sequelize) | Obrigatório | Descrição                                 |
| ------------------------- | ---------------- | ----------- | ----------------------------------------- |
| `id`                      | INTEGER (PK)     | automático  | Identificador                             |
| `nome`                    | STRING(120)      | sim         | Nome do produto                           |
| `descricao`               | TEXT             | não         | Descrição detalhada                       |
| `categoria`               | STRING(50)       | sim         | Categoria (salva em minúsculas)           |
| `preco`                   | DECIMAL(10,2)    | sim         | Preço em reais                            |
| `estoque`                 | INTEGER          | não         | Quantidade em estoque (padrão `0`)        |
| `ativo`                   | BOOLEAN          | não         | Produto ativo no catálogo (padrão `true`) |
| `createdAt` / `updatedAt` | DATE             | automático  | Auditoria                                 |

## Estrutura do projeto (MVC)

```
src/
├── config/        # database.ts (Sequelize + SSL condicional), config.cjs (sequelize-cli), swagger.ts
├── controllers/   # ProdutoController.ts (lógica de negócio do CRUD)
├── docs/          # swagger.json (especificação OpenAPI)
├── middlewares/   # errorHandler.ts (404 de rota e erros globais)
├── migrations/    # criação da tabela produtos
├── models/        # Produto.ts (model tipado + interface ProdutoAttributes)
├── routes/        # index.ts e produtoRoutes.ts (express.Router)
├── utils/         # validação de body/params e utilitários de erro
├── app.ts         # configuração do Express (CORS, JSON, rotas, Swagger)
└── server.ts      # ponto de entrada: conecta no banco e sobe o servidor HTTP
```

## Pré-requisitos

- Node.js 20 ou superior
- pnpm (`npm install -g pnpm`)
- Docker (para o PostgreSQL local) **ou** um projeto no Supabase

## Como rodar

### 1. Instalar as dependências

```bash
pnpm install
```

### 2. Configurar as variáveis de ambiente

```bash
cp .env.example .env
```

- **PostgreSQL local:** os valores padrão do `.env.example` já funcionam com o Docker Compose (`DB_SSL=false`).
- **Supabase:** troque `DB_HOST`, `DB_USER` e `DB_PASSWORD` pelos dados do painel do Supabase (_Project Settings → Database_) e use `DB_SSL=true`.

### 3. Subir o banco de dados (somente para uso local)

```bash
docker compose up -d db
```

### 4. Criar a tabela (migrations)

```bash
pnpm db:migrate
```

> Alternativa: defina `DB_SYNC=true` no `.env` para criar a tabela automaticamente com `sequelize.sync()` ao iniciar o servidor.

### 5. Iniciar o servidor

```bash
pnpm dev
```

Acesse:

- **Swagger UI:** http://localhost:3000/api-docs
- **Health check:** http://localhost:3000/api/health

### Rodando tudo com Docker

```bash
cp .env.example .env
docker compose up -d --build
docker compose ps
```

Sobe o PostgreSQL (com volume `pgdata` para persistir os dados) e a API. A API só inicia depois que o banco passa no healthcheck, aplica as migrations automaticamente e fica disponível em http://localhost:3000.

Teste rápido:

```bash
curl http://localhost:3000/api/health
curl -X POST http://localhost:3000/api/produtos -H "Content-Type: application/json" -d '{"nome":"Fone Bluetooth","categoria":"eletronicos","preco":249.9,"estoque":35}'
curl http://localhost:3000/api/produtos
```

Comandos úteis: `docker compose logs -f api` (logs da API), `docker compose down` (para os contêineres, mantendo os dados) e `docker compose down -v` (apaga também o volume do banco).

> Se já houver um PostgreSQL rodando na porta 5432 da sua máquina, defina `DB_PORT_HOST=5433` no `.env`.

## Endpoints

Base URL: `http://localhost:3000/api`

| Método | Rota            | Descrição                             | Sucesso |
| ------ | --------------- | ------------------------------------- | ------- |
| GET    | `/produtos`     | Lista os produtos (filtros opcionais) | 200     |
| GET    | `/produtos/:id` | Busca um produto por ID               | 200     |
| POST   | `/produtos`     | Cadastra um novo produto              | 201     |
| PUT    | `/produtos/:id` | Atualiza um produto (parcial)         | 200     |
| DELETE | `/produtos/:id` | Remove um produto                     | 200     |

**Filtros da listagem:** `GET /produtos?categoria=eletronicos&ativo=true`

**Erros:** `400` (dados, filtros ou ID inválidos, JSON malformado), `404` (produto ou rota não encontrados), `500` (falha interna ou no banco).

### Exemplo de corpo (POST)

```json
{
  "nome": "Fone de Ouvido Bluetooth",
  "descricao": "Fone sem fio com cancelamento de ruído e bateria de 30h.",
  "categoria": "eletronicos",
  "preco": 249.9,
  "estoque": 35
}
```

O arquivo `requests/requests.http` tem exemplos de todas as requisições (extensão REST Client do VS Code).

## Scripts

| Comando                | Descrição                                       |
| ---------------------- | ----------------------------------------------- |
| `pnpm dev`             | Servidor em modo desenvolvimento (watch)        |
| `pnpm build`           | Compila o TypeScript para `dist/`               |
| `pnpm start`           | Roda a versão compilada (`dist/server.js`)      |
| `pnpm lint`            | Análise estática com ESLint                     |
| `pnpm lint:fix`        | Corrige automaticamente o que o ESLint permitir |
| `pnpm format`          | Formata o código com Prettier                   |
| `pnpm format:check`    | Verifica se o código está formatado             |
| `pnpm typecheck`       | Checagem estrita de tipos (`tsc --noEmit`)      |
| `pnpm db:migrate`      | Executa as migrations                           |
| `pnpm db:migrate:undo` | Desfaz a última migration                       |

## Qualidade de código e CI

**Husky (pre-commit):** ao rodar `pnpm install`, o Husky é ativado automaticamente. Antes de cada commit, o hook em `.husky/pre-commit` executa `pnpm lint`, `pnpm format:check` e `pnpm typecheck`. Se qualquer um falhar, o commit é bloqueado.

**GitHub Actions:** o workflow `.github/workflows/ci.yml` roda a cada `push` (e em pull requests) com os passos: checkout, configuração do pnpm e do Node.js 22, instalação das dependências, lint, verificação de formatação, checagem de tipos e build.

## Docker

O `Dockerfile` usa build multi-stage: um estágio instala todas as dependências e compila o TypeScript, outro instala somente as dependências de produção, e a imagem final contém apenas `dist/`, as dependências de produção e os arquivos das migrations, rodando com o usuário `node` (sem root). O `.dockerignore` exclui `node_modules`, `.git`, `.env`, `dist` e arquivos temporários.
