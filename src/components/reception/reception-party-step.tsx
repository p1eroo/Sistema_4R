import { useEffect, useMemo, useState, type MutableRefObject } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import { CUSTOMER_BRANCHES } from "@/components/customers/customer-list-filters";
import {
  CustomerForm,
  type CustomerFormValues,
} from "@/components/customers/customer-form";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/erp/data-states";
import { ListToolbar, ListToolbarSearch } from "@/components/erp/list-toolbar";
import {
  isPlateLookup,
  normalizeLookupTerm,
} from "@/components/reception/reception-lookup";
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
import { Textarea } from "@/components/ui/textarea";
import {
  VehicleForm,
  type VehicleFormValues,
} from "@/components/vehicles/vehicle-form";
import type { Customer } from "@/domain/customers/types";
import type { Reception } from "@/domain/reception";
import { asEntityId, type EntityId } from "@/domain/shared";
import { vehicleDisplayName, type Vehicle } from "@/domain/vehicles";
import { customerService } from "@/mocks/customers/service";
import { receptionService } from "@/mocks/reception/service";
import { vehicleService } from "@/mocks/vehicles/service";

type LookupResult = {
  readonly customers: readonly Customer[];
  readonly vehicle?: Vehicle;
  readonly owner?: Customer;
};

async function lookupParty(term: string): Promise<LookupResult> {
  const normalized = normalizeLookupTerm(term);

  if (isPlateLookup(normalized)) {
    const vehicle = await vehicleService.getByPlate(normalized);
    if (!vehicle) {
      return { customers: [] };
    }

    const owner = await customerService.getById(vehicle.customerId);
    return {
      customers: owner ? [owner] : [],
      vehicle,
      ...(owner ? { owner } : {}),
    };
  }

  const result = await customerService.searchByDocOrName(normalized, {
    pageSize: 20,
    sortBy: "displayName",
  });
  return { customers: result.items };
}

export function ReceptionPartyStep({
  receptionId,
  submitRef,
  onReadyChange,
  onSaved,
  onContinue,
}: {
  receptionId?: EntityId;
  submitRef?: MutableRefObject<(() => void) | null>;
  onReadyChange?: (ready: boolean) => void;
  onSaved?: (reception: Reception) => void;
  onContinue?: () => void;
}) {
  const queryClient = useQueryClient();
  const [term, setTerm] = useState("");
  const [submittedTerm, setSubmittedTerm] = useState("");
  const [customer, setCustomer] = useState<Customer | undefined>();
  const [vehicle, setVehicle] = useState<Vehicle | undefined>();
  const [reason, setReason] = useState("Ingreso a taller");
  const [branchId, setBranchId] = useState<string>(
    CUSTOMER_BRANCHES[0]?.id ?? "BR-LM",
  );
  const [customerOpen, setCustomerOpen] = useState(false);
  const [vehicleOpen, setVehicleOpen] = useState(false);

  const lookupQuery = useQuery({
    queryKey: ["reception-lookup", submittedTerm],
    queryFn: () => lookupParty(submittedTerm),
    enabled: submittedTerm.length > 0,
  });

  const vehiclesQuery = useQuery({
    queryKey: ["vehicles", "customer", customer?.id],
    queryFn: () =>
      vehicleService.listByCustomer(customer!.id, { pageSize: 50 }),
    enabled: customer !== undefined,
  });

  const createCustomerMutation = useMutation({
    mutationFn: (values: CustomerFormValues) => customerService.create(values),
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
      setCustomer(created);
      setVehicle(undefined);
      setCustomerOpen(false);
      setVehicleOpen(true);
    },
  });

  const createVehicleMutation = useMutation({
    mutationFn: (values: VehicleFormValues) => vehicleService.create(values),
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      setVehicle(created);
      if (created.usualBranch) {
        setBranchId(created.usualBranch.id);
      }
      setVehicleOpen(false);
    },
  });

  const persistMutation = useMutation({
    mutationFn: async () => {
      if (!customer || !vehicle) {
        throw new Error("Selecciona cliente y vehículo.");
      }

      const trimmedReason = reason.trim();
      if (!trimmedReason) {
        throw new Error("Indica el motivo de ingreso.");
      }

      const values = {
        customerId: customer.id,
        vehicleId: vehicle.id,
        branchId: asEntityId(branchId),
        reason: trimmedReason,
      };

      if (receptionId) {
        return receptionService.updateStep(receptionId, {
          step: "party",
          values,
        });
      }

      return receptionService.createDraft(values);
    },
    onSuccess: (reception) => {
      onSaved?.(reception);
      onContinue?.();
    },
  });

  const ready = Boolean(customer && vehicle && reason.trim());

  useEffect(() => {
    onReadyChange?.(ready);
  }, [onReadyChange, ready]);

  if (submitRef) {
    submitRef.current = () => {
      if (ready && !persistMutation.isPending) {
        persistMutation.mutate();
      }
    };
  }

  useEffect(() => {
    const result = lookupQuery.data;
    if (!result) {
      return;
    }

    if (result.vehicle) {
      setVehicle(result.vehicle);
      if (result.vehicle.usualBranch) {
        setBranchId(result.vehicle.usualBranch.id);
      }
    }

    if (result.owner) {
      setCustomer(result.owner);
      if (!result.vehicle?.usualBranch && result.owner.preferredBranch) {
        setBranchId(result.owner.preferredBranch.id);
      }
    }
  }, [lookupQuery.data]);

  const customerHits = lookupQuery.data?.customers ?? [];
  const vehicles = vehiclesQuery.data?.items ?? [];

  const customersForForm = useMemo(() => {
    if (!customer) {
      return [];
    }
    return [{ id: customer.id, displayName: customer.displayName }];
  }, [customer]);

  function runSearch() {
    const normalized = normalizeLookupTerm(term);
    if (!normalized) {
      return;
    }
    setSubmittedTerm(normalized);
    persistMutation.reset();
  }

  useEffect(() => {
    const normalized = normalizeLookupTerm(term);
    if (!normalized) {
      setSubmittedTerm("");
      return;
    }

    const timer = setTimeout(() => setSubmittedTerm(normalized), 350);
    return () => clearTimeout(timer);
  }, [term]);

  return (
    <div className="space-y-4">
      <ListToolbar>
        <ListToolbarSearch
          value={term}
          onChange={setTerm}
          onEnter={runSearch}
          placeholder="Buscar por placa, DNI, RUC o nombre"
          ariaLabel="Buscar cliente o vehículo"
        />
        <Button type="button" onClick={() => setCustomerOpen(true)}>
          <Plus /> Nuevo cliente
        </Button>
      </ListToolbar>

      {lookupQuery.isFetching && <LoadingState />}
      {lookupQuery.isError && (
        <ErrorState onRetry={() => void lookupQuery.refetch()} />
      )}
      {lookupQuery.isSuccess &&
        !lookupQuery.data.vehicle &&
        customerHits.length === 0 && (
          <EmptyState
            title="Sin coincidencias"
            description="No hay cliente ni unidad con ese criterio. Puedes registrarlos ahora."
            action={
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCustomerOpen(true)}
              >
                Nuevo cliente
              </Button>
            }
          />
        )}

      {lookupQuery.isSuccess &&
        !lookupQuery.data.vehicle &&
        customerHits.length > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-muted-foreground">
              Clientes encontrados
            </p>
            <ul className="divide-y divide-border/60 rounded-lg border border-border/60 bg-white/50">
              {customerHits.map((hit) => (
                <li key={hit.id}>
                  <button
                    type="button"
                    className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left hover:bg-muted/50"
                    onClick={() => {
                      setCustomer(hit);
                      setVehicle(undefined);
                      if (hit.preferredBranch) {
                        setBranchId(hit.preferredBranch.id);
                      }
                    }}
                  >
                    <span className="text-xs font-semibold">
                      {hit.displayName}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {hit.documentType} {hit.documentNumber}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

      {customer && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border/60 bg-white/50 p-3">
            <p className="text-[11px] text-muted-foreground">Cliente</p>
            <p className="text-xs font-semibold">{customer.displayName}</p>
            <p className="text-[11px] text-muted-foreground">
              {customer.documentType} {customer.documentNumber}
            </p>
          </div>
          <div className="rounded-lg border border-border/60 bg-white/50 p-3">
            <p className="text-[11px] text-muted-foreground">Vehículo</p>
            {vehicle ? (
              <>
                <p className="text-xs font-semibold">
                  {vehicleDisplayName(vehicle)}
                </p>
                <span className="mt-1 inline-flex rounded-md bg-primary px-2 py-1 text-[10px] font-bold text-primary-foreground">
                  {vehicle.plate}
                </span>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                Selecciona o registra una unidad.
              </p>
            )}
          </div>
        </div>
      )}

      {customer && (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold text-muted-foreground">
              Unidades del cliente
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setVehicleOpen(true)}
            >
              <Plus /> Nuevo vehículo
            </Button>
          </div>
          {vehiclesQuery.isLoading && <LoadingState variant="table" rows={3} />}
          {vehiclesQuery.isError && (
            <ErrorState onRetry={() => void vehiclesQuery.refetch()} />
          )}
          {vehiclesQuery.isSuccess && vehicles.length === 0 && (
            <EmptyState
              title="Sin vehículos"
              description="Registra la unidad para continuar la recepción."
              action={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setVehicleOpen(true)}
                >
                  Nuevo vehículo
                </Button>
              }
            />
          )}
          {vehiclesQuery.isSuccess && vehicles.length > 0 && (
            <ul className="divide-y divide-border/60 rounded-lg border border-border/60 bg-white/50">
              {vehicles.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-muted/50"
                    onClick={() => {
                      setVehicle(item);
                      if (item.usualBranch) {
                        setBranchId(item.usualBranch.id);
                      }
                    }}
                  >
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold">
                        {vehicleDisplayName(item)}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {item.color}
                      </span>
                    </span>
                    <span className="inline-flex rounded-md bg-primary px-2 py-1 text-[10px] font-bold text-primary-foreground">
                      {item.plate}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1.5 text-xs font-medium">
          Motivo de ingreso
          <Textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={3}
            className="bg-white/70 text-xs font-normal"
          />
        </label>
        <label className="space-y-1.5 text-xs font-medium">
          Sede
          <Select value={branchId} onValueChange={setBranchId}>
            <SelectTrigger className="bg-white/70">
              <SelectValue placeholder="Sede" />
            </SelectTrigger>
            <SelectContent>
              {CUSTOMER_BRANCHES.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      </div>

      {persistMutation.isError && (
        <ErrorState
          title="No se pudo guardar el ingreso"
          message={
            persistMutation.error instanceof Error
              ? persistMutation.error.message
              : "Revisa cliente, vehículo y motivo."
          }
        />
      )}

      <div className="flex justify-end">
        <Button
          type="button"
          disabled={!ready || persistMutation.isPending}
          onClick={() => persistMutation.mutate()}
        >
          {persistMutation.isPending ? "Guardando…" : "Guardar y continuar"}
        </Button>
      </div>

      <Dialog open={customerOpen} onOpenChange={setCustomerOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo cliente</DialogTitle>
            <DialogDescription>
              Quedará asociado a esta recepción.
            </DialogDescription>
          </DialogHeader>
          {createCustomerMutation.isError && (
            <ErrorState
              title="No se pudo registrar"
              message={
                createCustomerMutation.error instanceof Error
                  ? createCustomerMutation.error.message
                  : "Revisa los datos e inténtalo de nuevo."
              }
            />
          )}
          <CustomerForm
            branches={CUSTOMER_BRANCHES}
            submitting={createCustomerMutation.isPending}
            onSubmit={async (values) => {
              await createCustomerMutation.mutateAsync(values);
            }}
            onCancel={() => setCustomerOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={vehicleOpen} onOpenChange={setVehicleOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo vehículo</DialogTitle>
            <DialogDescription>
              {customer
                ? `Quedará asociado a ${customer.displayName}.`
                : "Primero registra o busca un cliente."}
            </DialogDescription>
          </DialogHeader>
          {createVehicleMutation.isError && (
            <ErrorState
              title="No se pudo registrar"
              message={
                createVehicleMutation.error instanceof Error
                  ? createVehicleMutation.error.message
                  : "Revisa los datos e inténtalo de nuevo."
              }
            />
          )}
          {customer && (
            <VehicleForm
              lockedCustomerId={customer.id}
              customers={customersForForm}
              submitting={createVehicleMutation.isPending}
              onSubmit={async (values) => {
                await createVehicleMutation.mutateAsync(values);
              }}
              onCancel={() => setVehicleOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
