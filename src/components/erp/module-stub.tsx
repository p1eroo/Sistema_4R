import { SectionCard } from "@/components/erp/dashboard-ui";
import { ModulePage } from "@/components/erp/module-page";

export function ModuleStub({ title, crumb }: { title: string; crumb: string }) {
  return (
    <ModulePage title={title} breadcrumb={crumb}>
      <p className="text-sm text-muted-foreground">
        Placeholder de navegación. La pantalla de negocio se implementa en su
        tarea de backlog.
      </p>
      <SectionCard title={title} subtitle="Módulo pendiente" className="mt-4">
        <p className="text-xs text-muted-foreground">
          Este stub confirma la ruta y reutiliza AppShell, ModulePage, tokens y
          SectionCard. No contiene CRUD ni flujos operativos.
        </p>
      </SectionCard>
    </ModulePage>
  );
}
