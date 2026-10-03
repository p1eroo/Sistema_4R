import { ProductStatus, ProductUnit, type Product } from "@/domain/products";
import { asEntityId, money } from "@/domain/shared";

const SEED_CREATED_AT = "2025-03-12T09:00:00.000Z";
const SEED_UPDATED_AT = "2026-02-15T10:00:00.000Z";
const IGV_RATE = 0.18;

type ProductSeed = {
  id: string;
  sku: string;
  name: string;
  brand: string;
  unit: ProductUnit;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  location: string;
};

function product(seed: ProductSeed): Product {
  return {
    id: asEntityId(seed.id),
    sku: seed.sku,
    name: seed.name,
    brand: seed.brand,
    unit: seed.unit,
    price: money(seed.price),
    cost: money(seed.cost),
    igvRate: IGV_RATE,
    stock: seed.stock,
    minStock: seed.minStock,
    location: seed.location,
    status: ProductStatus.Active,
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  };
}

export const productSeed: Product[] = [
  product({
    id: "PRD-0001",
    sku: "FLT-ACE-01",
    name: "Filtro de aceite",
    brand: "Wega",
    unit: ProductUnit.Unit,
    price: 4500,
    cost: 2800,
    stock: 4,
    minStock: 10,
    location: "A-01",
  }),
  product({
    id: "PRD-0002",
    sku: "PAS-FRE-01",
    name: "Pastillas de freno delanteras",
    brand: "Bosch",
    unit: ProductUnit.Set,
    price: 12000,
    cost: 8200,
    stock: 2,
    minStock: 8,
    location: "B-03",
  }),
  product({
    id: "PRD-0003",
    sku: "BUJ-NGK-01",
    name: "Bujías NGK",
    brand: "NGK",
    unit: ProductUnit.Box,
    price: 3200,
    cost: 2100,
    stock: 6,
    minStock: 12,
    location: "A-05",
  }),
  product({
    id: "PRD-0004",
    sku: "ACE-5W30-01",
    name: "Aceite 5W30",
    brand: "Mobil",
    unit: ProductUnit.Liter,
    price: 8000,
    cost: 5600,
    stock: 24,
    minStock: 12,
    location: "C-01",
  }),
  product({
    id: "PRD-0005",
    sku: "FLT-AIR-01",
    name: "Filtro de aire",
    brand: "Wega",
    unit: ProductUnit.Unit,
    price: 5500,
    cost: 3400,
    stock: 15,
    minStock: 8,
    location: "A-02",
  }),
  product({
    id: "PRD-0006",
    sku: "LIQ-FRE-01",
    name: "Líquido de frenos DOT4",
    brand: "Bosch",
    unit: ProductUnit.Liter,
    price: 3500,
    cost: 2200,
    stock: 20,
    minStock: 6,
    location: "B-05",
  }),
];
