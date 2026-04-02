"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { ChevronLeft, ChevronRight, CalendarDays, List, Plus, X } from "lucide-react";
import {
  getScheduleEvents,
  createScheduleEvent,
  deleteScheduleEvent,
  getVenueOptions,
  type ScheduleEvent,
  type ScheduleFilter,
  type ScheduleStatus,
  type BusinessType,
  type BookingType,
  type ScheduleCreateRequest,
  SCHEDULE_STATUS_LABELS,
  BUSINESS_TYPE_LABELS,
} from "@/services/reservation-admin-api";
import { adminApi } from "@/lib/api-client";

// ── Helpers ────────────────────────────────────────────────────────

const MONTHS_KR = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
];
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function statusColor(status: ScheduleStatus): { className: string; style?: React.CSSProperties } {
  switch (status) {
    case "SCHEDULED": return { className: "", style: { backgroundColor: "var(--c-primary-light)", color: "var(--c-primary)", borderColor: "var(--c-primary)" } };
    case "IN_PROGRESS": return { className: "bg-emerald-100 text-emerald-700 border-emerald-200" };
    case "CANCELLED": return { className: "bg-red-100 text-red-700 border-red-200" };
    case "FINISHED": return { className: "bg-gray-100 text-gray-600 border-gray-200" };
  }
}

function statusBadgeVariant(
  status: ScheduleStatus
): "default" | "success" | "secondary" | "destructive" | "warning" {
  switch (status) {
    case "SCHEDULED": return "default";
    case "IN_PROGRESS": return "success";
    case "CANCELLED": return "destructive";
    case "FINISHED": return "secondary";
  }
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ── Create Modal ───────────────────────────────────────────────────

interface CreateModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  selectedDate: string | null;
}

function CreateModal({ open, onClose, onSaved, selectedDate }: CreateModalProps) {
  const [venueOptions, setVenueOptions] = useState<{ id: number; name: string }[]>([]);
  const [venueId, setVenueId] = useState("");
  const [startDate, setStartDate] = useState(selectedDate ?? "");
  const [startTime, setStartTime] = useState("14:00");
  const [endDate, setEndDate] = useState(selectedDate ?? "");
  const [endTime, setEndTime] = useState("16:00");
  const [ballCost, setBallCost] = useState("500");
  const [description, setDescription] = useState("");
  const [bookingType, setBookingType] = useState<BookingType>("ONE_TIME");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getVenueOptions().then(setVenueOptions).catch((err) => {
      console.error("[CreateModal] Failed to load venues:", err);
    });
  }, []);

  useEffect(() => {
    if (selectedDate) {
      setStartDate(selectedDate);
      setEndDate(selectedDate);
    }
  }, [selectedDate, open]);

  const handleSave = async () => {
    if (!venueId || !startDate || !endDate) return;
    setSaving(true);
    try {
      const req: ScheduleCreateRequest = {
        venueId: Number(venueId),
        startTime: `${startDate}T${startTime}:00`,
        endTime: `${endDate}T${endTime}:00`,
        ballCost: Number(ballCost),
        description: description.trim(),
        bookingType,
      };
      await createScheduleEvent(req);
      onSaved();
      onClose();
    } catch (err) {
      console.error("[CreateModal] Failed to save event:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>촬영예약 등록</DialogTitle>
          <DialogDescription>새 촬영 일정을 등록합니다.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>구장 <span className="text-red-500">*</span></Label>
            <Select value={venueId} onValueChange={setVenueId}>
              <SelectTrigger>
                <SelectValue placeholder="구장 선택" />
              </SelectTrigger>
              <SelectContent>
                {venueOptions.map((v) => (
                  <SelectItem key={v.id} value={String(v.id)}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>시작일 <span className="text-red-500">*</span></Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>시작시간</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>종료일 <span className="text-red-500">*</span></Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>종료시간</Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>뽈 비용</Label>
              <Input
                type="number"
                value={ballCost}
                onChange={(e) => setBallCost(e.target.value)}
                min={0}
              />
            </div>
            <div className="space-y-1.5">
              <Label>예약 유형</Label>
              <Select
                value={bookingType}
                onValueChange={(v) => setBookingType(v as BookingType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ONE_TIME">일회성</SelectItem>
                  <SelectItem value="REGULAR">정기</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>메모</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="추가 정보를 입력하세요"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={saving || !venueId || !startDate}>
            {saving ? "저장 중..." : "등록"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ──────────────────────────────────────────────────────

type ViewMode = "calendar" | "list";

export default function ReservationsPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");

  // Filters
  const [sportFilter, setSportFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [businessFilter, setBusinessFilter] = useState("ALL");
  const [keywordFilter, setKeywordFilter] = useState("");

  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Detail popover
  const [detailEvent, setDetailEvent] = useState<ScheduleEvent | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const filters: ScheduleFilter = {
        sportCode: sportFilter === "ALL" ? null : sportFilter,
        status:
          statusFilter === "ALL" ? null : (statusFilter as ScheduleStatus),
        businessType:
          businessFilter === "ALL" ? null : (businessFilter as BusinessType),
        competitionKeyword: keywordFilter || undefined,
        year,
        month,
      };

      // Try real API first, fall back to mock
      // TODO(Phase 4B): remove mock fallback once backend is stable
      const apiParams: Record<string, string> = { year: String(year), month: String(month) };
      if (filters.sportCode) apiParams.sportCode = filters.sportCode;
      if (filters.status) apiParams.status = filters.status;
      if (filters.businessType) apiParams.businessType = filters.businessType;
      if (filters.competitionKeyword) apiParams.competitionKeyword = filters.competitionKeyword;

      const apiResult = await adminApi.get<ScheduleEvent[]>(
        "/admin/api/v1/reservations",
        apiParams
      );
      if (apiResult) {
        setEvents(apiResult);
        return;
      }

      // Mock fallback
      const data = await getScheduleEvents(filters);
      setEvents(data);
    } finally {
      setLoading(false);
    }
  }, [sportFilter, statusFilter, businessFilter, keywordFilter, year, month]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const prevMonth = () => {
    if (month === 1) { setYear(year - 1); setMonth(12); }
    else setMonth(month - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setYear(year + 1); setMonth(1); }
    else setMonth(month + 1);
  };

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const days: Array<{ date: number; dateStr: string } | null> = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({ date: d, dateStr });
    }
    return days;
  }, [year, month]);

  const eventsForDate = useCallback(
    (dateStr: string) =>
      events.filter(
        (e) => formatDate(e.startTime) === dateStr
      ),
    [events]
  );

  const handleDeleteEvent = async (id: number) => {
    try {
      await deleteScheduleEvent(id);
      setDetailEvent(null);
      fetchData();
    } catch (err) {
      console.error("[Reservations] Failed to delete event:", err);
    }
  };

  const handleDayClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setCreateOpen(true);
  };

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">촬영예약 관리</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border border-gray-200 bg-white">
            <button
              onClick={() => setViewMode("calendar")}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-l-md transition-colors ${
                viewMode === "calendar"
                  ? "bg-emerald-600 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <CalendarDays size={16} />
              달력
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-r-md transition-colors border-l ${
                viewMode === "list"
                  ? "bg-emerald-600 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <List size={16} />
              목록
            </button>
          </div>
          <Button onClick={() => { setSelectedDate(null); setCreateOpen(true); }}>
            <Plus size={16} className="mr-1.5" />
            예약 등록
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 bg-white p-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">종목</Label>
          <Select value={sportFilter} onValueChange={setSportFilter}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="SOCCER">축구</SelectItem>
              <SelectItem value="BASKETBALL">농구</SelectItem>
              <SelectItem value="VOLLEYBALL">배구</SelectItem>
              <SelectItem value="BASEBALL">야구</SelectItem>
              <SelectItem value="FUTSAL">풋살</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">상태</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[110px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="SCHEDULED">예정</SelectItem>
              <SelectItem value="IN_PROGRESS">진행중</SelectItem>
              <SelectItem value="CANCELLED">취소</SelectItem>
              <SelectItem value="FINISHED">종료</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">사업유형</Label>
          <Select value={businessFilter} onValueChange={setBusinessFilter}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="B2B">B2B</SelectItem>
              <SelectItem value="B2G">B2G</SelectItem>
              <SelectItem value="B2C">B2C</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">대회명 검색</Label>
          <Input
            value={keywordFilter}
            onChange={(e) => setKeywordFilter(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchData()}
            placeholder="대회명 입력"
            className="w-[180px]"
          />
        </div>
      </div>

      {/* Month Navigator (Calendar mode) */}
      {viewMode === "calendar" && (
        <div className="rounded-lg border border-gray-200 bg-white">
          {/* Month Nav */}
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <button
              onClick={prevMonth}
              className="rounded-md p-1 hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
            <h2 className="text-base font-semibold text-gray-900">
              {year}년 {MONTHS_KR[month - 1]}
            </h2>
            <button
              onClick={nextMonth}
              className="rounded-md p-1 hover:bg-gray-100 transition-colors"
            >
              <ChevronRight size={20} className="text-gray-600" />
            </button>
          </div>

          {/* Weekday Header */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {WEEKDAYS.map((d, i) => (
              <div
                key={d}
                className={`py-2 text-center text-xs font-semibold ${
                  i === 0 ? "text-red-500" : i === 6 ? "" : "text-gray-500"
                }`}
                style={i === 6 ? { color: "var(--c-info)" } : undefined}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          {loading ? (
            <div className="py-20 text-center text-gray-400 text-sm">
              로딩 중...
            </div>
          ) : (
            <div className="grid grid-cols-7">
              {calendarDays.map((day, idx) => {
                if (!day) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      className="min-h-[100px] border-b border-r border-gray-100 bg-gray-50/30"
                    />
                  );
                }

                const dayEvents = eventsForDate(day.dateStr);
                const isToday = day.dateStr === todayStr;
                const colIdx = idx % 7;

                return (
                  <div
                    key={day.dateStr}
                    className={`min-h-[100px] border-b border-r border-gray-100 p-1.5 cursor-pointer hover:bg-gray-50 transition-colors ${
                      isToday ? "bg-emerald-50" : ""
                    }`}
                    onClick={() => handleDayClick(day.dateStr)}
                  >
                    <div
                      className={`mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                        isToday
                          ? "bg-emerald-600 text-white"
                          : colIdx === 0
                          ? "text-red-500"
                          : colIdx === 6
                          ? ""
                          : "text-gray-700"
                      }`}
                      style={!isToday && colIdx === 6 ? { color: "var(--c-info)" } : undefined}
                    >
                      {day.date}
                    </div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 3).map((ev) => (
                        <button
                          key={ev.id}
                          className={`w-full rounded border px-1 py-0.5 text-left text-[10px] leading-tight truncate font-medium transition-opacity hover:opacity-80 ${statusColor(ev.status).className}`}
                          style={statusColor(ev.status).style}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetailEvent(ev);
                          }}
                        >
                          {formatTime(ev.startTime)} {ev.venueName}
                        </button>
                      ))}
                      {dayEvents.length > 3 && (
                        <p className="pl-1 text-[10px] text-gray-400">
                          +{dayEvents.length - 3}개 더
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-4 py-3 text-center w-[60px]">NO</th>
                <th className="px-4 py-3">대회/리그</th>
                <th className="px-4 py-3 text-center w-[80px]">종목</th>
                <th className="px-4 py-3 text-center w-[100px]">구장</th>
                <th className="px-4 py-3 text-center w-[180px]">촬영일시</th>
                <th className="px-4 py-3 text-center w-[70px]">사업</th>
                <th className="px-4 py-3 text-center w-[80px]">뽈</th>
                <th className="px-4 py-3 text-center w-[90px]">상태</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                    로딩 중...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                    데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                events.map((ev, idx) => (
                  <tr
                    key={ev.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                      idx % 2 === 1 ? "bg-gray-50/50" : ""
                    }`}
                    onClick={() => setDetailEvent(ev)}
                  >
                    <td className="px-4 py-3 text-center text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {ev.competitionName || "-"}
                      <p className="text-xs text-gray-400 font-normal">{ev.description}</p>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600 text-xs">{ev.sportName}</td>
                    <td className="px-4 py-3 text-center text-gray-600 text-xs">{ev.venueName}</td>
                    <td className="px-4 py-3 text-center text-gray-600 text-xs whitespace-nowrap">
                      {formatDate(ev.startTime)}<br />
                      {formatTime(ev.startTime)} ~ {formatTime(ev.endTime)}
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-gray-500">
                      {BUSINESS_TYPE_LABELS[ev.businessType]}
                    </td>
                    <td className="px-4 py-3 text-center text-xs font-medium text-emerald-600">
                      {ev.ballCost.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={statusBadgeVariant(ev.status)}>
                        {SCHEDULE_STATUS_LABELS[ev.status]}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Dialog */}
      {detailEvent && (
        <Dialog open={!!detailEvent} onOpenChange={() => setDetailEvent(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>촬영 일정 상세</DialogTitle>
              <DialogDescription>
                {detailEvent.competitionName || "촬영 예약"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                <div>
                  <p className="text-xs text-gray-500">구장</p>
                  <p className="font-medium">{detailEvent.venueName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">종목</p>
                  <p className="font-medium">{detailEvent.sportName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">시작</p>
                  <p className="font-medium">
                    {formatDate(detailEvent.startTime)} {formatTime(detailEvent.startTime)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">종료</p>
                  <p className="font-medium">
                    {formatDate(detailEvent.endTime)} {formatTime(detailEvent.endTime)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">사업유형</p>
                  <p className="font-medium">{BUSINESS_TYPE_LABELS[detailEvent.businessType]}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">뽈 비용</p>
                  <p className="font-medium text-emerald-600">
                    {detailEvent.ballCost.toLocaleString()} 뽈
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">상태</p>
                  <Badge variant={statusBadgeVariant(detailEvent.status)}>
                    {SCHEDULE_STATUS_LABELS[detailEvent.status]}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-500">스튜디오</p>
                  <p className={`font-medium ${detailEvent.studioLinked ? "text-emerald-600" : "text-gray-400"}`}>
                    {detailEvent.studioLinked ? "연결됨" : "미연결"}
                  </p>
                </div>
              </div>
              {detailEvent.description && (
                <div>
                  <p className="text-xs text-gray-500">메모</p>
                  <p className="text-gray-700">{detailEvent.description}</p>
                </div>
              )}
              <p className="text-xs text-gray-400">
                등록: {detailEvent.createdBy} · {detailEvent.createdAt}
              </p>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteEvent(detailEvent.id)}
              >
                <X size={14} className="mr-1" />
                삭제
              </Button>
              <Button variant="outline" onClick={() => setDetailEvent(null)}>
                닫기
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Modal */}
      <CreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSaved={fetchData}
        selectedDate={selectedDate}
      />
    </div>
  );
}
