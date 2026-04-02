"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/table/data-table-pagination";
import {
  Video,
  CalendarDays,
  List,
  MapPin,
  Share2,
  Search,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  StopCircle,
  Camera,
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  BarChart3,
} from "lucide-react";
import type {
  RecordingSession,
  RecordingFilter,
  RecordingStatus,
  VenueRecordingSummary,
  ShareStatItem,
} from "@/types/recording";
import type { PageResponse } from "@/types/common";
import {
  getRecordingSessions,
  getCalendarSessions,
  getVenueRecordingSummaries,
  getShareStatistics,
  forceTerminateRecording,
  RECORDING_STATUS_LABELS,
} from "@/services/recording-api";

// ── Helpers ──────────────────────────────────────────────────────────

const MONTHS_KR = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
];
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

type TabKey = "list" | "calendar" | "venues" | "shares";

function statusStyle(status: RecordingStatus): React.CSSProperties {
  switch (status) {
    case "RECORDING":
      return { backgroundColor: "var(--c-primary-light)", color: "var(--c-primary)" };
    case "COMPLETED":
      return { backgroundColor: "rgba(0,204,51,0.1)", color: "var(--c-success)" };
    case "SCHEDULED":
      return { backgroundColor: "rgba(102,153,255,0.1)", color: "var(--c-info)" };
    case "FAILED":
      return { backgroundColor: "rgba(229,23,40,0.1)", color: "var(--c-error)" };
    case "CANCELLED":
      return { backgroundColor: "var(--c-hover)", color: "var(--fg-secondary)" };
  }
}

function statusIcon(status: RecordingStatus) {
  switch (status) {
    case "RECORDING": return <Activity size={12} />;
    case "COMPLETED": return <CheckCircle2 size={12} />;
    case "SCHEDULED": return <Clock size={12} />;
    case "FAILED": return <AlertTriangle size={12} />;
    case "CANCELLED": return <XCircle size={12} />;
  }
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "-";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}시간 ${m}분`;
  return `${m}분`;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "-";
  if (bytes >= 1_073_741_824) return `${(bytes / 1_073_741_824).toFixed(1)}GB`;
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)}MB`;
  return `${(bytes / 1024).toFixed(0)}KB`;
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function formatTime(iso: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// ── Mock data generators (until API is ready) ────────────────────────

function generateMockSessions(page: number, size: number): PageResponse<RecordingSession> {
  const statuses: RecordingStatus[] = ["SCHEDULED", "RECORDING", "COMPLETED", "FAILED", "CANCELLED"];
  const venues = ["서울종합운동장", "잠실체육관", "고척스카이돔", "인천문학경기장", "수원월드컵경기장"];
  const sports = ["축구", "야구", "농구", "배구", "테니스"];
  const total = 87;
  const content: RecordingSession[] = [];

  for (let i = 0; i < Math.min(size, total - (page - 1) * size); i++) {
    const idx = (page - 1) * size + i;
    const status = statuses[idx % statuses.length];
    const venueIdx = idx % venues.length;
    const now = new Date();
    const start = new Date(now.getTime() - (idx * 3600000));
    const end = new Date(start.getTime() + 7200000);

    content.push({
      id: 1000 + idx,
      venueId: venueIdx + 1,
      venueName: venues[venueIdx],
      district: ["서울", "인천", "수원", "대전", "부산"][venueIdx],
      sportCode: `SP${venueIdx + 1}`,
      sportName: sports[venueIdx],
      matchId: idx % 3 === 0 ? 2000 + idx : null,
      matchTitle: idx % 3 === 0 ? `${sports[venueIdx]} 경기 #${idx}` : null,
      cameraId: 100 + (idx % 10),
      cameraName: `CAM-${String(100 + (idx % 10))}`,
      vpuId: 200 + (idx % 5),
      vpuName: `VPU-${String(200 + (idx % 5))}`,
      scheduledStart: start.toISOString(),
      scheduledEnd: end.toISOString(),
      actualStart: status !== "SCHEDULED" ? start.toISOString() : null,
      actualEnd: status === "COMPLETED" || status === "FAILED" ? end.toISOString() : null,
      status,
      duration: status === "COMPLETED" ? 7200 - idx * 60 : null,
      fileSize: status === "COMPLETED" ? (1_073_741_824 + idx * 10_000_000) : null,
      contentId: status === "COMPLETED" ? 3000 + idx : null,
      shareCount: Math.floor(Math.random() * 500),
      viewCount: Math.floor(Math.random() * 5000),
      createdBy: "admin",
      createdAt: start.toISOString(),
      updatedAt: end.toISOString(),
    });
  }

  return {
    content,
    totalElements: total,
    totalPages: Math.ceil(total / size),
    page,
    size,
  };
}

function generateMockVenueSummaries(): VenueRecordingSummary[] {
  const venues = ["서울종합운동장", "잠실체육관", "고척스카이돔", "인천문학경기장", "수원월드컵경기장", "대전한밭스포츠타운"];
  return venues.map((v, i) => ({
    venueId: i + 1,
    venueName: v,
    district: ["서울", "서울", "서울", "인천", "수원", "대전"][i],
    totalSessions: 50 + i * 12,
    activeSessions: i % 3,
    completedToday: 3 + i,
    scheduledToday: 2 + (i % 4),
    failedToday: i % 2,
  }));
}

function generateMockShareStats(): PageResponse<ShareStatItem> {
  const items: ShareStatItem[] = Array.from({ length: 10 }, (_, i) => ({
    contentId: 3000 + i,
    contentTitle: `하이라이트 #${i + 1}`,
    contentType: i % 2 === 0 ? "VOD" : "클립",
    shareCount: 500 - i * 30,
    viewCount: 5000 - i * 300,
    venueName: ["서울종합운동장", "잠실체육관", "고척스카이돔"][i % 3],
    recordedAt: new Date(Date.now() - i * 86400000).toISOString(),
  }));
  return { content: items, totalElements: 10, totalPages: 1, page: 1, size: 10 };
}

// ── Session List Tab ─────────────────────────────────────────────────

function SessionListTab() {
  const [data, setData] = useState<PageResponse<RecordingSession>>({
    content: [], totalElements: 0, totalPages: 0, page: 1, size: 10,
  });
  const [filter, setFilter] = useState<RecordingFilter>({ page: 1, size: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [terminateTarget, setTerminateTarget] = useState<RecordingSession | null>(null);
  const [isTerminating, setIsTerminating] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const result = await getRecordingSessions(filter);
      setData(result);
    } catch {
      setData(generateMockSessions(filter.page ?? 1, filter.size ?? 10));
    }
  }, [filter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = () => {
    setFilter((prev) => ({
      ...prev,
      keyword: search || undefined,
      status: statusFilter === "all" ? undefined : (statusFilter as RecordingStatus),
      page: 1,
    }));
  };

  const handleReset = () => {
    setSearch("");
    setStatusFilter("all");
    setFilter({ page: 1, size: 10 });
  };

  const handleTerminate = async () => {
    if (!terminateTarget) return;
    setIsTerminating(true);
    try {
      await forceTerminateRecording(terminateTarget.id);
      fetchData();
    } catch {
      // fallback: just close
    } finally {
      setIsTerminating(false);
      setTerminateTarget(null);
    }
  };

  const columns: ColumnDef<RecordingSession>[] = useMemo(() => [
    {
      accessorKey: "id",
      header: "ID",
      size: 70,
      cell: ({ row }) => (
        <span className="text-sm font-medium" style={{ color: "var(--c-primary)" }}>
          #{row.original.id}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "상태",
      size: 100,
      cell: ({ row }) => (
        <span
          className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium"
          style={statusStyle(row.original.status)}
        >
          {statusIcon(row.original.status)}
          {RECORDING_STATUS_LABELS[row.original.status]}
        </span>
      ),
    },
    {
      accessorKey: "venueName",
      header: "구장",
      cell: ({ row }) => (
        <div>
          <div className="text-sm font-medium">{row.original.venueName}</div>
          <div className="text-xs" style={{ color: "var(--fg-tertiary)" }}>{row.original.district}</div>
        </div>
      ),
    },
    {
      accessorKey: "sportName",
      header: "종목",
      size: 80,
    },
    {
      accessorKey: "cameraName",
      header: "카메라",
      size: 100,
      cell: ({ row }) => (
        <div className="text-sm">
          <div>{row.original.cameraName}</div>
          {row.original.vpuName && (
            <div className="text-xs" style={{ color: "var(--fg-tertiary)" }}>{row.original.vpuName}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "scheduledStart",
      header: "예약시간",
      enableSorting: true,
      cell: ({ row }) => (
        <div className="text-sm">
          <div>{formatDateTime(row.original.scheduledStart)}</div>
          <div className="text-xs" style={{ color: "var(--fg-tertiary)" }}>
            ~ {formatTime(row.original.scheduledEnd)}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "duration",
      header: "촬영시간",
      size: 90,
      cell: ({ row }) => <span className="text-sm">{formatDuration(row.original.duration)}</span>,
    },
    {
      accessorKey: "fileSize",
      header: "파일크기",
      size: 90,
      cell: ({ row }) => <span className="text-sm">{formatFileSize(row.original.fileSize)}</span>,
    },
    {
      accessorKey: "shareCount",
      header: "공유",
      size: 70,
      cell: ({ row }) => (
        <span className="text-sm tabular-nums">{row.original.shareCount.toLocaleString()}</span>
      ),
    },
    {
      id: "actions",
      header: "",
      size: 80,
      cell: ({ row }) => (
        row.original.status === "RECORDING" ? (
          <Button
            variant="destructive"
            size="xs"
            onClick={() => setTerminateTarget(row.original)}
          >
            <StopCircle size={12} style={{ marginRight: 4 }} />
            종료
          </Button>
        ) : null
      ),
    },
  ], []);

  const table = useReactTable({
    data: data.content,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
    rowCount: data.totalElements,
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Filters */}
      <div
        className="rounded-lg px-5 py-4"
        style={{ border: "1px solid var(--c-border)", backgroundColor: "var(--bg-surface)" }}
      >
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--fg)" }}>검색</label>
            <div className="flex gap-2">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="구장/종목/카메라 검색"
                className="w-[220px]"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--fg)" }}>상태</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {(Object.entries(RECORDING_STATUS_LABELS) as [RecordingStatus, string][]).map(
                  ([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2 ml-auto">
            <Button variant="outline" onClick={handleReset} className="h-9">
              <RotateCcw size={14} style={{ marginRight: 6 }} />
              초기화
            </Button>
            <Button onClick={handleSearch} className="h-9">
              <Search size={14} style={{ marginRight: 6 }} />
              검색
            </Button>
          </div>
        </div>
      </div>

      {/* Count + page size */}
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: "var(--fg)" }}>
          전체 <span className="font-semibold">{data.totalElements.toLocaleString()}</span>건
        </p>
        <Select
          value={String(filter.size ?? 10)}
          onValueChange={(v) => setFilter((prev) => ({ ...prev, size: Number(v), page: 1 }))}
        >
          <SelectTrigger className="h-8 w-[80px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[10, 50, 100].map((s) => (
              <SelectItem key={s} value={String(s)}>{s}건</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--c-border)", backgroundColor: "var(--bg-surface)" }}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} style={{ backgroundColor: "var(--bg-surface-variant)", borderBottom: "1px solid var(--c-border)" }}>
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        className="flex items-center gap-1"
                        style={{ color: "var(--fg-secondary)" }}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: <ArrowUp className="h-3.5 w-3.5" />,
                          desc: <ArrowDown className="h-3.5 w-3.5" />,
                        }[header.column.getIsSorted() as string] ?? (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-30" />
                        )}
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {data.content.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center" style={{ color: "var(--fg-tertiary)" }}>
                  검색 결과가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {data.totalPages > 0 && (
        <DataTablePagination
          currentPage={data.page}
          totalPages={data.totalPages}
          onPageChange={(p) => setFilter((prev) => ({ ...prev, page: p }))}
        />
      )}

      {/* Force terminate dialog */}
      <Dialog open={!!terminateTarget} onOpenChange={() => setTerminateTarget(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: "rgba(229,23,40,0.1)" }}
              >
                <StopCircle size={20} style={{ color: "var(--c-error)" }} />
              </div>
              <div className="flex flex-col gap-1.5 pt-1">
                <DialogTitle className="text-base">촬영 세션 강제 종료</DialogTitle>
                <DialogDescription>
                  {terminateTarget?.venueName} - {terminateTarget?.cameraName} 세션을 강제 종료하시겠습니까?
                  진행 중인 촬영이 즉시 중단됩니다.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTerminateTarget(null)} disabled={isTerminating}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleTerminate} disabled={isTerminating}>
              {isTerminating ? "처리 중..." : "강제 종료"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Calendar Tab ─────────────────────────────────────────────────────

function CalendarTab() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [sessions, setSessions] = useState<RecordingSession[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getCalendarSessions(year, month + 1);
        setSessions(data);
      } catch {
        // Generate mock calendar data
        const mockSessions: RecordingSession[] = [];
        const statuses: RecordingStatus[] = ["SCHEDULED", "RECORDING", "COMPLETED"];
        const venues = ["서울종합운동장", "잠실체육관", "고척스카이돔"];
        for (let d = 1; d <= 28; d++) {
          if (d % 2 === 0) continue;
          const count = 1 + (d % 3);
          for (let j = 0; j < count; j++) {
            const start = new Date(year, month, d, 9 + j * 3, 0);
            mockSessions.push({
              id: d * 10 + j,
              venueId: j + 1,
              venueName: venues[j % venues.length],
              district: "서울",
              sportCode: "SP1",
              sportName: "축구",
              matchId: null,
              matchTitle: null,
              cameraId: 100 + j,
              cameraName: `CAM-${100 + j}`,
              vpuId: null,
              vpuName: null,
              scheduledStart: start.toISOString(),
              scheduledEnd: new Date(start.getTime() + 7200000).toISOString(),
              actualStart: null,
              actualEnd: null,
              status: statuses[j % statuses.length],
              duration: null,
              fileSize: null,
              contentId: null,
              shareCount: 0,
              viewCount: 0,
              createdBy: "admin",
              createdAt: start.toISOString(),
              updatedAt: start.toISOString(),
            });
          }
        }
        setSessions(mockSessions);
      }
    })();
  }, [year, month]);

  const prevMonth = () => {
    if (month === 0) { setYear(year - 1); setMonth(11); }
    else setMonth(month - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(year + 1); setMonth(0); }
    else setMonth(month + 1);
  };

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = Array(firstDay).fill(null);

  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d);
    if (week.length === 7) { weeks.push(week); week = []; }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  const sessionsByDay = useMemo(() => {
    const map = new Map<number, RecordingSession[]>();
    sessions.forEach((s) => {
      const d = new Date(s.scheduledStart).getDate();
      if (!map.has(d)) map.set(d, []);
      map.get(d)!.push(s);
    });
    return map;
  }, [sessions]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="rounded-md p-1.5 transition-colors"
            style={{ color: "var(--fg-secondary)" }}
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-lg font-bold" style={{ color: "var(--fg)" }}>
            {year}년 {MONTHS_KR[month]}
          </h2>
          <button
            onClick={nextMonth}
            className="rounded-md p-1.5 transition-colors"
            style={{ color: "var(--fg-secondary)" }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="flex items-center gap-3 text-xs">
          {(["SCHEDULED", "RECORDING", "COMPLETED"] as RecordingStatus[]).map((s) => (
            <span key={s} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ ...statusStyle(s), width: 10, height: 10 }} />
              {RECORDING_STATUS_LABELS[s]}
            </span>
          ))}
        </div>
      </div>

      {/* Calendar grid */}
      <div
        className="rounded-lg overflow-hidden"
        style={{ border: "1px solid var(--c-border)", backgroundColor: "var(--bg-surface)" }}
      >
        {/* Weekday headers */}
        <div className="grid grid-cols-7" style={{ borderBottom: "1px solid var(--c-border)", backgroundColor: "var(--bg-surface-variant)" }}>
          {WEEKDAYS.map((d, i) => (
            <div
              key={d}
              className="px-2 py-2 text-center text-xs font-medium"
              style={{
                color: i === 0 ? "var(--c-error)" : i === 6 ? "var(--c-info)" : "var(--fg-secondary)",
              }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar cells */}
        {weeks.map((w, wi) => (
          <div key={wi} className="grid grid-cols-7" style={{ borderBottom: wi < weeks.length - 1 ? "1px solid var(--c-border-light)" : undefined }}>
            {w.map((day, di) => {
              const daySessions = day ? sessionsByDay.get(day) || [] : [];
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const dayOfWeek = di;

              return (
                <div
                  key={di}
                  className="min-h-[100px] p-1.5"
                  style={{
                    borderRight: di < 6 ? "1px solid var(--c-border-light)" : undefined,
                    backgroundColor: isToday ? "var(--c-primary-lighter)" : undefined,
                  }}
                >
                  {day && (
                    <>
                      <div
                        className="mb-1 text-xs font-medium"
                        style={{
                          color: dayOfWeek === 0 ? "var(--c-error)" : dayOfWeek === 6 ? "var(--c-info)" : "var(--fg)",
                        }}
                      >
                        {day}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {daySessions.slice(0, 3).map((s) => (
                          <div
                            key={s.id}
                            className="truncate rounded px-1 py-0.5 text-[10px] font-medium"
                            style={statusStyle(s.status)}
                            title={`${formatTime(s.scheduledStart)} ${s.venueName}`}
                          >
                            {formatTime(s.scheduledStart)} {s.venueName}
                          </div>
                        ))}
                        {daySessions.length > 3 && (
                          <div className="text-[10px] px-1" style={{ color: "var(--fg-tertiary)" }}>
                            +{daySessions.length - 3}건 더
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Venue Dashboard Tab ──────────────────────────────────────────────

function VenueDashboardTab() {
  const [summaries, setSummaries] = useState<VenueRecordingSummary[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getVenueRecordingSummaries();
        setSummaries(data);
      } catch {
        setSummaries(generateMockVenueSummaries());
      }
    })();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {summaries.map((venue) => (
          <div
            key={venue.venueId}
            className="rounded-lg p-5"
            style={{ border: "1px solid var(--c-border)", backgroundColor: "var(--bg-surface)" }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold" style={{ color: "var(--fg)" }}>
                  {venue.venueName}
                </h3>
                <p className="text-xs" style={{ color: "var(--fg-tertiary)" }}>{venue.district}</p>
              </div>
              {venue.activeSessions > 0 && (
                <span
                  className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{ backgroundColor: "var(--c-primary-light)", color: "var(--c-primary)" }}
                >
                  <Activity size={10} />
                  LIVE {venue.activeSessions}
                </span>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <StatCell label="총 세션" value={venue.totalSessions} icon={<Camera size={14} />} />
              <StatCell label="오늘 완료" value={venue.completedToday} icon={<CheckCircle2 size={14} />} color="var(--c-success)" />
              <StatCell label="오늘 예약" value={venue.scheduledToday} icon={<Clock size={14} />} color="var(--c-info)" />
              <StatCell label="오늘 실패" value={venue.failedToday} icon={<AlertTriangle size={14} />} color="var(--c-error)" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCell({
  label, value, icon, color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex h-7 w-7 items-center justify-center rounded-md"
        style={{ backgroundColor: color ? `color-mix(in srgb, ${color} 15%, transparent)` : "var(--c-hover)", color: color || "var(--fg-secondary)" }}
      >
        {icon}
      </div>
      <div>
        <div className="text-sm font-bold tabular-nums" style={{ color: "var(--fg)" }}>{value}</div>
        <div className="text-[10px]" style={{ color: "var(--fg-tertiary)" }}>{label}</div>
      </div>
    </div>
  );
}

// ── Share Stats Tab ──────────────────────────────────────────────────

function ShareStatsTab() {
  const [data, setData] = useState<PageResponse<ShareStatItem>>({
    content: [], totalElements: 0, totalPages: 0, page: 1, size: 10,
  });

  useEffect(() => {
    (async () => {
      try {
        const result = await getShareStatistics({ page: 1, size: 20 });
        setData(result);
      } catch {
        setData(generateMockShareStats());
      }
    })();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--c-border)", backgroundColor: "var(--bg-surface)" }}>
        <Table>
          <TableHeader>
            <TableRow style={{ backgroundColor: "var(--bg-surface-variant)", borderBottom: "1px solid var(--c-border)" }}>
              <TableHead>콘텐츠</TableHead>
              <TableHead>타입</TableHead>
              <TableHead>구장</TableHead>
              <TableHead>촬영일</TableHead>
              <TableHead className="text-right">공유수</TableHead>
              <TableHead className="text-right">조회수</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.content.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center" style={{ color: "var(--fg-tertiary)" }}>
                  공유 통계 데이터가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              data.content.map((item) => (
                <TableRow key={item.contentId}>
                  <TableCell>
                    <span className="text-sm font-medium" style={{ color: "var(--c-primary)" }}>
                      {item.contentTitle}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.contentType === "VOD" ? "default" : "secondary"}>
                      {item.contentType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{item.venueName}</TableCell>
                  <TableCell className="text-sm">{formatDateTime(item.recordedAt)}</TableCell>
                  <TableCell className="text-right">
                    <span className="flex items-center justify-end gap-1 text-sm font-medium tabular-nums">
                      <Share2 size={12} style={{ color: "var(--c-primary)" }} />
                      {item.shareCount.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {item.viewCount.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "list", label: "촬영 목록", icon: <List size={16} /> },
  { key: "calendar", label: "캘린더", icon: <CalendarDays size={16} /> },
  { key: "venues", label: "장소별 현황", icon: <MapPin size={16} /> },
  { key: "shares", label: "공유 통계", icon: <BarChart3 size={16} /> },
];

export default function RecordingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("list");

  return (
    <div className="p-6" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: "var(--c-primary-light)" }}
          >
            <Video size={20} style={{ color: "var(--c-primary)" }} />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--fg)" }}>촬영 관리</h1>
            <p className="text-sm" style={{ color: "var(--fg-secondary)" }}>
              전체 촬영 세션과 일정을 관리합니다
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 rounded-lg p-1"
        style={{ backgroundColor: "var(--c-hover)" }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors"
            style={{
              backgroundColor: activeTab === tab.key ? "var(--bg-surface)" : "transparent",
              color: activeTab === tab.key ? "var(--c-primary)" : "var(--fg-secondary)",
              boxShadow: activeTab === tab.key ? "0 1px 2px rgba(0,0,0,0.05)" : undefined,
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "list" && <SessionListTab />}
      {activeTab === "calendar" && <CalendarTab />}
      {activeTab === "venues" && <VenueDashboardTab />}
      {activeTab === "shares" && <ShareStatsTab />}
    </div>
  );
}
