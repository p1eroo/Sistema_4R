import { appointmentDateKey } from "@/domain/appointments";
import {
  sumReportColumn,
  type ReportDataset,
  type ReportDefinition,
  type ReportKey,
  type ReportQuery,
  type ReportRow,
} from "@/domain/reports/types";
import { WORK_ORDER_STATUS_LABELS } from "@/domain/work-orders/status";
import { inventoryService } from "@/mocks/inventory/service";
import { posService } from "@/mocks/pos/service";
import { productService } from "@/mocks/products/service";
import { workOrderService } from "@/mocks/work-orders/service";

const DEFINITIONS: readonly ReportDefinition[] = [
  {
    key: "sales",
    title: "Ventas",
    description: "Tickets POS cobrados.",
  },
  {
    key: "work-orders",
    title: "Órdenes de trabajo",
    description: "OT con estado, sede y fechas.",
  },
  {
    key: "inventory",
    title: "Inventario",
    description: "Saldos por producto y sede.",
  },
  {
    key: "receivables",
    title: "Cuentas por cobrar",
    description: "Facturas pendientes de cobro.",
  },
];

export type ReportsService = {
  listReports(): readonly ReportDefinition[];
  getReport(query: ReportQuery): Promise<ReportDataset>;
};

function inDateRange(value: string, from?: string, to?: string): boolean {
  const key = appointmentDateKey(value);
  if (from && key < from) {
    return false;
  }
  if (to && key > to) {
    return false;
  }
  return true;
}

function receivablesRows(): ReportRow[] {
  const today = Date.now();
  const dueDate = (days: number): string =>
    new Date(today + days * 86_400_000).toISOString().slice(0, 10);

  return [
    {
      invoice: "F001-00990",
      customer: "Lucía Ramos",
      total: 1280000,
      dueDate: dueDate(-40),
      status: "Vencida",
    },
    {
      invoice: "F001-00991",
      customer: "Ana Torres",
      total: 450000,
      dueDate: dueDate(-30),
      status: "Vencida",
    },
    {
      invoice: "F001-00992",
      customer: "Luis Paredes",
      total: 320000,
      dueDate: dueDate(-20),
      status: "Vencida",
    },
    {
      invoice: "F001-00993",
      customer: "Rosa Huamán",
      total: 185000,
      dueDate: dueDate(-10),
      status: "Vencida",
    },
    {
      invoice: "F001-00994",
      customer: "Jorge Salazar",
      total: 200000,
      dueDate: dueDate(30),
      status: "Vigente",
    },
  ];
}

async function salesDataset(query: ReportQuery): Promise<ReportDataset> {
  const tickets = (await posService.list({ pageSize: 500 })).items.filter(
    (ticket) =>
      ticket.status === "paid" &&
      (query.branchId === undefined ||
        query.branchId === "all" ||
        ticket.branchId === query.branchId) &&
      inDateRange(ticket.createdAt, query.from, query.to),
  );

  const rows: ReportRow[] = tickets.map((ticket) => ({
    code: ticket.code,
    document: ticket.documentNumber ?? "—",
    date: appointmentDateKey(ticket.createdAt),
    total: ticket.totals.total.amount,
  }));

  return {
    key: "sales",
    title: "Ventas",
    columns: [
      { key: "code", header: "Ticket" },
      { key: "document", header: "Comprobante" },
      { key: "date", header: "Fecha" },
      { key: "total", header: "Total", align: "right" },
    ],
    rows,
    totals: { count: rows.length, total: sumReportColumn(rows, "total") },
    gaps: [],
  };
}

async function workOrdersDataset(query: ReportQuery): Promise<ReportDataset> {
  const orders = (await workOrderService.list({ pageSize: 500 })).items.filter(
    (order) =>
      (query.branchId === undefined ||
        query.branchId === "all" ||
        order.branchId === query.branchId) &&
      inDateRange(order.openedAt, query.from, query.to),
  );

  const rows: ReportRow[] = orders.map((order) => ({
    code: order.code,
    status: WORK_ORDER_STATUS_LABELS[order.status],
    branch: order.branchId,
    openedAt: appointmentDateKey(order.openedAt),
  }));

  return {
    key: "work-orders",
    title: "Órdenes de trabajo",
    columns: [
      { key: "code", header: "OT" },
      { key: "status", header: "Estado" },
      { key: "branch", header: "Sede" },
      { key: "openedAt", header: "Apertura" },
    ],
    rows,
    totals: { count: rows.length },
    gaps: [],
  };
}

async function inventoryDataset(query: ReportQuery): Promise<ReportDataset> {
  const balances = (await inventoryService.getStock()).filter(
    (balance) =>
      query.branchId === undefined ||
      query.branchId === "all" ||
      balance.branchId === query.branchId,
  );
  const products = (await productService.list({ pageSize: 100 })).items;
  const productMap = new Map(products.map((product) => [product.id, product]));

  const rows: ReportRow[] = balances.map((balance) => {
    const product = productMap.get(balance.productId);
    return {
      product: product?.name ?? balance.productId,
      sku: product?.sku ?? "—",
      branch: balance.branchId,
      stock: balance.quantity,
      minStock: balance.minStock,
      critical: balance.quantity <= balance.minStock ? 1 : 0,
    };
  });

  return {
    key: "inventory",
    title: "Inventario",
    columns: [
      { key: "product", header: "Producto" },
      { key: "sku", header: "SKU" },
      { key: "branch", header: "Sede" },
      { key: "stock", header: "Stock", align: "right" },
      { key: "minStock", header: "Mínimo", align: "right" },
    ],
    rows,
    totals: {
      count: rows.length,
      critical: sumReportColumn(rows, "critical"),
    },
    gaps: [],
  };
}

function receivablesDataset(): ReportDataset {
  const rows = receivablesRows();

  return {
    key: "receivables",
    title: "Cuentas por cobrar",
    columns: [
      { key: "invoice", header: "Factura" },
      { key: "customer", header: "Cliente" },
      { key: "dueDate", header: "Vencimiento" },
      { key: "status", header: "Estado" },
      { key: "total", header: "Saldo", align: "right" },
    ],
    rows,
    totals: {
      count: rows.length,
      total: sumReportColumn(rows, "total"),
      overdue: rows.filter((row) => row["status"] === "Vencida").length,
    },
    gaps: [
      "CxC es un dataset fijo de reportes (no proviene de un seed de facturación).",
    ],
  };
}

export function createReportsService(): ReportsService {
  return {
    listReports() {
      return DEFINITIONS;
    },

    async getReport(query: ReportQuery) {
      switch (query.key) {
        case "sales":
          return salesDataset(query);
        case "work-orders":
          return workOrdersDataset(query);
        case "inventory":
          return inventoryDataset(query);
        default:
          return receivablesDataset();
      }
    },
  };
}

export const reportsService: ReportsService = createReportsService();

export type { ReportKey };
