import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { SectionCard } from "@/components/erp/dashboard-ui";
import { ErrorState, LoadingState } from "@/components/erp/data-states";
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
import type { AppSettings } from "@/domain/settings";
import { asEntityId } from "@/domain/shared";
import { branchService } from "@/mocks/branches/service";
import { settingsService } from "@/mocks/settings/service";

type FormState = {
  legalName: string;
  tradeName: string;
  ruc: string;
  address: string;
  phone: string;
  email: string;
  igvPercent: string;
  invoiceSeries: string;
  workOrderPrefix: string;
  workOrderYear: string;
  quotePrefix: string;
  defaultBranchId: string;
};

function fromSettings(
  settings: AppSettings,
  defaultBranchId: string,
): FormState {
  return {
    legalName: settings.company.legalName,
    tradeName: settings.company.tradeName,
    ruc: settings.company.ruc,
    address: settings.company.address,
    phone: settings.company.phone,
    email: settings.company.email,
    igvPercent: String(Math.round(settings.tax.igvRate * 100)),
    invoiceSeries: settings.documents.invoiceSeries,
    workOrderPrefix: settings.documents.workOrderPrefix,
    workOrderYear: String(settings.documents.workOrderYear),
    quotePrefix: settings.documents.quotePrefix,
    defaultBranchId,
  };
}

export function SettingsForm() {
  const queryClient = useQueryClient();
  const settingsQuery = useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsService.get(),
  });
  const branchesQuery = useQuery({
    queryKey: ["branches", "list"],
    queryFn: () => branchService.list({ pageSize: 100 }),
  });

  const branches = branchesQuery.data?.items ?? [];
  const defaultBranch =
    branches.find((branch) => branch.isDefault) ?? branches[0];

  const [form, setForm] = useState<FormState | null>(null);

  useEffect(() => {
    if (settingsQuery.data && defaultBranch && form === null) {
      setForm(fromSettings(settingsQuery.data, defaultBranch.id));
    }
  }, [defaultBranch, form, settingsQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async (values: FormState) => {
      const igvRate = Number(values.igvPercent) / 100;
      const updated = await settingsService.update({
        company: {
          legalName: values.legalName.trim(),
          tradeName: values.tradeName.trim(),
          ruc: values.ruc.trim(),
          address: values.address.trim(),
          phone: values.phone.trim(),
          email: values.email.trim(),
        },
        tax: { igvRate },
        documents: {
          invoiceSeries: values.invoiceSeries.trim(),
          workOrderPrefix: values.workOrderPrefix.trim(),
          workOrderYear: Number(values.workOrderYear),
          quotePrefix: values.quotePrefix.trim(),
        },
      });

      if (values.defaultBranchId) {
        await branchService.update(asEntityId(values.defaultBranchId), {
          isDefault: true,
        });
      }

      return updated;
    },
    onSuccess: async (updated) => {
      const branch =
        branches.find((item) => item.id === form?.defaultBranchId) ??
        defaultBranch;
      if (branch) {
        setForm(fromSettings(updated, branch.id));
      }
      await queryClient.invalidateQueries({ queryKey: ["settings"] });
      await queryClient.invalidateQueries({ queryKey: ["branches"] });
      toast.success("Configuración guardada");
    },
    onError: (error: Error) => {
      toast.error(error.message || "No se pudo guardar la configuración.");
    },
  });

  if (settingsQuery.isLoading || branchesQuery.isLoading || !form) {
    return <LoadingState />;
  }

  if (settingsQuery.isError) {
    return <ErrorState onRetry={() => void settingsQuery.refetch()} />;
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        saveMutation.mutate(form);
      }}
    >
      <SectionCard title="Empresa" subtitle="Datos legales y contacto">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="legalName">Razón social</Label>
            <Input
              id="legalName"
              value={form.legalName}
              onChange={(event) =>
                setForm((current) =>
                  current
                    ? { ...current, legalName: event.target.value }
                    : current,
                )
              }
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="tradeName">Nombre comercial</Label>
            <Input
              id="tradeName"
              value={form.tradeName}
              onChange={(event) =>
                setForm((current) =>
                  current
                    ? { ...current, tradeName: event.target.value }
                    : current,
                )
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ruc">RUC</Label>
            <Input
              id="ruc"
              value={form.ruc}
              onChange={(event) =>
                setForm((current) =>
                  current ? { ...current, ruc: event.target.value } : current,
                )
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(event) =>
                setForm((current) =>
                  current ? { ...current, phone: event.target.value } : current,
                )
              }
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              value={form.address}
              onChange={(event) =>
                setForm((current) =>
                  current
                    ? { ...current, address: event.target.value }
                    : current,
                )
              }
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="email">Correo</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) =>
                  current ? { ...current, email: event.target.value } : current,
                )
              }
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Impuestos"
        subtitle="Parámetros fiscales del prototipo"
      >
        <div className="max-w-xs space-y-1.5">
          <Label htmlFor="igv">IGV (%)</Label>
          <Input
            id="igv"
            inputMode="decimal"
            value={form.igvPercent}
            onChange={(event) =>
              setForm((current) =>
                current
                  ? { ...current, igvPercent: event.target.value }
                  : current,
              )
            }
          />
          <p className="text-[11px] text-muted-foreground">
            Valor actual equivalente a{" "}
            {(Number(form.igvPercent) / 100 || 0).toLocaleString("es-PE", {
              style: "percent",
              maximumFractionDigits: 0,
            })}
          </p>
        </div>
      </SectionCard>

      <SectionCard title="Numeración" subtitle="Series y prefijos documentales">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="invoiceSeries">Serie factura</Label>
            <Input
              id="invoiceSeries"
              value={form.invoiceSeries}
              onChange={(event) =>
                setForm((current) =>
                  current
                    ? { ...current, invoiceSeries: event.target.value }
                    : current,
                )
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="quotePrefix">Prefijo cotización</Label>
            <Input
              id="quotePrefix"
              value={form.quotePrefix}
              onChange={(event) =>
                setForm((current) =>
                  current
                    ? { ...current, quotePrefix: event.target.value }
                    : current,
                )
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="workOrderPrefix">Prefijo OT</Label>
            <Input
              id="workOrderPrefix"
              value={form.workOrderPrefix}
              onChange={(event) =>
                setForm((current) =>
                  current
                    ? { ...current, workOrderPrefix: event.target.value }
                    : current,
                )
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="workOrderYear">Año OT</Label>
            <Input
              id="workOrderYear"
              inputMode="numeric"
              value={form.workOrderYear}
              onChange={(event) =>
                setForm((current) =>
                  current
                    ? { ...current, workOrderYear: event.target.value }
                    : current,
                )
              }
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Sede predeterminada"
        subtitle="Sucursal principal del ERP"
      >
        <div className="max-w-md space-y-1.5">
          <Label htmlFor="defaultBranch">Sede</Label>
          <Select
            value={form.defaultBranchId}
            onValueChange={(value) =>
              setForm((current) =>
                current ? { ...current, defaultBranchId: value } : current,
              )
            }
          >
            <SelectTrigger id="defaultBranch">
              <SelectValue placeholder="Seleccionar sede" />
            </SelectTrigger>
            <SelectContent>
              {branches.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <Button type="submit" disabled={saveMutation.isPending}>
          Guardar cambios
        </Button>
      </div>
    </form>
  );
}
