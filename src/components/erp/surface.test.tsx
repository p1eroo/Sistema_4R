import { renderToStaticMarkup } from "react-dom/server";
import { Package } from "lucide-react";
import { describe, expect, it } from "vitest";

import {
  MetricCard,
  SectionCard,
  StatusBadge,
} from "@/components/erp/dashboard-ui";
import { Surface } from "@/components/erp/surface";

describe("Surface", () => {
  it("renders the default glass level", () => {
    const html = renderToStaticMarkup(<Surface>Contenido</Surface>);

    expect(html).toContain("<div");
    expect(html).toContain("min-w-0");
    expect(html).toContain("glass");
    expect(html).not.toContain("glass-strong");
    expect(html).toContain("Contenido");
  });

  it("renders the strong level", () => {
    const html = renderToStaticMarkup(
      <Surface level="strong">Contenido</Surface>,
    );

    expect(html).toContain("glass-strong");
  });

  it("renders the subtle level", () => {
    const html = renderToStaticMarkup(
      <Surface level="subtle">Contenido</Surface>,
    );

    expect(html).toContain("glass-subtle");
  });

  it("supports a semantic tag and custom classes", () => {
    const html = renderToStaticMarkup(
      <Surface as="section" className="custom-surface">
        Contenido
      </Surface>,
    );

    expect(html).toContain("<section");
    expect(html).toContain("custom-surface");
  });
});

describe("ERP primitives", () => {
  it("SectionCard inherits glass and renders its header", () => {
    const html = renderToStaticMarkup(
      <SectionCard title="Clientes" subtitle="Directorio">
        <span>contenido</span>
      </SectionCard>,
    );

    expect(html).toContain("glass");
    expect(html).toContain("Clientes");
    expect(html).toContain("Directorio");
    expect(html).toContain("border-border/60");
    expect(html).toContain("contenido");
  });

  it("MetricCard inherits glass and renders its value", () => {
    const html = renderToStaticMarkup(
      <MetricCard
        label="Ventas del día"
        value="S/ 1,280.00"
        detail="+12% vs ayer"
        trend="up"
        icon={Package}
      />,
    );

    expect(html).toContain("glass");
    expect(html).toContain("Ventas del día");
    expect(html).toContain("S/ 1,280.00");
  });

  it("StatusBadge maps variants to semantic tokens", () => {
    const success = renderToStaticMarkup(
      <StatusBadge variant="success">Listo</StatusBadge>,
    );
    const danger = renderToStaticMarkup(
      <StatusBadge variant="danger">Crítico</StatusBadge>,
    );

    expect(success).toContain("bg-success/10");
    expect(success).toContain("Listo");
    expect(danger).toContain("bg-destructive/10");
    expect(danger).toContain("Crítico");
  });
});
