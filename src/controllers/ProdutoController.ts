import { Request, Response } from 'express';
import { WhereOptions } from 'sequelize';
import { Produto, ProdutoAttributes } from '../models/Produto';
import {
  parseId,
  validateCreateProduto,
  validateFiltros,
  validateUpdateProduto,
} from '../utils/produtoValidator';
import { getErrorMessage } from '../utils/errors';

const ID_INVALIDO = 'O ID informado deve ser um número inteiro positivo.';
const NAO_ENCONTRADO = 'Produto não encontrado.';

export class ProdutoController {
  // GET /api/produtos - Lista os produtos (filtros opcionais: categoria, ativo)
  public static async index(req: Request, res: Response): Promise<Response> {
    try {
      const { isValid, errors, data } = validateFiltros(req.query);
      if (!isValid) {
        return res
          .status(400)
          .json({ erro: 'Filtros inválidos.', detalhes: errors });
      }

      const where: WhereOptions<ProdutoAttributes> = { ...data };
      const produtos = await Produto.findAll({ where, order: [['id', 'ASC']] });
      return res.status(200).json(produtos);
    } catch (error: unknown) {
      return res.status(500).json({
        erro: 'Erro ao listar produtos.',
        detalhe: getErrorMessage(error),
      });
    }
  }

  // GET /api/produtos/:id - Busca um produto por ID
  public static async show(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseId(req.params.id);
      if (id === null) {
        return res.status(400).json({ erro: ID_INVALIDO });
      }

      const produto = await Produto.findByPk(id);
      if (!produto) {
        return res.status(404).json({ erro: NAO_ENCONTRADO });
      }

      return res.status(200).json(produto);
    } catch (error: unknown) {
      return res.status(500).json({
        erro: 'Erro ao buscar produto.',
        detalhe: getErrorMessage(error),
      });
    }
  }

  // POST /api/produtos - Cadastra um novo produto
  public static async create(req: Request, res: Response): Promise<Response> {
    try {
      const { isValid, errors, data } = validateCreateProduto(req.body);
      if (!isValid || data === null) {
        return res
          .status(400)
          .json({ erro: 'Dados inválidos.', detalhes: errors });
      }

      const novoProduto = await Produto.create(data);
      return res.status(201).json(novoProduto);
    } catch (error: unknown) {
      return res.status(500).json({
        erro: 'Erro ao cadastrar produto.',
        detalhe: getErrorMessage(error),
      });
    }
  }

  // PUT /api/produtos/:id - Atualiza um produto existente
  public static async update(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseId(req.params.id);
      if (id === null) {
        return res.status(400).json({ erro: ID_INVALIDO });
      }

      const { isValid, errors, data } = validateUpdateProduto(req.body);
      if (!isValid) {
        return res
          .status(400)
          .json({ erro: 'Dados inválidos.', detalhes: errors });
      }

      const produto = await Produto.findByPk(id);
      if (!produto) {
        return res.status(404).json({ erro: NAO_ENCONTRADO });
      }

      await produto.update(data);
      return res.status(200).json(produto);
    } catch (error: unknown) {
      return res.status(500).json({
        erro: 'Erro ao atualizar produto.',
        detalhe: getErrorMessage(error),
      });
    }
  }

  // DELETE /api/produtos/:id - Remove um produto
  public static async delete(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseId(req.params.id);
      if (id === null) {
        return res.status(400).json({ erro: ID_INVALIDO });
      }

      const produto = await Produto.findByPk(id);
      if (!produto) {
        return res.status(404).json({ erro: NAO_ENCONTRADO });
      }

      await produto.destroy();
      return res
        .status(200)
        .json({ mensagem: 'Produto removido com sucesso.', id });
    } catch (error: unknown) {
      return res.status(500).json({
        erro: 'Erro ao remover produto.',
        detalhe: getErrorMessage(error),
      });
    }
  }
}
