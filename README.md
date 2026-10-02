# 🛒 API Catálogo de Produtos

API RESTful para gerenciamento de um catálogo de produtos, desenvolvida para a atividade **AT1 – Laboratório de Desenvolvimento Web (LDW)**.

Permite cadastrar, listar (com filtros), consultar, atualizar e remover produtos, controlando preço e estoque, com persistência em **PostgreSQL** e documentação interativa em **Swagger UI**.

## Tecnologias

- Node.js + Express 5 + TypeScript (modo `strict`)
- Sequelize ORM + PostgreSQL (local via Docker ou Supabase)
- sequelize-cli (migrations)
- Swagger UI (`swagger-ui-express` + `swagger.json` OpenAPI 3)
- CORS, dotenv, pnpm, Docker Compose

## Entidade `Produto`

| Campo                     | Tipo (Sequelize) | Obrigatório | Descrição                                  |
| ------------------------- | ---------------- | ----------- | ------------------------------------------ |
| `id`                      | INTEGER (PK)     | automático  | Identificador                              |
| `nome`                    | STRING(120)      | sim         | Nome do produto                            |
| `descricao`               | TEXT             | não         | Descrição detalhada                        |
| `categoria`               | STRING(50)       | sim         | Categoria (salva em minúsculas)            |
| `preco`                   | DECIMAL(10,2)    | sim         | Preço em reais                             |
| `estoque`                 | INTEGER          | não         | Quantidade em estoque (padrão `0`)         |
| `ativo`                   | BOOLEAN          | não         | Produto ativo no catálogo (padrão `true`)  |
| `createdAt` / `updatedAt` | DATE             | automático  | Auditoria                                  |

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
- **Supabase:** troque `DB_HOST`, `DB_USER` e `DB_PASSWORD` pelos dados do painel do Supabase (*Project Settings → Database*) e use `DB_SSL=true`.

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
docker compose up --build
```

Sobe o PostgreSQL e a API, roda as migrations e inicia o servidor na porta 3000.

## Endpoints

Base URL: `http://localhost:3000/api`

| Método | Rota            | Descrição                                   | Sucesso |
| ------ | --------------- | ------------------------------------------- | ------- |
| GET    | `/produtos`     | Lista os produtos (filtros opcionais)       | 200     |
| GET    | `/produtos/:id` | Busca um produto por ID                     | 200     |
| POST   | `/produtos`     | Cadastra um novo produto                    | 201     |
| PUT    | `/produtos/:id` | Atualiza um produto (parcial)               | 200     |
| DELETE | `/produtos/:id` | Remove um produto                           | 200     |

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

| Comando                | Descrição                                  |
| ---------------------- | ------------------------------------------ |
| `pnpm dev`             | Servidor em modo desenvolvimento (watch)   |
| `pnpm build`           | Compila o TypeScript para `dist/`          |
| `pnpm start`           | Roda a versão compilada (`dist/server.js`) |
| `pnpm type-check`      | Verifica os tipos sem gerar arquivos       |
| `pnpm db:migrate`      | Executa as migrations                      |
| `pnpm db:migrate:undo` | Desfaz a última migration                  |
