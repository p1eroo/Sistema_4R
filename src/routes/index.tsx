import { useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Banknote,
  CalendarDays,
  CarFront,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileClock,
  PackageX,
  Search,
  ShoppingCart,
  Wrench,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  dashboardPaths,
  resolveActivityHref,
} from "@/components/dashboard/dashboard-links";
import { AppShell } from "@/components/erp/app-shell";
import {
  MetricCard,
  SectionCard,
  StatusBadge,
} from "@/components/erp/dashboard-ui";
import { LoadingState } from "@/components/erp/data-states";
import { DateRangePicker } from "@/components/erp/date-range-picker";
import { useActiveBranch } from "@/components/erp/branch-context";
import { defaultDashboardDateRange } from "@/domain/dashboard/filters";
import type { DashboardActivityTone } from "@/domain/dashboard/types";
import { formatMoney } from "@/domain/shared";
import { WorkOrderStatus } from "@/domain/work-orders/status";
import { dashboardService } from "@/mocks/dashboard/service";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Input } from "@/components/ui/input";

function todayLabel(): string {
  const label = new Intl.DateTimeFormat("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "America/Lima",
  }).format(new Date());
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard operativo | 4 RUEDAS" },
      {
        name: "description",
        content: "Panel operativo y ejecutivo de 4 RUEDAS Mecánica Automotriz.",
      },
      { property: "og:title", content: "Dashboard operativo | 4 RUEDAS" },
      {
        property: "og:description",
        content: "Control de ventas, taller, inventario y citas de 4 RUEDAS.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

const WORK_ORDER_CHART_COLORS: Partial<Record<WorkOrderStatus, string>> = {
  [WorkOrderStatus.Diagnosis]: "var(--color-chart-1)",
  [WorkOrderStatus.InRepair]: "var(--color-chart-2)",
  [WorkOrderStatus.Quality]: "var(--color-chart-3)",
  [WorkOrderStatus.Ready]: "var(--color-chart-4)",
};

const salesConfig = {
  sales: { label: "Ventas", color: "var(--primary)" },
} satisfies ChartConfig;
const workConfig = {
  diagnosis: { label: "Diagnóstico", color: "var(--chart-1)" },
  repair: { label: "En reparación", color: "var(--chart-2)" },
  quality: { label: "Control", color: "var(--chart-3)" },
  ready: { label: "Listo", color: "var(--chart-4)" },
} satisfies ChartConfig;
const financeConfig = {
  income: { label: "Ingresos", color: "var(--primary)" },
  expenses: { label: "Gastos", color: "var(--destructive)" },
} satisfies ChartConfig;

function activityIcon(tone: DashboardActivityTone): LucideIcon {
  switch (tone) {
    case "success":
      return ClipboardCheck;
    case "info":
      return Banknote;
    case "danger":
      return PackageX;
    case "warning":
      return AlertTriangle;
    default:
      return CarFront;
  }
}

function DashboardContent() {
  const defaultRange = defaultDashboardDateRange();
  const { activeBranch } = useActiveBranch();
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<{
    from: string;
    to: string;
  } | null>(null);

  const snapshotQuery = useQuery({
    queryKey: [
      "dashboard",
      activeBranch?.id ?? "all",
      dateRange?.from ?? "all",
      dateRange?.to ?? "all",
    ],
    queryFn: () =>
      dashboardService.getDashboardSnapshot({
        ...(activeBranch ? { branchId: activeBranch.id } : {}),
        ...(dateRange ? { from: dateRange.from, to: dateRange.to } : {}),
      }),
  });

  const snapshot = snapshotQuery.data;
  const metrics = snapshot?.metrics ?? [];
  const metric = (id: string) => metrics.find((item) => item.id === id);

  const salesData = useMemo(
    () => [...(snapshot?.salesSeries ?? [])],
    [snapshot?.salesSeries],
  );
  const salesSubtitle = useMemo(() => {
    const total = salesData.reduce((acc, point) => acc + point.sales, 0);
    return `Últimos 7 días · ${formatMoney({ amount: total, currency: "PEN" })}`;
  }, [salesData]);

  const workOrderData = useMemo(
    () =>
      (snapshot?.workOrderSlices ?? []).map((slice) => ({
        name: slice.name,
        value: slice.value,
        fill: WORK_ORDER_CHART_COLORS[slice.status] ?? "var(--color-chart-1)",
      })),
    [snapshot?.workOrderSlices],
  );

  const workOrderTotal = workOrderData.reduce(
    (acc, slice) => acc + slice.value,
    0,
  );

  const financeData = useMemo(
    () => [...(snapshot?.financeSeries ?? [])],
    [snapshot?.financeSeries],
  );

  const serviceRanking = useMemo(
    () => [...(snapshot?.serviceRanking ?? [])],
    [snapshot?.serviceRanking],
  );
  const productRanking = useMemo(
    () => [...(snapshot?.productRanking ?? [])],
    [snapshot?.productRanking],
  );

  const activities = snapshot?.activities ?? [];

  const salesMonthTotal = salesData.reduce(
    (acc, point) => acc + point.sales,
    0,
  );

  if (snapshotQuery.isLoading) {
    return (
      <main className="min-w-0 flex-1 p-3 sm:p-5 lg:p-6">
        <LoadingState variant="page" rows={8} />
      </main>
    );
  }

  return (
    <main id="dashboard-content" className="min-w-0 flex-1 p-3 sm:p-5 lg:p-6">
      <section className="mx-auto w-full max-w-[1680px]">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-primary">{todayLabel()}</p>
            <h2 className="mt-1 truncate text-xl font-bold text-foreground sm:text-2xl">
              Buenos días, Carlos
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <DateRangePicker
              value={dateRange ?? defaultRange}
              onChange={setDateRange}
              className="w-full sm:w-64"
            />
            <Button
              asChild
              className="shrink-0 bg-critical text-critical-foreground hover:bg-critical/90"
            >
              <Link to="/taller/recepcion">
                <Wrench /> Nueva orden
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4 2xl:grid-cols-8">
          <MetricCard
            label={metric("salesToday")?.label ?? "Ventas de hoy"}
            value={metric("salesToday")?.value ?? "—"}
            detail={metric("salesToday")?.detail ?? "—"}
            icon={Banknote}
          />
          <MetricCard
            label="Ventas del mes"
            value={formatMoney({
              amount: salesMonthTotal,
              currency: "PEN",
            })}
            detail="Serie semanal agregada"
            icon={ShoppingCart}
          />
          <MetricCard
            label={metric("openOrders")?.label ?? "Órdenes abiertas"}
            value={metric("openOrders")?.value ?? "—"}
            detail={metric("openOrders")?.detail ?? "—"}
            icon={ClipboardCheck}
          />
          <MetricCard
            label={metric("vehiclesInWorkshop")?.label ?? "Vehículos en taller"}
            value={metric("vehiclesInWorkshop")?.value ?? "—"}
            detail={metric("vehiclesInWorkshop")?.detail ?? "—"}
            icon={CarFront}
          />
          <MetricCard
            label="Servicios completados"
            value={String(snapshot?.readyVehicles.length ?? 0)}
            detail="Vehículos listos para entrega"
            icon={CheckCircle2}
          />
          <MetricCard
            label={
              metric("pendingEstimates")?.label ?? "Presupuestos pendientes"
            }
            value={metric("pendingEstimates")?.value ?? "—"}
            detail={metric("pendingEstimates")?.detail ?? "—"}
            icon={FileClock}
            emphasis="warning"
          />
          <Link to={dashboardPaths.criticalInventory} className="block">
            <MetricCard
              label={metric("stockCritical")?.label ?? "Stock crítico"}
              value={metric("stockCritical")?.value ?? "—"}
              detail={metric("stockCritical")?.detail ?? "—"}
              icon={PackageX}
              emphasis="danger"
            />
          </Link>
          <MetricCard
            label="Cuentas por cobrar"
            value={
              metric("pendingEstimates")
                ?.detail?.split(" ")
                .slice(0, 2)
                .join(" ") ?? "—"
            }
            detail="Estimado desde presupuestos"
            icon={AlertTriangle}
            emphasis="warning"
          />
        </div>

        <div className="mt-4 grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.7fr)]">
          <SectionCard title="Ventas por día" subtitle={salesSubtitle}>
            <ChartContainer
              config={salesConfig}
              className="h-64 w-full aspect-auto"
            >
              <AreaChart
                data={salesData}
                margin={{ left: -18, right: 8, top: 8 }}
              >
                <defs>
                  <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--primary)"
                      stopOpacity={0.24}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--primary)"
                      stopOpacity={0.01}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  width={44}
                  tickFormatter={(value: number) =>
                    value >= 1000 ? `${value / 1000}k` : `${value}`
                  }
                />
                <ChartTooltip
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fill="url(#salesFill)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ChartContainer>
          </SectionCard>

          <SectionCard
            title="Órdenes por estado"
            subtitle={`${workOrderTotal} órdenes activas`}
          >
            <ChartContainer
              config={workConfig}
              className="mx-auto h-48 max-w-64 aspect-auto"
            >
              <PieChart>
                <Tooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={workOrderData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={52}
                  outerRadius={76}
                  paddingAngle={3}
                  strokeWidth={0}
                  isAnimationActive={false}
                >
                  {workOrderData.map((item) => (
                    <Cell key={item.name} fill={item.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="grid grid-cols-2 gap-2">
              {workOrderData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-2 text-xs"
                >
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="min-w-0 flex-1 truncate text-muted-foreground">
                    {item.name}
                  </span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="mt-4 grid min-w-0 gap-4 xl:grid-cols-3">
          <RankingCard title="Servicios principales" items={serviceRanking} />
          <RankingCard title="Productos principales" items={productRanking} />
          <SectionCard
            title="Ingresos vs. gastos"
            subtitle="Últimos 6 meses · miles de soles"
          >
            <ChartContainer
              config={financeConfig}
              className="h-48 w-full aspect-auto"
            >
              <BarChart data={financeData} margin={{ left: -22, right: 4 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="income"
                  fill="var(--primary)"
                  radius={[3, 3, 0, 0]}
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="expenses"
                  fill="var(--destructive)"
                  radius={[3, 3, 0, 0]}
                  isAnimationActive={false}
                />
              </BarChart>
            </ChartContainer>
          </SectionCard>
        </div>

        <div className="mt-4 grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <SectionCard
            title="Actividad reciente"
            subtitle="Actualizaciones de todas las áreas"
            action={
              <Button variant="link" size="sm" asChild>
                <Link to={dashboardPaths.reports}>Ver todo</Link>
              </Button>
            }
          >
            <div className="divide-y divide-border/60">
              {activities.map((activity) => {
                const Icon = activityIcon(activity.tone);
                const href = resolveActivityHref(activity);
                const row = (
                  <>
                    <div className="grid size-8 shrink-0 place-items-center rounded-md bg-muted text-primary">
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold">
                        {activity.title}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                        {activity.meta}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {activity.time}
                    </span>
                  </>
                );

                return href ? (
                  <Link
                    key={activity.id}
                    to={href}
                    className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-3 first:pt-0 last:pb-0 transition-colors hover:bg-muted/40"
                  >
                    {row}
                  </Link>
                ) : (
                  <div
                    key={activity.id}
                    className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    {row}
                  </div>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard
            title="Vehículos listos pronto"
            subtitle="Entregas estimadas para hoy"
            action={
              <Button variant="link" size="sm" asChild>
                <Link to={dashboardPaths.wip}>Ver taller</Link>
              </Button>
            }
          >
            <div className="space-y-3">
              {(snapshot?.readyVehicles ?? []).slice(0, 3).map((vehicle) => (
                <Link
                  key={vehicle.workOrderId}
                  to={dashboardPaths.deliveries}
                  className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border/60 bg-white/40 p-3 transition-colors hover:border-primary/40 hover:bg-white/70"
                >
                  <div className="rounded-md bg-primary px-2 py-1 text-[11px] font-black text-primary-foreground">
                    {vehicle.plate}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold">
                      {vehicle.vehicleLabel}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {vehicle.code}
                    </p>
                  </div>
                  <strong className="text-xs tabular-nums">
                    {vehicle.promisedAt
                      ? vehicle.promisedAt.slice(11, 16)
                      : "—"}
                  </strong>
                </Link>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="mt-4 grid min-w-0 gap-4 xl:grid-cols-3">
          <CompactList
            title="Stock bajo"
            icon={PackageX}
            viewAllHref={dashboardPaths.criticalInventory}
            rows={(snapshot?.lowStock ?? [])
              .slice(0, 3)
              .map((item) => [
                item.name,
                `${item.stock} ${item.unit}`,
                item.restockable ? "warning" : "danger",
              ])}
          />
          <CompactList
            title="Citas de hoy"
            icon={CalendarDays}
            viewAllHref={dashboardPaths.appointments}
            rows={(snapshot?.todayAppointments ?? [])
              .slice(0, 3)
              .map((item) => [
                `${item.time} · ${item.customerName}`,
                item.vehicleLabel,
                "neutral",
              ])}
          />
          <CompactList
            title="Órdenes pendientes"
            icon={Clock3}
            viewAllHref={dashboardPaths.orders}
            rows={(snapshot?.pendingOrders ?? [])
              .slice(0, 3)
              .map((item) => [item.code, item.label, "warning"])}
          />
        </div>

        <div className="mt-4 lg:hidden">
          <label className="relative block">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar orden, placa o cliente"
              className="pl-9"
              aria-label="Búsqueda global móvil"
            />
          </label>
        </div>
      </section>
    </main>
  );
}

function DashboardPage() {
  return (
    <AppShell>
      <DashboardContent />
    </AppShell>
  );
}

function RankingCard({
  title,
  items,
}: {
  title: string;
  items: { name: string; value: number }[];
}) {
  return (
    <SectionCard title={title} subtitle="Este mes">
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={item.name}>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
              <span className="truncate text-muted-foreground">
                {index + 1}. {item.name}
              </span>
              <strong>
                {item.value >= 10000
                  ? formatMoney({ amount: item.value, currency: "PEN" })
                  : item.value}
              </strong>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{
                  width: `${Math.max(8, (item.value / Math.max(...items.map((entry) => entry.value), 1)) * 100)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function CompactList({
  title,
  icon: Icon,
  rows,
  viewAllHref,
}: {
  title: string;
  icon: typeof PackageX;
  rows: string[][];
  viewAllHref?: string;
}) {
  return (
    <SectionCard
      title={title}
      action={
        viewAllHref ? (
          <Button variant="ghost" size="icon" className="size-8" asChild>
            <Link to={viewAllHref} aria-label={`Ver ${title}`}>
              <Icon className="size-4 text-primary" />
            </Link>
          </Button>
        ) : (
          <div className="grid size-8 place-items-center rounded-md bg-primary/10 text-primary">
            <Icon className="size-4" />
          </div>
        )
      }
    >
      <div className="divide-y divide-border/60">
        {rows.map(([main, detail, tone]) => (
          <div
            key={main}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-2.5 first:pt-0 last:pb-0"
          >
            <span className="truncate text-xs font-medium">{main}</span>
            <StatusBadge
              variant={tone as "info" | "warning" | "danger" | "neutral"}
            >
              {detail}
            </StatusBadge>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
