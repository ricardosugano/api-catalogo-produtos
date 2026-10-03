import { app } from './app';
import { sequelize } from './config/database';
import './models/Produto';

const PORT = String(process.env.PORT) || 3001;

async function main(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o PostgreSQL realizada com sucesso.');

    // Opcional: cria a tabela automaticamente sem rodar as migrations
    if (process.env.DB_SYNC === 'true') {
      await sequelize.sync();
      console.log('Tabelas sincronizadas com sequelize.sync().');
    }

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error: unknown) {
    console.error('Erro ao conectar com o banco de dados:', error);
    process.exit(1);
  }
}

void main();
