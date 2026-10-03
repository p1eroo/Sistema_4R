import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, Plus } from "lucide-react";

import { SectionCard, StatusBadge } from "@/components/erp/dashboard-ui";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/erp/data-states";
import { ListToolbar, ListToolbarSearch } from "@/components/erp/list-toolbar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { CatalogStatus, CATALOG_STATUS_LABELS } from "@/domain/catalog/types";
import { asEntityId, type EntityId } from "@/domain/shared";
import type { ListResult } from "@/domain/shared/list-query";
import {
  brandService,
  categoryService,
  lineService,
} from "@/mocks/catalog/service";

export type TaxonomyColumn<T> = {
  readonly key: string;
  readonly header: string;
  readonly className?: string;
  readonly cell: (row: T) => ReactNode;
};

type TaxonomyField = {
  readonly key: string;
  readonly label: string;
  readonly placeholder?: string;
  readonly type?: "text" | "select";
  readonly options?: readonly {
    readonly value: string;
    readonly label: string;
  }[];
};

type TaxonomyManagerProps<T extends { id: EntityId; status: CatalogStatus }> = {
  title: string;
  subtitle: string;
  queryKey: string;
  list: () => Promise<ListResult<T>>;
  create: (values: Record<string, string>) => Promise<T>;
  archive: (id: EntityId) => Promise<T>;
  columns: readonly TaxonomyColumn<T>[];
  fields: readonly TaxonomyField[];
  emptyValues: Record<string, string>;
};

function TaxonomyManager<T extends { id: EntityId; status: CatalogStatus }>({
  title,
  subtitle,
  queryKey,
  list,
  create,
  archive,
  columns,
  fields,
  emptyValues,
}: TaxonomyManagerProps<T>) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>(emptyValues);

  const query = useQuery({ queryKey: [queryKey], queryFn: list });

  const rows = useMemo(() => {
    const items = query.data?.items ?? [];
    const term = search.trim().toLowerCase();
    if (!term) {
      return items;
    }
    return items.filter((item) =>
      `${String((item as { code?: string }).code ?? "")} ${String(
        (item as { name?: string }).name ?? "",
      )}`
        .toLowerCase()
        .includes(term),
    );
  }, [query.data, search]);

  const createMutation = useMutation({
    mutationFn: () => create(values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [queryKey] });
      setOpen(false);
      setValues(emptyValues);
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: EntityId) => archive(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
  });

  return (
    <div className="space-y-4">
      <ListToolbar>
        <ListToolbarSearch
          value={search}
          onChange={setSearch}
          placeholder="Buscar por código o nombre"
          ariaLabel={`Buscar ${title}`}
        />
        <Button onClick={() => setOpen(true)}>
          <Plus /> Nuevo
        </Button>
      </ListToolbar>

      <SectionCard title={title} subtitle={subtitle}>
        {query.isLoading && <LoadingState variant="table" rows={5} />}
        {query.isError && <ErrorState onRetry={() => void query.refetch()} />}
        {query.isSuccess && rows.length === 0 && (
          <EmptyState
            title={`Sin ${title.toLowerCase()}`}
            description="No hay registros con los filtros actuales."
          />
        )}
        {query.isSuccess && rows.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.key} className={column.className}>
                    {column.header}
                  </TableHead>
                ))}
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((column) => (
                    <TableCell key={column.key} className={column.className}>
                      {column.cell(row)}
                    </TableCell>
                  ))}
                  <TableCell>
                    <StatusBadge
                      variant={
                        row.status === CatalogStatus.Active
                          ? "success"
                          : "neutral"
                      }
                    >
                      {CATALOG_STATUS_LABELS[row.status]}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Archivar"
                      disabled={
                        row.status !== CatalogStatus.Active ||
                        archiveMutation.isPending
                      }
                      onClick={() => archiveMutation.mutate(row.id)}
                    >
                      <Archive />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SectionCard>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo en {title}</DialogTitle>
            <DialogDescription>Alta simple de taxonomía.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {fields.map((field) =>
              field.type === "select" ? (
                <Select
                  key={field.key}
                  value={values[field.key] ?? ""}
                  onValueChange={(value) =>
                    setValues((current) => ({ ...current, [field.key]: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={field.label} />
                  </SelectTrigger>
                  <SelectContent>
                    {(field.options ?? []).map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  key={field.key}
                  placeholder={field.placeholder ?? field.label}
                  value={values[field.key] ?? ""}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      [field.key]: event.target.value,
                    }))
                  }
                />
              ),
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              disabled={createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              Crear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function CategoryManager() {
  return (
    <TaxonomyManager
      title="Categorías"
      subtitle="Categorías del catálogo"
      queryKey="catalog-categories"
      list={() => categoryService.list({ pageSize: 100 })}
      create={(values) =>
        categoryService.create({
          code: values["code"] ?? "",
          name: values["name"] ?? "",
          ...(values["description"]
            ? { description: values["description"] }
            : {}),
        })
      }
      archive={(id) => categoryService.archive(id)}
      columns={[
        {
          key: "code",
          header: "Código",
          cell: (row) => (
            <span className="text-xs font-semibold">{row.code}</span>
          ),
        },
        {
          key: "name",
          header: "Nombre",
          cell: (row) => <span className="text-xs">{row.name}</span>,
        },
      ]}
      fields={[
        { key: "code", label: "Código" },
        { key: "name", label: "Nombre" },
        { key: "description", label: "Descripción" },
      ]}
      emptyValues={{ code: "", name: "", description: "" }}
    />
  );
}

export function BrandManager() {
  return (
    <TaxonomyManager
      title="Marcas"
      subtitle="Marcas del catálogo"
      queryKey="catalog-brands"
      list={() => brandService.list({ pageSize: 100 })}
      create={(values) =>
        brandService.create({
          code: values["code"] ?? "",
          name: values["name"] ?? "",
          ...(values["description"]
            ? { description: values["description"] }
            : {}),
        })
      }
      archive={(id) => brandService.archive(id)}
      columns={[
        {
          key: "code",
          header: "Código",
          cell: (row) => (
            <span className="text-xs font-semibold">{row.code}</span>
          ),
        },
        {
          key: "name",
          header: "Nombre",
          cell: (row) => <span className="text-xs">{row.name}</span>,
        },
      ]}
      fields={[
        { key: "code", label: "Código" },
        { key: "name", label: "Nombre" },
        { key: "description", label: "Descripción" },
      ]}
      emptyValues={{ code: "", name: "", description: "" }}
    />
  );
}

export function LineManager({
  brandOptions,
  categoryOptions,
}: {
  brandOptions: readonly { value: string; label: string }[];
  categoryOptions: readonly { value: string; label: string }[];
}) {
  return (
    <TaxonomyManager
      title="Líneas"
      subtitle="Líneas por marca y categoría"
      queryKey="catalog-lines"
      list={() => lineService.list({ pageSize: 100 })}
      create={(values) =>
        lineService.create({
          code: values["code"] ?? "",
          name: values["name"] ?? "",
          ...(values["brandId"]
            ? { brandId: asEntityId(values["brandId"]) }
            : {}),
          ...(values["categoryId"]
            ? { categoryId: asEntityId(values["categoryId"]) }
            : {}),
        })
      }
      archive={(id) => lineService.archive(id)}
      columns={[
        {
          key: "code",
          header: "Código",
          cell: (row) => (
            <span className="text-xs font-semibold">{row.code}</span>
          ),
        },
        {
          key: "name",
          header: "Nombre",
          cell: (row) => <span className="text-xs">{row.name}</span>,
        },
      ]}
      fields={[
        { key: "code", label: "Código" },
        { key: "name", label: "Nombre" },
        {
          key: "brandId",
          label: "Marca",
          type: "select",
          options: brandOptions,
        },
        {
          key: "categoryId",
          label: "Categoría",
          type: "select",
          options: categoryOptions,
        },
      ]}
      emptyValues={{ code: "", name: "", brandId: "", categoryId: "" }}
    />
  );
}
