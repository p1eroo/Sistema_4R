import { ListToolbarGrid } from "@/components/erp/list-toolbar";
import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Filter } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { buildReportChartPoints } from "@/components/reports/report-chart";
import { SectionCard } from "@/components/erp/dashboard-ui";
import { ModulePage } from "@/components/erp/module-page";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { defaultDashboardDateRange } from "@/domain/dashboard/filters";
import type { ReportKey } from "@/domain/reports/types";
import { asEntityId, formatMoney } from "@/domain/shared";
import { reportsService } from "@/mocks/reports/service";

const chartConfig = {
  value: { label: "Valor", color: "var(--chart-1)" },
} satisfies ChartConfig;

function branchFilterValue(branch: string) {
  if (branch === "all") {
    return "all" as const;
  }
  if (branch === "surco") {
    return asEntityId("BR-SU");
  }
  return asEntityId("BR-LM");
}

function formatCell(key: string, value: string | number): string {
  if (
    (key === "total" || key.endsWith("Amount")) &&
    typeof value === "number"
  ) {
    return formatMoney({ amount: value, currency: "PEN" });
  }
  return String(value);
}

export function ReportView({
  reportKey,
  title,
  breadcrumb,
}: {
  reportKey: ReportKey;
  title: string;
  breadcrumb: string;
}) {
  const defaults = defaultDashboardDateRange();
  const [branch, setBranch] = useState("molina");
  const [dateFrom, setDateFrom] = useState(defaults.from);
  const [dateTo, setDateTo] = useState(defaults.to);
  const [applied, setApplied] = useState(true);

  const reportQuery = useQuery({
    queryKey: ["reports", reportKey, branch, dateFrom, dateTo, applied],
    queryFn: () =>
      reportsService.getReport({
        key: reportKey,
        branchId: branchFilterValue(branch),
        ...(applied ? { from: dateFrom, to: dateTo } : {}),
      }),
  });

  const chartPoints = useMemo(
    () => (reportQuery.data ? buildReportChartPoints(reportQuery.data) : []),
    [reportQuery.data],
  );

  if (reportQuery.isLoading) {
    return (
      <ModulePage title={title} breadcrumb={breadcrumb} status="loading" />
    );
  }

  if (reportQuery.isError || !reportQuery.data) {
    return (
      <ModulePage
        title={title}
        breadcrumb={breadcrumb}
        status="error"
        onRetry={() => void reportQuery.refetch()}
      />
    );
  }

  const dataset = reportQuery.data;

  if (dataset.rows.length === 0) {
    return (
      <ModulePage
        title={title}
        breadcrumb={breadcrumb}
        status="empty"
        empty={{
          title: "Sin datos para el filtro",
          description: "Amplía el rango de fechas o cambia de sede.",
        }}
      />
    );
  }

  return (
    <ModulePage title={title} breadcrumb={breadcrumb}>
      <div className="space-y-4">
        <ListToolbarGrid className="lg:grid-cols-[1fr_1fr_1fr_auto]">
          <Select value={branch} onValueChange={setBranch}>
            <SelectTrigger aria-label="Filtrar por sede">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="molina">Sede La Molina</SelectItem>
              <SelectItem value="surco">Sede Surco</SelectItem>
              <SelectItem value="all">Todas las sedes</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
            aria-label="Fecha desde"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
            aria-label="Fecha hasta"
          />
          <Button
            variant={applied ? "secondary" : "default"}
            onClick={() => setApplied((value) => !value)}
          >
            <Filter /> {applied ? "Aplicado" : "Aplicar"}
          </Button>
        </ListToolbarGrid>

        <SectionCard title="Resumen visual" subtitle={dataset.title}>
          <ChartContainer
            config={chartConfig}
            className="h-56 w-full aspect-auto"
          >
            <BarChart data={chartPoints} margin={{ left: -12, right: 8 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) =>
                  value >= 10000
                    ? `${Math.round(value / 1000)}k`
                    : String(value)
                }
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="value"
                fill="var(--chart-1)"
                radius={[3, 3, 0, 0]}
                isAnimationActive={false}
              />
            </BarChart>
          </ChartContainer>
        </SectionCard>

        <SectionCard title="Detalle" subtitle={`${dataset.rows.length} filas`}>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {dataset.columns.map((column) => (
                    <TableHead
                      key={column.key}
                      className={
                        column.align === "right" ? "text-right" : undefined
                      }
                    >
                      {column.header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataset.rows.map((row, index) => (
                  <TableRow key={`${dataset.key}-${index}`}>
                    {dataset.columns.map((column) => (
                      <TableCell
                        key={column.key}
                        className={
                          column.align === "right"
                            ? "text-right tabular-nums"
                            : undefined
                        }
                      >
                        {formatCell(column.key, row[column.key] ?? "—")}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SectionCard>

        <Button variant="link" className="px-0" asChild>
          <Link to="/reportes">Volver al hub de reportes</Link>
        </Button>
      </div>
    </ModulePage>
  );
}
