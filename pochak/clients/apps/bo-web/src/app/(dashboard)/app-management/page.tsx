"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import { FileUpload } from "@/components/common/file-upload";
import { Plus, Smartphone, Megaphone, Pencil, Trash2 } from "lucide-react";
import type { PageResponse } from "@/types/common";
import {
  getAppVersions,
  createAppVersion,
  updateVersionStatus,
  getAdvertisements,
  createAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,
  type AppVersion,
  type AppVersionCreateRequest,
  type Advertisement,
  type AdCreateRequest,
  type Platform,
  type VersionStatus,
  type AdStatus,
  type AdPlacement,
  PLATFORM_LABELS,
  VERSION_STATUS_LABELS,
  AD_STATUS_LABELS,
  AD_PLACEMENT_LABELS,
} from "@/services/app-management-api";
import { adminApi } from "@/lib/api-client";

// ── Tab ────────────────────────────────────────────────────────────

type Tab = "versions" | "ads";

// ── Version Status Variant ─────────────────────────────────────────

function versionStatusVariant(
  status: VersionStatus
): "default" | "success" | "secondary" | "destructive" | "warning" {
  switch (status) {
    case "ACTIVE": return "success";
    case "DEPRECATED": return "secondary";
    case "FORCE_UPDATE": return "destructive";
  }
}

// ── Ad Status Variant ──────────────────────────────────────────────

function adStatusVariant(
  status: AdStatus
): "default" | "success" | "secondary" | "destructive" | "warning" {
  switch (status) {
    case "ACTIVE": return "success";
    case "INACTIVE": return "secondary";
    case "SCHEDULED": return "warning";
  }
}

// ── Version Modal ──────────────────────────────────────────────────

interface VersionModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

function VersionModal({ open, onClose, onSaved }: VersionModalProps) {
  const [platform, setPlatform] = useState<Platform>("IOS");
  const [version, setVersion] = useState("");
  const [buildNumber, setBuildNumber] = useState("");
  const [status, setStatus] = useState<VersionStatus>("ACTIVE");
  const [releaseNotes, setReleaseNotes] = useState("");
  const [minSupportedVersion, setMinSupportedVersion] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [releasedAt, setReleasedAt] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!version.trim() || !buildNumber) return;
    setSaving(true);
    try {
      const req: AppVersionCreateRequest = {
        platform,
        version: version.trim(),
        buildNumber: Number(buildNumber),
        status,
        releaseNotes: releaseNotes.trim(),
        minSupportedVersion: minSupportedVersion.trim(),
        downloadUrl: downloadUrl.trim(),
        releasedAt,
      };
      await createAppVersion(req);
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (open) {
      setPlatform("IOS");
      setVersion("");
      setBuildNumber("");
      setStatus("ACTIVE");
      setReleaseNotes("");
      setMinSupportedVersion("");
      setDownloadUrl("");
      setReleasedAt("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>앱 버전 등록</DialogTitle>
          <DialogDescription>새 앱 버전을 등록합니다.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>플랫폼 <span className="text-red-500">*</span></Label>
              <Select value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IOS">iOS</SelectItem>
                  <SelectItem value="ANDROID">Android</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>상태</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as VersionStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">정상</SelectItem>
                  <SelectItem value="DEPRECATED">구버전</SelectItem>
                  <SelectItem value="FORCE_UPDATE">강제업데이트</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>버전 <span className="text-red-500">*</span></Label>
              <Input
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="예: 2.2.0"
              />
            </div>
            <div className="space-y-1.5">
              <Label>빌드 번호</Label>
              <Input
                type="number"
                value={buildNumber}
                onChange={(e) => setBuildNumber(e.target.value)}
                placeholder="예: 220"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>최소 지원 버전</Label>
              <Input
                value={minSupportedVersion}
                onChange={(e) => setMinSupportedVersion(e.target.value)}
                placeholder="예: 1.8.0"
              />
            </div>
            <div className="space-y-1.5">
              <Label>출시일</Label>
              <Input
                type="date"
                value={releasedAt}
                onChange={(e) => setReleasedAt(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>다운로드 URL</Label>
            <Input
              value={downloadUrl}
              onChange={(e) => setDownloadUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-1.5">
            <Label>릴리스 노트</Label>
            <Textarea
              value={releaseNotes}
              onChange={(e) => setReleaseNotes(e.target.value)}
              placeholder="주요 변경사항을 입력하세요."
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button onClick={handleSave} disabled={saving || !version.trim()}>
            {saving ? "저장 중..." : "등록"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Ad Modal ───────────────────────────────────────────────────────

interface AdModalProps {
  open: boolean;
  onClose: () => void;
  ad: Advertisement | null;
  onSaved: () => void;
}

function AdModal({ open, onClose, ad, onSaved }: AdModalProps) {
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [placement, setPlacement] = useState<AdPlacement>("HOME_TOP");
  const [status, setStatus] = useState<AdStatus>("ACTIVE");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [adImageFile, setAdImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (ad) {
      setTitle(ad.title);
      setImageUrl(ad.imageUrl);
      setLinkUrl(ad.linkUrl);
      setPlacement(ad.placement);
      setStatus(ad.status);
      setStartDate(ad.startDate);
      setEndDate(ad.endDate);
    } else {
      setTitle("");
      setImageUrl("");
      setLinkUrl("");
      setPlacement("HOME_TOP");
      setStatus("ACTIVE");
      setStartDate("");
      setEndDate("");
    }
  }, [ad, open]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const req: AdCreateRequest = {
        title: title.trim(),
        imageUrl: imageUrl.trim(),
        linkUrl: linkUrl.trim(),
        placement,
        status,
        startDate,
        endDate,
      };
      if (ad) {
        await updateAdvertisement(ad.id, req);
      } else {
        await createAdvertisement(req);
      }
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
          <DialogTitle>{ad ? "광고 수정" : "광고 등록"}</DialogTitle>
          <DialogDescription>
            {ad ? "광고 정보를 수정합니다." : "새 광고를 등록합니다."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>제목 <span className="text-red-500">*</span></Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="광고 제목"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>노출 위치</Label>
              <Select value={placement} onValueChange={(v) => setPlacement(v as AdPlacement)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HOME_TOP">홈 상단</SelectItem>
                  <SelectItem value="HOME_MIDDLE">홈 중간</SelectItem>
                  <SelectItem value="CONTENT_LIST">콘텐츠 목록</SelectItem>
                  <SelectItem value="PLAYER_PAUSE">플레이어 정지</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>상태</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as AdStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">게시중</SelectItem>
                  <SelectItem value="INACTIVE">중지</SelectItem>
                  <SelectItem value="SCHEDULED">예약</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <FileUpload
            label="광고 이미지"
            currentUrl={imageUrl || undefined}
            onChange={(file, previewUrl) => {
              setAdImageFile(file);
              if (previewUrl) {
                setImageUrl(previewUrl);
              } else {
                setImageUrl("");
              }
            }}
            description="광고 이미지를 업로드하세요 (권장: 1080x1920px 또는 1200x628px)"
          />

          <div className="space-y-1.5">
            <Label>링크 URL</Label>
            <Input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https:// 또는 /path"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>시작일</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>종료일</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button onClick={handleSave} disabled={saving || !title.trim()}>
            {saving ? "저장 중..." : "저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ──────────────────────────────────────────────────────

export default function AppManagementPage() {
  const [activeTab, setActiveTab] = useState<Tab>("versions");

  // Versions state
  const [versions, setVersions] = useState<PageResponse<AppVersion> | null>(null);
  const [versionPlatformFilter, setVersionPlatformFilter] = useState("ALL");
  const [versionsLoading, setVersionsLoading] = useState(true);
  const [versionModalOpen, setVersionModalOpen] = useState(false);

  // Ads state
  const [ads, setAds] = useState<PageResponse<Advertisement> | null>(null);
  const [adPlacementFilter, setAdPlacementFilter] = useState("ALL");
  const [adStatusFilter, setAdStatusFilter] = useState("ALL");
  const [adsLoading, setAdsLoading] = useState(true);
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);

  const fetchVersions = useCallback(async () => {
    setVersionsLoading(true);
    try {
      // Try real API first, fall back to mock
      // TODO(Phase 4B): remove mock fallback once backend is stable
      const apiParams: Record<string, string> = {};
      if (versionPlatformFilter !== "ALL") apiParams.platform = versionPlatformFilter;

      const apiResult = await adminApi.get<PageResponse<AppVersion>>(
        "/admin/api/v1/app-management/versions",
        apiParams
      );
      if (apiResult) {
        setVersions(apiResult);
        return;
      }

      // Mock fallback
      const data = await getAppVersions(
        versionPlatformFilter === "ALL" ? null : (versionPlatformFilter as Platform)
      );
      setVersions(data);
    } finally {
      setVersionsLoading(false);
    }
  }, [versionPlatformFilter]);

  const fetchAds = useCallback(async () => {
    setAdsLoading(true);
    try {
      // Try real API first, fall back to mock
      // TODO(Phase 4B): remove mock fallback once backend is stable
      const apiParams: Record<string, string> = {};
      if (adPlacementFilter !== "ALL") apiParams.placement = adPlacementFilter;
      if (adStatusFilter !== "ALL") apiParams.status = adStatusFilter;

      const apiResult = await adminApi.get<PageResponse<Advertisement>>(
        "/admin/api/v1/app-management/ads",
        apiParams
      );
      if (apiResult) {
        setAds(apiResult);
        return;
      }

      // Mock fallback
      const data = await getAdvertisements(
        adPlacementFilter === "ALL" ? null : (adPlacementFilter as AdPlacement),
        adStatusFilter === "ALL" ? null : (adStatusFilter as AdStatus)
      );
      setAds(data);
    } finally {
      setAdsLoading(false);
    }
  }, [adPlacementFilter, adStatusFilter]);

  useEffect(() => {
    if (activeTab === "versions") fetchVersions();
  }, [activeTab, fetchVersions]);

  useEffect(() => {
    if (activeTab === "ads") fetchAds();
  }, [activeTab, fetchAds]);

  const handleStatusChange = async (id: number, status: VersionStatus) => {
    await updateVersionStatus(id, status);
    fetchVersions();
  };

  const handleDeleteAd = async (id: number) => {
    if (!confirm("광고를 삭제하시겠습니까?")) return;
    await deleteAdvertisement(id);
    fetchAds();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">앱 관리</h1>
        <Button
          onClick={() => {
            if (activeTab === "versions") setVersionModalOpen(true);
            else { setEditingAd(null); setAdModalOpen(true); }
          }}
        >
          <Plus size={16} className="mr-1.5" />
          {activeTab === "versions" ? "버전 등록" : "광고 등록"}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("versions")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "versions"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Smartphone size={16} />
          앱 버전
        </button>
        <button
          onClick={() => setActiveTab("ads")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "ads"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Megaphone size={16} />
          광고 관리
        </button>
      </div>

      {/* ── Versions Tab ── */}
      {activeTab === "versions" && (
        <div className="space-y-4">
          {/* Filter */}
          <div className="flex items-end gap-4 rounded-lg border border-gray-200 bg-white p-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">플랫폼</Label>
              <Select value={versionPlatformFilter} onValueChange={setVersionPlatformFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">전체</SelectItem>
                  <SelectItem value="IOS">iOS</SelectItem>
                  <SelectItem value="ANDROID">Android</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
                  <th className="px-4 py-3 text-center w-[80px]">플랫폼</th>
                  <th className="px-4 py-3 text-center w-[90px]">버전</th>
                  <th className="px-4 py-3 text-center w-[80px]">빌드번호</th>
                  <th className="px-4 py-3 text-center w-[110px]">최소지원</th>
                  <th className="px-4 py-3">릴리스 노트</th>
                  <th className="px-4 py-3 text-center w-[90px]">출시일</th>
                  <th className="px-4 py-3 text-center w-[120px]">상태</th>
                </tr>
              </thead>
              <tbody>
                {versionsLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-400">로딩 중...</td>
                  </tr>
                ) : !versions || versions.content.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-400">데이터가 없습니다.</td>
                  </tr>
                ) : (
                  versions.content.map((v, idx) => (
                    <tr
                      key={v.id}
                      className={`border-b border-gray-100 transition-colors ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                    >
                      <td className="px-4 py-3 text-center">
                        <Badge variant={v.platform === "IOS" ? "default" : "secondary"}>
                          {PLATFORM_LABELS[v.platform]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-medium text-gray-900">{v.version}</td>
                      <td className="px-4 py-3 text-center text-gray-500 text-xs">{v.buildNumber}</td>
                      <td className="px-4 py-3 text-center text-gray-500 text-xs font-mono">{v.minSupportedVersion}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs max-w-[240px] truncate">{v.releaseNotes}</td>
                      <td className="px-4 py-3 text-center text-gray-500 text-xs">{v.releasedAt}</td>
                      <td className="px-4 py-3 text-center">
                        <Select
                          value={v.status}
                          onValueChange={(s) => handleStatusChange(v.id, s as VersionStatus)}
                        >
                          <SelectTrigger className="h-7 w-[120px] text-xs">
                            <SelectValue>
                              <Badge variant={versionStatusVariant(v.status)}>
                                {VERSION_STATUS_LABELS[v.status]}
                              </Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ACTIVE">정상</SelectItem>
                            <SelectItem value="DEPRECATED">구버전</SelectItem>
                            <SelectItem value="FORCE_UPDATE">강제업데이트</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Ads Tab ── */}
      {activeTab === "ads" && (
        <div className="space-y-4">
          {/* Filter */}
          <div className="flex items-end gap-4 rounded-lg border border-gray-200 bg-white p-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">노출위치</Label>
              <Select value={adPlacementFilter} onValueChange={setAdPlacementFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">전체</SelectItem>
                  <SelectItem value="HOME_TOP">홈 상단</SelectItem>
                  <SelectItem value="HOME_MIDDLE">홈 중간</SelectItem>
                  <SelectItem value="CONTENT_LIST">콘텐츠 목록</SelectItem>
                  <SelectItem value="PLAYER_PAUSE">플레이어 정지</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">상태</Label>
              <Select value={adStatusFilter} onValueChange={setAdStatusFilter}>
                <SelectTrigger className="w-[110px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">전체</SelectItem>
                  <SelectItem value="ACTIVE">게시중</SelectItem>
                  <SelectItem value="INACTIVE">중지</SelectItem>
                  <SelectItem value="SCHEDULED">예약</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
                  <th className="px-4 py-3 text-center w-[60px]">NO</th>
                  <th className="px-4 py-3">제목</th>
                  <th className="px-4 py-3 text-center w-[120px]">노출위치</th>
                  <th className="px-4 py-3 text-center w-[150px]">노출기간</th>
                  <th className="px-4 py-3 text-center w-[90px]">노출수</th>
                  <th className="px-4 py-3 text-center w-[80px]">클릭수</th>
                  <th className="px-4 py-3 text-center w-[80px]">상태</th>
                  <th className="px-4 py-3 text-center w-[80px]">관리</th>
                </tr>
              </thead>
              <tbody>
                {adsLoading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-400">로딩 중...</td>
                  </tr>
                ) : !ads || ads.content.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-400">데이터가 없습니다.</td>
                  </tr>
                ) : (
                  ads.content.map((ad, idx) => (
                    <tr
                      key={ad.id}
                      className={`border-b border-gray-100 ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                    >
                      <td className="px-4 py-3 text-center text-gray-500">{idx + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{ad.title}</td>
                      <td className="px-4 py-3 text-center text-xs text-gray-600">
                        {AD_PLACEMENT_LABELS[ad.placement]}
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-gray-500 whitespace-nowrap">
                        {ad.startDate} ~ {ad.endDate}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600 text-xs">
                        {ad.impressions.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600 text-xs">
                        {ad.clicks.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={adStatusVariant(ad.status)}>
                          {AD_STATUS_LABELS[ad.status]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => { setEditingAd(ad); setAdModalOpen(true); }}
                            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteAd(ad.id)}
                            className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <VersionModal
        open={versionModalOpen}
        onClose={() => setVersionModalOpen(false)}
        onSaved={fetchVersions}
      />
      <AdModal
        open={adModalOpen}
        onClose={() => setAdModalOpen(false)}
        ad={editingAd}
        onSaved={fetchAds}
      />
    </div>
  );
}
