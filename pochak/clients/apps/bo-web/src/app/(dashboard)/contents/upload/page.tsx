"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload,
  FileVideo,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  Loader2,
  X,
} from "lucide-react";
import {
  createUploadTicket,
  confirmUpload,
  getProcessingJobs,
  getProcessingJobStatus,
  type VodProcessingJob,
  type CreateUploadRequest,
} from "@/services/streaming-api";

const stepLabels = ["업로드", "트랜스코딩", "썸네일", "완료"];

function getStepIndex(status: string): number {
  switch (status) {
    case "QUEUED":
      return 0;
    case "TRANSCODING":
      return 1;
    case "THUMBNAIL_GENERATING":
      return 2;
    case "COMPLETED":
      return 3;
    case "FAILED":
      return -1;
    default:
      return 0;
  }
}

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

export default function UploadPage() {
  const router = useRouter();

  // ── Upload form state ──────────────────────────────────────────────────
  const [filename, setFilename] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [matchIdStr, setMatchIdStr] = useState("");
  const [uploading, setUploading] = useState(false);

  // ── Active processing job ──────────────────────────────────────────────
  const [activeJob, setActiveJob] = useState<VodProcessingJob | null>(null);
  const [polling, setPolling] = useState(false);

  // ── Upload history ─────────────────────────────────────────────────────
  const [history, setHistory] = useState<VodProcessingJob[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const jobs = await getProcessingJobs();
      setHistory(jobs);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // ── Poll active job ────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeJob || activeJob.status === "COMPLETED" || activeJob.status === "FAILED") {
      return;
    }

    setPolling(true);
    const interval = setInterval(async () => {
      try {
        const updated = await getProcessingJobStatus(activeJob.id);
        setActiveJob(updated);
        if (updated.status === "COMPLETED" || updated.status === "FAILED") {
          clearInterval(interval);
          setPolling(false);
          fetchHistory();
        }
      } catch {
        clearInterval(interval);
        setPolling(false);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [activeJob, fetchHistory]);

  // ── Handle upload ──────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!filename) return;
    setUploading(true);
    try {
      const req: CreateUploadRequest = {
        filename,
        contentType: filename.endsWith(".mov") ? "video/quicktime" : "video/mp4",
        fileSizeBytes: 1024 * 1024 * 500, // simulated 500MB
        matchId: matchIdStr ? parseInt(matchIdStr, 10) : undefined,
        title: title || undefined,
        description: description || undefined,
        tags: tags ? tags.split(",").map((t) => t.trim()) : undefined,
      };

      const ticket = await createUploadTicket(req);
      // Simulate upload completion (in real impl, client uploads to presigned URL)
      const job = await confirmUpload(ticket.id);
      setActiveJob(job);

      // Clear form
      setFilename("");
      setTitle("");
      setDescription("");
      setTags("");
      setMatchIdStr("");
    } finally {
      setUploading(false);
    }
  };

  const currentStep = activeJob ? getStepIndex(activeJob.status) : -1;

  return (
    <div className="space-y-6">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">VOD 업로드</h1>
      </div>

      {/* ── Upload Form ─────────────────────────────────────────────────── */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-5">
        <h2 className="text-base font-semibold text-gray-800">파일 업로드</h2>

        {/* Drag-and-drop zone (simulated) */}
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 transition-colors hover:border-emerald-400 hover:bg-emerald-50/30">
          <FileVideo size={40} className="mb-3 text-gray-400" />
          <p className="text-sm text-gray-500 mb-3">
            영상 파일을 드래그하거나 파일명을 직접 입력하세요
          </p>
          <Input
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="예: match_highlight.mp4"
            className="max-w-sm"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-sm">제목</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VOD 제목 입력"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">경기 ID (선택)</Label>
            <Input
              value={matchIdStr}
              onChange={(e) => setMatchIdStr(e.target.value)}
              placeholder="연결할 경기 ID"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm">설명</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="VOD 설명 입력"
            rows={3}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm">태그 (쉼표로 구분)</Label>
          <Input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="예: 축구, 하이라이트, K리그"
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleUpload} disabled={!filename || uploading}>
            {uploading ? (
              <Loader2 size={14} className="mr-1.5 animate-spin" />
            ) : (
              <Upload size={14} className="mr-1.5" />
            )}
            {uploading ? "업로드 중..." : "업로드 시작"}
          </Button>
        </div>
      </div>

      {/* ── Processing Status ───────────────────────────────────────────── */}
      {activeJob && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-800">
              처리 진행 상황
            </h2>
            {activeJob.status === "COMPLETED" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push("/contents/vod")}
              >
                VOD 목록 보기
                <ArrowRight size={14} className="ml-1" />
              </Button>
            )}
            {(activeJob.status === "COMPLETED" || activeJob.status === "FAILED") && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setActiveJob(null)}
              >
                <X size={14} />
              </Button>
            )}
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-2">
            {stepLabels.map((label, idx) => {
              const isCurrent = idx === currentStep;
              const isDone = currentStep > idx;
              const isFailed = activeJob.status === "FAILED";

              return (
                <React.Fragment key={label}>
                  {idx > 0 && (
                    <div
                      className={`h-0.5 flex-1 ${isDone ? "bg-emerald-500" : "bg-gray-200"}`}
                    />
                  )}
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
                        isFailed && isCurrent
                          ? "bg-red-100 text-red-600"
                          : isDone
                            ? "bg-emerald-500 text-white"
                            : isCurrent
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle size={16} />
                      ) : isCurrent && polling ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <span className="mt-1 text-xs text-gray-500">{label}</span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>{activeJob.filename ?? "파일"}</span>
              <span>{activeJob.progressPercent}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  activeJob.status === "COMPLETED"
                    ? "bg-emerald-500"
                    : activeJob.status === "FAILED"
                      ? "bg-red-500"
                      : "bg-blue-500"
                }`}
                style={{ width: `${activeJob.progressPercent}%` }}
              />
            </div>
          </div>

          {activeJob.errorMessage && (
            <p className="text-sm text-red-600">
              오류: {activeJob.errorMessage}
            </p>
          )}
        </div>
      )}

      {/* ── Upload History ──────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">
            업로드 이력
          </h2>
          <Button variant="ghost" size="sm" onClick={fetchHistory}>
            <RefreshCw size={14} className="mr-1" />
            새로고침
          </Button>
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-4 py-3 text-center w-[50px]">ID</th>
                <th className="px-4 py-3">파일명</th>
                <th className="px-4 py-3 text-center">상태</th>
                <th className="px-4 py-3 w-[160px]">진행률</th>
                <th className="px-4 py-3 text-right">길이</th>
                <th className="px-4 py-3">생성일시</th>
                <th className="px-4 py-3">완료일시</th>
              </tr>
            </thead>
            <tbody>
              {loadingHistory ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    로딩 중...
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    업로드 이력이 없습니다.
                  </td>
                </tr>
              ) : (
                history.map((job, idx) => {
                  const conf = jobStatusConfig[job.status] ?? jobStatusConfig.QUEUED;
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
                        <Badge variant={conf.variant}>{conf.label}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
                            <div
                              className={`h-full rounded-full ${
                                job.status === "COMPLETED"
                                  ? "bg-emerald-500"
                                  : job.status === "FAILED"
                                    ? "bg-red-500"
                                    : "bg-blue-500"
                              }`}
                              style={{ width: `${job.progressPercent}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-[32px] text-right">
                            {job.progressPercent}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700 whitespace-nowrap">
                        {job.durationSeconds
                          ? `${Math.floor(job.durationSeconds / 60)}분`
                          : "-"}
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
    </div>
  );
}
