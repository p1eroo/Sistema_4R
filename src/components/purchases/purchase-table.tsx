import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

import { SectionCard } from "@/components/erp/dashboard-ui";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/erp/data-states";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PurchaseStatus } from "@/domain/purchases/types";
import { supplierService } from "@/mocks/suppliers/service";

export type PurchaseColumn<T> = {
  readonly key: string;
  readonly header: string;
  readonly className?: string;
  readonly cell: (row: T) => ReactNode;
};

export type PurchaseTableProps<T> = {
  title: string;
  subtitle?: string;
  columns: readonly PurchaseColumn<T>[];
  rows: readonly T[];
  getRowKey: (row: T) => string;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
};

export function PurchaseTable<T>({
  title,
  subtitle,
  columns,
  rows,
  getRowKey,
  isLoading = false,
  isError = false,
  onRetry,
  emptyTitle,
  emptyDescription,
  emptyAction,
}: PurchaseTableProps<T>) {
  return (
    <SectionCard
      title={title}
      action={
        <span className="text-[11px] tabular-nums text-muted-foreground">
          {rows.length} registros
        </span>
      }
      {...(subtitle !== undefined ? { subtitle } : {})}
    >
      {isLoading && <LoadingState variant="table" rows={6} />}
      {!isLoading && isError && (
        <ErrorState {...(onRetry ? { onRetry } : {})} />
      )}
      {!isLoading && !isError && rows.length === 0 && (
        <EmptyState
          title={emptyTitle ?? "Sin resultados"}
          description={
            emptyDescription ?? "No hay registros con los filtros actuales."
          }
          {...(emptyAction ? { action: emptyAction } : {})}
        />
      )}
      {!isLoading && !isError && rows.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={getRowKey(row)}>
                {columns.map((column) => (
                  <TableCell key={column.key} className={column.className}>
                    {column.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </SectionCard>
  );
}

export function purchaseStatusVariant(
  status: PurchaseStatus,
): "info" | "success" | "warning" | "danger" | "neutral" {
  switch (status) {
    case PurchaseStatus.Received:
      return "success";
    case PurchaseStatus.Sent:
      return "info";
    case PurchaseStatus.Cancelled:
      return "danger";
    default:
      return "neutral";
  }
}

export function formatPurchaseDate(
  value: string | undefined,
  fallback = "—",
): string {
  if (!value) {
    return fallback;
  }

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export type SupplierOption = {
  readonly id: string;
  readonly name: string;
};

export function useSuppliers(): {
  names: Map<string, string>;
  options: readonly SupplierOption[];
} {
  const query = useQuery({
    queryKey: ["suppliers", "options"],
    queryFn: () => supplierService.list({ pageSize: 100 }),
  });

  const items = query.data?.items ?? [];

  return {
    names: new Map(
      items.map((supplier) => [
        supplier.id,
        supplier.tradeName ?? supplier.businessName,
      ]),
    ),
    options: items.map((supplier) => ({
      id: supplier.id,
      name: supplier.tradeName ?? supplier.businessName,
    })),
  };
}
