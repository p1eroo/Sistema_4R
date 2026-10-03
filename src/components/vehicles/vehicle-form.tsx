import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EntityId } from "@/domain/shared";
import {
  vehicleCreateSchema,
  type VehicleCreateValues,
} from "@/domain/vehicles/schemas";
import { FuelType } from "@/domain/vehicles/types";

export type VehicleFormValues = VehicleCreateValues;

export type VehicleCustomerOption = {
  readonly id: EntityId;
  readonly displayName: string;
};

export type VehicleFormProps = {
  mode?: "create" | "edit";
  initialValues?: Partial<VehicleFormValues>;
  customers: readonly VehicleCustomerOption[];
  lockedCustomerId?: EntityId;
  submitting?: boolean;
  onSubmit: (values: VehicleFormValues) => void | Promise<void>;
  onCancel?: () => void;
};

const FUEL_TYPES: readonly FuelType[] = [
  FuelType.Gasolina,
  FuelType.Diesel,
  FuelType.GNV,
  FuelType.GLP,
  FuelType.Hibrido,
  FuelType.Electrico,
];

const FUEL_LABELS: Record<FuelType, string> = {
  [FuelType.Gasolina]: "Gasolina",
  [FuelType.Diesel]: "Diésel",
  [FuelType.GNV]: "GNV",
  [FuelType.GLP]: "GLP",
  [FuelType.Hibrido]: "Híbrido",
  [FuelType.Electrico]: "Eléctrico",
};

function toOptionalNumber(value: string): number | undefined {
  if (value.trim() === "") {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function VehicleForm({
  mode = "create",
  initialValues,
  customers,
  lockedCustomerId,
  submitting = false,
  onSubmit,
  onCancel,
}: VehicleFormProps) {
  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleCreateSchema),
    defaultValues: {
      ...(lockedCustomerId !== undefined
        ? { customerId: lockedCustomerId }
        : {}),
      plate: "",
      brand: "",
      model: "",
      color: "",
      fuelType: FuelType.Gasolina,
      odometerKm: 0,
      ...initialValues,
    },
  });

  const submit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <Form {...form}>
      <form onSubmit={submit} className="space-y-6" noValidate>
        <FormField
          control={form.control}
          name="customerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente</FormLabel>
              <Select
                value={field.value ?? ""}
                onValueChange={field.onChange}
                disabled={
                  lockedCustomerId !== undefined || customers.length === 0
                }
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el cliente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="plate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Placa</FormLabel>
                <FormControl>
                  <Input
                    placeholder="ABC-123"
                    className="uppercase"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <Input placeholder="Blanco" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marca</FormLabel>
                <FormControl>
                  <Input placeholder="Toyota" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modelo</FormLabel>
                <FormControl>
                  <Input placeholder="Corolla" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Año</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="2021"
                    value={field.value ?? ""}
                    onChange={(event) =>
                      field.onChange(toOptionalNumber(event.target.value))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="odometerKm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kilometraje</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="45000"
                    value={field.value ?? ""}
                    onChange={(event) =>
                      field.onChange(toOptionalNumber(event.target.value))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fuelType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Combustible</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {FUEL_TYPES.map((fuelType) => (
                      <SelectItem key={fuelType} value={fuelType}>
                        {FUEL_LABELS[fuelType]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            disabled={submitting || form.formState.isSubmitting}
          >
            {mode === "edit" ? "Guardar cambios" : "Registrar vehículo"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
