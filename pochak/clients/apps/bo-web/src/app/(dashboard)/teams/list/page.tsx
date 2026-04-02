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
import { FormModal } from "@/components/form/form-modal";
import { FormField } from "@/components/form/form-field";
import { ExportButton } from "@/components/common/export-button";
import { FileUpload } from "@/components/common/file-upload";
import { Search, Plus, Pencil, Eye, Users, Trophy, Swords, UserCog, Shield } from "lucide-react";
import type { PageResponse } from "@/types/common";
import {
  getTeams,
  createTeam,
  updateTeam,
  getOrganizationOptions,
  getTeamMembers,
  changeMembershipRole,
  type Team,
  type TeamFilter,
  type TeamFormData,
  type TeamMember,
  type MembershipRole,
  type OperationStatus,
  type OperationStatusFilter,
  OPERATION_STATUS_LABELS,
  MEMBERSHIP_ROLE_LABELS,
  SPORT_OPTIONS,
  DISTRICT_OPTIONS,
} from "@/services/organization-api";
import { adminApi } from "@/lib/api-client";

const STATUS_BADGE_VARIANT: Record<string, "success" | "warning" | "destructive"> = {
  ACTIVE: "success",
  SUSPENDED: "warning",
  DISSOLVED: "destructive",
};

const ROLE_BADGE_VARIANT: Record<string, "default" | "secondary" | "info" | "warning" | "success"> = {
  ADMIN: "default",
  MANAGER: "info",
  COACH: "warning",
  PLAYER: "success",
  GUARDIAN: "secondary",
  MEMBER: "secondary",
};

const EXPORT_COLUMNS = [
  { header: "NO", accessor: "id" },
  { header: "팀명", accessor: "name" },
  { header: "종목", accessor: "sportName" },
  { header: "시/군/구", accessor: "district" },
  { header: "회원수", accessor: "memberCount" },
  { header: "운영상태", accessor: "status" },
  { header: "소속 조직", accessor: "organizationName" },
  { header: "생성일", accessor: "createdAt" },
];

const INITIAL_FORM: TeamFormData = {
  name: "",
  sportName: "축구",
  district: "",
  organizationId: null,
  status: "ACTIVE",
  logoUrl: "",
};

export default function TeamListPage() {
  const [data, setData] = useState<PageResponse<Team> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  // Filters
  const [orgFilter, setOrgFilter] = useState("ALL");
  const [sportFilter, setSportFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<OperationStatusFilter>("ALL");
  const [searchKeyword, setSearchKeyword] = useState("");

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [form, setForm] = useState<TeamFormData>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Detail dialog
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTeam, setDetailTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  // Quick assign admin dialog
  const [quickAssignOpen, setQuickAssignOpen] = useState(false);
  const [quickAssignTeamId, setQuickAssignTeamId] = useState<string>("NONE");
  const [quickAssignRole, setQuickAssignRole] = useState<MembershipRole>("ADMIN");
  const [quickAssignSearch, setQuickAssignSearch] = useState("");

  const [orgOptions, setOrgOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    getOrganizationOptions().then(setOrgOptions);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const filters: TeamFilter = {
        organizationId: orgFilter,
        sportName: sportFilter,
        status: statusFilter,
        searchKeyword,
      };

      // Try real API first, fall back to mock
      // TODO(Phase 4B): remove mock fallback once backend is stable
      const apiParams: Record<string, string> = { page: String(page) };
      if (orgFilter !== "ALL") apiParams.organizationId = orgFilter;
      if (sportFilter !== "ALL") apiParams.sportName = sportFilter;
      if (statusFilter !== "ALL") apiParams.status = statusFilter;
      if (searchKeyword) apiParams.searchKeyword = searchKeyword;

      const apiResult = await adminApi.get<PageResponse<Team>>(
        "/admin/api/v1/teams/list",
        apiParams
      );
      if (apiResult) {
        setData(apiResult);
        return;
      }

      // Mock fallback
      const result = await getTeams(filters, page);
      setData(result);
    } finally {
      setLoading(false);
    }
  }, [orgFilter, sportFilter, statusFilter, searchKeyword, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = () => {
    setPage(0);
    fetchData();
  };

  const handleReset = () => {
    setOrgFilter("ALL");
    setSportFilter("ALL");
    setStatusFilter("ALL");
    setSearchKeyword("");
  };

  const openCreate = () => {
    setEditingTeam(null);
    setForm(INITIAL_FORM);
    setLogoFile(null);
    setModalOpen(true);
  };

  const openEdit = (team: Team) => {
    setEditingTeam(team);
    setForm({
      name: team.name,
      sportName: team.sportName,
      district: team.district,
      organizationId: team.organizationId,
      status: team.status,
      logoUrl: team.logoUrl,
    });
    setLogoFile(null);
    setModalOpen(true);
  };

  const openDetail = async (team: Team) => {
    setDetailTeam(team);
    setDetailOpen(true);
    setMembersLoading(true);
    try {
      const members = await getTeamMembers(team.id);
      setTeamMembers(members);
    } finally {
      setMembersLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (editingTeam) {
        await updateTeam(editingTeam.id, form);
      } else {
        await createTeam(form);
      }
      setModalOpen(false);
      fetchData();
    } finally {
      setSaving(false);
    }
  };

  const handleMemberRoleChange = async (membershipId: number, newRole: MembershipRole) => {
    await changeMembershipRole(membershipId, newRole);
    if (detailTeam) {
      const members = await getTeamMembers(detailTeam.id);
      setTeamMembers(members);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">팀 관리</h1>
          <p className="mt-1 text-sm text-gray-500">팀 목록을 조회하고 관리합니다.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setQuickAssignOpen(true)}>
            <Shield className="mr-1.5 h-4 w-4" />
            관리자 부여
          </Button>
          <ExportButton
            data={(data?.content ?? []) as unknown as Record<string, unknown>[]}
            columns={EXPORT_COLUMNS}
            filename="teams"
            label="Export"
          />
          <Button onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" />
            등록
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 bg-white p-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">소속 조직</Label>
          <Select value={orgFilter} onValueChange={setOrgFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              {orgOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">종목</Label>
          <Select value={sportFilter} onValueChange={setSportFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SPORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">운영 상태</Label>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as OperationStatusFilter)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="ACTIVE">운영중</SelectItem>
              <SelectItem value="SUSPENDED">운영중단</SelectItem>
              <SelectItem value="DISSOLVED">해체</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">직접 검색</Label>
          <Input
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="팀명 검색"
            className="w-[180px]"
          />
        </div>

        <div className="flex items-end gap-2">
          <Button onClick={handleSearch}>
            <Search size={16} className="mr-1.5" />
            검색
          </Button>
          <Button variant="outline" onClick={handleReset}>
            초기화
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
              <th className="px-4 py-3 text-center w-[60px]">NO</th>
              <th className="px-4 py-3">팀명</th>
              <th className="px-4 py-3">종목</th>
              <th className="px-4 py-3">시/군/구</th>
              <th className="px-4 py-3 text-center">회원수</th>
              <th className="px-4 py-3 text-center">운영상태</th>
              <th className="px-4 py-3">소속 조직</th>
              <th className="px-4 py-3 text-center">생성일</th>
              <th className="px-4 py-3 text-center w-[120px]">관리</th>
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
              data.content.map((team, idx) => (
                <tr
                  key={team.id}
                  className={`border-b border-gray-100 transition-colors hover:bg-gray-50 cursor-pointer ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                  onClick={() => openDetail(team)}
                >
                  <td className="px-4 py-3 text-center text-gray-500">
                    {page * (data?.size ?? 20) + idx + 1}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{team.name}</td>
                  <td className="px-4 py-3 text-gray-600">{team.sportName}</td>
                  <td className="px-4 py-3 text-gray-600">{team.district}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{team.memberCount}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={STATUS_BADGE_VARIANT[team.status]}>
                      {OPERATION_STATUS_LABELS[team.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {team.organizationName ?? <span className="text-gray-400">독립팀</span>}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500">{team.createdAt}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); openDetail(team); }} title="상세">
                        <Eye size={14} />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); openEdit(team); }} title="수정">
                        <Pencil size={14} />
                      </Button>
                    </div>
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
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
            이전
          </Button>
          <span className="text-sm text-gray-600">
            {page + 1} / {data.totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= data.totalPages - 1} onClick={() => setPage(page + 1)}>
            다음
          </Button>
        </div>
      )}

      {/* Team Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>팀 상세 정보</DialogTitle>
          </DialogHeader>
          {detailTeam && (
            <div className="space-y-5">
              {/* Team Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">팀명</p>
                  <p className="text-sm font-medium text-gray-900">{detailTeam.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">종목</p>
                  <p className="text-sm text-gray-700">{detailTeam.sportName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">소속 조직</p>
                  <p className="text-sm text-gray-700">{detailTeam.organizationName ?? "독립팀"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">운영상태</p>
                  <Badge variant={STATUS_BADGE_VARIANT[detailTeam.status]}>
                    {OPERATION_STATUS_LABELS[detailTeam.status]}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">시/군/구</p>
                  <p className="text-sm text-gray-700">{detailTeam.district}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">생성일</p>
                  <p className="text-sm text-gray-700">{detailTeam.createdAt}</p>
                </div>
                {detailTeam.captainName && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">주장</p>
                    <p className="text-sm text-gray-700">{detailTeam.captainName}</p>
                  </div>
                )}
              </div>

              {detailTeam.description && (
                <p className="text-sm text-gray-600">{detailTeam.description}</p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                  <Users size={16} style={{ color: "var(--c-primary)" }} />
                  <div>
                    <p className="text-xs text-gray-500">회원수</p>
                    <p className="text-sm font-semibold text-gray-900">{detailTeam.memberCount}명</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                  <Swords size={16} className="text-orange-500" />
                  <div>
                    <p className="text-xs text-gray-500">경기수</p>
                    <p className="text-sm font-semibold text-gray-900">{detailTeam.matchCount}경기</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                  <Trophy size={16} className="text-yellow-500" />
                  <div>
                    <p className="text-xs text-gray-500">승률</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {detailTeam.matchCount > 0
                        ? `${Math.round((detailTeam.winCount / detailTeam.matchCount) * 100)}%`
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Team Members */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-900">팀원 목록</h3>
                {membersLoading ? (
                  <p className="py-4 text-center text-sm text-gray-400">로딩 중...</p>
                ) : teamMembers.length === 0 ? (
                  <p className="py-4 text-center text-sm text-gray-400">등록된 팀원이 없습니다.</p>
                ) : (
                  <div className="overflow-hidden rounded-md border border-gray-200">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-gray-50 text-xs text-gray-500">
                          <th className="px-3 py-2 text-left">이름</th>
                          <th className="px-3 py-2 text-center">역할</th>
                          <th className="px-3 py-2 text-center">가입일</th>
                          <th className="px-3 py-2 text-center">관리</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teamMembers.map((member) => (
                          <tr key={member.id} className="border-b border-gray-100">
                            <td className="px-3 py-2 font-medium text-gray-900">{member.name}</td>
                            <td className="px-3 py-2 text-center">
                              <Badge variant={ROLE_BADGE_VARIANT[member.role] ?? "secondary"}>
                                {MEMBERSHIP_ROLE_LABELS[member.role]}
                              </Badge>
                            </td>
                            <td className="px-3 py-2 text-center text-gray-500">{member.joinedAt}</td>
                            <td className="px-3 py-2 text-center">
                              <Select
                                onValueChange={(newRole) => handleMemberRoleChange(member.id, newRole as MembershipRole)}
                                defaultValue={member.role}
                              >
                                <SelectTrigger className="h-7 w-24 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="ADMIN">관리자</SelectItem>
                                  <SelectItem value="MANAGER">매니저</SelectItem>
                                  <SelectItem value="COACH">코치</SelectItem>
                                  <SelectItem value="PLAYER">선수</SelectItem>
                                  <SelectItem value="GUARDIAN">보호자</SelectItem>
                                  <SelectItem value="MEMBER">멤버</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setDetailOpen(false)}>
                  닫기
                </Button>
                <Button onClick={() => { setDetailOpen(false); openEdit(detailTeam); }}>
                  <Pencil size={14} className="mr-1.5" />
                  수정
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Quick Assign Admin Dialog */}
      <Dialog open={quickAssignOpen} onOpenChange={setQuickAssignOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>관리자 일괄 부여</DialogTitle>
            <DialogDescription>
              사용자를 검색하고 팀에 관리자/매니저 역할을 부여합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">사용자 검색</label>
              <Input
                value={quickAssignSearch}
                onChange={(e) => setQuickAssignSearch(e.target.value)}
                placeholder="이름 또는 이메일 검색"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">대상 팀</label>
              <Select value={quickAssignTeamId} onValueChange={setQuickAssignTeamId}>
                <SelectTrigger>
                  <SelectValue placeholder="팀 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">팀 선택</SelectItem>
                  {(data?.content ?? []).map((team) => (
                    <SelectItem key={team.id} value={String(team.id)}>{team.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">부여할 역할</label>
              <Select value={quickAssignRole} onValueChange={(v) => setQuickAssignRole(v as MembershipRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">관리자</SelectItem>
                  <SelectItem value="MANAGER">매니저</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2 pt-4">
            <Button variant="outline" onClick={() => setQuickAssignOpen(false)}>
              취소
            </Button>
            <Button
              onClick={() => {
                alert(`${quickAssignSearch}님에게 ${quickAssignRole === "ADMIN" ? "관리자" : "매니저"} 역할이 부여되었습니다.`);
                setQuickAssignOpen(false);
                setQuickAssignSearch("");
                setQuickAssignTeamId("NONE");
              }}
              disabled={!quickAssignSearch || quickAssignTeamId === "NONE"}
            >
              <Shield className="mr-1.5 h-4 w-4" />
              역할 부여
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Modal */}
      <FormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editingTeam ? "팀 수정" : "팀 등록"}
        description={editingTeam ? "팀 정보를 수정합니다." : "새로운 팀을 등록합니다."}
        onSubmit={handleSubmit}
        isLoading={saving}
      >
        <FormField label="팀 로고">
          <FileUpload
            label="팀 로고"
            currentUrl={form.logoUrl || undefined}
            onChange={(file, previewUrl) => {
              setLogoFile(file);
              if (previewUrl) {
                setForm({ ...form, logoUrl: previewUrl });
              } else {
                setForm({ ...form, logoUrl: "" });
              }
            }}
            description="팀 로고 이미지를 업로드하세요 (권장: 200x200px)"
          />
        </FormField>

        <FormField label="팀명" required>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="팀명 입력"
          />
        </FormField>

        <FormField label="종목" required>
          <Select value={form.sportName} onValueChange={(v) => setForm({ ...form, sportName: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SPORT_OPTIONS.filter((o) => o.value !== "ALL").map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="시/군/구">
          <Select
            value={form.district || "NONE"}
            onValueChange={(v) => setForm({ ...form, district: v === "NONE" ? "" : v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NONE">선택 안 함</SelectItem>
              {DISTRICT_OPTIONS.filter((o) => o.value !== "ALL").map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="소속 조직" helperText="선택하지 않으면 독립 팀으로 등록됩니다.">
          <Select
            value={form.organizationId ? String(form.organizationId) : "NONE"}
            onValueChange={(v) => setForm({ ...form, organizationId: v === "NONE" ? null : Number(v) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="선택 안 함 (독립 팀)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NONE">선택 안 함 (독립 팀)</SelectItem>
              {orgOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        {editingTeam && (
          <FormField label="운영 상태">
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as OperationStatus })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">운영중</SelectItem>
                <SelectItem value="SUSPENDED">운영중단</SelectItem>
                <SelectItem value="DISSOLVED">해체</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        )}
      </FormModal>
    </div>
  );
}
