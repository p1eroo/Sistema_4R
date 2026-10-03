import {
  CatalogStatus,
  type CatalogBrand,
  type CatalogCategory,
  type CatalogLine,
} from "@/domain/catalog";
import { asEntityId } from "@/domain/shared";

const SEED_CREATED_AT = "2025-03-01T09:00:00.000Z";
const SEED_UPDATED_AT = "2026-02-15T10:00:00.000Z";

export const categorySeed: CatalogCategory[] = [
  {
    id: asEntityId("CAT-0001"),
    code: "FRENOS",
    name: "Frenos",
    status: CatalogStatus.Active,
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  },
  {
    id: asEntityId("CAT-0002"),
    code: "FILTROS",
    name: "Filtros",
    status: CatalogStatus.Active,
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  },
  {
    id: asEntityId("CAT-0003"),
    code: "ACEITES",
    name: "Aceites y lubricantes",
    status: CatalogStatus.Active,
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  },
  {
    id: asEntityId("CAT-0004"),
    code: "ENCENDIDO",
    name: "Encendido",
    status: CatalogStatus.Active,
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  },
  {
    id: asEntityId("CAT-0005"),
    code: "SUSPENSION",
    name: "Suspensión",
    status: CatalogStatus.Active,
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  },
];

export const brandSeed: CatalogBrand[] = [
  {
    id: asEntityId("BRD-0001"),
    code: "NGK",
    name: "NGK",
    status: CatalogStatus.Active,
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  },
  {
    id: asEntityId("BRD-0002"),
    code: "TOYOTA",
    name: "Toyota",
    status: CatalogStatus.Active,
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  },
  {
    id: asEntityId("BRD-0003"),
    code: "BOSCH",
    name: "Bosch",
    status: CatalogStatus.Active,
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  },
  {
    id: asEntityId("BRD-0004"),
    code: "WEGA",
    name: "Wega",
    status: CatalogStatus.Active,
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  },
  {
    id: asEntityId("BRD-0005"),
    code: "MOBIL",
    name: "Mobil",
    status: CatalogStatus.Active,
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  },
  {
    id: asEntityId("BRD-0006"),
    code: "SUZUKI",
    name: "Suzuki",
    status: CatalogStatus.Active,
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  },
];

export const lineSeed: CatalogLine[] = [
  {
    id: asEntityId("LIN-0001"),
    code: "FRE-BOSCH",
    name: "Frenos Bosch",
    brandId: asEntityId("BRD-0003"),
    categoryId: asEntityId("CAT-0001"),
    status: CatalogStatus.Active,
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  },
  {
    id: asEntityId("LIN-0002"),
    code: "FLT-WEGA",
    name: "Filtros Wega",
    brandId: asEntityId("BRD-0004"),
    categoryId: asEntityId("CAT-0002"),
    status: CatalogStatus.Active,
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  },
  {
    id: asEntityId("LIN-0003"),
    code: "ACE-MOBIL",
    name: "Aceite sintético Mobil",
    brandId: asEntityId("BRD-0005"),
    categoryId: asEntityId("CAT-0003"),
    status: CatalogStatus.Active,
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  },
  {
    id: asEntityId("LIN-0004"),
    code: "BUJ-NGK",
    name: "Bujías de iridio NGK",
    brandId: asEntityId("BRD-0001"),
    categoryId: asEntityId("CAT-0004"),
    status: CatalogStatus.Active,
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  },
  {
    id: asEntityId("LIN-0005"),
    code: "AMO-TOYOTA",
    name: "Amortiguadores Toyota",
    brandId: asEntityId("BRD-0002"),
    categoryId: asEntityId("CAT-0005"),
    status: CatalogStatus.Active,
    createdAt: SEED_CREATED_AT,
    updatedAt: SEED_UPDATED_AT,
  },
];
