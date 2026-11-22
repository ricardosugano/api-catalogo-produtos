import express, { Request, Response } from 'express';
import cors from 'cors';
import { appRoutes } from './routes';
import { setupSwagger } from './config/swagger';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());

// Health check (usado pelo Render no "Health Check Path")
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    mensagem: 'API Catálogo de Produtos rodando com sucesso.',
    versao: '1.1.0',
    ambiente: process.env.NODE_ENV || 'development',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Documentação interativa (Swagger UI) em /api-docs
setupSwagger(app);

// Rotas da aplicação sob o prefixo /api
app.use('/api', appRoutes);

// Rotas inexistentes e erros globais
app.use(notFoundHandler);
app.use(errorHandler);

export { app };
