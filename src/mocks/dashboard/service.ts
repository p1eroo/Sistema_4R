import { appointmentDateKey, todayDateKey } from "@/domain/appointments";
import { dateKeyMatchesDashboardFilter } from "@/domain/dashboard/filters";
import type {
  DashboardActivity,
  DashboardAppointmentItem,
  DashboardFilters,
  DashboardLowStockItem,
  DashboardMetric,
  DashboardPendingOrderItem,
  DashboardReadyVehicle,
  DashboardSnapshot,
  DashboardWorkOrderSlice,
} from "@/domain/dashboard/types";
import { EstimateStatus } from "@/domain/estimates/types";
import { formatMoney } from "@/domain/shared";
import { vehicleDisplayName } from "@/domain/vehicles/types";
import {
  WorkOrderStatus,
  isWorkOrderOpen,
  WORK_ORDER_STATUS_LABELS,
} from "@/domain/work-orders/status";
import { appointmentService } from "@/mocks/appointments/service";
import { customerService } from "@/mocks/customers/service";
import { estimateService } from "@/mocks/estimates/service";
import { inventoryService } from "@/mocks/inventory/service";
import { posService } from "@/mocks/pos/service";
import { productService } from "@/mocks/products/service";
import { vehicleService } from "@/mocks/vehicles/service";
import { workOrderService } from "@/mocks/work-orders/service";

const ADVISORY_STATUSES: readonly WorkOrderStatus[] = [
  WorkOrderStatus.Diagnosis,
  WorkOrderStatus.InRepair,
  WorkOrderStatus.Quality,
  WorkOrderStatus.Ready,
];

const WORKSHOP_CAPACITY = 24;
const LIMA_TIME_ZONE = "America/Lima";

function limaTime(value: string): string {
  return new Intl.DateTimeFormat("es-PE", {
    timeZone: LIMA_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function weekdayLabel(value: string): string {
  return new Intl.DateTimeFormat("es-PE", {
    timeZone: LIMA_TIME_ZONE,
    weekday: "short",
  }).format(new Date(value));
}

export type DashboardService = {
  getDashboardSnapshot(filters?: DashboardFilters): Promise<DashboardSnapshot>;
};

export function createDashboardService(): DashboardService {
  return {
    async getDashboardSnapshot(filters: DashboardFilters = {}) {
      const branchFilter =
        filters.branchId && filters.branchId !== "all"
          ? filters.branchId
          : undefined;
      const today = todayDateKey();

      const allOrders = (await workOrderService.list({ pageSize: 500 })).items;
      const orders = allOrders.filter(
        (order) =>
          (!branchFilter || order.branchId === branchFilter) &&
          dateKeyMatchesDashboardFilter(order.openedAt, filters, today),
      );

      const countBy = (status: WorkOrderStatus): number =>
        orders.filter((order) => order.status === status).length;

      const workOrderSlices: DashboardWorkOrderSlice[] = ADVISORY_STATUSES.map(
        (status) => ({
          status,
          name: WORK_ORDER_STATUS_LABELS[status],
          value: countBy(status),
        }),
      );

      const criticalBalances = (await inventoryService.listCritical()).filter(
        (balance) => !branchFilter || balance.branchId === branchFilter,
      );
      const productCache = new Map<string, { name: string; unit: string }>();
      const lowStock: DashboardLowStockItem[] = [];
      for (const balance of criticalBalances) {
        let product = productCache.get(balance.productId);
        if (!product) {
          const found = await productService.getById(balance.productId);
          product = {
            name: found?.name ?? balance.productId,
            unit: found?.unit ?? "unit",
          };
          productCache.set(balance.productId, product);
        }
        lowStock.push({
          productId: balance.productId,
          name: product.name,
          stock: balance.quantity,
          minStock: balance.minStock,
          unit: product.unit,
          restockable: balance.restockable,
        });
      }
      const withoutRestock = (
        await inventoryService.listWithoutRestock()
      ).filter(
        (balance) => !branchFilter || balance.branchId === branchFilter,
      ).length;

      const pendingEstimates = await estimateService.listByStatus(
        EstimateStatus.PendingApproval,
        { pageSize: 100 },
      );
      const pendingEstimateTotal = await estimateService.sumPendingApproval();

      const appointments = (
        await appointmentService.listByDate(today)
      ).items.filter(
        (appointment) => !branchFilter || appointment.branchId === branchFilter,
      );
      const customerCache = new Map<string, string>();
      const vehicleCache = new Map<string, { plate: string; label: string }>();

      const todayAppointments: DashboardAppointmentItem[] = [];
      for (const appointment of appointments) {
        let customerName = customerCache.get(appointment.customerId);
        if (!customerName) {
          const customer = await customerService.getById(
            appointment.customerId,
          );
          customerName = customer?.displayName ?? appointment.customerId;
          customerCache.set(appointment.customerId, customerName);
        }

        let vehicle = vehicleCache.get(appointment.vehicleId);
        if (!vehicle) {
          const found = await vehicleService.getById(appointment.vehicleId);
          vehicle = found
            ? {
                plate: found.plate,
                label: vehicleDisplayName(found),
              }
            : { plate: appointment.vehicleId, label: "" };
          vehicleCache.set(appointment.vehicleId, vehicle);
        }

        todayAppointments.push({
          id: appointment.id,
          time: limaTime(appointment.scheduledAt),
          customerName,
          vehicleLabel: vehicle.label,
        });
      }

      const readyVehicles: DashboardReadyVehicle[] = [];
      for (const order of orders.filter(
        (order) => order.status === WorkOrderStatus.Ready,
      )) {
        let vehicle = vehicleCache.get(order.vehicleId);
        if (!vehicle) {
          const found = await vehicleService.getById(order.vehicleId);
          vehicle = found
            ? {
                plate: found.plate,
                label: vehicleDisplayName(found),
              }
            : { plate: order.vehicleId, label: "" };
          vehicleCache.set(order.vehicleId, vehicle);
        }
        readyVehicles.push({
          workOrderId: order.id,
          code: order.code,
          plate: vehicle.plate,
          vehicleLabel: vehicle.label,
          ...(order.promisedAt !== undefined
            ? { promisedAt: order.promisedAt }
            : {}),
        });
      }

      const pendingOrders: DashboardPendingOrderItem[] = orders
        .filter(
          (order) =>
            isWorkOrderOpen(order.status) &&
            order.status !== WorkOrderStatus.Ready,
        )
        .slice(0, 5)
        .map((order) => ({
          workOrderId: order.id,
          code: order.code,
          label: order.reason,
        }));

      const tickets = (await posService.list({ pageSize: 500 })).items;
      const paidTickets = tickets.filter(
        (ticket) =>
          ticket.status === "paid" &&
          (!branchFilter || ticket.branchId === branchFilter) &&
          dateKeyMatchesDashboardFilter(ticket.createdAt, filters, today),
      );
      const todayTickets = paidTickets.filter(
        (ticket) => appointmentDateKey(ticket.createdAt) === today,
      );
      const salesToday = todayTickets.reduce(
        (acc, ticket) => acc + ticket.totals.total.amount,
        0,
      );

      const salesByDay = new Map<string, number>();
      for (const ticket of paidTickets) {
        const key = appointmentDateKey(ticket.createdAt);
        salesByDay.set(
          key,
          (salesByDay.get(key) ?? 0) + ticket.totals.total.amount,
        );
      }
      const salesSeries = [];
      for (let offset = 6; offset >= 0; offset -= 1) {
        const date = new Date(
          Date.parse(`${today}T12:00:00Z`) - offset * 86_400_000,
        );
        const key = appointmentDateKey(date);
        salesSeries.push({
          day: weekdayLabel(key),
          sales: salesByDay.get(key) ?? 0,
        });
      }

      const estimates = (await estimateService.list({ pageSize: 500 })).items;
      const rankingBy = (
        kind: "labor" | "part",
      ): { name: string; value: number }[] => {
        const totals = new Map<string, number>();
        for (const estimate of estimates) {
          for (const line of estimate.lines) {
            if (line.kind !== kind) {
              continue;
            }
            totals.set(
              line.name,
              (totals.get(line.name) ?? 0) +
                line.quantity * line.unitPrice.amount,
            );
          }
        }
        return [...totals.entries()]
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 4);
      };

      const activities: DashboardActivity[] = [];
      if (todayTickets[0]) {
        activities.push({
          id: `activity-${todayTickets[0].id}`,
          title: `Pago registrado por ${formatMoney(todayTickets[0].totals.total)}`,
          meta: `Comprobante ${todayTickets[0].documentNumber ?? todayTickets[0].code}`,
          time: limaTime(todayTickets[0].createdAt),
          tone: "info",
        });
      }
      const inQuality = orders.find(
        (order) => order.status === WorkOrderStatus.Quality,
      );
      if (inQuality) {
        activities.push({
          id: `activity-${inQuality.id}`,
          title: `${inQuality.code} en control de calidad`,
          meta: inQuality.reason,
          time: inQuality.updatedAt.slice(0, 10),
          tone: "success",
        });
      }
      const inRepair = orders.find(
        (order) => order.status === WorkOrderStatus.InRepair,
      );
      if (inRepair) {
        activities.push({
          id: `activity-${inRepair.id}`,
          title: `${inRepair.code} en reparación`,
          meta: inRepair.reason,
          time: inRepair.updatedAt.slice(0, 10),
          tone: "neutral",
        });
      }

      const inWorkshop =
        countBy(WorkOrderStatus.InRepair) + countBy(WorkOrderStatus.Quality);

      const metrics: DashboardMetric[] = [
        {
          id: "salesToday",
          label: "Ventas de hoy",
          value: formatMoney({ amount: salesToday, currency: "PEN" }),
          detail: `${todayTickets.length} tickets cobrados`,
        },
        {
          id: "openOrders",
          label: "Órdenes abiertas",
          value: String(
            workOrderSlices.reduce((acc, slice) => acc + slice.value, 0),
          ),
          detail: `${countBy(WorkOrderStatus.Quality)} en control`,
        },
        {
          id: "vehiclesInWorkshop",
          label: "Vehículos en taller",
          value: String(inWorkshop),
          detail: `${Math.round((inWorkshop / WORKSHOP_CAPACITY) * 100)}% de capacidad`,
        },
        {
          id: "pendingEstimates",
          label: "Presupuestos pendientes",
          value: String(pendingEstimates.pagination.total),
          detail: `${formatMoney(pendingEstimateTotal)} por aprobar`,
        },
        {
          id: "stockCritical",
          label: "Stock crítico",
          value: String(lowStock.length),
          detail: `${withoutRestock} sin reposición`,
          tone: "danger",
        },
      ];

      return {
        filters,
        metrics,
        workOrderSlices,
        salesSeries,
        financeSeries: [],
        serviceRanking: rankingBy("labor"),
        productRanking: rankingBy("part"),
        activities,
        readyVehicles,
        lowStock,
        todayAppointments,
        pendingOrders,
        gaps: [
          "financeSeries (ingresos/gastos por mes) no es reproducible con los mocks actuales; se devuelve vacío.",
          "salesSeries usa los tickets POS pagados por día (Lima); el dashboard original usa valores históricos fijos.",
          "serviceRanking/productRanking se derivan de las líneas de presupuestos, no de un histórico de ventas.",
        ],
      };
    },
  };
}

export const dashboardService: DashboardService = createDashboardService();
