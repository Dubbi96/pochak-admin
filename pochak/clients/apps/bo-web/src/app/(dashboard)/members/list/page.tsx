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
  DateRangePicker,
  type DateRange,
} from "@/components/filter/date-range-picker";
import { Search, Eye, ShieldOff, UserMinus } from "lucide-react";
import type { PageResponse } from "@/types/common";
import {
  getMembers,
  blockMember,
  withdrawMember,
  type Member,
  type MemberFilter,
  type MemberType,
  type MemberGender,
  type MemberStatus,
  type SeasonPass,
  type SignUpProvider,
  type AgeGroup,
} from "@/services/member-api";

const STATUS_CONFIG: Record<string, { label: string; variant: "success" | "destructive" | "secondary" }> = {
  ACTIVE: { label: "정상", variant: "success" },
  BLOCKED: { label: "차단", variant: "destructive" },
  WITHDRAWN: { label: "탈퇴", variant: "secondary" },
};

const PROVIDER_LABELS: Record<string, string> = {
  KAKAO: "카카오",
  NAVER: "네이버",
  APPLE: "애플",
  GOOGLE: "구글",
};

export default function MemberListPage() {
  const [data, setData] = useState<PageResponse<Member> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  // Filters
  const [memberType, setMemberType] = useState<MemberType>("ALL");
  const [gender, setGender] = useState<MemberGender>("ALL");
  const [status, setStatus] = useState<MemberStatus>("ALL");
  const [seasonPass, setSeasonPass] = useState<SeasonPass>("ALL");
  const [signUpProvider, setSignUpProvider] = useState<SignUpProvider>("ALL");
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("ALL");
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [searchType, setSearchType] = useState("name");
  const [searchKeyword, setSearchKeyword] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const filters: MemberFilter = {
        memberType,
        gender,
        status,
        seasonPass,
        signUpProvider,
        ageGroup,
        dateFrom: dateRange.from?.toISOString(),
        dateTo: dateRange.to?.toISOString(),
        searchType,
        searchKeyword: searchKeyword || undefined,
      };

      // getMembers tries real API via gateway, falls back to mock
      const result = await getMembers(filters, page);
      setData(result);
    } finally {
      setLoading(false);
    }
  }, [memberType, gender, status, seasonPass, signUpProvider, ageGroup, dateRange, searchType, searchKeyword, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = () => {
    setPage(0);
    fetchData();
  };

  const handleReset = () => {
    setMemberType("ALL");
    setGender("ALL");
    setStatus("ALL");
    setSeasonPass("ALL");
    setSignUpProvider("ALL");
    setAgeGroup("ALL");
    setDateRange({ from: undefined, to: undefined });
    setSearchType("name");
    setSearchKeyword("");
  };

  const handleBlock = async (id: number) => {
    if (!confirm("이 회원을 차단하시겠습니까?")) return;
    try {
      await blockMember(id);
      fetchData();
    } catch (err) {
      console.error("[MemberList] Failed to block member:", err);
    }
  };

  const handleWithdraw = async (id: number) => {
    if (!confirm("이 회원을 탈퇴 처리하시겠습니까?")) return;
    try {
      await withdrawMember(id);
      fetchData();
    } catch (err) {
      console.error("[MemberList] Failed to withdraw member:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <h1 className="text-xl font-bold text-gray-900">회원리스트</h1>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 bg-white p-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">회원 유형</Label>
          <Select value={memberType} onValueChange={(v) => setMemberType(v as MemberType)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="NON_MEMBER">비회원</SelectItem>
              <SelectItem value="MEMBER">회원</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">성별</Label>
          <Select value={gender} onValueChange={(v) => setGender(v as MemberGender)}>
            <SelectTrigger className="w-[110px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="MALE">남성</SelectItem>
              <SelectItem value="FEMALE">여성</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">회원 상태</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as MemberStatus)}>
            <SelectTrigger className="w-[110px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="ACTIVE">정상</SelectItem>
              <SelectItem value="BLOCKED">차단</SelectItem>
              <SelectItem value="WITHDRAWN">탈퇴</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">시즌권 및 결제</Label>
          <Select value={seasonPass} onValueChange={(v) => setSeasonPass(v as SeasonPass)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="3DAY">3일</SelectItem>
              <SelectItem value="7DAY">7일</SelectItem>
              <SelectItem value="30DAY">30일</SelectItem>
              <SelectItem value="365DAY">365일</SelectItem>
              <SelectItem value="COMPETITION">대회</SelectItem>
              <SelectItem value="LEAGUE">리그</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">가입 경로</Label>
          <Select value={signUpProvider} onValueChange={(v) => setSignUpProvider(v as SignUpProvider)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="KAKAO">카카오</SelectItem>
              <SelectItem value="NAVER">네이버</SelectItem>
              <SelectItem value="APPLE">애플</SelectItem>
              <SelectItem value="GOOGLE">구글</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">연령대</Label>
          <Select value={ageGroup} onValueChange={(v) => setAgeGroup(v as AgeGroup)}>
            <SelectTrigger className="w-[110px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="10S">10대</SelectItem>
              <SelectItem value="20S">20대</SelectItem>
              <SelectItem value="30S">30대</SelectItem>
              <SelectItem value="40S">40대</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">가입일자</Label>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">직접 검색</Label>
          <div className="flex items-center gap-2">
            <Select value={searchType} onValueChange={setSearchType}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">이름</SelectItem>
                <SelectItem value="email">이메일</SelectItem>
                <SelectItem value="phone">휴대폰번호</SelectItem>
              </SelectContent>
            </Select>
            <Input
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="검색어 입력"
              className="w-[180px]"
            />
          </div>
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
              <th className="px-4 py-3">이름</th>
              <th className="px-4 py-3">국적</th>
              <th className="px-4 py-3">이메일</th>
              <th className="px-4 py-3">휴대폰</th>
              <th className="px-4 py-3 text-center">가입경로</th>
              <th className="px-4 py-3 text-center">가입일</th>
              <th className="px-4 py-3 text-center">상태</th>
              <th className="px-4 py-3 text-center w-[160px]">관리</th>
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
              data.content.map((member, idx) => {
                const statusConfig = STATUS_CONFIG[member.status];
                return (
                  <tr
                    key={member.id}
                    className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                  >
                    <td className="px-4 py-3 text-center text-gray-500">
                      {page * (data?.size ?? 20) + idx + 1}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{member.name}</td>
                    <td className="px-4 py-3 text-gray-600">{member.nationality}</td>
                    <td className="px-4 py-3 text-gray-600">{member.email}</td>
                    <td className="px-4 py-3 text-gray-600">{member.phone}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="outline">
                        {PROVIDER_LABELS[member.signUpProvider] ?? member.signUpProvider}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500">{member.signUpDate}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button size="sm" variant="ghost" title="상세보기">
                          <Eye size={14} />
                        </Button>
                        {member.status === "ACTIVE" && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-orange-500 hover:text-orange-700"
                              onClick={() => handleBlock(member.id)}
                              title="차단"
                            >
                              <ShieldOff size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleWithdraw(member.id)}
                              title="탈퇴"
                            >
                              <UserMinus size={14} />
                            </Button>
                          </>
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
    </div>
  );
}
