"use client";

import React, { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import {
  Radio,
  Plus,
  Upload,
  ArrowRightLeft,
  RefreshCw,
  Loader2,
  Square,
  Trash2,
} from "lucide-react";
import {
  getEndpointStatus,
  createIngestEndpoint,
  convertLiveToVod,
  getCompletedLiveSessions,
  type IngestEndpoint,
  type IngestStatus,
  type VodProcessingJob,
  type CompletedLiveSession,
} from "@/services/streaming-api";
import { adminApi } from "@/lib/api-client";

// ── Status badge configs ────────────────────────────────────────────────────

const endpointStatusConfig: Record<
  string,
  { label: string; variant: "success" | "destructive" | "secondary" | "warning" }
> = {
  CREATED: { label: "대기", variant: "secondary" },
  RECEIVING: { label: "수신중", variant: "success" },
  ERROR: { label: "오류", variant: "destructive" },
  STOPPED: { label: "중지", variant: "secondary" },
};

const healthConfig: Record<
  string,
  { label: string; variant: "success" | "destructive" | "secondary" | "warning" }
> = {
  GOOD: { label: "양호", variant: "success" },
  DEGRADED: { label: "불안정", variant: "warning" },
  POOR: { label: "불량", variant: "destructive" },
  OFFLINE: { label: "오프라인", variant: "secondary" },
};

const jobStatusConfig: Record<
  string,
  { label: string; variant: "success" | "destructive" | "secondary" | "warning" | "info" }
> = {
  QUEUED: { label: "대기", variant: "secondary" },
  TRANSCODING: { label: "트랜스코딩", variant: "info" },
  THUMBNAIL_GENERATING: { label: "썸네일 생성", variant: "info" },
  COMPLETED: { label: "완료", variant: "success" },
  FAILED: { label: "실패", variant: "destructive" },
};

export default function StreamingPage() {
  // ── Ingest state ────────────────────────────────────────────────────────
  const [endpoints, setEndpoints] = useState<IngestEndpoint[]>([]);
  const [statuses, setStatuses] = useState<Record<number, IngestStatus>>({});
  const [loadingEndpoints, setLoadingEndpoints] = useState(true);

  // ── Job state ───────────────────────────────────────────────────────────
  const [jobs, setJobs] = useState<VodProcessingJob[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // ── Dialogs ─────────────────────────────────────────────────────────────
  const [createEndpointOpen, setCreateEndpointOpen] = useState(false);
  const [liveToVodOpen, setLiveToVodOpen] = useState(false);

  // ── Stop/Delete confirmation ────────────────────────────────────────────
  const [stopConfirmOpen, setStopConfirmOpen] = useState(false);
  const [stopTargetId, setStopTargetId] = useState<number | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // ── Create Endpoint form ─────────────────────────────────────────────────
  const [newCameraLabel, setNewCameraLabel] = useState("AI");
  const [newResolution, setNewResolution] = useState("1080p");
  const [newFps, setNewFps] = useState("30");

  // ── Live to VOD form ──────────────────────────────────────────────────────
  const [completedSessions, setCompletedSessions] = useState<CompletedLiveSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [vodTitle, setVodTitle] = useState("");

  // ── Fetch endpoints ────────────────────────────────────────────────────
  const fetchEndpoints = useCallback(async () => {
    setLoadingEndpoints(true);
    try {
      const apiResult = await adminApi.get<IngestEndpoint[]>(
        "/admin/api/v1/streaming/endpoints"
      );
      if (apiResult) {
        setEndpoints(apiResult);
        const statusMap: Record<number, IngestStatus> = {};
        await Promise.all(
          apiResult.map(async (ep) => {
            const st = await getEndpointStatus(ep.id);
            statusMap[ep.id] = st;
          })
        );
        setStatuses(statusMap);
      }
    } catch {
      /* API error - data remains in initial empty state */
    } finally {
      setLoadingEndpoints(false);
    }
  }, []);

  const fetchJobs = useCallback(async () => {
    setLoadingJobs(true);
    try {
      const apiResult = await adminApi.get<VodProcessingJob[]>(
        "/admin/api/v1/streaming/jobs"
      );
      if (apiResult) {
        setJobs(apiResult);
      }
    } catch {
      /* API error - data remains in initial empty state */
    } finally {
      setLoadingJobs(false);
    }
  }, []);

  useEffect(() => {
    fetchEndpoints();
    fetchJobs();
  }, [fetchEndpoints, fetchJobs]);

  // ── Handlers ───────────────────────────────────────────────────────────

  const handleCreateEndpoint = async () => {
    await createIngestEndpoint({
      venueId: 1,
      cameraLabel: newCameraLabel,
      resolution: newResolution,
      fps: parseInt(newFps, 10),
    });
    setCreateEndpointOpen(false);
    setNewCameraLabel("AI");
    setNewResolution("1080p");
    setNewFps("30");
    fetchEndpoints();
  };

  const handleLiveToVod = async () => {
    if (!selectedSessionId) return;
    await convertLiveToVod({
      transcodeSessionId: parseInt(selectedSessionId, 10),
      title: vodTitle || undefined,
    });
    setLiveToVodOpen(false);
    setSelectedSessionId("");
    setVodTitle("");
    fetchJobs();
  };

  const openLiveToVodDialog = async () => {
    const sessions = await getCompletedLiveSessions();
    setCompletedSessions(sessions);
    setLiveToVodOpen(true);
  };

  const handleStopEndpoint = async () => {
    if (stopTargetId === null) return;
    setActionLoading(true);
    try {
      // Mock: update endpoint status to STOPPED
      setEndpoints((prev) =>
        prev.map((ep) =>
          ep.id === stopTargetId ? { ...ep, status: "STOPPED" as const } : ep
        )
      );
      setStopConfirmOpen(false);
      setStopTargetId(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteEndpoint = async () => {
    if (deleteTargetId === null) return;
    setActionLoading(true);
    try {
      // Mock: remove endpoint from list
      setEndpoints((prev) => prev.filter((ep) => ep.id !== deleteTargetId));
      setDeleteConfirmOpen(false);
      setDeleteTargetId(null);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">
          스트리밍 관리
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchEndpoints();
              fetchJobs();
            }}
          >
            <RefreshCw size={14} className="mr-1.5" />
            새로고침
          </Button>
          <Button size="sm" onClick={() => setCreateEndpointOpen(true)}>
            <Plus size={14} className="mr-1.5" />
            RTMP 엔드포인트 생성
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={openLiveToVodDialog}
          >
            <ArrowRightLeft size={14} className="mr-1.5" />
            라이브→VOD 변환
          </Button>
        </div>
      </div>

      {/* ── Live Ingest Status ──────────────────────────────────────────── */}
      <div className="space-y-3">
        <h2 className="flex items-center gap-2 text-base font-semibold text-gray-800">
          <Radio size={16} className="text-emerald-500" />
          라이브 인제스트 현황
        </h2>
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-4 py-3 text-center w-[50px]">ID</th>
                <th className="px-4 py-3">구장</th>
                <th className="px-4 py-3">카메라</th>
                <th className="px-4 py-3">Stream Key</th>
                <th className="px-4 py-3 text-center">상태</th>
                <th className="px-4 py-3 text-right">비트레이트</th>
                <th className="px-4 py-3 text-center">FPS</th>
                <th className="px-4 py-3 text-center">해상도</th>
                <th className="px-4 py-3 text-center">건강</th>
                <th className="px-4 py-3">생성일시</th>
                <th className="px-4 py-3 text-center w-[120px]">액션</th>
              </tr>
            </thead>
            <tbody>
              {loadingEndpoints ? (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center text-gray-400">
                    로딩 중...
                  </td>
                </tr>
              ) : endpoints.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center text-gray-400">
                    활성 인제스트 엔드포인트가 없습니다.
                  </td>
                </tr>
              ) : (
                endpoints.map((ep, idx) => {
                  const st = statuses[ep.id];
                  const statusConf = endpointStatusConfig[ep.status] ?? endpointStatusConfig.CREATED;
                  const healthConf = st
                    ? healthConfig[st.health] ?? healthConfig.OFFLINE
                    : healthConfig.OFFLINE;

                  return (
                    <tr
                      key={ep.id}
                      className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                    >
                      <td className="px-4 py-3 text-center text-gray-500">
                        {ep.id}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {ep.venueName}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{ep.cameraLabel}</td>
                      <td className="px-4 py-3">
                        <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                          {ep.streamKey}
                        </code>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={statusConf.variant}>
                          {ep.status === "RECEIVING" && (
                            <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
                          )}
                          {statusConf.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        {st?.currentBitrate ? `${st.currentBitrate} kbps` : "-"}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-700">
                        {st?.currentFps || "-"}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-700">
                        {st?.currentResolution || "-"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={healthConf.variant}>
                          {healthConf.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {format(new Date(ep.createdAt), "yyyy.MM.dd HH:mm")}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {ep.status === "RECEIVING" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-yellow-700 border-yellow-300 hover:bg-yellow-50"
                              onClick={() => {
                                setStopTargetId(ep.id);
                                setStopConfirmOpen(true);
                              }}
                            >
                              <Square size={12} className="mr-1" />
                              중지
                            </Button>
                          )}
                          {ep.status === "STOPPED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-red-700 border-red-300 hover:bg-red-50"
                              onClick={() => {
                                setDeleteTargetId(ep.id);
                                setDeleteConfirmOpen(true);
                              }}
                            >
                              <Trash2 size={12} className="mr-1" />
                              삭제
                            </Button>
                          )}
                          {ep.status !== "RECEIVING" && ep.status !== "STOPPED" && (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── VOD Processing Queue ────────────────────────────────────────── */}
      <div className="space-y-3">
        <h2 className="flex items-center gap-2 text-base font-semibold text-gray-800">
          <Upload size={16} style={{ color: "var(--c-primary)" }} />
          VOD 처리 큐
        </h2>
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-4 py-3 text-center w-[50px]">ID</th>
                <th className="px-4 py-3">파일명</th>
                <th className="px-4 py-3 text-center">상태</th>
                <th className="px-4 py-3 w-[200px]">진행률</th>
                <th className="px-4 py-3 text-right">길이</th>
                <th className="px-4 py-3">오류</th>
                <th className="px-4 py-3">생성일시</th>
                <th className="px-4 py-3">완료일시</th>
              </tr>
            </thead>
            <tbody>
              {loadingJobs ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                    로딩 중...
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                    처리 중인 작업이 없습니다.
                  </td>
                </tr>
              ) : (
                jobs.map((job, idx) => {
                  const conf = jobStatusConfig[job.status] ?? jobStatusConfig.QUEUED;
                  const isActive =
                    job.status === "TRANSCODING" ||
                    job.status === "THUMBNAIL_GENERATING";

                  return (
                    <tr
                      key={job.id}
                      className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                    >
                      <td className="px-4 py-3 text-center text-gray-500">
                        {job.id}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {job.filename}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={conf.variant}>
                          {isActive && (
                            <Loader2 size={12} className="mr-1 animate-spin" />
                          )}
                          {conf.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                            <div
                              className={`h-full rounded-full transition-all ${
                                job.status === "COMPLETED"
                                  ? "bg-emerald-500"
                                  : job.status === "FAILED"
                                    ? "bg-red-500"
                                    : ""
                              }`}
                              style={{
                                width: `${job.progressPercent}%`,
                                ...(job.status !== "COMPLETED" && job.status !== "FAILED" ? { backgroundColor: "var(--c-primary)" } : {}),
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-[36px] text-right">
                            {job.progressPercent}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700 whitespace-nowrap">
                        {job.durationSeconds
                          ? `${Math.floor(job.durationSeconds / 60)}분`
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-red-600 text-xs max-w-[200px] truncate">
                        {job.errorMessage || (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {format(new Date(job.createdAt), "yyyy.MM.dd HH:mm")}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {job.completedAt
                          ? format(new Date(job.completedAt), "yyyy.MM.dd HH:mm")
                          : "-"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Create Endpoint Dialog ──────────────────────────────────────── */}
      <Dialog open={createEndpointOpen} onOpenChange={setCreateEndpointOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>RTMP 엔드포인트 생성</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm">카메라 라벨</Label>
              <Select value={newCameraLabel} onValueChange={setNewCameraLabel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AI">AI</SelectItem>
                  <SelectItem value="PANO">PANO</SelectItem>
                  <SelectItem value="SIDE_A">SIDE_A</SelectItem>
                  <SelectItem value="SIDE_B">SIDE_B</SelectItem>
                  <SelectItem value="CAM">CAM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">해상도</Label>
              <Select value={newResolution} onValueChange={setNewResolution}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1080p">1080p</SelectItem>
                  <SelectItem value="4K">4K</SelectItem>
                  <SelectItem value="720p">720p</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">FPS</Label>
              <Select value={newFps} onValueChange={setNewFps}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30fps</SelectItem>
                  <SelectItem value="60">60fps</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateEndpointOpen(false)}>
              취소
            </Button>
            <Button onClick={handleCreateEndpoint}>생성</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Live to VOD Dialog ──────────────────────────────────────────── */}
      <Dialog open={liveToVodOpen} onOpenChange={setLiveToVodOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>라이브 → VOD 변환</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm">완료된 라이브 세션 선택</Label>
              <Select
                value={selectedSessionId}
                onValueChange={setSelectedSessionId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="세션을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {completedSessions.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.matchName} - {s.cameraLabel} ({s.venueName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">VOD 제목 (선택)</Label>
              <Input
                value={vodTitle}
                onChange={(e) => setVodTitle(e.target.value)}
                placeholder="미입력시 경기명으로 자동 설정"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLiveToVodOpen(false)}>
              취소
            </Button>
            <Button onClick={handleLiveToVod} disabled={!selectedSessionId}>
              변환 시작
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Stop Confirmation ─────────────────────────────────────────── */}
      <ConfirmDialog
        open={stopConfirmOpen}
        onOpenChange={setStopConfirmOpen}
        title="인제스트 중지"
        message="해당 엔드포인트의 스트림 수신을 중지하시겠습니까? 진행 중인 라이브 방송이 중단됩니다."
        confirmLabel="중지"
        variant="destructive"
        isLoading={actionLoading}
        onConfirm={handleStopEndpoint}
        onCancel={() => setStopTargetId(null)}
      />

      {/* ── Delete Confirmation ────────────────────────────────────────── */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="엔드포인트 삭제"
        message="해당 엔드포인트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmLabel="삭제"
        variant="destructive"
        isLoading={actionLoading}
        onConfirm={handleDeleteEndpoint}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}
