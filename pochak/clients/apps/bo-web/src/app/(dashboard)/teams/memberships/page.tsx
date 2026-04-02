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
import { ExportButton } from "@/components/common/export-button";
import { Search, CheckCircle, XCircle, UserCog, Eye, Clock } from "lucide-react";
import type { PageResponse } from "@/types/common";
import {
  approveMembership,
  rejectMembershipWithReason,
  changeMembershipRole,
  type Membership,
  type MembershipTargetTypeFilter,
  type MembershipRoleFilter,
  type MembershipApprovalStatusFilter,
  type MembershipRole,
  MEMBERSHIP_ROLE_LABELS,
  MEMBERSHIP_STATUS_LABELS,
} from "@/services/organization-api";
import { adminApi } from "@/lib/api-client";

const TARGET_TYPE_LABELS: Record<string, string> = {
  ORGANIZATION: "조직",
  TEAM: "팀",
};

const TARGET_TYPE_BADGE_VARIANT: Record<string, "info" | "success"> = {
  ORGANIZATION: "info",
  TEAM: "success",
};

const ROLE_BADGE_VARIANT: Record<string, "default" | "secondary" | "info" | "warning" | "success"> = {
  ADMIN: "default",
  MANAGER: "info",
  COACH: "warning",
  PLAYER: "success",
  GUARDIAN: "secondary",
  MEMBER: "secondary",
};

const STATUS_BADGE_VARIANT: Record<string, "warning" | "success" | "destructive"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "destructive",
};

const EXPORT_COLUMNS = [
  { header: "NO", accessor: "id" },
  { header: "사용자명", accessor: "userName" },
  { header: "이메일", accessor: "userEmail" },
  { header: "대상유형", accessor: "targetType" },
  { header: "대상명", accessor: "targetName" },
  { header: "역할", accessor: "role" },
  { header: "승인상태", accessor: "approvalStatus" },
  { header: "승인자", accessor: "approvedBy" },
  { header: "승인일", accessor: "approvedAt" },
  { header: "가입일", accessor: "joinedAt" },
];

export default function MembershipsPage() {
  const [data, setData] = useState<PageResponse<Membership> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  // Filters
  const [targetTypeFilter, setTargetTypeFilter] = useState<MembershipTargetTypeFilter>("ALL");
  const [roleFilter, setRoleFilter] = useState<MembershipRoleFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<MembershipApprovalStatusFilter>("ALL");
  const [searchKeyword, setSearchKeyword] = useState("");

  // Role change modal
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [roleTarget, setRoleTarget] = useState<Membership | null>(null);
  const [newRole, setNewRole] = useState<MembershipRole>("MEMBER");

  // Reject modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<Membership | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  // Detail dialog
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailMembership, setDetailMembership] = useState<Membership | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const apiParams: Record<string, string> = { page: String(page) };
      if (targetTypeFilter !== "ALL") apiParams.targetType = targetTypeFilter;
      if (roleFilter !== "ALL") apiParams.role = roleFilter;
      if (statusFilter !== "ALL") apiParams.approvalStatus = statusFilter;
      if (searchKeyword) apiParams.searchKeyword = searchKeyword;

      const apiResult = await adminApi.get<PageResponse<Membership>>(
        "/admin/api/v1/teams/memberships",
        apiParams
      );
      if (apiResult) {
        setData(apiResult);
      }
    } catch {
      /* API error - data remains in initial empty state */
    } finally {
      setLoading(false);
    }
  }, [targetTypeFilter, roleFilter, statusFilter, searchKeyword, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = () => {
    setPage(0);
    fetchData();
  };

  const handleReset = () => {
    setTargetTypeFilter("ALL");
    setRoleFilter("ALL");
    setStatusFilter("ALL");
    setSearchKeyword("");
  };

  const handleApprove = async (id: number) => {
    if (!confirm("이 멤버십을 승인하시겠습니까?")) return;
    await approveMembership(id);
    fetchData();
  };

  const openRejectModal = (membership: Membership) => {
    setRejectTarget(membership);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    setRejecting(true);
    try {
      await rejectMembershipWithReason(rejectTarget.id, rejectReason || "사유 없음");
      setRejectModalOpen(false);
      setRejectTarget(null);
      fetchData();
    } finally {
      setRejecting(false);
    }
  };

  const openRoleChange = (membership: Membership) => {
    setRoleTarget(membership);
    setNewRole(membership.role);
    setRoleModalOpen(true);
  };

  const handleRoleChange = async () => {
    if (!roleTarget) return;
    await changeMembershipRole(roleTarget.id, newRole);
    setRoleModalOpen(false);
    setRoleTarget(null);
    fetchData();
  };

  const openDetail = (membership: Membership) => {
    setDetailMembership(membership);
    setDetailOpen(true);
  };

  // Count pending memberships for summary
  const pendingCount = data?.content.filter((m) => m.approvalStatus === "PENDING").length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">멤버십 관리</h1>
            <p className="mt-1 text-sm text-gray-500">조직/팀 멤버십을 조회하고 관리합니다.</p>
          </div>
          {pendingCount > 0 && (
            <Badge variant="warning" className="text-sm px-3 py-1.5 flex items-center gap-1">
              <Clock size={14} />
              승인 대기 {pendingCount}건
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ExportButton
            data={(data?.content ?? []) as unknown as Record<string, unknown>[]}
            columns={EXPORT_COLUMNS}
            filename="memberships"
            label="내보내기"
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 bg-white p-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">대상 유형</Label>
          <Select value={targetTypeFilter} onValueChange={(v) => setTargetTypeFilter(v as MembershipTargetTypeFilter)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="ORGANIZATION">조직</SelectItem>
              <SelectItem value="TEAM">팀</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">역할</Label>
          <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as MembershipRoleFilter)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="ADMIN">관리자</SelectItem>
              <SelectItem value="MANAGER">매니저</SelectItem>
              <SelectItem value="COACH">코치</SelectItem>
              <SelectItem value="PLAYER">선수</SelectItem>
              <SelectItem value="GUARDIAN">보호자</SelectItem>
              <SelectItem value="MEMBER">회원</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">승인 상태</Label>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as MembershipApprovalStatusFilter)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="PENDING">승인 대기</SelectItem>
              <SelectItem value="APPROVED">승인됨</SelectItem>
              <SelectItem value="REJECTED">거절됨</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">사용자 검색</Label>
          <Input
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="사용자명 검색"
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
              <th className="px-4 py-3">사용자명</th>
              <th className="px-4 py-3">이메일</th>
              <th className="px-4 py-3 text-center">대상유형</th>
              <th className="px-4 py-3">대상명</th>
              <th className="px-4 py-3 text-center">역할</th>
              <th className="px-4 py-3 text-center">승인상태</th>
              <th className="px-4 py-3 text-center">승인자</th>
              <th className="px-4 py-3 text-center">승인일</th>
              <th className="px-4 py-3 text-center">가입일</th>
              <th className="px-4 py-3 text-center w-[180px]">관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={11} className="px-4 py-12 text-center text-gray-400">
                  로딩 중...
                </td>
              </tr>
            ) : !data || data.content.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-12 text-center text-gray-400">
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              data.content.map((membership, idx) => (
                <tr
                  key={membership.id}
                  className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${idx % 2 === 1 ? "bg-gray-50/50" : ""} ${membership.approvalStatus === "PENDING" ? "bg-amber-50/50 hover:bg-amber-50" : ""}`}
                >
                  <td className="px-4 py-3 text-center text-gray-500">
                    {page * (data?.size ?? 20) + idx + 1}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{membership.userName}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{membership.userEmail}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={TARGET_TYPE_BADGE_VARIANT[membership.targetType]}>
                      {TARGET_TYPE_LABELS[membership.targetType]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{membership.targetName}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={ROLE_BADGE_VARIANT[membership.role]}>
                      {MEMBERSHIP_ROLE_LABELS[membership.role]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={STATUS_BADGE_VARIANT[membership.approvalStatus]}>
                      {MEMBERSHIP_STATUS_LABELS[membership.approvalStatus]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500 text-xs">
                    {membership.approvedBy ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500 text-xs">
                    {membership.approvedAt ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500">{membership.joinedAt}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {membership.approvalStatus === "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-emerald-600 hover:text-emerald-800"
                            onClick={() => handleApprove(membership.id)}
                            title="승인"
                          >
                            <CheckCircle size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => openRejectModal(membership)}
                            title="거절"
                          >
                            <XCircle size={14} />
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openRoleChange(membership)}
                        title="역할변경"
                      >
                        <UserCog size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openDetail(membership)}
                        title="상세"
                      >
                        <Eye size={14} />
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

      {/* Membership Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>멤버십 상세</DialogTitle>
          </DialogHeader>
          {detailMembership && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">사용자명</p>
                  <p className="text-sm font-medium text-gray-900">{detailMembership.userName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">이메일</p>
                  <p className="text-sm text-gray-700">{detailMembership.userEmail}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">대상</p>
                  <p className="text-sm text-gray-700">
                    <Badge variant={TARGET_TYPE_BADGE_VARIANT[detailMembership.targetType]} className="mr-1">
                      {TARGET_TYPE_LABELS[detailMembership.targetType]}
                    </Badge>
                    {detailMembership.targetName}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">역할</p>
                  <Badge variant={ROLE_BADGE_VARIANT[detailMembership.role]}>
                    {MEMBERSHIP_ROLE_LABELS[detailMembership.role]}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">승인상태</p>
                  <Badge variant={STATUS_BADGE_VARIANT[detailMembership.approvalStatus]}>
                    {MEMBERSHIP_STATUS_LABELS[detailMembership.approvalStatus]}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">가입일</p>
                  <p className="text-sm text-gray-700">{detailMembership.joinedAt}</p>
                </div>
              </div>
              {/* Approved by/at info */}
              {detailMembership.approvalStatus === "APPROVED" && (
                <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs font-medium text-green-700">승인자</p>
                      <p className="text-sm text-green-600">{detailMembership.approvedBy ?? "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-green-700">승인일</p>
                      <p className="text-sm text-green-600">{detailMembership.approvedAt ?? "-"}</p>
                    </div>
                  </div>
                </div>
              )}
              {detailMembership.rejectReason && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2">
                  <p className="text-xs font-medium text-red-700">거절 사유</p>
                  <p className="text-sm text-red-600">{detailMembership.rejectReason}</p>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setDetailOpen(false)}>닫기</Button>
                {detailMembership.approvalStatus === "PENDING" && (
                  <>
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => { setDetailOpen(false); openRejectModal(detailMembership); }}
                    >
                      거절
                    </Button>
                    <Button onClick={() => { handleApprove(detailMembership.id); setDetailOpen(false); }}>
                      승인
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>멤버십 거절</DialogTitle>
            <DialogDescription>
              {rejectTarget && (
                <>
                  <span className="font-medium text-gray-900">{rejectTarget.userName}</span>님의 멤버십 가입을 거절합니다.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">거절 사유</Label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="거절 사유를 입력해 주세요"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 pt-4">
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejecting}
            >
              {rejecting ? "처리 중..." : "거절"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Change Dialog */}
      <Dialog open={roleModalOpen} onOpenChange={setRoleModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>역할 변경</DialogTitle>
          </DialogHeader>
          {roleTarget && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium text-gray-900">{roleTarget.userName}</span>님의 역할을 변경합니다.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>현재 역할:</span>
                <Badge variant={ROLE_BADGE_VARIANT[roleTarget.role]}>
                  {MEMBERSHIP_ROLE_LABELS[roleTarget.role]}
                </Badge>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">새 역할</Label>
                <Select value={newRole} onValueChange={(v) => setNewRole(v as MembershipRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">관리자</SelectItem>
                    <SelectItem value="MANAGER">매니저</SelectItem>
                    <SelectItem value="COACH">코치</SelectItem>
                    <SelectItem value="PLAYER">선수</SelectItem>
                    <SelectItem value="GUARDIAN">보호자</SelectItem>
                    <SelectItem value="MEMBER">회원</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 pt-4">
            <Button variant="outline" onClick={() => setRoleModalOpen(false)}>
              취소
            </Button>
            <Button onClick={handleRoleChange} disabled={roleTarget?.role === newRole}>
              변경
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
