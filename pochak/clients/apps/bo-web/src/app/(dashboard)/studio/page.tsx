"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import {
  Plus,
  Video,
  Camera,
  HardDrive,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Clapperboard,
} from "lucide-react";
import {
  getStudioSessions,
  createStudioSession,
  getStudioVenueOptions,
  getSessionKPIs,
  type StudioSession,
  type StudioCamera,
  type SessionStatus,
  type SessionFilter,
  type SessionCreateRequest,
  type CameraType,
  SESSION_STATUS_LABELS,
  CAMERA_TYPE_LABELS,
} from "@/services/studio-api";
import { adminApi } from "@/lib/api-client";

// ── Helpers ────────────────────────────────────────────────────────

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function statusBadgeVariant(
  status: SessionStatus
): "default" | "destructive" | "secondary" | "success" | "warning" {
  switch (status) {
    case "STANDBY":
      return "default";
    case "RECORDING":
      return "destructive";
    case "COMPLETED":
      return "secondary";
    case "ERROR":
      return "warning";
  }
}

function cameraStatusDot(status: StudioCamera["status"]): string {
  switch (status) {
    case "ONLINE":
      return "bg-green-500";
    case "RECORDING":
      return "bg-red-500";
    case "OFFLINE":
      return "bg-gray-400";
    case "ERROR":
      return "bg-yellow-500";
  }
}

// ── Detail Dialog ──────────────────────────────────────────────────

interface DetailDialogProps {
  session: StudioSession | null;
  onClose: () => void;
}

function DetailDialog({ session, onClose }: DetailDialogProps) {
  if (!session) return null;

  const storagePercent = session.storageTotalGB > 0
    ? Math.round((session.storageUsedGB / session.storageTotalGB) * 100)
    : 0;

  return (
    <Dialog open={!!session} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>세션 상세 정보</DialogTitle>
          <DialogDescription>
            {session.competitionName} - {session.matchName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Session Info */}
          <div className="grid grid-cols-2 gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
            <div>
              <p className="text-xs text-gray-500">구장</p>
              <p className="font-medium">{session.venueName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">상태</p>
              <Badge variant={statusBadgeVariant(session.status)}>
                {session.status === "RECORDING" && (
                  <span className="relative mr-1.5 flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                  </span>
                )}
                {SESSION_STATUS_LABELS[session.status]}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-gray-500">시작시간</p>
              <p className="font-medium">{formatDateTime(session.startTime)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">종료시간</p>
              <p className="font-medium">{formatDateTime(session.endTime)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">담당자</p>
              <p className="font-medium">{session.assignee}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">생성일</p>
              <p className="font-medium">{session.createdAt}</p>
            </div>
          </div>

          {/* Camera List */}
          <div>
            <p className="mb-2 text-sm font-semibold text-gray-700">
              카메라 ({session.cameras.length}대)
            </p>
            <div className="space-y-1.5">
              {session.cameras.map((cam) => (
                <div
                  key={cam.id}
                  className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${cameraStatusDot(cam.status)}`}
                    />
                    <span className="font-medium text-gray-900">
                      {cam.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {CAMERA_TYPE_LABELS[cam.type]}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{cam.resolution}</span>
                    <span>{cam.fps}fps</span>
                    <span>{cam.bitrate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recording Timeline */}
          <div>
            <p className="mb-2 text-sm font-semibold text-gray-700">
              촬영 타임라인
            </p>
            <div className="rounded-md border border-gray-200 bg-white p-3">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                <span>{formatTime(session.startTime)}</span>
                <span>{formatTime(session.endTime)}</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                {session.status === "RECORDING" && (
                  <div
                    className="h-full rounded-full bg-red-500 transition-all"
                    style={{ width: "45%" }}
                  />
                )}
                {session.status === "COMPLETED" && (
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: "100%" }} />
                )}
                {session.status === "ERROR" && (
                  <div className="h-full rounded-full bg-yellow-500" style={{ width: "60%" }} />
                )}
              </div>
            </div>
          </div>

          {/* Storage Usage */}
          <div>
            <p className="mb-2 text-sm font-semibold text-gray-700">
              스토리지 사용량
            </p>
            <div className="rounded-md border border-gray-200 bg-white p-3">
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-gray-600">
                  {session.storageUsedGB.toFixed(1)} GB / {session.storageTotalGB} GB
                </span>
                <span className="font-medium text-gray-900">{storagePercent}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className={`h-full rounded-full transition-all ${
                    storagePercent > 80 ? "bg-red-500" : storagePercent > 60 ? "bg-yellow-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${storagePercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Create Dialog ──────────────────────────────────────────────────

interface CreateDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

function CreateDialog({ open, onClose, onSaved }: CreateDialogProps) {
  const [venueOptions, setVenueOptions] = useState<{ id: number; name: string }[]>([]);
  const [venueId, setVenueId] = useState("");
  const [competitionName, setCompetitionName] = useState("");
  const [matchName, setMatchName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("14:00");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("16:00");
  const [cameraConfig, setCameraConfig] = useState<CameraType[]>(["AI", "PANO"]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getStudioVenueOptions().then(setVenueOptions);
  }, []);

  const toggleCamera = (type: CameraType) => {
    setCameraConfig((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSave = async () => {
    if (!venueId || !startDate || !endDate || !competitionName) return;
    setSaving(true);
    try {
      const req: SessionCreateRequest = {
        venueId: Number(venueId),
        competitionName,
        matchName,
        scheduledStartTime: `${startDate}T${startTime}:00`,
        scheduledEndTime: `${endDate}T${endTime}:00`,
        cameraConfig,
      };
      await createStudioSession(req);
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>세션 생성</DialogTitle>
          <DialogDescription>새 촬영 세션을 생성합니다.</DialogDescription>
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

          <div className="space-y-1.5">
            <Label>대회/경기 <span className="text-red-500">*</span></Label>
            <Input
              value={competitionName}
              onChange={(e) => setCompetitionName(e.target.value)}
              placeholder="대회 또는 리그명"
            />
          </div>

          <div className="space-y-1.5">
            <Label>경기명</Label>
            <Input
              value={matchName}
              onChange={(e) => setMatchName(e.target.value)}
              placeholder="예: A조 1경기"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>시작일시 <span className="text-red-500">*</span></Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (!endDate) setEndDate(e.target.value);
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label>&nbsp;</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>종료일시 <span className="text-red-500">*</span></Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>&nbsp;</Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>카메라 구성</Label>
            <div className="flex flex-wrap gap-2">
              {(["AI", "PANO", "SIDE_A", "CAM"] as CameraType[]).map(
                (type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleCamera(type)}
                    className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                      cameraConfig.includes(type)
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {CAMERA_TYPE_LABELS[type]}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !venueId || !startDate || !competitionName}
          >
            {saving ? "생성 중..." : "세션 생성"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── KPI Card ───────────────────────────────────────────────────────

function KPICard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────

export default function StudioPage() {
  const [sessions, setSessions] = useState<StudioSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [venueFilter, setVenueFilter] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Venue options
  const [venueOptions, setVenueOptions] = useState<{ id: number; name: string }[]>([]);

  // Dialogs
  const [detailSession, setDetailSession] = useState<StudioSession | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    getStudioVenueOptions().then(setVenueOptions);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const filters: SessionFilter = {
        status: statusFilter === "ALL" ? null : (statusFilter as SessionStatus),
        venueId: venueFilter === "ALL" ? null : Number(venueFilter),
        dateFrom: dateFrom || null,
        dateTo: dateTo || null,
      };

      // Try real API first, fall back to mock
      // TODO(Phase 4B): remove mock fallback once backend is stable
      const apiParams: Record<string, string> = {};
      if (filters.status) apiParams.status = filters.status;
      if (filters.venueId) apiParams.venueId = String(filters.venueId);
      if (dateFrom) apiParams.dateFrom = dateFrom;
      if (dateTo) apiParams.dateTo = dateTo;

      const apiResult = await adminApi.get<StudioSession[]>(
        "/admin/api/v1/studio/sessions",
        apiParams
      );
      if (apiResult) {
        setSessions(apiResult);
        return;
      }

      // Mock fallback
      const data = await getStudioSessions(filters);
      setSessions(data);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, venueFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const [kpis, setKpis] = useState<{ activeSessions: number; scheduledToday: number; recording: number; completed: number }>({
    activeSessions: 0,
    scheduledToday: 0,
    recording: 0,
    completed: 0,
  });

  useEffect(() => {
    const filters: SessionFilter = {
      status: statusFilter === "ALL" ? null : (statusFilter as SessionStatus),
      venueId: venueFilter === "ALL" ? null : Number(venueFilter),
      dateFrom: dateFrom || null,
      dateTo: dateTo || null,
    };
    getSessionKPIs(filters).then(setKpis);
  }, [statusFilter, venueFilter, dateFrom, dateTo]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">스튜디오 관리</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus size={16} className="mr-1.5" />
          세션 생성
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KPICard
          label="활성 세션 수"
          value={kpis.activeSessions}
          icon={<Video size={20} className="text-blue-600" />}
          color="bg-blue-50"
        />
        <KPICard
          label="오늘 촬영 예정"
          value={kpis.scheduledToday}
          icon={<Clock size={20} className="text-emerald-600" />}
          color="bg-emerald-50"
        />
        <KPICard
          label="진행중 촬영"
          value={kpis.recording}
          icon={<Clapperboard size={20} className="text-red-600" />}
          color="bg-red-50"
        />
        <KPICard
          label="완료된 촬영"
          value={kpis.completed}
          icon={<CheckCircle2 size={20} className="text-gray-600" />}
          color="bg-gray-100"
        />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 bg-white p-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">상태</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="STANDBY">대기</SelectItem>
              <SelectItem value="RECORDING">촬영중</SelectItem>
              <SelectItem value="COMPLETED">완료</SelectItem>
              <SelectItem value="ERROR">오류</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">구장</Label>
          <Select value={venueFilter} onValueChange={setVenueFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              {venueOptions.map((v) => (
                <SelectItem key={v.id} value={String(v.id)}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">시작일</Label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-[160px]"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">종료일</Label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-[160px]"
          />
        </div>
      </div>

      {/* Session Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
              <th className="px-4 py-3 text-center w-[60px]">ID</th>
              <th className="px-4 py-3">구장명</th>
              <th className="px-4 py-3">대회/경기</th>
              <th className="px-4 py-3 text-center">시작시간</th>
              <th className="px-4 py-3 text-center">종료시간</th>
              <th className="px-4 py-3 text-center w-[100px]">상태</th>
              <th className="px-4 py-3 text-center w-[80px]">카메라</th>
              <th className="px-4 py-3 text-center">담당자</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                  로딩 중...
                </td>
              </tr>
            ) : sessions.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              sessions.map((session, idx) => (
                <tr
                  key={session.id}
                  className={`border-b border-gray-100 transition-colors hover:bg-gray-50 cursor-pointer ${
                    idx % 2 === 1 ? "bg-gray-50/50" : ""
                  }`}
                  onClick={() => setDetailSession(session)}
                >
                  <td className="px-4 py-3 text-center text-gray-500">
                    {session.id}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {session.venueName}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {session.competitionName}
                    {session.matchName && (
                      <p className="text-xs text-gray-400">{session.matchName}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600 text-xs whitespace-nowrap">
                    {formatDateTime(session.startTime)}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600 text-xs whitespace-nowrap">
                    {formatDateTime(session.endTime)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={statusBadgeVariant(session.status)}>
                      {session.status === "RECORDING" && (
                        <span className="relative mr-1.5 flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                        </span>
                      )}
                      {SESSION_STATUS_LABELS[session.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    <div className="flex items-center justify-center gap-1">
                      <Camera size={14} className="text-gray-400" />
                      <span>{session.cameras.length}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {session.assignee}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Dialog */}
      <DetailDialog
        session={detailSession}
        onClose={() => setDetailSession(null)}
      />

      {/* Create Dialog */}
      <CreateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSaved={fetchData}
      />
    </div>
  );
}
