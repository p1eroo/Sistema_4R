import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { LineManager } from "@/components/catalog/taxonomy-table";
import { ModulePage } from "@/components/erp/module-page";
import { brandService, categoryService } from "@/mocks/catalog/service";

export const Route = createFileRoute("/_erp/productos/lineas")({
  head: () => ({
    meta: [{ title: "Líneas | 4 RUEDAS" }],
  }),
  component: LineasPage,
});

function LineasPage() {
  const brandsQuery = useQuery({
    queryKey: ["catalog-brands", "options"],
    queryFn: () => brandService.list({ pageSize: 100 }),
  });
  const categoriesQuery = useQuery({
    queryKey: ["catalog-categories", "options"],
    queryFn: () => categoryService.list({ pageSize: 100 }),
  });

  const brandOptions = useMemo(
    () =>
      (brandsQuery.data?.items ?? []).map((brand) => ({
        value: brand.id,
        label: brand.name,
      })),
    [brandsQuery.data],
  );
  const categoryOptions = useMemo(
    () =>
      (categoriesQuery.data?.items ?? []).map((category) => ({
        value: category.id,
        label: category.name,
      })),
    [categoriesQuery.data],
  );

  return (
    <ModulePage title="Líneas" breadcrumb="Inicio / Productos / Líneas">
      <LineManager
        brandOptions={brandOptions}
        categoryOptions={categoryOptions}
      />
    </ModulePage>
  );
}
