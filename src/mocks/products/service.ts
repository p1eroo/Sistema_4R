import { z, type ZodType } from "zod";

import { isLowStock, ProductStatus, type Product } from "@/domain/products";
import {
  productCreateSchema,
  productUpdateSchema,
  type ProductCreateValues,
  type ProductUpdateValues,
} from "@/domain/products/schemas";
import { nowIso, type DateTimeIso, type EntityId } from "@/domain/shared";
import type { ListQuery, ListResult } from "@/domain/shared/list-query";
import { paginate } from "@/lib/list-query";
import { productSeed } from "@/mocks/products/seed";
import {
  createInMemoryRepository,
  type InMemoryRepository,
} from "@/mocks/shared/in-memory-repository";

export class ProductNotFoundError extends Error {
  constructor(id: EntityId) {
    super(`No se encontró el producto ${id}.`);
    this.name = "ProductNotFoundError";
  }
}

export class ProductValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(issues.join(" ") || "Los datos del producto no son válidos.");
    this.name = "ProductValidationError";
    this.issues = issues;
  }
}

export type ProductService = {
  list(query?: ListQuery): Promise<ListResult<Product>>;
  listCriticalStock(query?: ListQuery): Promise<ListResult<Product>>;
  getById(id: EntityId): Promise<Product | undefined>;
  getBySku(sku: string): Promise<Product | undefined>;
  create(input: ProductCreateValues): Promise<Product>;
  update(id: EntityId, input: ProductUpdateValues): Promise<Product>;
  archive(id: EntityId): Promise<Product>;
};

const SORT_SELECTORS = {
  sku: (product: Product) => product.sku,
  name: (product: Product) => product.name,
  stock: (product: Product) => product.stock,
  price: (product: Product) => product.price.amount,
};

function parseOrThrow<TSchema extends ZodType>(
  schema: TSchema,
  input: unknown,
): z.output<TSchema> {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new ProductValidationError(
      result.error.issues.map((issue) => issue.message),
    );
  }

  return result.data;
}

function normalizeSku(sku: string): string {
  return sku.trim().toUpperCase();
}

function buildUpdatePatch(
  values: ProductUpdateValues,
  now: DateTimeIso,
): Partial<Omit<Product, "id">> {
  return {
    ...(values.sku !== undefined ? { sku: values.sku } : {}),
    ...(values.name !== undefined ? { name: values.name } : {}),
    ...(values.description !== undefined
      ? { description: values.description }
      : {}),
    ...(values.brand !== undefined ? { brand: values.brand } : {}),
    ...(values.categoryId !== undefined
      ? { categoryId: values.categoryId }
      : {}),
    ...(values.unit !== undefined ? { unit: values.unit } : {}),
    ...(values.price !== undefined ? { price: values.price } : {}),
    ...(values.cost !== undefined ? { cost: values.cost } : {}),
    ...(values.igvRate !== undefined ? { igvRate: values.igvRate } : {}),
    ...(values.stock !== undefined ? { stock: values.stock } : {}),
    ...(values.minStock !== undefined ? { minStock: values.minStock } : {}),
    ...(values.location !== undefined ? { location: values.location } : {}),
    ...(values.status !== undefined ? { status: values.status } : {}),
    updatedAt: now,
  };
}

export function createProductService(
  repository: InMemoryRepository<Product> = createInMemoryRepository<Product>({
    seed: productSeed,
    idPrefix: "PRD",
  }),
): ProductService {
  async function findBySku(sku: string): Promise<Product | undefined> {
    const normalized = normalizeSku(sku);
    const all = await repository.getAll();
    return all.find((product) => normalizeSku(product.sku) === normalized);
  }

  async function assertSkuAvailable(
    sku: string,
    ignoreId?: EntityId,
  ): Promise<void> {
    const conflict = await findBySku(sku);
    if (conflict && conflict.id !== ignoreId) {
      throw new ProductValidationError([
        `Ya existe un producto con el SKU ${normalizeSku(sku)}.`,
      ]);
    }
  }

  return {
    list(query: ListQuery = {}) {
      return repository.query({
        query,
        searchFields: ["sku", "name", "brand"],
        sortSelectors: SORT_SELECTORS,
      });
    },

    async listCriticalStock(query: ListQuery = {}) {
      const all = await repository.getAll();
      const critical = all.filter((product) => isLowStock(product));
      return paginate(critical, query.page, query.pageSize);
    },

    getById(id: EntityId) {
      return repository.getById(id);
    },

    getBySku(sku: string) {
      return findBySku(sku);
    },

    async create(input: ProductCreateValues) {
      const values = parseOrThrow(productCreateSchema, input);
      await assertSkuAvailable(values.sku);
      const now = nowIso();

      return repository.create({
        sku: values.sku,
        name: values.name,
        ...(values.description !== undefined
          ? { description: values.description }
          : {}),
        ...(values.brand !== undefined ? { brand: values.brand } : {}),
        ...(values.categoryId !== undefined
          ? { categoryId: values.categoryId }
          : {}),
        unit: values.unit,
        price: values.price,
        ...(values.cost !== undefined ? { cost: values.cost } : {}),
        igvRate: values.igvRate ?? 0.18,
        stock: values.stock,
        minStock: values.minStock,
        ...(values.location !== undefined ? { location: values.location } : {}),
        status: values.status ?? ProductStatus.Active,
        createdAt: now,
        updatedAt: now,
      });
    },

    async update(id: EntityId, input: ProductUpdateValues) {
      const values = parseOrThrow(productUpdateSchema, input);
      const current = await repository.getById(id);
      if (!current) {
        throw new ProductNotFoundError(id);
      }
      if (values.sku !== undefined) {
        await assertSkuAvailable(values.sku, id);
      }

      return repository.update(id, buildUpdatePatch(values, nowIso()));
    },

    async archive(id: EntityId) {
      const current = await repository.getById(id);
      if (!current) {
        throw new ProductNotFoundError(id);
      }

      return repository.update(id, {
        status: ProductStatus.Inactive,
        updatedAt: nowIso(),
      });
    },
  };
}

export const productService: ProductService = createProductService();
