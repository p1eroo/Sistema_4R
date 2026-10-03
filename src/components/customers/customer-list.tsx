import { ListToolbar, ListToolbarSearch } from "@/components/erp/list-toolbar";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import {
  CustomerForm,
  type CustomerFormValues,
} from "@/components/customers/customer-form";
import {
  CUSTOMER_BRANCHES,
  EMPTY_CUSTOMER_FILTERS,
  customerStatusLabel,
  customerStatusVariant,
  customerTypeLabel,
  filterCustomers,
  type CustomerListFilters,
} from "@/components/customers/customer-list-filters";
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
import { CustomerStatus } from "@/domain/customers/types";
import type { ListQuery } from "@/domain/shared/list-query";
import { customerService } from "@/mocks/customers/service";

export function CustomerList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<CustomerListFilters>(
    EMPTY_CUSTOMER_FILTERS,
  );
  const [createOpen, setCreateOpen] = useState(false);

  const listQuery: ListQuery = {
    pageSize: 100,
    sortBy: "displayName",
    ...(filters.search.trim() ? { search: filters.search.trim() } : {}),
  };

  const customersQuery = useQuery({
    queryKey: ["customers", listQuery],
    queryFn: () => customerService.list(listQuery),
  });

  const createMutation = useMutation({
    mutationFn: (values: CustomerFormValues) => customerService.create(values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
      setCreateOpen(false);
    },
  });

  const rows = useMemo(
    () => filterCustomers(customersQuery.data?.items ?? [], filters),
    [customersQuery.data?.items, filters],
  );

  const updateFilter = <K extends keyof CustomerListFilters>(
    key: K,
    value: CustomerListFilters[K],
  ) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="space-y-4">
      <ListToolbar>
        <ListToolbarSearch
          value={filters.search}
          onChange={(value) => updateFilter("search", value)}
          placeholder="Buscar por nombre o documento"
          ariaLabel="Buscar clientes"
        />
        <Select
          value={filters.branchId}
          onValueChange={(value) => updateFilter("branchId", value)}
        >
          <SelectTrigger className="w-full border-input bg-card shadow-none sm:w-48">
            <SelectValue placeholder="Sede" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las sedes</SelectItem>
            {CUSTOMER_BRANCHES.map((branch) => (
              <SelectItem key={branch.id} value={branch.id}>
                {branch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.status}
          onValueChange={(value) => updateFilter("status", value)}
        >
          <SelectTrigger className="w-full border-input bg-card shadow-none sm:w-40">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value={CustomerStatus.Active}>Activo</SelectItem>
            <SelectItem value={CustomerStatus.Inactive}>Inactivo</SelectItem>
            <SelectItem value={CustomerStatus.Archived}>Archivado</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus /> Nuevo cliente
        </Button>
      </ListToolbar>

      <SectionCard
        title="Clientes"
        subtitle="Directorio de personas y empresas"
        action={
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {rows.length} registros
          </span>
        }
      >
        {customersQuery.isLoading && <LoadingState variant="table" rows={6} />}
        {customersQuery.isError && (
          <ErrorState onRetry={() => void customersQuery.refetch()} />
        )}
        {customersQuery.isSuccess && rows.length === 0 && (
          <EmptyState
            title="Sin clientes"
            description="No hay resultados con los filtros actuales."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCreateOpen(true)}
              >
                Registrar cliente
              </Button>
            }
          />
        )}
        {customersQuery.isSuccess && rows.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead className="hidden md:table-cell">Teléfono</TableHead>
                <TableHead className="hidden lg:table-cell">Correo</TableHead>
                <TableHead className="hidden sm:table-cell">Sede</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((customer) => (
                <TableRow
                  key={customer.id}
                  className="cursor-pointer"
                  onClick={() =>
                    void navigate({
                      to: "/clientes/$id",
                      params: { id: customer.id },
                    })
                  }
                >
                  <TableCell>
                    <p className="truncate text-xs font-semibold">
                      {customer.displayName}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {customerTypeLabel(customer.type)}
                    </p>
                  </TableCell>
                  <TableCell className="text-xs tabular-nums">
                    {customer.documentType} {customer.documentNumber}
                  </TableCell>
                  <TableCell className="hidden text-xs tabular-nums md:table-cell">
                    {customer.phones[0]?.number ?? "—"}
                  </TableCell>
                  <TableCell className="hidden truncate text-xs lg:table-cell">
                    {customer.email ?? "—"}
                  </TableCell>
                  <TableCell className="hidden text-xs sm:table-cell">
                    {customer.preferredBranch?.name ?? "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      variant={customerStatusVariant(customer.status)}
                    >
                      {customerStatusLabel(customer.status)}
                    </StatusBadge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SectionCard>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo cliente</DialogTitle>
            <DialogDescription>
              Completa los datos para registrarlo en el directorio.
            </DialogDescription>
          </DialogHeader>
          {createMutation.isError && (
            <ErrorState
              title="No se pudo registrar"
              message={
                createMutation.error instanceof Error
                  ? createMutation.error.message
                  : "Revisa los datos e inténtalo de nuevo."
              }
            />
          )}
          <CustomerForm
            branches={CUSTOMER_BRANCHES}
            submitting={createMutation.isPending}
            onSubmit={async (values) => {
              await createMutation.mutateAsync(values);
            }}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
