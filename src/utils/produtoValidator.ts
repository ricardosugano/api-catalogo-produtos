import { ProdutoCreationAttributes } from '../models/Produto';

export interface ValidationResult<T> {
  isValid: boolean;
  errors: string[];
  data: T;
}

type ProdutoUpdateData = Partial<Omit<ProdutoCreationAttributes, 'id'>>;

export interface ProdutoFiltros {
  categoria?: string;
  ativo?: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Valida o parâmetro de rota :id (inteiro positivo)
 */
export function parseId(param: unknown): number | null {
  if (typeof param !== 'string' || !/^\d+$/.test(param)) return null;
  const id = Number(param);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

/**
 * Valida os filtros opcionais da listagem (?categoria=...&ativo=true)
 */
export function validateFiltros(
  query: Record<string, unknown>,
): ValidationResult<ProdutoFiltros> {
  const errors: string[] = [];
  const data: ProdutoFiltros = {};

  const { categoria, ativo } = query;

  if (categoria !== undefined) {
    if (typeof categoria !== 'string' || categoria.trim() === '') {
      errors.push('O filtro categoria deve ser um texto.');
    } else {
      data.categoria = categoria.trim().toLowerCase();
    }
  }

  if (ativo !== undefined) {
    if (ativo === 'true') data.ativo = true;
    else if (ativo === 'false') data.ativo = false;
    else errors.push('O filtro ativo deve ser true ou false.');
  }

  return { isValid: errors.length === 0, errors, data };
}

/**
 * Valida cada campo individualmente. Quando `obrigatorio` é true,
 * campos ausentes geram erro (usado no POST).
 */
function validarCampos(
  body: Record<string, unknown>,
  obrigatorio: boolean,
): ValidationResult<ProdutoUpdateData> {
  const errors: string[] = [];
  const data: ProdutoUpdateData = {};

  const { nome, descricao, categoria, preco, estoque, ativo } = body;

  // nome
  if (nome !== undefined) {
    if (typeof nome !== 'string' || nome.trim().length < 2) {
      errors.push('O campo nome deve ser um texto com no mínimo 2 caracteres.');
    } else if (nome.trim().length > 120) {
      errors.push('O campo nome deve ter no máximo 120 caracteres.');
    } else {
      data.nome = nome.trim();
    }
  } else if (obrigatorio) {
    errors.push('O campo nome é obrigatório.');
  }

  // descricao (opcional, pode ser null)
  if (descricao !== undefined) {
    if (descricao !== null && typeof descricao !== 'string') {
      errors.push('O campo descricao deve ser um texto.');
    } else {
      data.descricao =
        typeof descricao === 'string' && descricao.trim() !== ''
          ? descricao.trim()
          : null;
    }
  }

  // categoria (salva em minúsculas para facilitar o filtro)
  if (categoria !== undefined) {
    if (typeof categoria !== 'string' || categoria.trim().length < 2) {
      errors.push(
        'O campo categoria deve ser um texto com no mínimo 2 caracteres.',
      );
    } else if (categoria.trim().length > 50) {
      errors.push('O campo categoria deve ter no máximo 50 caracteres.');
    } else {
      data.categoria = categoria.trim().toLowerCase();
    }
  } else if (obrigatorio) {
    errors.push('O campo categoria é obrigatório.');
  }

  // preco
  if (preco !== undefined) {
    if (
      typeof preco !== 'number' ||
      !Number.isFinite(preco) ||
      preco <= 0 ||
      preco >= 100000000
    ) {
      errors.push('O campo preco deve ser um número maior que 0.');
    } else {
      data.preco = Math.round(preco * 100) / 100;
    }
  } else if (obrigatorio) {
    errors.push('O campo preco é obrigatório.');
  }

  // estoque (opcional, padrão 0)
  if (estoque !== undefined) {
    if (
      typeof estoque !== 'number' ||
      !Number.isInteger(estoque) ||
      estoque < 0 ||
      estoque > 2147483647
    ) {
      errors.push(
        'O campo estoque deve ser um número inteiro maior ou igual a 0.',
      );
    } else {
      data.estoque = estoque;
    }
  }

  // ativo (opcional, padrão true)
  if (ativo !== undefined) {
    if (typeof ativo !== 'boolean') {
      errors.push('O campo ativo deve ser true ou false.');
    } else {
      data.ativo = ativo;
    }
  }

  return { isValid: errors.length === 0, errors, data };
}

/**
 * Validação para criação (POST): nome, categoria e preco são obrigatórios
 */
export function validateCreateProduto(
  body: unknown,
): ValidationResult<ProdutoCreationAttributes | null> {
  if (!isRecord(body)) {
    return {
      isValid: false,
      errors: ['O corpo da requisição deve ser um objeto JSON.'],
      data: null,
    };
  }

  const result = validarCampos(body, true);
  if (!result.isValid) return { ...result, data: null };

  const { nome, categoria, preco } = result.data;
  if (nome === undefined || categoria === undefined || preco === undefined) {
    return { isValid: false, errors: ['Dados incompletos.'], data: null };
  }

  return {
    isValid: true,
    errors: [],
    data: { ...result.data, nome, categoria, preco },
  };
}

/**
 * Validação para atualização (PUT): ao menos um campo deve ser enviado
 */
export function validateUpdateProduto(
  body: unknown,
): ValidationResult<ProdutoUpdateData> {
  if (!isRecord(body)) {
    return {
      isValid: false,
      errors: ['O corpo da requisição deve ser um objeto JSON.'],
      data: {},
    };
  }

  const result = validarCampos(body, false);
  if (result.isValid && Object.keys(result.data).length === 0) {
    return {
      isValid: false,
      errors: [
        'Informe ao menos um campo para atualizar: nome, descricao, categoria, preco, estoque ou ativo.',
      ],
      data: {},
    };
  }

  return result;
}
