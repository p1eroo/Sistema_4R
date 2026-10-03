import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";

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
import { Textarea } from "@/components/ui/textarea";
import {
  customerCreateSchema,
  type CustomerCreateValues,
} from "@/domain/customers/schemas";
import {
  CustomerType,
  DocumentType,
  type CustomerAddress,
} from "@/domain/customers/types";
import type { BranchRef } from "@/domain/shared";

export type CustomerFormValues = CustomerCreateValues;

export type CustomerFormProps = {
  mode?: "create" | "edit";
  initialValues?: Partial<CustomerFormValues>;
  branches?: readonly BranchRef[];
  submitting?: boolean;
  onSubmit: (values: CustomerFormValues) => void | Promise<void>;
  onCancel?: () => void;
};

const DOCUMENT_TYPES: readonly DocumentType[] = [
  DocumentType.DNI,
  DocumentType.RUC,
  DocumentType.CE,
];

const EMPTY_VALUES: CustomerFormValues = {
  type: CustomerType.Persona,
  documentType: DocumentType.DNI,
  documentNumber: "",
  phones: [{ label: "Móvil", number: "" }],
};

export function CustomerForm({
  mode = "create",
  initialValues,
  branches = [],
  submitting = false,
  onSubmit,
  onCancel,
}: CustomerFormProps) {
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerCreateSchema),
    defaultValues: { ...EMPTY_VALUES, ...initialValues },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "phones",
  });

  const customerType = form.watch("type");
  const isCompany = customerType === CustomerType.Empresa;

  const submit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <Form {...form}>
      <form onSubmit={submit} className="space-y-6" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de cliente</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    const nextType = value as CustomerType;
                    field.onChange(nextType);
                    if (nextType === CustomerType.Empresa) {
                      form.setValue("documentType", DocumentType.RUC);
                    }
                  }}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={CustomerType.Persona}>
                      Persona natural
                    </SelectItem>
                    <SelectItem value={CustomerType.Empresa}>
                      Empresa
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="documentType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Documento</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isCompany}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el documento" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DOCUMENT_TYPES.map((documentType) => (
                      <SelectItem key={documentType} value={documentType}>
                        {documentType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="documentNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de documento</FormLabel>
              <FormControl>
                <Input placeholder="45678912" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isCompany ? (
          <FormField
            control={form.control}
            name="businessName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Razón social</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Taller El Sol SAC"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombres</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Lucía"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apellidos</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ramos"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Teléfonos</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ label: "Teléfono", number: "" })}
            >
              <Plus /> Agregar
            </Button>
          </div>
          {fields.map((phoneField, index) => (
            <div
              key={phoneField.id}
              className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
            >
              <FormField
                control={form.control}
                name={`phones.${index}.label`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Etiqueta</FormLabel>
                    <FormControl>
                      <Input placeholder="Móvil" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`phones.${index}.number`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número</FormLabel>
                    <FormControl>
                      <Input placeholder="987654321" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="self-end"
                disabled={fields.length === 1}
                onClick={() => remove(index)}
                aria-label="Quitar teléfono"
              >
                <Trash2 />
              </Button>
            </div>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="cliente@correo.pe"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="preferredBranch"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sede preferida</FormLabel>
                <Select
                  value={field.value?.id ?? ""}
                  onValueChange={(value) => {
                    field.onChange(
                      branches.find((branch) => branch.id === value),
                    );
                  }}
                  disabled={branches.length === 0}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona la sede" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección</FormLabel>
              <FormControl>
                <Input
                  placeholder="Av. Los Álamos 345, La Molina"
                  value={field.value?.line1 ?? ""}
                  onChange={(event) => {
                    const address: CustomerAddress = {
                      ...(field.value ?? {}),
                      line1: event.target.value,
                    };
                    field.onChange(address);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Observaciones del cliente"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
            {mode === "edit" ? "Guardar cambios" : "Registrar cliente"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
