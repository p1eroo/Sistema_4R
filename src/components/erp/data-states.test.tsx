import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/erp/data-states";

describe("LoadingState", () => {
  it("renders table placeholders with an accessible loading label", () => {
    const html = renderToStaticMarkup(
      <LoadingState variant="table" rows={3} />,
    );

    expect(html).toContain("Cargando…");
    expect(html).toContain('role="status"');
  });

  it("renders page placeholders by default", () => {
    const html = renderToStaticMarkup(<LoadingState />);

    expect(html).toContain("h-64");
  });
});

describe("EmptyState", () => {
  it("uses the Spanish defaults", () => {
    const html = renderToStaticMarkup(<EmptyState />);

    expect(html).toContain("Sin resultados");
    expect(html).toContain("No hay datos para mostrar");
  });

  it("accepts a custom title, description and action", () => {
    const html = renderToStaticMarkup(
      <EmptyState
        title="Sin clientes"
        description="Registra el primer cliente."
        action={<button type="button">Nuevo cliente</button>}
      />,
    );

    expect(html).toContain("Sin clientes");
    expect(html).toContain("Nuevo cliente");
  });
});

describe("ErrorState", () => {
  it("renders the default error message", () => {
    const html = renderToStaticMarkup(<ErrorState />);

    expect(html).toContain('role="alert"');
    expect(html).toContain("No pudimos cargar la información");
    expect(html).not.toContain("Reintentar");
  });

  it("renders a retry action when handled", () => {
    const html = renderToStaticMarkup(<ErrorState onRetry={() => {}} />);

    expect(html).toContain("Reintentar");
  });
});
