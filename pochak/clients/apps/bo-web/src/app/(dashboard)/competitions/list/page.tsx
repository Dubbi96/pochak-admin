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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FileUpload } from "@/components/common/file-upload";
import { Plus, Search, Download } from "lucide-react";
import type {
  Competition,
  CompetitionType,
  CompetitionStatus,
  CompetitionVisibility,
} from "@/types/competition";
import type { PageResponse } from "@/types/common";
import {
  createCompetition,
  updateCompetition,
} from "@/services/competition-api";
import { adminApi } from "@/lib/api-client";

// ── Label Helpers ──────────────────────────────────────────────────────────────

const competitionStatusLabels: Record<CompetitionStatus, string> = {
  UPCOMING: "예정",
  IN_PROGRESS: "진행중",
  FINISHED: "종료",
};

const competitionStatusVariants: Record<
  CompetitionStatus,
  "info" | "success" | "secondary"
> = {
  UPCOMING: "info",
  IN_PROGRESS: "success",
  FINISHED: "secondary",
};

const competitionTypeLabels: Record<CompetitionType, string> = {
  TOURNAMENT: "대회",
  LEAGUE: "리그",
};

// ── Competition Modal ──────────────────────────────────────────────────────────

interface CompetitionModalProps {
  open: boolean;
  onClose: () => void;
  competition: Competition | null;
  onSaved: () => void;
}

function CompetitionModal({
  open,
  onClose,
  competition,
  onSaved,
}: CompetitionModalProps) {
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [type, setType] = useState<CompetitionType>("TOURNAMENT");
  const [sportCode, setSportCode] = useState("SOCCER");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [isFree, setIsFree] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [eligibility, setEligibility] = useState("");
  const [rules, setRules] = useState("");
  const [visibility, setVisibility] = useState<CompetitionVisibility>("PUBLIC");
  const [emblemUrl, setEmblemUrl] = useState("");
  const [emblemFile, setEmblemFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (competition) {
      setName(competition.name);
      setShortName(competition.shortName);
      setType(competition.type);
      setSportCode(competition.sportCode);
      setStartDate(competition.startDate);
      setEndDate(competition.endDate);
      setDescription(competition.description);
      setPrice(competition.price);
      setIsFree(competition.isFree);
      setIsActive(competition.isActive);
      setVisibility(competition.visibility);
      setWebsiteUrl(competition.websiteUrl);
      setEligibility(competition.eligibility);
      setRules(competition.rules);
      setEmblemUrl("");
      setEmblemFile(null);
    } else {
      setName("");
      setShortName("");
      setType("TOURNAMENT");
      setSportCode("SOCCER");
      setStartDate("");
      setEndDate("");
      setDescription("");
      setPrice(0);
      setIsFree(false);
      setIsActive(true);
      setVisibility("PUBLIC");
      setWebsiteUrl("");
      setEligibility("");
      setRules("");
      setEmblemUrl("");
      setEmblemFile(null);
    }
  }, [competition, open]);

  const handleSave = async () => {
    if (!name.trim()) return;

    setSaving(true);
    try {
      const payload = {
        id: competition?.id ?? 0,
        name: name.trim(),
        shortName: shortName.trim() || undefined,
        type,
        sportCode,
        startDate,
        endDate,
        description: description.trim() || undefined,
        price: isFree ? 0 : price,
        isFree,
        isActive,
        visibility,
        websiteUrl: websiteUrl.trim() || undefined,
        eligibility: eligibility.trim() || undefined,
        rules: rules.trim() || undefined,
      };

      if (competition) {
        await updateCompetition(competition.id, payload);
      } else {
        await createCompetition(payload);
      }
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {competition ? "대회/리그 수정" : "대회/리그 등록"}
          </DialogTitle>
          <DialogDescription>
            {competition
              ? "대회/리그 정보를 수정합니다."
              : "새로운 대회/리그를 등록합니다."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 대회명 */}
          <div className="space-y-1.5">
            <Label>
              대회명 <span className="text-red-500">*</span>
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="대회/리그 이름을 입력하세요"
            />
          </div>

          {/* 약칭 */}
          <div className="space-y-1.5">
            <Label>약칭</Label>
            <Input
              value={shortName}
              onChange={(e) => setShortName(e.target.value)}
              placeholder="약칭을 입력하세요"
            />
          </div>

          {/* 대회 엠블럼 */}
          <FileUpload
            label="대회 엠블럼"
            currentUrl={emblemUrl || undefined}
            onChange={(file, previewUrl) => {
              setEmblemFile(file);
              setEmblemUrl(previewUrl ?? "");
            }}
            description="대회/리그 엠블럼 이미지를 업로드하세요 (권장: 300x300px)"
          />

          {/* 구분 */}
          <div className="space-y-1.5">
            <Label>구분</Label>
            <RadioGroup
              value={type}
              onValueChange={(v) => setType(v as CompetitionType)}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="TOURNAMENT" id="type-tournament" />
                <Label htmlFor="type-tournament" className="font-normal">
                  대회
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="LEAGUE" id="type-league" />
                <Label htmlFor="type-league" className="font-normal">
                  리그
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* 종목 */}
          <div className="space-y-1.5">
            <Label>종목</Label>
            <Select value={sportCode} onValueChange={setSportCode}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SOCCER">축구</SelectItem>
                <SelectItem value="BASEBALL">야구</SelectItem>
                <SelectItem value="VOLLEYBALL">배구</SelectItem>
                <SelectItem value="BASKETBALL">농구</SelectItem>
                <SelectItem value="BADMINTON">배드민턴</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 기간 */}
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

          {/* 설명 */}
          <div className="space-y-1.5">
            <Label>설명</Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="대회/리그 설명을 입력하세요"
              rows={3}
              className="flex w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
            />
          </div>

          {/* 금액 & 무료여부 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>금액(뽈)</Label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(parseInt(e.target.value, 10) || 0)}
                disabled={isFree}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label>무료여부</Label>
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setIsFree(!isFree)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${isFree ? "bg-emerald-500" : "bg-gray-200"}`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${isFree ? "translate-x-5" : "translate-x-0"}`}
                  />
                </button>
                <span className="text-sm text-gray-600">
                  {isFree ? "무료" : "유료"}
                </span>
              </div>
            </div>
          </div>

          {/* 게시상태 */}
          <div className="space-y-1.5">
            <Label>게시상태</Label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${isActive ? "bg-emerald-500" : "bg-gray-200"}`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${isActive ? "translate-x-5" : "translate-x-0"}`}
                />
              </button>
              <span className="text-sm text-gray-600">
                {isActive ? "활성화" : "비활성화"}
              </span>
            </div>
          </div>

          {/* 공개 범위 */}
          <div className="space-y-1.5">
            <Label>공개 범위</Label>
            <Select value={visibility} onValueChange={(v) => setVisibility(v as CompetitionVisibility)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PUBLIC">전체 공개 (PUBLIC)</SelectItem>
                <SelectItem value="PRIVATE">비공개 - 초대제 (PRIVATE)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 비공개 시 초대 URL */}
          {visibility === "PRIVATE" && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 space-y-2">
              <p className="text-xs font-medium text-amber-800">초대 URL (자동 생성)</p>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={competition?.inviteUrl || `https://pochak.tv/invite/comp-new-${Date.now().toString(36)}`}
                  className="text-xs bg-white"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(competition?.inviteUrl || "");
                  }}
                >
                  복사
                </Button>
              </div>
              <p className="text-xs text-amber-600">QR 코드: 저장 후 대회 상세에서 다운로드 가능</p>
            </div>
          )}

          {/* 웹사이트 URL */}
          <div className="space-y-1.5">
            <Label>웹사이트 URL</Label>
            <Input
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          {/* 참가자격 */}
          <div className="space-y-1.5">
            <Label>참가자격</Label>
            <textarea
              value={eligibility}
              onChange={(e) => setEligibility(e.target.value)}
              placeholder="참가자격을 입력하세요"
              rows={2}
              className="flex w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
            />
          </div>

          {/* 규칙 */}
          <div className="space-y-1.5">
            <Label>규칙</Label>
            <textarea
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              placeholder="규칙을 입력하세요"
              rows={2}
              className="flex w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? "저장 중..." : "저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Competitions List Page ──────────────────────────────────────────────────────

export default function CompetitionsListPage() {
  const [data, setData] = useState<PageResponse<Competition> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [competitionStatusFilter, setCompetitionStatusFilter] =
    useState<string>("ALL");
  const [sportFilter, setSportFilter] = useState<string>("ALL");
  const [searchType, setSearchType] = useState<string>("ALL");
  const [keyword, setKeyword] = useState("");

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCompetition, setEditingCompetition] =
    useState<Competition | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const apiParams: Record<string, string> = { page: String(page) };
      if (statusFilter !== "ALL") apiParams.isActive = statusFilter === "ACTIVE" ? "true" : "false";
      if (competitionStatusFilter !== "ALL") apiParams.status = competitionStatusFilter;
      if (sportFilter !== "ALL") apiParams.sportCode = sportFilter;
      if (searchType !== "ALL") apiParams.searchType = searchType;
      if (keyword) apiParams.keyword = keyword;

      const apiResult = await adminApi.get<PageResponse<Competition>>(
        "/admin/api/v1/competitions",
        apiParams
      );
      setData(apiResult);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, competitionStatusFilter, sportFilter, searchType, keyword, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = () => {
    setPage(0);
    fetchData();
  };

  const handleRowClick = (competition: Competition) => {
    setEditingCompetition(competition);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingCompetition(null);
    setModalOpen(true);
  };

  const formatDate = (iso: string) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const formatNumber = (n: number) => n.toLocaleString();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">대회/리그 관리</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download size={16} className="mr-1.5" />
            Export
          </Button>
          <Button onClick={handleCreate}>
            <Plus size={16} className="mr-1.5" />
            등록
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 bg-white p-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">게시 상태</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="ACTIVE">활성화</SelectItem>
              <SelectItem value="INACTIVE">비활성화</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">대회 상태</Label>
          <Select
            value={competitionStatusFilter}
            onValueChange={setCompetitionStatusFilter}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="IN_PROGRESS">진행중</SelectItem>
              <SelectItem value="UPCOMING">예정</SelectItem>
              <SelectItem value="FINISHED">종료</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">종목</Label>
          <Select value={sportFilter} onValueChange={setSportFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="SOCCER">축구</SelectItem>
              <SelectItem value="BASEBALL">야구</SelectItem>
              <SelectItem value="VOLLEYBALL">배구</SelectItem>
              <SelectItem value="BASKETBALL">농구</SelectItem>
              <SelectItem value="BADMINTON">배드민턴</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">직접 검색</Label>
          <div className="flex gap-2">
            <Select value={searchType} onValueChange={setSearchType}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체</SelectItem>
                <SelectItem value="TOURNAMENT">대회</SelectItem>
                <SelectItem value="LEAGUE">리그</SelectItem>
              </SelectContent>
            </Select>
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="검색어"
              className="w-[200px]"
            />
            <Button variant="outline" size="icon" onClick={handleSearch}>
              <Search size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
              <th className="px-4 py-3 text-center w-[60px]">NO</th>
              <th className="px-4 py-3">종목</th>
              <th className="px-4 py-3 text-center">구분</th>
              <th className="px-4 py-3 text-center">대회 상태</th>
              <th className="px-4 py-3 text-center">공개</th>
              <th className="px-4 py-3">리그/대회 명</th>
              <th className="px-4 py-3 text-right">금액(뽈)</th>
              <th className="px-4 py-3 text-center">영상(수)</th>
              <th className="px-4 py-3 text-center">클립(수)</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                  로딩 중...
                </td>
              </tr>
            ) : !data || data.content.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              data.content.map((comp, idx) => (
                <tr
                  key={comp.id}
                  className={`border-b border-gray-100 transition-colors hover:bg-gray-50 cursor-pointer ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                  onClick={() => handleRowClick(comp)}
                >
                  <td className="px-4 py-3 text-center text-gray-500">
                    {page * (data?.size ?? 20) + idx + 1}
                  </td>
                  <td className="px-4 py-3 text-gray-900">{comp.sportName}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge
                      variant={comp.type === "TOURNAMENT" ? "info" : "warning"}
                    >
                      {competitionTypeLabels[comp.type]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={competitionStatusVariants[comp.status]}>
                      {competitionStatusLabels[comp.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={comp.visibility === "PUBLIC" ? "success" : "secondary"}>
                      {comp.visibility === "PUBLIC" ? "공개" : "비공개"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {comp.name}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {comp.isFree ? (
                      <span className="text-emerald-600">무료</span>
                    ) : (
                      formatNumber(comp.price)
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {comp.videoCount}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {comp.clipCount}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            이전
          </Button>
          <span className="text-sm text-gray-600">
            {page + 1} / {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= data.totalPages - 1}
            onClick={() => setPage(page + 1)}
          >
            다음
          </Button>
        </div>
      )}

      {/* Modal */}
      <CompetitionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        competition={editingCompetition}
        onSaved={fetchData}
      />
    </div>
  );
}
