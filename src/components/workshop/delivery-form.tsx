import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { PenLine } from "lucide-react";

import { formatLimaTime } from "@/components/appointments/appointment-datetime";
import {
  DASHBOARD_DELIVERY_NOTES,
  deliveryStatusVariant,
} from "@/components/workshop/delivery-status";
import { SectionCard, StatusBadge } from "@/components/erp/dashboard-ui";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/erp/data-states";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { asEntityId } from "@/domain/shared";
import { vehicleDisplayName, type Vehicle } from "@/domain/vehicles";
import {
  WORK_ORDER_STATUS_LABELS,
  WorkOrderStatus,
} from "@/domain/work-orders";
import {
  DELIVERY_CHECKLIST_CATALOG,
  DELIVERY_STATUS_LABELS,
  DeliveryStatus,
  type Delivery,
} from "@/domain/workshop-ops";
import { customerService } from "@/mocks/customers/service";
import { vehicleService } from "@/mocks/vehicles/service";
import { deliveryService } from "@/mocks/workshop-ops/delivery-service";
import { workOrderService } from "@/mocks/work-orders/service";

export function DeliveryForm({
  delivery,
  vehicle,
  customerName,
  onDelivered,
}: {
  delivery: Delivery;
  vehicle?: Vehicle;
  customerName: string;
  onDelivered?: () => void;
}) {
  const queryClient = useQueryClient();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [receivedBy, setReceivedBy] = useState(customerName);
  const [mileageKm, setMileageKm] = useState("");
  const [signed, setSigned] = useState(false);

  const plate = vehicle?.plate ?? "";
  const note = DASHBOARD_DELIVERY_NOTES[plate] ?? delivery.notes ?? "Entrega";
  const allChecked = DELIVERY_CHECKLIST_CATALOG.every(
    (item) => checked[item.id],
  );

  const deliverMutation = useMutation({
    mutationFn: () =>
      deliveryService.markDelivered(delivery.id, {
        ...(receivedBy.trim() ? { receivedBy: receivedBy.trim() } : {}),
        ...(mileageKm.trim() ? { mileageKm: Number(mileageKm) } : {}),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["deliveries"] }),
        queryClient.invalidateQueries({ queryKey: ["work-orders"] }),
      ]);
      onDelivered?.();
    },
  });

  return (
    <SectionCard
      title={vehicle ? vehicleDisplayName(vehicle) : delivery.vehicleId}
      subtitle={`${
        delivery.scheduledAt ? formatLimaTime(delivery.scheduledAt) : "—"
      } · ${note}`}
      action={
        <StatusBadge variant={deliveryStatusVariant(delivery.status)}>
          {DELIVERY_STATUS_LABELS[delivery.status]}
        </StatusBadge>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        {plate && (
          <div className="w-fit rounded-md bg-primary px-2 py-1 text-[11px] font-black text-primary-foreground">
            {plate}
          </div>
        )}

        <ul className="space-y-2">
          {DELIVERY_CHECKLIST_CATALOG.map((item) => (
            <li key={item.id} className="flex items-center gap-3">
              <Checkbox
                id={`dlv-${delivery.id}-${item.id}`}
                checked={checked[item.id] === true}
                onCheckedChange={(value) =>
                  setChecked((current) => ({
                    ...current,
                    [item.id]: value === true,
                  }))
                }
              />
              <Label
                htmlFor={`dlv-${delivery.id}-${item.id}`}
                className="text-xs font-semibold"
              >
                {item.label}
              </Label>
            </li>
          ))}
        </ul>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor={`dlv-recibe-${delivery.id}`}>Recibe</Label>
            <Input
              id={`dlv-recibe-${delivery.id}`}
              value={receivedBy}
              onChange={(event) => setReceivedBy(event.target.value)}
              className="bg-white/70"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`dlv-km-${delivery.id}`}>Kilometraje</Label>
            <Input
              id={`dlv-km-${delivery.id}`}
              type="number"
              min={0}
              value={mileageKm}
              onChange={(event) => setMileageKm(event.target.value)}
              className="bg-white/70"
              placeholder="Opcional"
            />
          </div>
        </div>

        <div className="rounded-lg border border-dashed border-border p-3">
          <p className="text-[11px] text-muted-foreground">Firma mock</p>
          <p className="mt-1 font-serif text-lg">
            {signed && receivedBy.trim() ? receivedBy : "—"}
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-2"
            onClick={() => setSigned(true)}
            disabled={!receivedBy.trim()}
          >
            <PenLine /> Firmar
          </Button>
        </div>

        {deliverMutation.isError && (
          <ErrorState
            title="No se pudo entregar"
            message={
              deliverMutation.error instanceof Error
                ? deliverMutation.error.message
                : "La orden debe estar lista."
            }
          />
        )}

        {deliverMutation.data && (
          <p className="text-xs font-semibold text-emerald-700">
            Entrega registrada. La OT quedó{" "}
            {WORK_ORDER_STATUS_LABELS[WorkOrderStatus.Delivered]}.
          </p>
        )}

        <div className="flex flex-wrap justify-end gap-2">
          <Button asChild size="sm" variant="outline">
            <Link to="/pos">Ir a POS</Link>
          </Button>
          <Button
            type="button"
            disabled={
              !allChecked ||
              !signed ||
              !receivedBy.trim() ||
              deliverMutation.isPending ||
              delivery.status === DeliveryStatus.Delivered
            }
            onClick={() => deliverMutation.mutate()}
          >
            {deliverMutation.isPending ? "Entregando…" : "Completar entrega"}
          </Button>
        </div>
      </form>
    </SectionCard>
  );
}

export function DeliveryQueue() {
  const [selectedId, setSelectedId] = useState<string>();

  const todayQuery = useQuery({
    queryKey: ["deliveries", "today"],
    queryFn: () => deliveryService.listToday({ pageSize: 20 }),
  });

  const customersQuery = useQuery({
    queryKey: ["customers", { pageSize: 100 }],
    queryFn: () =>
      customerService.list({ pageSize: 100, sortBy: "displayName" }),
  });

  const vehiclesQuery = useQuery({
    queryKey: ["vehicles", { pageSize: 100 }],
    queryFn: () => vehicleService.list({ pageSize: 100, sortBy: "plate" }),
  });

  const customers = useMemo(
    () =>
      new Map(
        (customersQuery.data?.items ?? []).map((customer) => [
          customer.id,
          customer.displayName,
        ]),
      ),
    [customersQuery.data?.items],
  );

  const vehicles = useMemo(
    () =>
      new Map(
        (vehiclesQuery.data?.items ?? []).map((vehicle) => [
          vehicle.id,
          vehicle,
        ]),
      ),
    [vehiclesQuery.data?.items],
  );

  const pending = (todayQuery.data?.items ?? []).filter(
    (delivery) => delivery.status !== DeliveryStatus.Delivered,
  );
  const selected =
    pending.find((delivery) => delivery.id === selectedId) ?? pending[0];
  const loading =
    todayQuery.isLoading || customersQuery.isLoading || vehiclesQuery.isLoading;

  return (
    <div className="space-y-3">
      <SectionCard title="Entregas de hoy" subtitle="Vehículos listos pronto">
        {loading && <LoadingState />}
        {todayQuery.isError && (
          <ErrorState onRetry={() => void todayQuery.refetch()} />
        )}
        {!loading && !todayQuery.isError && pending.length === 0 && (
          <EmptyState
            title="Sin entregas"
            description="No hay vehículos pendientes de entrega hoy."
          />
        )}
        {!loading && !todayQuery.isError && pending.length > 0 && (
          <div className="space-y-3">
            {pending.map((delivery) => {
              const vehicle = vehicles.get(delivery.vehicleId);
              const plate = vehicle?.plate ?? delivery.vehicleId;
              const note =
                DASHBOARD_DELIVERY_NOTES[plate] ?? delivery.notes ?? "Entrega";
              return (
                <button
                  key={delivery.id}
                  type="button"
                  onClick={() => setSelectedId(delivery.id)}
                  className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-md border border-border p-3 text-left"
                >
                  <div className="rounded-md bg-primary px-2 py-1 text-[11px] font-black text-primary-foreground">
                    {plate}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold">
                      {vehicle ? vehicle.brand + " " + vehicle.model : plate}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {note}
                    </p>
                  </div>
                  <p className="text-xs font-bold tabular-nums">
                    {delivery.scheduledAt
                      ? formatLimaTime(delivery.scheduledAt)
                      : "—"}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </SectionCard>

      {selected ? (
        <DeliveryForm
          key={selected.id}
          delivery={selected}
          {...(vehicles.get(selected.vehicleId)
            ? { vehicle: vehicles.get(selected.vehicleId)! }
            : {})}
          customerName={customers.get(selected.customerId) ?? ""}
          onDelivered={() => setSelectedId(undefined)}
        />
      ) : null}
    </div>
  );
}

export function DeliveryPanel({ workOrderId }: { workOrderId: string }) {
  const deliveryQuery = useQuery({
    queryKey: ["deliveries", "work-order", workOrderId],
    queryFn: async () =>
      (await deliveryService.getByWorkOrder(asEntityId(workOrderId))) ?? null,
  });

  const vehicleQuery = useQuery({
    queryKey: ["vehicles", deliveryQuery.data?.vehicleId],
    queryFn: async () => {
      const vehicleId = deliveryQuery.data?.vehicleId;
      if (!vehicleId) {
        return null;
      }
      return (await vehicleService.getById(vehicleId)) ?? null;
    },
    enabled: deliveryQuery.data?.vehicleId !== undefined,
  });

  const customerQuery = useQuery({
    queryKey: ["customers", deliveryQuery.data?.customerId],
    queryFn: async () => {
      const customerId = deliveryQuery.data?.customerId;
      if (!customerId) {
        return null;
      }
      return (await customerService.getById(customerId)) ?? null;
    },
    enabled: deliveryQuery.data?.customerId !== undefined,
  });

  if (deliveryQuery.isLoading) {
    return <LoadingState />;
  }

  if (deliveryQuery.isError) {
    return <ErrorState onRetry={() => void deliveryQuery.refetch()} />;
  }

  const delivery = deliveryQuery.data;
  if (!delivery) {
    return (
      <EmptyState
        title="Sin entrega programada"
        description="Esta orden aún no tiene una entrega en la cola de hoy."
      />
    );
  }

  if (delivery.status === DeliveryStatus.Delivered) {
    return (
      <EmptyState
        title="Entregada"
        description={`Recibió ${delivery.receivedBy ?? "el cliente"}.`}
      />
    );
  }

  const vehicle = vehicleQuery.data;
  return (
    <DeliveryForm
      delivery={delivery}
      {...(vehicle ? { vehicle } : {})}
      customerName={customerQuery.data?.displayName ?? ""}
    />
  );
}
