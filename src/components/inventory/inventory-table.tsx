import type { ReactNode } from "react";

import { SectionCard, StatusBadge } from "@/components/erp/dashboard-ui";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/erp/data-states";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { StockBalance } from "@/domain/inventory/types";

export const BRANCH_LABELS: Record<string, string> = {
  "BR-LM": "La Molina",
  "BR-SU": "Surco",
  "BR-SM": "San Miguel",
};

export type InventoryColumn<T> = {
  readonly key: string;
  readonly header: string;
  readonly className?: string;
  readonly cell: (row: T) => ReactNode;
};

export type InventoryPagination = {
  readonly page: number;
  readonly totalPages: number;
  readonly onPrevious: () => void;
  readonly onNext: () => void;
};

export type InventoryTableProps<T> = {
  title: string;
  subtitle?: string;
  columns: readonly InventoryColumn<T>[];
  rows: readonly T[];
  getRowKey: (row: T) => string;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  pagination?: InventoryPagination;
};

export function InventoryTable<T>({
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
  pagination,
}: InventoryTableProps<T>) {
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
        />
      )}
      {!isLoading && !isError && rows.length > 0 && (
        <>
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
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={pagination.onPrevious}
              >
                Anterior
              </Button>
              <span className="text-[11px] tabular-nums text-muted-foreground">
                Página {pagination.page} de {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={pagination.onNext}
              >
                Siguiente
              </Button>
            </div>
          )}
        </>
      )}
    </SectionCard>
  );
}

export function StockBadge({
  balance,
}: {
  balance: Pick<StockBalance, "quantity" | "minStock">;
}) {
  if (balance.quantity <= balance.minStock) {
    return <StatusBadge variant="danger">Crítico</StatusBadge>;
  }

  return <StatusBadge variant="success">Disponible</StatusBadge>;
}

export function branchLabel(branchId: string): string {
  return BRANCH_LABELS[branchId] ?? branchId;
}

export function formatStockDate(value: string): string {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}
