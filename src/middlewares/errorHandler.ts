import { NextFunction, Request, Response } from 'express';
import { getErrorMessage } from '../utils/errors';

// 404 para qualquer rota não mapeada
export function notFoundHandler(req: Request, res: Response): void {
  res
    .status(404)
    .json({ erro: `Rota ${req.method} ${req.originalUrl} não encontrada.` });
}

// Tratamento global de erros (ex.: JSON malformado no corpo da requisição)
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({ erro: 'JSON inválido no corpo da requisição.' });
    return;
  }

  res.status(500).json({
    erro: 'Erro interno do servidor.',
    detalhe: getErrorMessage(error),
  });
}
