"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  CreditCard,
  ShoppingCart,
  RotateCcw,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Settings,
} from "lucide-react";
import {
  exportToCsv,
  type SalesStatistics,
  type ChartDataPoint,
  type ProductBreakdownItem,
} from "@/services/statistics-api";
import { adminApi } from "@/lib/api-client";

// ── Helpers ────────────────────────────────────────────────────────

function formatWon(value: number): string {
  if (value >= 100000000) {
    return `${(value / 100000000).toFixed(1)}억`;
  }
  if (value >= 10000) {
    return `${(value / 10000).toFixed(0)}만`;
  }
  return value.toLocaleString();
}

// ── Bar Chart ──────────────────────────────────────────────────────

function BarChart({
  data,
  color = "bg-emerald-500",
  height = 180,
  formatLabel,
}: {
  data: ChartDataPoint[];
  color?: string;
  height?: number;
  formatLabel?: (v: number) => string;
}) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const fmt = formatLabel ?? ((v: number) => v.toLocaleString());

  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-[10px] text-gray-500">{fmt(d.value)}</span>
          <div
            className={`${color} w-full max-w-[48px] rounded-t transition-all`}
            style={{ height: `${(d.value / maxValue) * 100}%`, minHeight: 4 }}
          />
          <span className="text-xs text-gray-600">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── KPI Card ───────────────────────────────────────────────────────

const KPI_ICONS = [CreditCard, ShoppingCart, RotateCcw, DollarSign] as const;

function KpiCard({
  label,
  value,
  unit,
  change,
  icon: Icon,
  formatValue,
}: {
  label: string;
  value: number;
  unit?: string;
  change?: number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  formatValue?: (v: number) => string;
}) {
  const fmt = formatValue ?? formatWon;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{label}</CardTitle>
        <Icon size={18} className="text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {fmt(value)}
          {unit && <span className="ml-1 text-sm font-normal text-gray-500">{unit}</span>}
        </div>
        {change !== undefined && (
          <p className={`flex items-center gap-1 text-xs ${change >= 0 ? "text-emerald-600" : "text-red-500"}`}>
            {change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            전월 대비 {Math.abs(change)}%
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ── Product Breakdown Table ──────────────────────────────────────

function ProductBreakdownTable({ items }: { items: ProductBreakdownItem[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
            <th className="px-4 py-3 text-center w-[60px]">NO</th>
            <th className="px-4 py-3">상품명</th>
            <th className="px-4 py-3">카테고리</th>
            <th className="px-4 py-3 text-right">판매량</th>
            <th className="px-4 py-3 text-right">매출</th>
            <th className="px-4 py-3 text-right">환불</th>
            <th className="px-4 py-3 text-right">환불율</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p, idx) => {
            const refundRate = p.sold > 0 ? ((p.refunds / p.sold) * 100).toFixed(1) : "0.0";
            return (
              <tr
                key={p.name}
                className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
              >
                <td className="px-4 py-3 text-center text-gray-500">{idx + 1}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                <td className="px-4 py-3 text-gray-600">{p.category}</td>
                <td className="px-4 py-3 text-right">{p.sold.toLocaleString()}개</td>
                <td className="px-4 py-3 text-right font-medium">{p.revenue.toLocaleString()}원</td>
                <td className="px-4 py-3 text-right text-red-500">{p.refunds}건</td>
                <td className="px-4 py-3 text-right text-gray-600">{refundRate}%</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-200 bg-gray-50 font-medium">
            <td className="px-4 py-3" colSpan={3}>합계</td>
            <td className="px-4 py-3 text-right">{items.reduce((s, p) => s + p.sold, 0).toLocaleString()}개</td>
            <td className="px-4 py-3 text-right">{items.reduce((s, p) => s + p.revenue, 0).toLocaleString()}원</td>
            <td className="px-4 py-3 text-right text-red-500">{items.reduce((s, p) => s + p.refunds, 0)}건</td>
            <td className="px-4 py-3 text-right text-gray-600">
              {(items.reduce((s, p) => s + p.sold, 0) > 0
                ? ((items.reduce((s, p) => s + p.refunds, 0) / items.reduce((s, p) => s + p.sold, 0)) * 100).toFixed(1)
                : "0.0"
              )}%
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

export default function SalesStatisticsPage() {
  const [data, setData] = useState<SalesStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(String(CURRENT_YEAR));
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const apiResult = await adminApi.get<SalesStatistics>(
        "/admin/api/v1/statistics/sales",
        { year, month }
      );
      if (apiResult) {
        setData(apiResult);
      }
    } catch {
      /* API error - data remains in initial empty state */
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = () => {
    if (!data) return;

    const headers = ["구분", "항목", "건수/수량", "금액(원)"];
    const rows: string[][] = [];

    // KPI
    rows.push(["KPI", data.kpi.totalRevenue.label, "-", String(data.kpi.totalRevenue.value)]);
    rows.push(["KPI", data.kpi.avgTransaction.label, "-", String(data.kpi.avgTransaction.value)]);
    rows.push(["KPI", data.kpi.refundRate.label, "-", String(data.kpi.refundRate.value)]);
    rows.push(["KPI", data.kpi.mrr.label, "-", String(data.kpi.mrr.value)]);

    // Payments
    data.payments.forEach((p) =>
      rows.push(["결제현황", p.method, String(p.count), String(p.amount)])
    );
    // Purchases
    data.purchases.forEach((p) =>
      rows.push(["구매현황", p.type, String(p.count), String(p.amount)])
    );
    // Product Breakdown
    data.productBreakdown.forEach((p) =>
      rows.push(["상품별분석", p.name, `판매:${p.sold} 환불:${p.refunds}`, String(p.revenue)])
    );

    exportToCsv(`매출통계_${year}년${month}월`, headers, rows);
  };

  if (loading || !data) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        로딩 중...
      </div>
    );
  }

  const kpis = [
    { ...data.kpi.totalRevenue, icon: KPI_ICONS[0], formatValue: formatWon },
    { ...data.kpi.avgTransaction, icon: KPI_ICONS[1], formatValue: formatWon },
    { ...data.kpi.refundRate, icon: KPI_ICONS[2], formatValue: (v: number) => String(v) },
    { ...data.kpi.mrr, icon: KPI_ICONS[3], formatValue: formatWon },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">매출 통계</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => alert("설정 기능은 준비 중입니다.")}>
            <Settings size={16} className="mr-1.5" />
            설정
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download size={16} className="mr-1.5" />
            내보내기
          </Button>
        </div>
      </div>

      {/* Month Filter */}
      <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4">
        <span className="text-sm font-medium text-gray-700">월별 조회</span>
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {YEARS.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}년
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className="w-[80px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m) => (
              <SelectItem key={m} value={String(m)}>
                {m}월
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" onClick={fetchData}>
          조회
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <KpiCard
            key={k.label}
            label={k.label}
            value={k.value}
            unit={k.unit}
            change={k.change}
            icon={k.icon}
            formatValue={k.formatValue}
          />
        ))}
      </div>

      {/* Monthly Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">월별 매출 현황</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart
            data={data.monthlyRevenue}
            color="bg-emerald-500"
            height={200}
            formatLabel={formatWon}
          />
        </CardContent>
      </Card>

      {/* Product Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">상품별 매출 분석</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductBreakdownTable items={data.productBreakdown} />
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="payments">
            <TabsList>
              <TabsTrigger value="payments">결제 현황</TabsTrigger>
              <TabsTrigger value="purchases">구매 현황</TabsTrigger>
              <TabsTrigger value="products">상품 현황</TabsTrigger>
            </TabsList>

            {/* Payments Table */}
            <TabsContent value="payments">
              <div className="overflow-x-auto rounded-lg border border-gray-200 mt-4">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
                      <th className="px-4 py-3 text-center w-[60px]">NO</th>
                      <th className="px-4 py-3">결제수단</th>
                      <th className="px-4 py-3 text-right">건수</th>
                      <th className="px-4 py-3 text-right">금액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.payments.map((p, idx) => (
                      <tr
                        key={p.method}
                        className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                      >
                        <td className="px-4 py-3 text-center text-gray-500">{idx + 1}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{p.method}</td>
                        <td className="px-4 py-3 text-right">{p.count.toLocaleString()}건</td>
                        <td className="px-4 py-3 text-right font-medium">{p.amount.toLocaleString()}원</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-200 bg-gray-50 font-medium">
                      <td className="px-4 py-3" colSpan={2}>합계</td>
                      <td className="px-4 py-3 text-right">
                        {data.payments.reduce((s, p) => s + p.count, 0).toLocaleString()}건
                      </td>
                      <td className="px-4 py-3 text-right">
                        {data.payments.reduce((s, p) => s + p.amount, 0).toLocaleString()}원
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </TabsContent>

            {/* Purchases Table */}
            <TabsContent value="purchases">
              <div className="overflow-x-auto rounded-lg border border-gray-200 mt-4">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
                      <th className="px-4 py-3 text-center w-[60px]">NO</th>
                      <th className="px-4 py-3">상품유형</th>
                      <th className="px-4 py-3 text-right">건수</th>
                      <th className="px-4 py-3 text-right">금액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.purchases.map((p, idx) => (
                      <tr
                        key={p.type}
                        className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                      >
                        <td className="px-4 py-3 text-center text-gray-500">{idx + 1}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{p.type}</td>
                        <td className="px-4 py-3 text-right">{p.count.toLocaleString()}건</td>
                        <td className="px-4 py-3 text-right font-medium">{p.amount.toLocaleString()}원</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-200 bg-gray-50 font-medium">
                      <td className="px-4 py-3" colSpan={2}>합계</td>
                      <td className="px-4 py-3 text-right">
                        {data.purchases.reduce((s, p) => s + p.count, 0).toLocaleString()}건
                      </td>
                      <td className="px-4 py-3 text-right">
                        {data.purchases.reduce((s, p) => s + p.amount, 0).toLocaleString()}원
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </TabsContent>

            {/* Products Table */}
            <TabsContent value="products">
              <div className="overflow-x-auto rounded-lg border border-gray-200 mt-4">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
                      <th className="px-4 py-3 text-center w-[60px]">NO</th>
                      <th className="px-4 py-3">상품명</th>
                      <th className="px-4 py-3">카테고리</th>
                      <th className="px-4 py-3 text-right">판매량</th>
                      <th className="px-4 py-3 text-right">매출</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.products.map((p, idx) => (
                      <tr
                        key={p.name}
                        className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                      >
                        <td className="px-4 py-3 text-center text-gray-500">{idx + 1}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                        <td className="px-4 py-3 text-gray-600">{p.category}</td>
                        <td className="px-4 py-3 text-right">{p.sold.toLocaleString()}개</td>
                        <td className="px-4 py-3 text-right font-medium">{p.revenue.toLocaleString()}원</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-200 bg-gray-50 font-medium">
                      <td className="px-4 py-3" colSpan={3}>합계</td>
                      <td className="px-4 py-3 text-right">
                        {data.products.reduce((s, p) => s + p.sold, 0).toLocaleString()}개
                      </td>
                      <td className="px-4 py-3 text-right">
                        {data.products.reduce((s, p) => s + p.revenue, 0).toLocaleString()}원
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
