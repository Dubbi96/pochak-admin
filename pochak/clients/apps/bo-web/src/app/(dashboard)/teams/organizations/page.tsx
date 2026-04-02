"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import { TreeView } from "@/components/common/tree-view";
import { Search, Plus, Pencil, LayoutList, GitBranch, Eye, Building2, Users, Calendar, ChevronRight, Clock, Shield, UserCog, HelpCircle, CheckCircle2 } from "lucide-react";
import type { PageResponse } from "@/types/common";
import {
  getOrganizations,
  createOrganization,
  updateOrganization,
  getOrganizationTreeData,
  getHeadquarterOptions,
  getSubOrganizations,
  getOrganizationMembers,
  changeMembershipRole,
  type Organization,
  type OrganizationFilter,
  type OrganizationTypeFilter,
  type OperationStatusFilter,
  type OrganizationType,
  type AccessType,
  type AccessTypeFilter,
  type ContentVisibility,
  type DisplayArea,
  type JoinPolicy,
  type ReservationPolicy,
  type OrganizationFormData,
  type Membership,
  type MembershipRole,
  ORG_TYPE_LABELS,
  OPERATION_STATUS_LABELS,
  ACCESS_TYPE_LABELS,
  CONTENT_VISIBILITY_LABELS,
  DISPLAY_AREA_LABELS,
  JOIN_POLICY_LABELS,
  RESERVATION_POLICY_LABELS,
  MEMBERSHIP_ROLE_LABELS,
  SPORT_OPTIONS,
  DISTRICT_OPTIONS,
} from "@/services/organization-api";
import { adminApi } from "@/lib/api-client";

const ORG_TYPE_BADGE_VARIANT: Record<OrganizationType, "info" | "warning" | "success"> = {
  ASSOCIATION: "info",
  PRIVATE: "warning",
  PUBLIC: "success",
};

const ROLE_BADGE_VARIANT: Record<string, "default" | "secondary" | "info" | "warning" | "success"> = {
  ADMIN: "default",
  MANAGER: "info",
  COACH: "warning",
  PLAYER: "success",
  GUARDIAN: "secondary",
  MEMBER: "secondary",
};

const STATUS_BADGE_VARIANT: Record<string, "success" | "warning" | "destructive"> = {
  ACTIVE: "success",
  SUSPENDED: "warning",
  DISSOLVED: "destructive",
};

const EXPORT_COLUMNS = [
  { header: "NO", accessor: "id" },
  { header: "종목", accessor: "sportName" },
  { header: "유형", accessor: "type" },
  { header: "접근유형", accessor: "accessType" },
  { header: "영역", accessor: "displayArea" },
  { header: "인증", accessor: "isVerified" },
  { header: "운영상태", accessor: "operationStatus" },
  { header: "조직명", accessor: "name" },
  { header: "시/군/구", accessor: "district" },
  { header: "소속팀수", accessor: "teamCount" },
  { header: "회원수", accessor: "memberCount" },
  { header: "가입대기", accessor: "pendingMemberCount" },
  { header: "상위조직", accessor: "parentOrganizationName" },
];

const INITIAL_FORM: OrganizationFormData = {
  type: "ASSOCIATION",
  accessType: "OPEN",
  contentVisibility: "PUBLIC",
  displayArea: "CITY",
  isVerified: false,
  joinPolicy: "OPEN",
  reservationPolicy: "ALL_MEMBERS",
  isCug: false,
  siGunGuCode: "",
  parentOrganizationId: null,
  name: "",
  shortName: "",
  sportName: "축구",
  canHostCompetition: false,
  autoJoin: false,
  managerOnlyBooking: false,
  logoUrl: "",
  phone: "",
  website: "",
  description: "",
  district: "",
  memberLimit: null,
  published: true,
};

export default function OrganizationsPage() {
  const [data, setData] = useState<PageResponse<Organization> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  // Filters
  const [typeFilter, setTypeFilter] = useState<OrganizationTypeFilter>("ALL");
  const [accessTypeFilter, setAccessTypeFilter] = useState<AccessTypeFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<OperationStatusFilter>("ALL");
  const [sportFilter, setSportFilter] = useState("ALL");
  const [districtFilter, setDistrictFilter] = useState("ALL");
  const [searchKeyword, setSearchKeyword] = useState("");

  // View mode
  const [viewMode, setViewMode] = useState<"table" | "tree">("table");

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [form, setForm] = useState<OrganizationFormData>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Detail dialog
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailOrg, setDetailOrg] = useState<Organization | null>(null);
  const [subOrgs, setSubOrgs] = useState<Organization[]>([]);

  // Member management dialog
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [orgMembers, setOrgMembers] = useState<Membership[]>([]);
  const [orgMembersLoading, setOrgMembersLoading] = useState(false);
  const [memberMgmtOrg, setMemberMgmtOrg] = useState<Organization | null>(null);

  // Quick assign admin dialog
  const [quickAssignOpen, setQuickAssignOpen] = useState(false);
  const [quickAssignOrgId, setQuickAssignOrgId] = useState<string>("NONE");
  const [quickAssignRole, setQuickAssignRole] = useState<MembershipRole>("ADMIN");
  const [quickAssignSearch, setQuickAssignSearch] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const filters: OrganizationFilter = {
        type: typeFilter,
        operationStatus: statusFilter,
        accessType: accessTypeFilter,
        sportName: sportFilter,
        district: districtFilter,
        searchKeyword,
      };

      // Try real API first, fall back to mock
      // TODO(Phase 4B): remove mock fallback once backend is stable
      const apiParams: Record<string, string> = { page: String(page) };
      if (typeFilter !== "ALL") apiParams.type = typeFilter;
      if (accessTypeFilter !== "ALL") apiParams.accessType = accessTypeFilter;
      if (statusFilter !== "ALL") apiParams.operationStatus = statusFilter;
      if (sportFilter !== "ALL") apiParams.sportName = sportFilter;
      if (districtFilter !== "ALL") apiParams.district = districtFilter;
      if (searchKeyword) apiParams.searchKeyword = searchKeyword;

      const apiResult = await adminApi.get<PageResponse<Organization>>(
        "/admin/api/v1/teams/organizations",
        apiParams
      );
      if (apiResult) {
        setData(apiResult);
        return;
      }

      // Mock fallback
      const result = await getOrganizations(filters, page);
      setData(result);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, accessTypeFilter, statusFilter, sportFilter, districtFilter, searchKeyword, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = () => {
    setPage(0);
    fetchData();
  };

  const handleReset = () => {
    setTypeFilter("ALL");
    setAccessTypeFilter("ALL");
    setStatusFilter("ALL");
    setSportFilter("ALL");
    setDistrictFilter("ALL");
    setSearchKeyword("");
  };

  const openCreate = () => {
    setEditingOrg(null);
    setForm(INITIAL_FORM);
    setLogoFile(null);
    setModalOpen(true);
  };

  const openEdit = (org: Organization) => {
    setEditingOrg(org);
    setForm({
      type: org.type,
      accessType: org.accessType,
      contentVisibility: org.contentVisibility,
      displayArea: org.displayArea,
      isVerified: org.isVerified,
      joinPolicy: org.joinPolicy,
      reservationPolicy: org.reservationPolicy,
      isCug: org.isCug,
      siGunGuCode: org.siGunGuCode,
      parentOrganizationId: org.parentOrganizationId,
      name: org.name,
      shortName: org.shortName,
      sportName: org.sportName,
      canHostCompetition: org.canHostCompetition,
      autoJoin: org.autoJoin,
      managerOnlyBooking: org.managerOnlyBooking,
      logoUrl: org.logoUrl,
      phone: org.phone,
      website: org.website,
      description: org.description,
      district: org.district,
      memberLimit: org.memberLimit,
      published: org.published,
    });
    setLogoFile(null);
    setModalOpen(true);
  };

  const openDetail = (org: Organization) => {
    setDetailOrg(org);
    const subs = getSubOrganizations(org.id);
    setSubOrgs(subs);
    setDetailOpen(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (editingOrg) {
        await updateOrganization(editingOrg.id, form);
      } else {
        await createOrganization(form);
      }
      setModalOpen(false);
      fetchData();
    } finally {
      setSaving(false);
    }
  };

  const loadOrgMembers = async (org: Organization) => {
    setMemberMgmtOrg(org);
    setMemberDialogOpen(true);
    setOrgMembersLoading(true);
    try {
      const members = await getOrganizationMembers(org.name);
      setOrgMembers(members);
    } finally {
      setOrgMembersLoading(false);
    }
  };

  const handleOrgMemberRoleChange = async (membershipId: number, newRole: MembershipRole) => {
    await changeMembershipRole(membershipId, newRole);
    if (memberMgmtOrg) {
      const members = await getOrganizationMembers(memberMgmtOrg.name);
      setOrgMembers(members);
    }
  };

  // When access type changes in the form, update defaults
  const handleAccessTypeChange = (at: AccessType) => {
    if (at === "OPEN") {
      setForm({
        ...form,
        accessType: at,
        autoJoin: true,
        contentVisibility: "PUBLIC",
        managerOnlyBooking: false,
      });
    } else {
      setForm({
        ...form,
        accessType: at,
        autoJoin: false,
        contentVisibility: "MEMBERS_ONLY",
        managerOnlyBooking: true,
      });
    }
  };

  const hqOptions = getHeadquarterOptions();
  const treeData = getOrganizationTreeData();

  const canHostCompetition = form.type === "ASSOCIATION" || form.type === "PUBLIC";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">조직 통합 관리</h1>
          <p className="mt-1 text-sm text-gray-500">협회, 단체(폐쇄/개방)를 통합 관리합니다.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setQuickAssignOpen(true)}>
            <Shield className="mr-1.5 h-4 w-4" />
            관리자 부여
          </Button>
          <ExportButton
            data={(data?.content ?? []) as unknown as Record<string, unknown>[]}
            columns={EXPORT_COLUMNS}
            filename="organizations"
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
          <Label className="text-xs text-gray-500">조직 유형</Label>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as OrganizationTypeFilter)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="ASSOCIATION">협회</SelectItem>
              <SelectItem value="PRIVATE">단체 폐쇄</SelectItem>
              <SelectItem value="PUBLIC">단체 개방</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">단체 유형</Label>
          <Select value={accessTypeFilter} onValueChange={(v) => setAccessTypeFilter(v as AccessTypeFilter)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="OPEN">포착 시티 (개방)</SelectItem>
              <SelectItem value="CLOSED">포착 클럽 (폐쇄)</SelectItem>
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
          <Label className="text-xs text-gray-500">시/군/구</Label>
          <Select value={districtFilter} onValueChange={setDistrictFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DISTRICT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">직접 검색</Label>
          <Input
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="조직명 검색"
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

      {/* View Toggle */}
      <div className="flex items-center gap-2">
        <Button
          variant={viewMode === "table" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("table")}
        >
          <LayoutList size={14} className="mr-1.5" />
          테이블
        </Button>
        <Button
          variant={viewMode === "tree" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("tree")}
        >
          <GitBranch size={14} className="mr-1.5" />
          트리뷰
        </Button>
      </div>

      {/* Content */}
      {viewMode === "tree" ? (
        <TreeView data={treeData} />
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
                  <th className="px-4 py-3 text-center w-[60px]">NO</th>
                  <th className="px-4 py-3">종목</th>
                  <th className="px-4 py-3 text-center">유형</th>
                  <th className="px-4 py-3 text-center">접근</th>
                  <th className="px-4 py-3 text-center">영역</th>
                  <th className="px-4 py-3 text-center w-[50px]">인증</th>
                  <th className="px-4 py-3 text-center">운영상태</th>
                  <th className="px-4 py-3">조직명</th>
                  <th className="px-4 py-3">시/군/구</th>
                  <th className="px-4 py-3 text-center">소속팀수</th>
                  <th className="px-4 py-3 text-center">회원수</th>
                  <th className="px-4 py-3 text-center">가입 대기</th>
                  <th className="px-4 py-3">상위조직</th>
                  <th className="px-4 py-3 text-center w-[120px]">관리</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={14} className="px-4 py-12 text-center text-gray-400">
                      로딩 중...
                    </td>
                  </tr>
                ) : !data || data.content.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="px-4 py-12 text-center text-gray-400">
                      데이터가 없습니다.
                    </td>
                  </tr>
                ) : (
                  data.content.map((org, idx) => (
                    <tr
                      key={org.id}
                      className={`border-b border-gray-100 transition-colors hover:bg-gray-50 cursor-pointer ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                      onClick={() => openDetail(org)}
                    >
                      <td className="px-4 py-3 text-center text-gray-500">
                        {page * (data?.size ?? 20) + idx + 1}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{org.sportName}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={ORG_TYPE_BADGE_VARIANT[org.type]}>
                          {ORG_TYPE_LABELS[org.type]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge
                          variant={org.accessType === "OPEN" ? "success" : "secondary"}
                          className={org.accessType === "OPEN"
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-gray-100 text-gray-600 border-gray-200"
                          }
                        >
                          {org.accessType === "OPEN" ? "개방" : "폐쇄"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge
                          variant={org.displayArea === "CITY" ? "info" : "warning"}
                        >
                          {DISPLAY_AREA_LABELS[org.displayArea]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {org.isVerified ? (
                          <CheckCircle2 size={16} className="mx-auto text-blue-500" />
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={STATUS_BADGE_VARIANT[org.operationStatus]}>
                          {OPERATION_STATUS_LABELS[org.operationStatus]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{org.name}</td>
                      <td className="px-4 py-3 text-gray-600">{org.district}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{org.teamCount}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{org.memberCount}</td>
                      <td className="px-4 py-3 text-center">
                        {org.accessType === "CLOSED" && org.pendingMemberCount > 0 ? (
                          <Badge variant="warning" className="text-xs">
                            <Clock size={10} className="mr-0.5" />
                            {org.pendingMemberCount}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {org.parentOrganizationName ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); openDetail(org); }} title="상세">
                            <Eye size={14} />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); openEdit(org); }} title="수정">
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
        </>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>조직 상세 정보</DialogTitle>
          </DialogHeader>
          {detailOrg && (
            <div className="space-y-5">
              {/* Organization Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">조직명</p>
                  <p className="text-sm font-medium text-gray-900">{detailOrg.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">약칭</p>
                  <p className="text-sm text-gray-700">{detailOrg.shortName || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">유형</p>
                  <Badge variant={ORG_TYPE_BADGE_VARIANT[detailOrg.type]}>
                    {ORG_TYPE_LABELS[detailOrg.type]}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">단체 유형 (접근)</p>
                  <Badge
                    variant={detailOrg.accessType === "OPEN" ? "success" : "secondary"}
                    className={detailOrg.accessType === "OPEN"
                      ? "bg-green-100 text-green-800 border-green-200"
                      : "bg-gray-100 text-gray-600 border-gray-200"
                    }
                  >
                    {detailOrg.accessType === "OPEN" ? "포착 시티 (개방)" : "포착 클럽 (폐쇄)"}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">운영상태</p>
                  <Badge variant={STATUS_BADGE_VARIANT[detailOrg.operationStatus]}>
                    {OPERATION_STATUS_LABELS[detailOrg.operationStatus]}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">콘텐츠 공개범위</p>
                  <p className="text-sm text-gray-700">{CONTENT_VISIBILITY_LABELS[detailOrg.contentVisibility]}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">종목</p>
                  <p className="text-sm text-gray-700">{detailOrg.sportName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">시/군/구</p>
                  <p className="text-sm text-gray-700">{detailOrg.district || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">영역 구분</p>
                  <Badge variant={detailOrg.displayArea === "CITY" ? "info" : "warning"}>
                    {DISPLAY_AREA_LABELS[detailOrg.displayArea]}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">시티 인증</p>
                  <p className="text-sm text-gray-700">{detailOrg.isVerified ? "인증됨" : "미인증"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">가입 정책</p>
                  <p className="text-sm text-gray-700">{JOIN_POLICY_LABELS[detailOrg.joinPolicy]}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">예약 정책</p>
                  <p className="text-sm text-gray-700">{RESERVATION_POLICY_LABELS[detailOrg.reservationPolicy]}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">CUG 모드</p>
                  <Badge variant={detailOrg.isCug ? "warning" : "secondary"}>
                    {detailOrg.isCug ? "활성" : "비활성"}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">시/군/구 코드</p>
                  <p className="text-sm text-gray-700">{detailOrg.siGunGuCode || "-"}</p>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-3">
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                  <Building2 size={16} className="text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-500">소속팀</p>
                    <p className="text-sm font-semibold text-gray-900">{detailOrg.teamCount}개</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                  <Users size={16} className="text-emerald-500" />
                  <div>
                    <p className="text-xs text-gray-500">회원수</p>
                    <p className="text-sm font-semibold text-gray-900">{detailOrg.memberCount}명</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                  <Calendar size={16} className="text-purple-500" />
                  <div>
                    <p className="text-xs text-gray-500">회원제한</p>
                    <p className="text-sm font-semibold text-gray-900">{detailOrg.memberLimit ? `${detailOrg.memberLimit}명` : "없음"}</p>
                  </div>
                </div>
                {detailOrg.accessType === "CLOSED" && (
                  <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                    <Clock size={16} className="text-amber-500" />
                    <div>
                      <p className="text-xs text-amber-700">가입 대기</p>
                      <p className="text-sm font-semibold text-amber-900">{detailOrg.pendingMemberCount}명</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">전화번호:</span>{" "}
                    <span className="text-gray-700">{detailOrg.phone || "-"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">웹사이트:</span>{" "}
                    <span className="text-gray-700">{detailOrg.website || "-"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">대회운영:</span>{" "}
                    <Badge variant={detailOrg.canHostCompetition ? "success" : "secondary"}>
                      {detailOrg.canHostCompetition ? "가능" : "불가"}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-500">자동가입:</span>{" "}
                    <Badge variant={detailOrg.autoJoin ? "success" : "secondary"}>
                      {detailOrg.autoJoin ? "허용" : "비허용"}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-500">관리자 전용 예약:</span>{" "}
                    <Badge variant={detailOrg.managerOnlyBooking ? "warning" : "secondary"}>
                      {detailOrg.managerOnlyBooking ? "활성" : "비활성"}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-500">게시상태:</span>{" "}
                    <Badge variant={detailOrg.published ? "success" : "secondary"}>
                      {detailOrg.published ? "게시" : "미게시"}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-500">상위조직:</span>{" "}
                    <span className="text-gray-700">{detailOrg.parentOrganizationName || "없음 (최상위)"}</span>
                  </div>
                </div>
                {detailOrg.description && (
                  <div className="text-sm">
                    <span className="text-gray-500">설명:</span>{" "}
                    <span className="text-gray-700">{detailOrg.description}</span>
                  </div>
                )}
              </div>

              {/* Sub-organizations Tree */}
              {subOrgs.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-900">하위 조직 ({subOrgs.length}개)</h3>
                  <div className="space-y-1.5">
                    {subOrgs.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center gap-2 rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-sm"
                      >
                        <ChevronRight size={14} className="text-gray-400" />
                        <span className="font-medium text-gray-800">{sub.name}</span>
                        <Badge variant={ORG_TYPE_BADGE_VARIANT[sub.type]} className="ml-auto">
                          {ORG_TYPE_LABELS[sub.type]}
                        </Badge>
                        <Badge variant={STATUS_BADGE_VARIANT[sub.operationStatus]}>
                          {OPERATION_STATUS_LABELS[sub.operationStatus]}
                        </Badge>
                        <span className="text-xs text-gray-400">{sub.memberCount}명</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 멤버 관리 */}
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2">조직 멤버 관리</h4>
                <Button size="sm" variant="outline" onClick={() => { setDetailOpen(false); loadOrgMembers(detailOrg); }}>
                  <Users className="h-3.5 w-3.5 mr-1" />
                  멤버 관리
                </Button>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setDetailOpen(false)}>
                  닫기
                </Button>
                <Button onClick={() => { setDetailOpen(false); openEdit(detailOrg); }}>
                  <Pencil size={14} className="mr-1.5" />
                  수정
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Member Management Dialog */}
      <Dialog open={memberDialogOpen} onOpenChange={setMemberDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>조직 멤버 관리</DialogTitle>
            <DialogDescription>
              {memberMgmtOrg && <>{memberMgmtOrg.name}의 멤버 역할을 관리합니다.</>}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {orgMembersLoading ? (
              <p className="py-4 text-center text-sm text-gray-400">로딩 중...</p>
            ) : orgMembers.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-400">등록된 멤버가 없습니다.</p>
            ) : (
              <div className="overflow-hidden rounded-md border border-gray-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 text-xs text-gray-500">
                      <th className="px-3 py-2 text-left">이름</th>
                      <th className="px-3 py-2 text-left">이메일</th>
                      <th className="px-3 py-2 text-center">역할</th>
                      <th className="px-3 py-2 text-center">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orgMembers.map((member) => (
                      <tr key={member.id} className="border-b border-gray-100">
                        <td className="px-3 py-2 font-medium text-gray-900">{member.userName}</td>
                        <td className="px-3 py-2 text-gray-500 text-xs">{member.userEmail}</td>
                        <td className="px-3 py-2 text-center">
                          <Badge variant={ROLE_BADGE_VARIANT[member.role] ?? "secondary"}>
                            {MEMBERSHIP_ROLE_LABELS[member.role]}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <Select
                            onValueChange={(newRole) => handleOrgMemberRoleChange(member.id, newRole as MembershipRole)}
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setMemberDialogOpen(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Assign Admin Dialog */}
      <Dialog open={quickAssignOpen} onOpenChange={setQuickAssignOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>관리자 일괄 부여</DialogTitle>
            <DialogDescription>
              사용자를 검색하고 조직에 관리자/매니저 역할을 부여합니다.
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
              <label className="text-sm font-medium text-gray-700">대상 조직</label>
              <Select value={quickAssignOrgId} onValueChange={setQuickAssignOrgId}>
                <SelectTrigger>
                  <SelectValue placeholder="조직 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">조직 선택</SelectItem>
                  {(data?.content ?? []).map((org) => (
                    <SelectItem key={org.id} value={String(org.id)}>{org.name}</SelectItem>
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
                setQuickAssignOrgId("NONE");
              }}
              disabled={!quickAssignSearch || quickAssignOrgId === "NONE"}
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
        title={editingOrg ? "조직 수정" : "조직 등록"}
        description={editingOrg ? "조직 정보를 수정합니다." : "새로운 조직을 등록합니다."}
        onSubmit={handleSubmit}
        isLoading={saving}
      >
        <FormField label="조직 유형" required>
          <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as OrganizationType, parentOrganizationId: null, canHostCompetition: v !== "PRIVATE" ? form.canHostCompetition : false })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ASSOCIATION">협회</SelectItem>
              <SelectItem value="PRIVATE">단체 폐쇄</SelectItem>
              <SelectItem value="PUBLIC">단체 개방</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="단체 유형" required helperText="개방(시티): 자동가입, 전체공개 / 폐쇄(클럽): 승인필요, 멤버전용">
          <Select value={form.accessType} onValueChange={(v) => handleAccessTypeChange(v as AccessType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OPEN">포착 시티 (개방)</SelectItem>
              <SelectItem value="CLOSED">포착 클럽 (폐쇄)</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        {/* Defaults display based on access type */}
        <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600 space-y-1">
          <p>
            <span className="font-medium">자동가입:</span>{" "}
            {form.autoJoin ? "허용 (기본값)" : "비허용 (기본값)"}
          </p>
          <p>
            <span className="font-medium">콘텐츠 공개범위:</span>{" "}
            {CONTENT_VISIBILITY_LABELS[form.contentVisibility]} (기본값)
          </p>
          {form.accessType === "CLOSED" && (
            <p>
              <span className="font-medium">관리자 전용 예약:</span> 활성 (기본값)
            </p>
          )}
        </div>

        <FormField label="영역 구분" required>
          <Select value={form.displayArea} onValueChange={(v) => setForm({ ...form, displayArea: v as DisplayArea })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CITY">포착 시티 (CITY)</SelectItem>
              <SelectItem value="CLUB">포착 클럽 (CLUB)</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="시티 인증">
          <div className="flex items-center gap-2 pt-1">
            <Checkbox
              checked={form.isVerified}
              onCheckedChange={(v) => setForm({ ...form, isVerified: !!v })}
            />
            <span className="text-sm text-gray-600">인증된 단체</span>
            <span className="group relative inline-flex">
              <HelpCircle size={14} className="text-gray-400 cursor-help" />
              <span className="invisible group-hover:visible absolute left-6 top-0 z-10 w-60 rounded-md bg-gray-900 px-3 py-2 text-xs text-white shadow-lg">
                BO 관리자가 인증한 단체만 포착 시티에 노출됩니다
              </span>
            </span>
          </div>
        </FormField>

        <FormField label="가입 정책" required>
          <Select value={form.joinPolicy} onValueChange={(v) => setForm({ ...form, joinPolicy: v as JoinPolicy })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OPEN">자유 가입 (OPEN)</SelectItem>
              <SelectItem value="APPROVAL">승인 필요 (APPROVAL)</SelectItem>
              <SelectItem value="INVITE_ONLY">초대 전용 (INVITE_ONLY)</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="예약 정책" required>
          <Select value={form.reservationPolicy} onValueChange={(v) => setForm({ ...form, reservationPolicy: v as ReservationPolicy })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL_MEMBERS">모든 멤버 (ALL_MEMBERS)</SelectItem>
              <SelectItem value="MANAGER_ONLY">매니저만 (MANAGER_ONLY)</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="CUG 모드">
          <div className="flex items-center gap-2 pt-1">
            <Checkbox
              checked={form.isCug}
              onCheckedChange={(v) => setForm({ ...form, isCug: !!v })}
            />
            <span className="text-sm text-gray-600">CUG 모드 활성화</span>
            <span className="group relative inline-flex">
              <HelpCircle size={14} className="text-gray-400 cursor-help" />
              <span className="invisible group-hover:visible absolute left-6 top-0 z-10 w-64 rounded-md bg-gray-900 px-3 py-2 text-xs text-white shadow-lg">
                활성화 시 콘텐츠는 회원만 접근 가능하며, 홍보용 영상은 별도 지정
              </span>
            </span>
          </div>
        </FormField>

        <FormField label="시/군/구 코드">
          <Input
            value={form.siGunGuCode}
            onChange={(e) => setForm({ ...form, siGunGuCode: e.target.value })}
            placeholder="행정구역 코드 (예: 11680)"
          />
        </FormField>

        {form.type === "PRIVATE" && (
          <FormField label="상위 조직 (본점)" helperText="선택 시 지점으로 등록됩니다.">
            <Select
              value={form.parentOrganizationId ? String(form.parentOrganizationId) : "NONE"}
              onValueChange={(v) => setForm({ ...form, parentOrganizationId: v === "NONE" ? null : Number(v) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="선택 안 함 (본점으로 등록)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">선택 안 함 (본점)</SelectItem>
                {hqOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        )}

        <FormField label="조직명" required>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="조직 풀네임 입력"
          />
        </FormField>

        <FormField label="약칭">
          <Input
            value={form.shortName}
            onChange={(e) => setForm({ ...form, shortName: e.target.value })}
            placeholder="약칭 입력"
          />
        </FormField>

        <FormField label="단체 로고">
          <FileUpload
            label="단체 로고"
            currentUrl={form.logoUrl || undefined}
            onChange={(file, previewUrl) => {
              setLogoFile(file);
              if (previewUrl) {
                setForm({ ...form, logoUrl: previewUrl });
              } else {
                setForm({ ...form, logoUrl: "" });
              }
            }}
            description="조직 로고 이미지를 업로드하세요 (권장: 200x200px)"
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

        <FormField label="콘텐츠 공개범위">
          <Select value={form.contentVisibility} onValueChange={(v) => setForm({ ...form, contentVisibility: v as ContentVisibility })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PUBLIC">전체 공개</SelectItem>
              <SelectItem value="MEMBERS_ONLY">멤버만</SelectItem>
              <SelectItem value="PRIVATE">비공개</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <div className="flex gap-6">
          <FormField label="대회 운영 가능">
            <div className="flex items-center gap-2 pt-1">
              <Checkbox
                checked={form.canHostCompetition}
                onCheckedChange={(v) => setForm({ ...form, canHostCompetition: !!v })}
                disabled={!canHostCompetition}
              />
              <span className="text-sm text-gray-600">
                {canHostCompetition ? "활성" : "비활성 (협회/개방만 가능)"}
              </span>
            </div>
          </FormField>

          <FormField label="자동가입">
            <div className="flex items-center gap-2 pt-1">
              <Checkbox
                checked={form.autoJoin}
                onCheckedChange={(v) => setForm({ ...form, autoJoin: !!v })}
              />
              <span className="text-sm text-gray-600">허용</span>
            </div>
          </FormField>
        </div>

        <FormField label="관리자 전용 예약">
          <div className="flex items-center gap-2 pt-1">
            <Checkbox
              checked={form.managerOnlyBooking}
              onCheckedChange={(v) => setForm({ ...form, managerOnlyBooking: !!v })}
            />
            <span className="text-sm text-gray-600">활성</span>
          </div>
        </FormField>

        <FormField label="전화번호">
          <Input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="02-0000-0000"
          />
        </FormField>

        <FormField label="웹사이트">
          <Input
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            placeholder="https://"
          />
        </FormField>

        <FormField label="설명">
          <Input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="조직 설명"
          />
        </FormField>

        <FormField label="회원 제한">
          <Input
            type="number"
            value={form.memberLimit ?? ""}
            onChange={(e) => setForm({ ...form, memberLimit: e.target.value ? Number(e.target.value) : null })}
            placeholder="제한 없음"
          />
        </FormField>

        <FormField label="게시 상태">
          <div className="flex items-center gap-2 pt-1">
            <Checkbox
              checked={form.published}
              onCheckedChange={(v) => setForm({ ...form, published: !!v })}
            />
            <span className="text-sm text-gray-600">게시</span>
          </div>
        </FormField>
      </FormModal>
    </div>
  );
}
