import { ListToolbar } from "@/components/erp/list-toolbar";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Search } from "lucide-react";

import {
  EMPTY_PRODUCT_FILTERS,
  filterProducts,
  inferProductCategoryId,
  productStockLabel,
  productStockQtyLabel,
  productStockTone,
  uniqueProductBrands,
  type ProductListFilters,
} from "@/components/products/product-catalog-filters";
import { ProductForm } from "@/components/products/product-form";
import { SectionCard, StatusBadge } from "@/components/erp/dashboard-ui";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/erp/data-states";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CatalogStatus } from "@/domain/catalog";
import {
  PRODUCT_STATUS_LABELS,
  ProductStatus,
  type Product,
  type ProductCreateValues,
} from "@/domain/products";
import { formatMoney } from "@/domain/shared";
import type { ListQuery } from "@/domain/shared/list-query";
import { brandService, categoryService } from "@/mocks/catalog/service";
import { productService } from "@/mocks/products/service";

function productStatusVariant(
  status: ProductStatus,
): "success" | "warning" | "neutral" {
  if (status === ProductStatus.Active) {
    return "success";
  }
  if (status === ProductStatus.Inactive) {
    return "warning";
  }
  return "neutral";
}

export function ProductCatalog() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<ProductListFilters>(
    EMPTY_PRODUCT_FILTERS,
  );
  const [dialog, setDialog] = useState<"create" | Product | null>(null);

  const listQuery: ListQuery = {
    pageSize: 100,
    sortBy: "name",
    ...(filters.search.trim() ? { search: filters.search.trim() } : {}),
  };

  const productsQuery = useQuery({
    queryKey: ["products", listQuery],
    queryFn: () => productService.list(listQuery),
  });
  const categoriesQuery = useQuery({
    queryKey: ["catalog", "categories"],
    queryFn: () => categoryService.list({ pageSize: 100 }),
  });
  const brandsQuery = useQuery({
    queryKey: ["catalog", "brands"],
    queryFn: () => brandService.list({ pageSize: 100 }),
  });

  const categories = useMemo(
    () =>
      (categoriesQuery.data?.items ?? []).filter(
        (category) => category.status === CatalogStatus.Active,
      ),
    [categoriesQuery.data?.items],
  );
  const brands = useMemo(
    () =>
      (brandsQuery.data?.items ?? []).filter(
        (brand) => brand.status === CatalogStatus.Active,
      ),
    [brandsQuery.data?.items],
  );

  const rows = useMemo(
    () => filterProducts(productsQuery.data?.items ?? [], filters),
    [productsQuery.data?.items, filters],
  );
  const criticalRows = useMemo(
    () =>
      rows
        .filter((product) => productStockTone(product) !== "success")
        .sort(
          (left, right) =>
            left.stock / left.minStock - right.stock / right.minStock,
        ),
    [rows],
  );
  const brandOptions = useMemo(
    () => uniqueProductBrands(productsQuery.data?.items ?? []),
    [productsQuery.data?.items],
  );

  const categoryName = (product: Product) => {
    const categoryId = inferProductCategoryId(product);
    return (
      categories.find((category) => category.id === categoryId)?.name ?? "—"
    );
  };

  const saveMutation = useMutation({
    mutationFn: async (values: ProductCreateValues) => {
      if (dialog && dialog !== "create") {
        return productService.update(dialog.id, values);
      }
      return productService.create(values);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      window.setTimeout(() => setDialog(null), 0);
    },
  });

  const updateFilter = <K extends keyof ProductListFilters>(
    key: K,
    value: ProductListFilters[K],
  ) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const isLoading =
    productsQuery.isLoading ||
    categoriesQuery.isLoading ||
    brandsQuery.isLoading;
  const isError =
    productsQuery.isError || categoriesQuery.isError || brandsQuery.isError;

  return (
    <div className="space-y-4">
      <ListToolbar>
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(event) => updateFilter("search", event.target.value)}
            placeholder="Buscar por SKU o nombre"
            className="border-input bg-card shadow-none pl-9"
            aria-label="Buscar productos"
          />
        </div>
        <Select
          value={filters.categoryId}
          onValueChange={(value) => updateFilter("categoryId", value)}
        >
          <SelectTrigger className="w-full border-input bg-card shadow-none sm:w-48">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.brand}
          onValueChange={(value) => updateFilter("brand", value)}
        >
          <SelectTrigger className="w-full border-input bg-card shadow-none sm:w-40">
            <SelectValue placeholder="Marca" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las marcas</SelectItem>
            {brandOptions.map((brand) => (
              <SelectItem key={brand} value={brand}>
                {brand}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => setDialog("create")}>
          <Plus /> Nuevo producto
        </Button>
      </ListToolbar>

      {criticalRows.length > 0 ? (
        <SectionCard
          title="Stock crítico"
          subtitle="Mismos SKU que el tablero · énfasis danger"
        >
          <div className="divide-y divide-border">
            {criticalRows.map((product) => (
              <div
                key={product.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                <span className="truncate text-xs font-medium">
                  {product.name}
                </span>
                <StatusBadge variant={productStockTone(product)}>
                  {productStockQtyLabel(product)}
                </StatusBadge>
              </div>
            ))}
          </div>
        </SectionCard>
      ) : null}

      <SectionCard
        title="Productos"
        subtitle="Catálogo con precio, stock y alerta crítica"
        action={
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {rows.length} registros
          </span>
        }
      >
        {isLoading && <LoadingState variant="table" rows={6} />}
        {!isLoading && isError && (
          <ErrorState
            onRetry={() => {
              void productsQuery.refetch();
              void categoriesQuery.refetch();
              void brandsQuery.refetch();
            }}
          />
        )}
        {!isLoading && !isError && rows.length === 0 && (
          <EmptyState
            title="Sin productos"
            description="No hay resultados con los filtros actuales."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDialog("create")}
              >
                Registrar producto
              </Button>
            }
          />
        )}
        {!isLoading && !isError && rows.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead className="hidden sm:table-cell">Marca</TableHead>
                <TableHead className="hidden md:table-cell">
                  Categoría
                </TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="hidden lg:table-cell">Estado</TableHead>
                <TableHead className="w-10">
                  <span className="sr-only">Editar</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((product) => (
                <TableRow
                  key={product.id}
                  className="cursor-pointer"
                  onClick={() => setDialog(product)}
                >
                  <TableCell>
                    <p className="truncate text-xs font-semibold">
                      {product.name}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {product.sku}
                    </p>
                  </TableCell>
                  <TableCell className="hidden text-xs sm:table-cell">
                    {product.brand ?? "—"}
                  </TableCell>
                  <TableCell className="hidden text-xs md:table-cell">
                    {categoryName(product)}
                  </TableCell>
                  <TableCell className="text-xs tabular-nums">
                    {formatMoney(product.price)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge variant={productStockTone(product)}>
                      {productStockLabel(product)} ·{" "}
                      {productStockQtyLabel(product)}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <StatusBadge variant={productStatusVariant(product.status)}>
                      {PRODUCT_STATUS_LABELS[product.status]}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      aria-label={`Editar ${product.name}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        setDialog(product);
                      }}
                    >
                      <Pencil />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SectionCard>

      <Dialog
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDialog(null);
            saveMutation.reset();
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialog === "create" ? "Nuevo producto" : "Editar producto"}
            </DialogTitle>
            <DialogDescription>
              {dialog === "create"
                ? "Alta al catálogo. El SKU debe ser único."
                : "Actualiza precio, stock o datos del SKU."}
            </DialogDescription>
          </DialogHeader>
          {saveMutation.isError && (
            <ErrorState
              title="No se pudo guardar"
              message={
                saveMutation.error instanceof Error
                  ? saveMutation.error.message
                  : "Revisa los datos e inténtalo de nuevo."
              }
            />
          )}
          {dialog ? (
            <ProductForm
              key={dialog === "create" ? "create" : dialog.id}
              {...(dialog === "create" ? {} : { product: dialog })}
              brands={brands}
              categories={categories}
              submitting={saveMutation.isPending}
              onSubmit={async (values) => {
                await saveMutation.mutateAsync(values);
              }}
              onCancel={() => setDialog(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
