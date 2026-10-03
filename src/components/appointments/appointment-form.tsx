import { useMemo, useState } from "react";

import { CUSTOMER_BRANCHES } from "@/components/customers/customer-list-filters";
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
import {
  APPOINTMENT_SERVICE_LABELS,
  AppointmentServiceType,
  limaDateTimeIso,
} from "@/domain/appointments";
import type { AppointmentCreateValues } from "@/domain/appointments/schemas";
import type { Customer } from "@/domain/customers";
import { asEntityId } from "@/domain/shared";
import type { Vehicle } from "@/domain/vehicles";

const DURATIONS = [30, 45, 60, 90] as const;

export function AppointmentForm({
  dateKey,
  customers,
  vehicles,
  submitting,
  onSubmit,
  onCancel,
}: {
  dateKey: string;
  customers: readonly Customer[];
  vehicles: readonly Vehicle[];
  submitting: boolean;
  onSubmit: (values: AppointmentCreateValues) => Promise<void>;
  onCancel: () => void;
}) {
  const [customerId, setCustomerId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [branchId, setBranchId] = useState("BR-LM");
  const [time, setTime] = useState("10:00");
  const [duration, setDuration] = useState("60");
  const [serviceType, setServiceType] = useState(
    AppointmentServiceType.Maintenance,
  );
  const [notes, setNotes] = useState("");

  const customerVehicles = useMemo(
    () =>
      vehicles.filter((vehicle) =>
        customerId ? vehicle.customerId === customerId : false,
      ),
    [customerId, vehicles],
  );

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit({
          customerId: asEntityId(customerId),
          vehicleId: asEntityId(vehicleId),
          branchId: asEntityId(branchId),
          scheduledAt: limaDateTimeIso(dateKey, time),
          durationMinutes: Number(duration),
          serviceType,
          ...(notes.trim() ? { notes: notes.trim() } : {}),
        });
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="cita-cliente">Cliente</Label>
        <Select
          value={customerId}
          onValueChange={(value) => {
            setCustomerId(value);
            setVehicleId("");
            const customer = customers.find((item) => item.id === value);
            if (customer?.preferredBranch) {
              setBranchId(customer.preferredBranch.id);
            }
          }}
        >
          <SelectTrigger id="cita-cliente" className="bg-white/70">
            <SelectValue placeholder="Selecciona cliente" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((customer) => (
              <SelectItem key={customer.id} value={customer.id}>
                {customer.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cita-vehiculo">Vehículo</Label>
        <Select
          value={vehicleId}
          onValueChange={setVehicleId}
          disabled={!customerId}
        >
          <SelectTrigger id="cita-vehiculo" className="bg-white/70">
            <SelectValue placeholder="Selecciona vehículo" />
          </SelectTrigger>
          <SelectContent>
            {customerVehicles.map((vehicle) => (
              <SelectItem key={vehicle.id} value={vehicle.id}>
                {vehicle.plate} · {vehicle.brand} {vehicle.model}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="cita-hora">Hora</Label>
          <Input
            id="cita-hora"
            type="time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
            className="bg-white/70"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cita-duracion">Duración</Label>
          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger id="cita-duracion" className="bg-white/70">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DURATIONS.map((minutes) => (
                <SelectItem key={minutes} value={String(minutes)}>
                  {minutes} min
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="cita-sede">Sede</Label>
          <Select value={branchId} onValueChange={setBranchId}>
            <SelectTrigger id="cita-sede" className="bg-white/70">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CUSTOMER_BRANCHES.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cita-servicio">Servicio</Label>
          <Select
            value={serviceType}
            onValueChange={(value) =>
              setServiceType(value as AppointmentServiceType)
            }
          >
            <SelectTrigger id="cita-servicio" className="bg-white/70">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(AppointmentServiceType).map((type) => (
                <SelectItem key={type} value={type}>
                  {APPOINTMENT_SERVICE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cita-notas">Notas</Label>
        <Input
          id="cita-notas"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="bg-white/70"
          placeholder="Opcional"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={submitting || !customerId || !vehicleId}
        >
          {submitting ? "Guardando…" : "Crear cita"}
        </Button>
      </div>
    </form>
  );
}
