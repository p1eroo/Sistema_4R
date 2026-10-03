import { useState } from "react";

import { inferProductCategoryId } from "@/components/products/product-catalog-filters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CatalogBrand, CatalogCategory } from "@/domain/catalog";
import {
  productCreateSchema,
  PRODUCT_UNIT_LABELS,
  ProductUnit,
  type Product,
  type ProductCreateValues,
} from "@/domain/products";
import { asEntityId, money } from "@/domain/shared";

export type ProductFormProps = {
  product?: Product;
  brands: readonly CatalogBrand[];
  categories: readonly CatalogCategory[];
  submitting?: boolean;
  onSubmit: (values: ProductCreateValues) => void | Promise<void>;
  onCancel?: () => void;
};

type Draft = {
  sku: string;
  name: string;
  brand: string;
  categoryId: string;
  unit: ProductUnit;
  priceSoles: string;
  stock: string;
  minStock: string;
  location: string;
};

function solesFromCents(amount: number): string {
  return (amount / 100).toFixed(2);
}

function draftFromProduct(product?: Product): Draft {
  if (!product) {
    return {
      sku: "",
      name: "",
      brand: "",
      categoryId: "none",
      unit: ProductUnit.Unit,
      priceSoles: "",
      stock: "0",
      minStock: "0",
      location: "",
    };
  }

  return {
    sku: product.sku,
    name: product.name,
    brand: product.brand ?? "",
    categoryId: inferProductCategoryId(product) ?? "none",
    unit: product.unit,
    priceSoles: solesFromCents(product.price.amount),
    stock: String(product.stock),
    minStock: String(product.minStock),
    location: product.location ?? "",
  };
}

function parseDraft(draft: Draft): ProductCreateValues | string {
  const priceNumber = Number(draft.priceSoles.replace(",", "."));
  const stock = Number(draft.stock);
  const minStock = Number(draft.minStock);

  if (!Number.isFinite(priceNumber) || priceNumber < 0) {
    return "El precio no es válido.";
  }

  const parsed = productCreateSchema.safeParse({
    sku: draft.sku,
    name: draft.name,
    ...(draft.brand.trim() ? { brand: draft.brand.trim() } : {}),
    ...(draft.categoryId !== "none"
      ? { categoryId: asEntityId(draft.categoryId) }
      : {}),
    unit: draft.unit,
    price: money(Math.round(priceNumber * 100)),
    stock,
    minStock,
    ...(draft.location.trim() ? { location: draft.location.trim() } : {}),
  });

  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Revisa los datos del producto.";
  }

  return parsed.data;
}

export function ProductForm({
  product,
  brands,
  categories,
  submitting = false,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const [draft, setDraft] = useState<Draft>(() => draftFromProduct(product));
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const parsed = parseDraft(draft);
        if (typeof parsed === "string") {
          setError(parsed);
          return;
        }
        setError(null);
        void onSubmit(parsed);
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="product-sku">SKU</Label>
          <Input
            id="product-sku"
            value={draft.sku}
            onChange={(event) => update("sku", event.target.value)}
            placeholder="FLT-ACE-01"
            className="uppercase"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="product-name">Nombre</Label>
          <Input
            id="product-name"
            value={draft.name}
            onChange={(event) => update("name", event.target.value)}
            placeholder="Filtro de aceite"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Marca</Label>
          <Select
            value={draft.brand || "none"}
            onValueChange={(value) =>
              update("brand", value === "none" ? "" : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Marca" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin marca</SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.name}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Categoría</Label>
          <Select
            value={draft.categoryId}
            onValueChange={(value) => update("categoryId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin categoría</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Unidad</Label>
          <Select
            value={draft.unit}
            onValueChange={(value) => update("unit", value as ProductUnit)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Unidad" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(ProductUnit).map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {PRODUCT_UNIT_LABELS[unit]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="product-price">Precio (S/)</Label>
          <Input
            id="product-price"
            type="number"
            min="0"
            step="0.01"
            value={draft.priceSoles}
            onChange={(event) => update("priceSoles", event.target.value)}
            placeholder="45.00"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="product-stock">Stock</Label>
          <Input
            id="product-stock"
            type="number"
            min="0"
            step="1"
            value={draft.stock}
            onChange={(event) => update("stock", event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="product-min-stock">Stock mínimo</Label>
          <Input
            id="product-min-stock"
            type="number"
            min="0"
            step="1"
            value={draft.minStock}
            onChange={(event) => update("minStock", event.target.value)}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="product-location">Ubicación</Label>
          <Input
            id="product-location"
            value={draft.location}
            onChange={(event) => update("location", event.target.value)}
            placeholder="A-01"
          />
        </div>
      </div>

      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        ) : null}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Guardando…" : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
