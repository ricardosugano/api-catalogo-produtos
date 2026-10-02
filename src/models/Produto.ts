import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// Interface TypeScript que representa a entidade Produto
export interface ProdutoAttributes {
  id: number;
  nome: string;
  descricao: string | null;
  categoria: string;
  preco: number; // em reais
  estoque: number; // quantidade em estoque
  ativo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Campos opcionais na criação (gerados pelo banco ou com valor padrão)
export type ProdutoCreationAttributes = Optional<
  ProdutoAttributes,
  'id' | 'descricao' | 'estoque' | 'ativo' | 'createdAt' | 'updatedAt'
>;

export class Produto
  extends Model<ProdutoAttributes, ProdutoCreationAttributes>
  implements ProdutoAttributes
{
  declare id: number;
  declare nome: string;
  declare descricao: string | null;
  declare categoria: string;
  declare preco: number;
  declare estoque: number;
  declare ativo: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Produto.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nome: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    categoria: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    preco: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      // O driver pg devolve DECIMAL como string; convertemos para number
      get(): number {
        return Number(this.getDataValue('preco'));
      },
    },
    estoque: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'produtos',
    timestamps: true,
  },
);
