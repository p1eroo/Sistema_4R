import { describe, expect, it } from "vitest";

import { chromeFromPath, isNavPathActive, navLeaves } from "./nav";

describe("isNavPathActive", () => {
  it("marca Dashboard solo en /", () => {
    expect(isNavPathActive("/", "/")).toBe(true);
    expect(isNavPathActive("/clientes", "/")).toBe(false);
  });

  it("trata /clientes y /clientes/ como el mismo ítem", () => {
    expect(isNavPathActive("/clientes", "/clientes")).toBe(true);
    expect(isNavPathActive("/clientes/", "/clientes")).toBe(true);
  });

  it("marca Clientes activo en detalle", () => {
    expect(isNavPathActive("/clientes/CUS-0001", "/clientes")).toBe(true);
    expect(isNavPathActive("/clientes/CUS-0001", "/proveedores")).toBe(false);
  });

  it("marca Reportes activo en vistas hijas", () => {
    expect(isNavPathActive("/reportes/ventas", "/reportes")).toBe(true);
    expect(isNavPathActive("/reportes/ventas", "/")).toBe(false);
  });
});

describe("chromeFromPath", () => {
  it("mantiene el breadcrumb del dashboard", () => {
    expect(chromeFromPath("/")).toEqual({
      title: "Dashboard",
      breadcrumb: "Inicio / Dashboard",
    });
  });

  it("arma Inicio / Taller / Recepción", () => {
    expect(chromeFromPath("/taller/recepcion")).toEqual({
      title: "Recepción de vehículo",
      breadcrumb: "Inicio / Taller / Recepción de vehículo",
    });
  });

  it("arma breadcrumbs de reportes operativos", () => {
    expect(chromeFromPath("/reportes/ventas")).toEqual({
      title: "Ventas",
      breadcrumb: "Inicio / Reportes / Ventas",
    });
  });

  it("arma detalle de orden de trabajo", () => {
    expect(chromeFromPath("/taller/ordenes/WO-2026-0184")).toEqual({
      title: "Detalle de orden",
      breadcrumb: "Inicio / Taller / Detalle de orden",
    });
  });
});

describe("navLeaves", () => {
  it("incluye Bahías y no deja el dashboard fuera del contrato", () => {
    const paths = navLeaves().map((leaf) => leaf.path);
    expect(paths).toContain("/");
    expect(paths).toContain("/taller/bahias");
    expect(paths).toContain("/clientes");
  });
});
