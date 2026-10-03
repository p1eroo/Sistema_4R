import { PosLineKind, type PosLineValues } from "@/domain/pos";
import type { Product } from "@/domain/products";
import type { ServiceItem } from "@/domain/services";
import type { Money } from "@/domain/shared";

export type PosCategoryKey =
  | "lubricantes"
  | "filtros"
  | "frenos"
  | "encendido"
  | "repuestos"
  | "servicios";

export type PosCategory = {
  readonly key: PosCategoryKey;
  readonly label: string;
  readonly image: string;
};

/** Categorías de mostrador. El orden es el del riel lateral del POS. */
export const POS_CATEGORIES: readonly PosCategory[] = [
  { key: "lubricantes", label: "Lubricantes", image: "/pos/aceite.svg" },
  { key: "filtros", label: "Filtros", image: "/pos/filtro-aceite.svg" },
  { key: "frenos", label: "Frenos", image: "/pos/pastillas-freno.svg" },
  { key: "encendido", label: "Encendido", image: "/pos/bujias.svg" },
  { key: "repuestos", label: "Repuestos", image: "/pos/producto-generico.svg" },
  {
    key: "servicios",
    label: "Servicios",
    image: "/pos/servicio-mantenimiento.svg",
  },
];

const CATEGORY_BY_SKU_PREFIX: Record<string, PosCategoryKey> = {
  ACE: "lubricantes",
  FLT: "filtros",
  PAS: "frenos",
  LIQ: "frenos",
  DIS: "frenos",
  BUJ: "encendido",
  BAT: "encendido",
};

/** Imagen por SKU de producto o código de servicio. */
const IMAGE_BY_CODE: Record<string, string> = {
  "FLT-ACE-01": "/pos/filtro-aceite.svg",
  "PAS-FRE-01": "/pos/pastillas-freno.svg",
  "BUJ-NGK-01": "/pos/bujias.svg",
  "ACE-5W30-01": "/pos/aceite.svg",
  "FLT-AIR-01": "/pos/filtro-aire.svg",
  "LIQ-FRE-01": "/pos/liquido-frenos.svg",
  "SRV-001": "/pos/servicio-mantenimiento.svg",
  "SRV-002": "/pos/servicio-cambio-aceite.svg",
  "SRV-003": "/pos/servicio-frenos.svg",
  "SRV-004": "/pos/servicio-diagnostico.svg",
  "SRV-005": "/pos/servicio-alineamiento.svg",
  "SRV-006": "/pos/servicio-embrague.svg",
};

const FALLBACK_PRODUCT_IMAGE = "/pos/producto-generico.svg";
const FALLBACK_SERVICE_IMAGE = "/pos/servicio-mantenimiento.svg";

export type PosCatalogItem = {
  readonly key: string;
  readonly kind: PosLineKind;
  readonly sku: string;
  readonly name: string;
  readonly price: Money;
  readonly category: PosCategoryKey;
  readonly image: string;
  readonly brand?: string | undefined;
  /** Stock disponible en la sede. `undefined` para servicios. */
  readonly stock?: number | undefined;
  readonly minStock?: number | undefined;
  readonly productId?: Product["id"];
  readonly serviceId?: ServiceItem["id"];
};

export function productCategory(sku: string): PosCategoryKey {
  const prefix = sku.split("-")[0]?.toUpperCase() ?? "";
  return CATEGORY_BY_SKU_PREFIX[prefix] ?? "repuestos";
}

export function buildPosCatalog(
  products: readonly Product[],
  services: readonly ServiceItem[],
  branchStock?: ReadonlyMap<string, number>,
): PosCatalogItem[] {
  return [
    ...products.map((product) => ({
      key: product.id,
      kind: PosLineKind.Product,
      sku: product.sku,
      name: product.name,
      price: product.price,
      category: productCategory(product.sku),
      image: IMAGE_BY_CODE[product.sku] ?? FALLBACK_PRODUCT_IMAGE,
      brand: product.brand,
      stock: branchStock?.get(product.id) ?? product.stock,
      minStock: product.minStock,
      productId: product.id,
    })),
    ...services.map((service) => ({
      key: service.id,
      kind: PosLineKind.Service,
      sku: service.code,
      name: service.name,
      price: service.price,
      category: "servicios" as const,
      image: IMAGE_BY_CODE[service.code] ?? FALLBACK_SERVICE_IMAGE,
      serviceId: service.id,
    })),
  ];
}

export function filterPosCatalog(
  items: readonly PosCatalogItem[],
  term: string,
  category: PosCategoryKey | "all" = "all",
): PosCatalogItem[] {
  const query = term.trim().toLowerCase();

  return items.filter((item) => {
    if (category !== "all" && item.category !== category) {
      return false;
    }
    if (!query) {
      return true;
    }
    return `${item.sku} ${item.name} ${item.brand ?? ""}`
      .toLowerCase()
      .includes(query);
  });
}

export function countByCategory(
  items: readonly PosCatalogItem[],
): Record<PosCategoryKey | "all", number> {
  const counts: Record<PosCategoryKey | "all", number> = {
    all: items.length,
    lubricantes: 0,
    filtros: 0,
    frenos: 0,
    encendido: 0,
    repuestos: 0,
    servicios: 0,
  };
  for (const item of items) {
    counts[item.category] += 1;
  }
  return counts;
}

export function findCatalogBySku(
  items: readonly PosCatalogItem[],
  term: string,
): PosCatalogItem | undefined {
  const query = term.trim().toLowerCase();
  if (!query) {
    return undefined;
  }

  return items.find((item) => item.sku.toLowerCase() === query);
}

export function catalogItemToLine(
  item: PosCatalogItem,
  quantity = 1,
): PosLineValues {
  return {
    kind: item.kind,
    description: item.name,
    quantity,
    unitPrice: item.price,
    igvRate: 0.18,
    ...(item.productId !== undefined ? { productId: item.productId } : {}),
    ...(item.serviceId !== undefined ? { serviceId: item.serviceId } : {}),
  };
}

/** Imagen del ítem de catálogo asociado a una línea del ticket. */
export function lineImage(
  items: readonly PosCatalogItem[],
  line: { productId?: string | undefined; serviceId?: string | undefined },
): string {
  const match = items.find(
    (item) =>
      (line.productId !== undefined && item.productId === line.productId) ||
      (line.serviceId !== undefined && item.serviceId === line.serviceId),
  );
  if (match) {
    return match.image;
  }
  return line.serviceId ? FALLBACK_SERVICE_IMAGE : FALLBACK_PRODUCT_IMAGE;
}
