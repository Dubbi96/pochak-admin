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
import { Plus, Search, Download, Upload, Copy } from "lucide-react";
import type { Match, MatchFilter, MatchStatus, LinkStatus } from "@/types/match";
import type { PageResponse } from "@/types/common";
import {
  getMatches,
  createMatch,
  updateMatch,
  getCompetitionOptions,
} from "@/services/competition-api";
import { adminApi } from "@/lib/api-client";

// ── Label / Style Helpers ──────────────────────────────────────────────────────

const matchStatusLabels: Record<MatchStatus, string> = {
  SCHEDULED: "예정",
  LIVE: "진행(LIVE)",
  CANCELLED: "취소",
  FINISHED: "종료",
  CLOSED: "마감",
};

function MatchStatusBadge({ status }: { status: MatchStatus }) {
  switch (status) {
    case "SCHEDULED":
      return <Badge variant="info">예정</Badge>;
    case "LIVE":
      return (
        <Badge className="animate-pulse border-transparent bg-emerald-100 text-emerald-700">
          진행(LIVE)
        </Badge>
      );
    case "CANCELLED":
      return <Badge variant="destructive">취소</Badge>;
    case "FINISHED":
      return <Badge variant="secondary">종료</Badge>;
    case "CLOSED":
      return (
        <Badge className="border-transparent bg-gray-700 text-white">
          마감
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

// ── Match Modal ────────────────────────────────────────────────────────────────

interface CompetitionOption {
  id: number;
  name: string;
  sportCode: string;
}

interface MatchModalProps {
  open: boolean;
  onClose: () => void;
  match: Match | null;
  onSaved: () => void;
}

function MatchModal({ open, onClose, match, onSaved }: MatchModalProps) {
  const [competitionOptions, setCompetitionOptions] = useState<
    CompetitionOption[]
  >([]);
  const [competitionId, setCompetitionId] = useState("");
  const [name, setName] = useState("");
  const [venueName, setVenueName] = useState("");
  const [sportCode, setSportCode] = useState("SOCCER");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [homeTeamId, setHomeTeamId] = useState("");
  const [awayTeamId, setAwayTeamId] = useState("");
  const [hasPanorama, setHasPanorama] = useState(false);
  const [hasScoreboard, setHasScoreboard] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      getCompetitionOptions().then(setCompetitionOptions);
    }
  }, [open]);

  useEffect(() => {
    if (match) {
      setCompetitionId(String(match.competitionId));
      setName(match.name);
      setVenueName(match.venueName);
      setSportCode(match.sportCode);
      setStartTime(match.startTime.slice(0, 16));
      setEndTime(match.endTime.slice(0, 16));
      setHomeTeamId(String(match.homeTeam.teamId));
      setAwayTeamId(String(match.awayTeam.teamId));
      setHasPanorama(match.hasPanorama);
      setHasScoreboard(match.hasScoreboard);
      setIsActive(match.isActive);
    } else {
      setCompetitionId("");
      setName("");
      setVenueName("");
      setSportCode("SOCCER");
      setStartTime("");
      setEndTime("");
      setHomeTeamId("");
      setAwayTeamId("");
      setHasPanorama(false);
      setHasScoreboard(true);
      setIsActive(true);
    }
  }, [match, open]);

  const handleCompetitionChange = (val: string) => {
    setCompetitionId(val);
    const comp = competitionOptions.find((c) => String(c.id) === val);
    if (comp) {
      setSportCode(comp.sportCode);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !competitionId) return;

    setSaving(true);
    try {
      const payload = {
        id: match?.id ?? 0,
        competitionId: parseInt(competitionId, 10),
        name: name.trim(),
        venueName: venueName.trim(),
        sportCode,
        startTime,
        endTime,
        homeTeamId: parseInt(homeTeamId, 10) || 0,
        awayTeamId: parseInt(awayTeamId, 10) || 0,
        hasPanorama,
        hasScoreboard,
        isActive,
      };

      if (match) {
        await updateMatch(match.id, payload);
      } else {
        await createMatch(payload);
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
            {match ? "경기일정 수정" : "경기일정 등록"}
          </DialogTitle>
          <DialogDescription>
            {match
              ? "경기일정 정보를 수정합니다."
              : "새로운 경기일정을 등록합니다."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 대회/리그 선택 */}
          <div className="space-y-1.5">
            <Label>
              대회/리그 <span className="text-red-500">*</span>
            </Label>
            <Select value={competitionId} onValueChange={handleCompetitionChange}>
              <SelectTrigger>
                <SelectValue placeholder="대회/리그를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {competitionOptions.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 경기명 */}
          <div className="space-y-1.5">
            <Label>
              경기명 <span className="text-red-500">*</span>
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="경기명을 입력하세요"
            />
          </div>

          {/* 구장 */}
          <div className="space-y-1.5">
            <Label>구장</Label>
            <Input
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              placeholder="구장명을 입력하세요"
            />
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

          {/* 시작시간 / 종료시간 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>시작시간</Label>
              <Input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>종료시간</Label>
              <Input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {/* 홈팀 / 어웨이팀 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>홈팀 ID</Label>
              <Input
                value={homeTeamId}
                onChange={(e) => setHomeTeamId(e.target.value)}
                placeholder="홈팀 ID"
              />
            </div>
            <div className="space-y-1.5">
              <Label>어웨이팀 ID</Label>
              <Input
                value={awayTeamId}
                onChange={(e) => setAwayTeamId(e.target.value)}
                placeholder="어웨이팀 ID"
              />
            </div>
          </div>

          {/* 파노라마 */}
          <div className="space-y-1.5">
            <Label>파노라마</Label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setHasPanorama(!hasPanorama)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${hasPanorama ? "bg-emerald-500" : "bg-gray-200"}`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${hasPanorama ? "translate-x-5" : "translate-x-0"}`}
                />
              </button>
              <span className="text-sm text-gray-600">
                {hasPanorama ? "사용" : "미사용"}
              </span>
            </div>
          </div>

          {/* 스코어보드 */}
          <div className="space-y-1.5">
            <Label>스코어보드</Label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setHasScoreboard(!hasScoreboard)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${hasScoreboard ? "bg-emerald-500" : "bg-gray-200"}`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${hasScoreboard ? "translate-x-5" : "translate-x-0"}`}
                />
              </button>
              <span className="text-sm text-gray-600">
                {hasScoreboard ? "사용" : "미사용"}
              </span>
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !name.trim() || !competitionId}
          >
            {saving ? "저장 중..." : "저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Match Schedule Page ────────────────────────────────────────────────────────

export default function MatchSchedulePage() {
  const [data, setData] = useState<PageResponse<Match> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  // Filters
  const [dateMode, setDateMode] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sportFilter, setSportFilter] = useState("ALL");
  const [competitionFilter, setCompetitionFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [linkFilter, setLinkFilter] = useState("ALL");
  const [competitionKeyword, setCompetitionKeyword] = useState("");
  const [cardKeyword, setCardKeyword] = useState("");

  // Competition options for filter
  const [competitionOptions, setCompetitionOptions] = useState<
    { id: number; name: string; sportCode: string }[]
  >([]);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);

  useEffect(() => {
    getCompetitionOptions().then(setCompetitionOptions);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const filters: MatchFilter = {
        dateFrom: dateMode === "RANGE" && dateFrom ? dateFrom : undefined,
        dateTo: dateMode === "RANGE" && dateTo ? dateTo : undefined,
        sportCode: sportFilter === "ALL" ? null : sportFilter,
        competitionId:
          competitionFilter === "ALL"
            ? null
            : parseInt(competitionFilter, 10),
        status: statusFilter === "ALL" ? null : (statusFilter as MatchStatus),
        isActive:
          activeFilter === "ALL"
            ? null
            : activeFilter === "ACTIVE"
              ? true
              : false,
        linkStatus:
          linkFilter === "ALL" ? null : (linkFilter as LinkStatus),
        competitionKeyword: competitionKeyword || undefined,
        cardKeyword: cardKeyword || undefined,
      };

      // Try real API first, fall back to mock
      // TODO(Phase 4B): remove mock fallback once backend is stable
      const apiParams: Record<string, string> = { page: String(page) };
      if (filters.dateFrom) apiParams.dateFrom = filters.dateFrom;
      if (filters.dateTo) apiParams.dateTo = filters.dateTo;
      if (filters.sportCode) apiParams.sportCode = filters.sportCode;
      if (filters.competitionId) apiParams.competitionId = String(filters.competitionId);
      if (filters.status) apiParams.status = filters.status;
      if (filters.isActive !== null) apiParams.isActive = String(filters.isActive);
      if (filters.linkStatus) apiParams.linkStatus = filters.linkStatus;
      if (filters.competitionKeyword) apiParams.competitionKeyword = filters.competitionKeyword;
      if (filters.cardKeyword) apiParams.cardKeyword = filters.cardKeyword;

      const apiResult = await adminApi.get<PageResponse<Match>>(
        "/admin/api/v1/competitions/schedule",
        apiParams
      );
      if (apiResult) {
        setData(apiResult);
        return;
      }

      // Mock fallback
      const result = await getMatches(filters, page);
      setData(result);
    } finally {
      setLoading(false);
    }
  }, [
    dateMode,
    dateFrom,
    dateTo,
    sportFilter,
    competitionFilter,
    statusFilter,
    activeFilter,
    linkFilter,
    competitionKeyword,
    cardKeyword,
    page,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = () => {
    setPage(0);
    fetchData();
  };

  const handleRowClick = (match: Match) => {
    setEditingMatch(match);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingMatch(null);
    setModalOpen(true);
  };

  const formatDateTime = (iso: string) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">대회경기일정관리</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download size={16} className="mr-1.5" />
            Export
          </Button>
          <Button variant="outline">
            <Upload size={16} className="mr-1.5" />
            Import
          </Button>
          <Button variant="outline">
            <Copy size={16} className="mr-1.5" />
            복사
          </Button>
          <Button onClick={handleCreate}>
            <Plus size={16} className="mr-1.5" />
            등록
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex flex-wrap items-end gap-4">
          {/* 일정 조회 */}
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">일정 조회</Label>
            <Select value={dateMode} onValueChange={setDateMode}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체</SelectItem>
                <SelectItem value="RANGE">기간검색</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {dateMode === "RANGE" && (
            <>
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
            </>
          )}

          {/* 종목 */}
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">종목</Label>
            <Select value={sportFilter} onValueChange={setSportFilter}>
              <SelectTrigger className="w-[120px]">
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

          {/* 대회/리그 */}
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">대회/리그</Label>
            <Select
              value={competitionFilter}
              onValueChange={setCompetitionFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체</SelectItem>
                {competitionOptions.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 일정 상태 */}
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">일정 상태</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체</SelectItem>
                <SelectItem value="SCHEDULED">예정</SelectItem>
                <SelectItem value="LIVE">진행중</SelectItem>
                <SelectItem value="CANCELLED">경기취소</SelectItem>
                <SelectItem value="FINISHED">종료</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          {/* 게시 상태 */}
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">게시 상태</Label>
            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체</SelectItem>
                <SelectItem value="ACTIVE">활성화</SelectItem>
                <SelectItem value="INACTIVE">비활성화</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 연동 상태 */}
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">연동 상태</Label>
            <Select value={linkFilter} onValueChange={setLinkFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체</SelectItem>
                <SelectItem value="UNLINKED">비연동</SelectItem>
                <SelectItem value="LINKED">연동</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 대회/리그명 검색 */}
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">대회/리그명</Label>
            <Input
              value={competitionKeyword}
              onChange={(e) => setCompetitionKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="대회/리그명"
              className="w-[160px]"
            />
          </div>

          {/* 카드명 검색 */}
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">카드명</Label>
            <Input
              value={cardKeyword}
              onChange={(e) => setCardKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="카드명"
              className="w-[160px]"
            />
          </div>

          <Button variant="outline" size="icon" onClick={handleSearch}>
            <Search size={16} />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
              <th className="px-4 py-3 text-center w-[60px]">NO</th>
              <th className="px-4 py-3">종목</th>
              <th className="px-4 py-3">대회명</th>
              <th className="px-4 py-3">경기명</th>
              <th className="px-4 py-3">구장</th>
              <th className="px-4 py-3">시작시간</th>
              <th className="px-4 py-3">종료시간</th>
              <th className="px-4 py-3 text-center">상태</th>
              <th className="px-4 py-3 text-center">게시상태</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-12 text-center text-gray-400"
                >
                  로딩 중...
                </td>
              </tr>
            ) : !data || data.content.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-12 text-center text-gray-400"
                >
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              data.content.map((m, idx) => (
                <tr
                  key={m.id}
                  className={`border-b border-gray-100 transition-colors hover:bg-gray-50 cursor-pointer ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                  onClick={() => handleRowClick(m)}
                >
                  <td className="px-4 py-3 text-center text-gray-500">
                    {page * (data?.size ?? 20) + idx + 1}
                  </td>
                  <td className="px-4 py-3 text-gray-900">{m.sportName}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {m.competitionName}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {m.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{m.venueName}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDateTime(m.startTime)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDateTime(m.endTime)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <MatchStatusBadge status={m.status} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={m.isActive ? "success" : "secondary"}>
                      {m.isActive ? "활성화" : "비활성화"}
                    </Badge>
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
      <MatchModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        match={editingMatch}
        onSaved={fetchData}
      />
    </div>
  );
}
