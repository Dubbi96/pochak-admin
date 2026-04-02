"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { DataTablePagination } from "@/components/table/data-table-pagination";
import {
  Handshake,
  Search,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Pause,
  Play,
  Percent,
  Building2,
  MapPin,
  DollarSign,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ChevronLeft,
  Clock,
  Receipt,
  Eye,
} from "lucide-react";
import type {
  Partner,
  PartnerFilter,
  PartnerStatus,
  PartnerVenue,
  PartnerSettlement,
} from "@/types/partner";
import type { PageResponse } from "@/types/common";
import {
  getPartners,
  getPartnerById,
  approvePartner,
  suspendPartner,
  reactivatePartner,
  rejectPartner,
  updateCommissionRate,
  getPartnerVenues,
  getPartnerSettlements,
  PARTNER_STATUS_LABELS,
} from "@/services/partner-api";

// ── Helpers ──────────────────────────────────────────────────────────

function statusStyle(status: PartnerStatus): React.CSSProperties {
  switch (status) {
    case "ACTIVE":
      return { backgroundColor: "var(--c-primary-light)", color: "var(--c-primary)" };
    case "PENDING":
      return { backgroundColor: "rgba(255,215,64,0.15)", color: "#B8860B" };
    case "SUSPENDED":
      return { backgroundColor: "rgba(229,23,40,0.1)", color: "var(--c-error)" };
    case "REJECTED":
      return { backgroundColor: "var(--c-hover)", color: "var(--fg-secondary)" };
  }
}

function statusIcon(status: PartnerStatus) {
  switch (status) {
    case "ACTIVE": return <CheckCircle2 size={12} />;
    case "PENDING": return <Clock size={12} />;
    case "SUSPENDED": return <Pause size={12} />;
    case "REJECTED": return <XCircle size={12} />;
  }
}

function formatCurrency(amount: number): string {
  return `${amount.toLocaleString()}원`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ── Detail Panel ─────────────────────────────────────────────────────

function PartnerDetail({
  partnerId,
  onBack,
  onRefresh,
}: {
  partnerId: number;
  onBack: () => void;
  onRefresh: () => void;
}) {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [venues, setVenues] = useState<PartnerVenue[]>([]);
  const [settlements, setSettlements] = useState<PartnerSettlement[]>([]);
  const [loading, setLoading] = useState(true);

  // Commission rate edit
  const [editingRate, setEditingRate] = useState(false);
  const [newRate, setNewRate] = useState("");
  const [savingRate, setSavingRate] = useState(false);

  // Action dialogs
  const [suspendDialog, setSuspendDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [actionReason, setActionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [p, v, s] = await Promise.all([
          getPartnerById(partnerId),
          getPartnerVenues(partnerId),
          getPartnerSettlements(partnerId, { page: 1, size: 10 }),
        ]);
        setPartner(p);
        setVenues(v);
        setSettlements(s.content);
      } catch {
        /* API error */
      } finally {
        setLoading(false);
      }
    })();
  }, [partnerId]);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await approvePartner(partnerId);
      const p = await getPartnerById(partnerId);
      setPartner(p);
      onRefresh();
    } catch { /* API error */ }
    finally { setActionLoading(false); }
  };

  const handleSuspend = async () => {
    if (!actionReason.trim()) return;
    setActionLoading(true);
    try {
      await suspendPartner(partnerId, actionReason);
      const p = await getPartnerById(partnerId);
      setPartner(p);
      onRefresh();
    } catch { /* API error */ }
    finally {
      setActionLoading(false);
      setSuspendDialog(false);
      setActionReason("");
    }
  };

  const handleReactivate = async () => {
    setActionLoading(true);
    try {
      await reactivatePartner(partnerId);
      const p = await getPartnerById(partnerId);
      setPartner(p);
      onRefresh();
    } catch { /* API error */ }
    finally { setActionLoading(false); }
  };

  const handleReject = async () => {
    if (!actionReason.trim()) return;
    setActionLoading(true);
    try {
      await rejectPartner(partnerId, actionReason);
      const p = await getPartnerById(partnerId);
      setPartner(p);
      onRefresh();
    } catch { /* API error */ }
    finally {
      setActionLoading(false);
      setRejectDialog(false);
      setActionReason("");
    }
  };

  const handleSaveRate = async () => {
    const rate = parseFloat(newRate);
    if (isNaN(rate) || rate < 0 || rate > 100) return;
    setSavingRate(true);
    try {
      await updateCommissionRate(partnerId, rate);
      const p = await getPartnerById(partnerId);
      setPartner(p);
      setEditingRate(false);
    } catch { /* API error */ }
    finally { setSavingRate(false); }
  };

  if (loading || !partner) {
    return (
      <div className="flex h-64 items-center justify-center" style={{ color: "var(--fg-tertiary)" }}>
        {loading ? "로딩 중..." : "파트너 정보를 불러올 수 없습니다."}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Back button + header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="rounded-md p-1.5" style={{ color: "var(--fg-secondary)" }}>
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-lg font-bold" style={{ color: "var(--fg)" }}>{partner.companyName}</h2>
            <p className="text-sm" style={{ color: "var(--fg-secondary)" }}>
              {partner.representativeName} | {partner.businessNumber}
            </p>
          </div>
          <span
            className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium"
            style={statusStyle(partner.status)}
          >
            {statusIcon(partner.status)}
            {PARTNER_STATUS_LABELS[partner.status]}
          </span>
        </div>
        <div className="flex gap-2">
          {partner.status === "PENDING" && (
            <>
              <Button onClick={handleApprove} disabled={actionLoading} size="sm">
                <CheckCircle2 size={14} style={{ marginRight: 4 }} /> 승인
              </Button>
              <Button variant="destructive" onClick={() => setRejectDialog(true)} disabled={actionLoading} size="sm">
                <XCircle size={14} style={{ marginRight: 4 }} /> 거절
              </Button>
            </>
          )}
          {partner.status === "ACTIVE" && (
            <Button variant="destructive" onClick={() => setSuspendDialog(true)} disabled={actionLoading} size="sm">
              <Pause size={14} style={{ marginRight: 4 }} /> 정지
            </Button>
          )}
          {partner.status === "SUSPENDED" && (
            <Button onClick={handleReactivate} disabled={actionLoading} size="sm">
              <Play size={14} style={{ marginRight: 4 }} /> 해제
            </Button>
          )}
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard icon={<DollarSign size={16} />} label="총 매출" value={formatCurrency(partner.totalRevenue)} />
        <InfoCard icon={<DollarSign size={16} />} label="월 매출" value={formatCurrency(partner.monthlyRevenue)} />
        <InfoCard icon={<MapPin size={16} />} label="소유 장소" value={`${partner.venueCount}개`} />
        <div
          className="rounded-lg p-4"
          style={{ border: "1px solid var(--c-border)", backgroundColor: "var(--bg-surface)" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md" style={{ backgroundColor: "var(--c-primary-light)" }}>
                <Percent size={16} style={{ color: "var(--c-primary)" }} />
              </div>
              <div>
                <div className="text-xs" style={{ color: "var(--fg-tertiary)" }}>수수료율</div>
                {editingRate ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={newRate}
                      onChange={(e) => setNewRate(e.target.value)}
                      className="h-7 w-20 text-sm"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <span className="text-sm font-medium" style={{ color: "var(--fg)" }}>%</span>
                    <Button size="xs" onClick={handleSaveRate} disabled={savingRate}>저장</Button>
                    <Button size="xs" variant="ghost" onClick={() => setEditingRate(false)}>취소</Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold" style={{ color: "var(--fg)" }}>
                      {partner.commissionRate}%
                    </span>
                    <button
                      onClick={() => { setNewRate(String(partner.commissionRate)); setEditingRate(true); }}
                      className="rounded px-1.5 py-0.5 text-xs font-medium"
                      style={{ color: "var(--c-primary)", backgroundColor: "var(--c-primary-light)" }}
                    >
                      변경
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Business info */}
      <div
        className="rounded-lg p-5"
        style={{ border: "1px solid var(--c-border)", backgroundColor: "var(--bg-surface)" }}
      >
        <h3 className="mb-3 text-sm font-semibold" style={{ color: "var(--fg)" }}>사업자 정보</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span style={{ color: "var(--fg-tertiary)" }}>이메일:</span> <span style={{ color: "var(--fg)" }}>{partner.email}</span></div>
          <div><span style={{ color: "var(--fg-tertiary)" }}>연락처:</span> <span style={{ color: "var(--fg)" }}>{partner.phone}</span></div>
          <div className="col-span-2"><span style={{ color: "var(--fg-tertiary)" }}>주소:</span> <span style={{ color: "var(--fg)" }}>{partner.address}</span></div>
          <div><span style={{ color: "var(--fg-tertiary)" }}>가입일:</span> <span style={{ color: "var(--fg)" }}>{formatDate(partner.joinedAt)}</span></div>
          <div><span style={{ color: "var(--fg-tertiary)" }}>승인일:</span> <span style={{ color: "var(--fg)" }}>{formatDate(partner.approvedAt)}</span></div>
          {partner.suspendReason && (
            <div className="col-span-2">
              <span style={{ color: "var(--c-error)" }}>정지사유:</span>{" "}
              <span style={{ color: "var(--fg)" }}>{partner.suspendReason}</span>
            </div>
          )}
        </div>
      </div>

      {/* Venues */}
      <div
        className="rounded-lg overflow-hidden"
        style={{ border: "1px solid var(--c-border)", backgroundColor: "var(--bg-surface)" }}
      >
        <div className="px-5 py-3" style={{ borderBottom: "1px solid var(--c-border)" }}>
          <h3 className="text-sm font-semibold" style={{ color: "var(--fg)" }}>소유 장소 ({venues.length})</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow style={{ backgroundColor: "var(--bg-surface-variant)", borderBottom: "1px solid var(--c-border)" }}>
              <TableHead>장소명</TableHead>
              <TableHead>지역</TableHead>
              <TableHead>종목</TableHead>
              <TableHead>상태</TableHead>
              <TableHead className="text-right">월 매출</TableHead>
              <TableHead className="text-right">총 예약</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {venues.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-20 text-center" style={{ color: "var(--fg-tertiary)" }}>
                  등록된 장소가 없습니다.
                </TableCell>
              </TableRow>
            ) : venues.map((v) => (
              <TableRow key={v.id}>
                <TableCell className="font-medium">{v.venueName}</TableCell>
                <TableCell>{v.district}</TableCell>
                <TableCell>{v.sportName}</TableCell>
                <TableCell>
                  <Badge variant={v.isActive ? "success" : "secondary"}>
                    {v.isActive ? "운영중" : "비활성"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">{formatCurrency(v.monthlyRevenue)}</TableCell>
                <TableCell className="text-right tabular-nums">{v.totalBookings.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Settlements */}
      <div
        className="rounded-lg overflow-hidden"
        style={{ border: "1px solid var(--c-border)", backgroundColor: "var(--bg-surface)" }}
      >
        <div className="px-5 py-3" style={{ borderBottom: "1px solid var(--c-border)" }}>
          <h3 className="text-sm font-semibold" style={{ color: "var(--fg)" }}>정산 내역</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow style={{ backgroundColor: "var(--bg-surface-variant)", borderBottom: "1px solid var(--c-border)" }}>
              <TableHead>정산기간</TableHead>
              <TableHead className="text-right">매출</TableHead>
              <TableHead className="text-right">수수료율</TableHead>
              <TableHead className="text-right">수수료</TableHead>
              <TableHead className="text-right">정산금</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>지급일</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {settlements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-20 text-center" style={{ color: "var(--fg-tertiary)" }}>
                  정산 내역이 없습니다.
                </TableCell>
              </TableRow>
            ) : settlements.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.period}</TableCell>
                <TableCell className="text-right tabular-nums">{formatCurrency(s.totalRevenue)}</TableCell>
                <TableCell className="text-right tabular-nums">{s.commissionRate}%</TableCell>
                <TableCell className="text-right tabular-nums">{formatCurrency(s.commissionAmount)}</TableCell>
                <TableCell className="text-right tabular-nums font-medium">{formatCurrency(s.netAmount)}</TableCell>
                <TableCell>
                  <Badge variant={s.status === "PAID" ? "success" : s.status === "CONFIRMED" ? "default" : "warning"}>
                    {s.status === "PAID" ? "지급완료" : s.status === "CONFIRMED" ? "확정" : "대기"}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(s.paidAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Suspend dialog */}
      <Dialog open={suspendDialog} onOpenChange={setSuspendDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>파트너 정지</DialogTitle>
            <DialogDescription>{partner.companyName} 파트너를 정지합니다. 사유를 입력하세요.</DialogDescription>
          </DialogHeader>
          <Input
            value={actionReason}
            onChange={(e) => setActionReason(e.target.value)}
            placeholder="정지 사유 입력"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setSuspendDialog(false); setActionReason(""); }}>취소</Button>
            <Button variant="destructive" onClick={handleSuspend} disabled={actionLoading || !actionReason.trim()}>
              {actionLoading ? "처리 중..." : "정지"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject dialog */}
      <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>파트너 거절</DialogTitle>
            <DialogDescription>{partner.companyName} 파트너 가입을 거절합니다. 사유를 입력하세요.</DialogDescription>
          </DialogHeader>
          <Input
            value={actionReason}
            onChange={(e) => setActionReason(e.target.value)}
            placeholder="거절 사유 입력"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRejectDialog(false); setActionReason(""); }}>취소</Button>
            <Button variant="destructive" onClick={handleReject} disabled={actionLoading || !actionReason.trim()}>
              {actionLoading ? "처리 중..." : "거절"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoCard({
  icon, label, value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      className="rounded-lg p-4"
      style={{ border: "1px solid var(--c-border)", backgroundColor: "var(--bg-surface)" }}
    >
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md" style={{ backgroundColor: "var(--c-primary-light)" }}>
          <span style={{ color: "var(--c-primary)" }}>{icon}</span>
        </div>
        <div>
          <div className="text-xs" style={{ color: "var(--fg-tertiary)" }}>{label}</div>
          <div className="text-lg font-bold" style={{ color: "var(--fg)" }}>{value}</div>
        </div>
      </div>
    </div>
  );
}

// ── Partner List ─────────────────────────────────────────────────────

function PartnerListView({ onSelect }: { onSelect: (id: number) => void }) {
  const [data, setData] = useState<PageResponse<Partner>>({
    content: [], totalElements: 0, totalPages: 0, page: 1, size: 10,
  });
  const [filter, setFilter] = useState<PartnerFilter>({ page: 1, size: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchData = useCallback(async () => {
    try {
      const result = await getPartners(filter);
      setData(result);
    } catch {
      /* API error */
    }
  }, [filter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = () => {
    setFilter((prev) => ({
      ...prev,
      keyword: search || undefined,
      status: statusFilter === "all" ? undefined : (statusFilter as PartnerStatus),
      page: 1,
    }));
  };

  const handleReset = () => {
    setSearch("");
    setStatusFilter("all");
    setFilter({ page: 1, size: 10 });
  };

  const columns: ColumnDef<Partner>[] = useMemo(() => [
    {
      accessorKey: "companyName",
      header: "업체명",
      cell: ({ row }) => (
        <button
          onClick={() => onSelect(row.original.id)}
          className="text-sm font-medium"
          style={{ color: "var(--c-primary)" }}
        >
          {row.original.companyName}
        </button>
      ),
    },
    {
      accessorKey: "representativeName",
      header: "대표자",
      size: 100,
    },
    {
      accessorKey: "businessNumber",
      header: "사업자번호",
      size: 120,
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
          {PARTNER_STATUS_LABELS[row.original.status]}
        </span>
      ),
    },
    {
      accessorKey: "venueCount",
      header: "장소",
      size: 70,
      cell: ({ row }) => <span className="tabular-nums">{row.original.venueCount}</span>,
    },
    {
      accessorKey: "commissionRate",
      header: "수수료",
      size: 80,
      cell: ({ row }) => <span className="tabular-nums">{row.original.commissionRate}%</span>,
    },
    {
      accessorKey: "monthlyRevenue",
      header: "월 매출",
      enableSorting: true,
      size: 120,
      cell: ({ row }) => (
        <span className="tabular-nums">{formatCurrency(row.original.monthlyRevenue)}</span>
      ),
    },
    {
      accessorKey: "joinedAt",
      header: "가입일",
      size: 100,
      cell: ({ row }) => <span className="text-sm">{formatDate(row.original.joinedAt)}</span>,
    },
    {
      id: "actions",
      header: "",
      size: 60,
      cell: ({ row }) => (
        <Button variant="ghost" size="xs" onClick={() => onSelect(row.original.id)}>
          <Eye size={14} />
        </Button>
      ),
    },
  ], [onSelect]);

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
      {/* Status summary cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {(["all", "PENDING", "ACTIVE", "SUSPENDED"] as const).map((s) => {
          const count = s === "all" ? data.totalElements : data.content.filter((p) => p.status === s).length;
          const label = s === "all" ? "전체" : PARTNER_STATUS_LABELS[s];
          const active = (s === "all" && statusFilter === "all") || statusFilter === s;

          return (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s === "all" ? "all" : s);
                setFilter((prev) => ({
                  ...prev,
                  status: s === "all" ? undefined : s,
                  page: 1,
                }));
              }}
              className="rounded-lg p-3 text-left transition-colors"
              style={{
                border: active ? "2px solid var(--c-primary)" : "1px solid var(--c-border)",
                backgroundColor: "var(--bg-surface)",
              }}
            >
              <div className="text-xs" style={{ color: "var(--fg-tertiary)" }}>{label}</div>
              <div className="text-xl font-bold tabular-nums" style={{ color: active ? "var(--c-primary)" : "var(--fg)" }}>
                {count}
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter bar */}
      <div
        className="rounded-lg px-5 py-4"
        style={{ border: "1px solid var(--c-border)", backgroundColor: "var(--bg-surface)" }}
      >
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--fg)" }}>검색</label>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="업체명/대표자/사업자번호"
              className="w-[240px]"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <div className="flex items-end gap-2 ml-auto">
            <Button variant="outline" onClick={handleReset} className="h-9">
              <RotateCcw size={14} style={{ marginRight: 6 }} /> 초기화
            </Button>
            <Button onClick={handleSearch} className="h-9">
              <Search size={14} style={{ marginRight: 6 }} /> 검색
            </Button>
          </div>
        </div>
      </div>

      {/* Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: "var(--fg)" }}>
          전체 <span className="font-semibold">{data.totalElements.toLocaleString()}</span>건
        </p>
        <Select
          value={String(filter.size ?? 10)}
          onValueChange={(v) => setFilter((prev) => ({ ...prev, size: Number(v), page: 1 }))}
        >
          <SelectTrigger className="h-8 w-[80px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {[10, 50, 100].map((s) => <SelectItem key={s} value={String(s)}>{s}건</SelectItem>)}
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
                  <TableHead key={header.id} style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}>
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
                  파트너 데이터가 없습니다.
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
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────

export default function PartnersPage() {
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  if (selectedPartnerId !== null) {
    return (
      <div className="p-6">
        <PartnerDetail
          partnerId={selectedPartnerId}
          onBack={() => setSelectedPartnerId(null)}
          onRefresh={() => setRefreshKey((k) => k + 1)}
        />
      </div>
    );
  }

  return (
    <div className="p-6" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: "var(--c-primary-light)" }}
        >
          <Handshake size={20} style={{ color: "var(--c-primary)" }} />
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--fg)" }}>파트너 관리</h1>
          <p className="text-sm" style={{ color: "var(--fg-secondary)" }}>
            파트너 가입 승인, 정지/해제, 수수료율 관리
          </p>
        </div>
      </div>

      <PartnerListView key={refreshKey} onSelect={setSelectedPartnerId} />
    </div>
  );
}
