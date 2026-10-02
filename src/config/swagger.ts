import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../docs/swagger.json';

// Registra o painel interativo do Swagger UI em /api-docs
export function setupSwagger(app: Express): void {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      customSiteTitle: 'API Catálogo de Produtos - Documentação',
    }),
  );
}
