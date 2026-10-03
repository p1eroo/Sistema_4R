import { ListToolbar } from "@/components/erp/list-toolbar";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";

import { ModulePage } from "@/components/erp/module-page";
import {
  PurchaseTable,
  formatPurchaseDate,
  useSuppliers,
  type PurchaseColumn,
} from "@/components/purchases/purchase-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EXPENSE_CATEGORY_LABELS,
  ExpenseCategory,
  type Expense,
} from "@/domain/purchases/types";
import { formatMoney } from "@/domain/shared";
import { purchasesService } from "@/mocks/purchases/service";

export const Route = createFileRoute("/_erp/compras/gastos")({
  head: () => ({
    meta: [{ title: "Gastos diversos | 4 RUEDAS" }],
  }),
  component: GastosPage,
});

const EXPENSE_CATEGORIES = Object.values(ExpenseCategory);

function GastosPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [date, setDate] = useState("");

  const expensesQuery = useQuery({
    queryKey: ["purchases", "expenses"],
    queryFn: () => purchasesService.listExpenses({ pageSize: 100 }),
  });
  const { names } = useSuppliers();

  const rows = useMemo(() => {
    const items = expensesQuery.data?.items ?? [];
    const term = search.trim().toLowerCase();

    return items.filter((expense) => {
      if (
        term.length > 0 &&
        !`${expense.code} ${expense.description}`.toLowerCase().includes(term)
      ) {
        return false;
      }
      if (category !== "all" && expense.category !== category) {
        return false;
      }
      if (date && expense.incurredAt.slice(0, 10) !== date) {
        return false;
      }
      return true;
    });
  }, [expensesQuery.data, search, category, date]);

  const columns: readonly PurchaseColumn<Expense>[] = [
    {
      key: "description",
      header: "Gasto",
      cell: (expense) => (
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold">
            {expense.description}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            {expense.code} · {EXPENSE_CATEGORY_LABELS[expense.category]}
          </p>
        </div>
      ),
    },
    {
      key: "supplier",
      header: "Proveedor",
      className: "hidden md:table-cell",
      cell: (expense) =>
        expense.supplierId ? (
          <span className="text-xs">
            {names.get(expense.supplierId) ?? expense.supplierId}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      key: "date",
      header: "Fecha",
      className: "hidden sm:table-cell",
      cell: (expense) => (
        <span className="text-xs">
          {formatPurchaseDate(expense.incurredAt)}
        </span>
      ),
    },
    {
      key: "igv",
      header: "IGV",
      className: "hidden lg:table-cell",
      cell: (expense) => (
        <span className="text-xs tabular-nums">{formatMoney(expense.igv)}</span>
      ),
    },
    {
      key: "total",
      header: "Total",
      cell: (expense) => (
        <span className="text-xs font-semibold tabular-nums">
          {formatMoney(expense.total)}
        </span>
      ),
    },
  ];

  return (
    <ModulePage
      title="Gastos diversos"
      breadcrumb="Inicio / Compras / Gastos diversos"
    >
      <div className="space-y-4">
        <ListToolbar>
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por descripción"
              className="border-input bg-card shadow-none pl-9"
              aria-label="Buscar gastos"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full border-input bg-card shadow-none sm:w-52">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {EXPENSE_CATEGORIES.map((value) => (
                <SelectItem key={value} value={value}>
                  {EXPENSE_CATEGORY_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="w-full border-input bg-card shadow-none sm:w-40"
            aria-label="Filtrar por fecha"
          />
        </ListToolbar>

        <PurchaseTable
          title="Gastos diversos"
          subtitle="Gastos operativos sin movimiento de stock"
          columns={columns}
          rows={rows}
          getRowKey={(expense) => expense.id}
          isLoading={expensesQuery.isLoading}
          isError={expensesQuery.isError}
          onRetry={() => void expensesQuery.refetch()}
          emptyTitle="Sin gastos"
          emptyDescription="No hay gastos con los filtros actuales."
        />
      </div>
    </ModulePage>
  );
}
