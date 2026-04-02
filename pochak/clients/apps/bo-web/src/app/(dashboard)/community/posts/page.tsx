"use client";

import React, { useState } from "react";
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
import { Search, Trash2, Eye, Pin } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────

type PostType = "NEWS" | "JOB" | "RECRUIT" | "FREE";

interface CommunityPost {
  id: number;
  postType: PostType;
  title: string;
  organizationName: string;
  authorName: string;
  region: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isPinned: boolean;
  createdAt: string;
}

// ── Constants ────────────────────────────────────────────────────────

const POST_TYPE_LABELS: Record<PostType, string> = {
  NEWS: "소식",
  JOB: "구인",
  RECRUIT: "모집",
  FREE: "자유",
};

const POST_TYPE_VARIANTS: Record<PostType, "info" | "warning" | "success" | "secondary"> = {
  NEWS: "info",
  JOB: "warning",
  RECRUIT: "success",
  FREE: "secondary",
};

// ── Mock Data ────────────────────────────────────────────────────────

const MOCK_POSTS: CommunityPost[] = [
  {
    id: 1, postType: "NEWS", title: "2026 봄 시즌 회원 모집 안내",
    organizationName: "서울오픈농구모임", authorName: "김민수", region: "서울 마포구",
    viewCount: 342, likeCount: 28, commentCount: 12, isPinned: true, createdAt: "2026-03-20",
  },
  {
    id: 2, postType: "JOB", title: "유소년 축구 코치 모집합니다",
    organizationName: "대한축구협회", authorName: "이수진", region: "서울 강남구",
    viewCount: 189, likeCount: 15, commentCount: 8, isPinned: false, createdAt: "2026-03-19",
  },
  {
    id: 3, postType: "RECRUIT", title: "주말 풋살 멤버 구합니다 (경기 수원)",
    organizationName: "시립풋살장", authorName: "박정호", region: "경기 수원시",
    viewCount: 256, likeCount: 32, commentCount: 21, isPinned: false, createdAt: "2026-03-18",
  },
  {
    id: 4, postType: "FREE", title: "지난 주말 경기 후기 공유합니다",
    organizationName: "FC강남 본점", authorName: "최예린", region: "서울 강남구",
    viewCount: 128, likeCount: 9, commentCount: 5, isPinned: false, createdAt: "2026-03-17",
  },
  {
    id: 5, postType: "NEWS", title: "구장 시설 보수 공지 (3/25~3/28)",
    organizationName: "구민체육관", authorName: "정태우", region: "서울 강남구",
    viewCount: 412, likeCount: 3, commentCount: 2, isPinned: true, createdAt: "2026-03-16",
  },
  {
    id: 6, postType: "RECRUIT", title: "배구 동호회 신규 회원 모집",
    organizationName: "부산비치발리볼클럽", authorName: "한지은", region: "부산 해운대구",
    viewCount: 95, likeCount: 7, commentCount: 3, isPinned: false, createdAt: "2026-03-15",
  },
  {
    id: 7, postType: "JOB", title: "야구 심판 아르바이트 구합니다",
    organizationName: "공공야구장", authorName: "오성민", region: "서울 송파구",
    viewCount: 167, likeCount: 11, commentCount: 6, isPinned: false, createdAt: "2026-03-14",
  },
  {
    id: 8, postType: "FREE", title: "농구화 추천 부탁드립니다",
    organizationName: "서울오픈농구모임", authorName: "윤서현", region: "서울 마포구",
    viewCount: 78, likeCount: 22, commentCount: 14, isPinned: false, createdAt: "2026-03-13",
  },
];

// ── Page Component ───────────────────────────────────────────────────

export default function CommunityPostsPage() {
  const [posts] = useState<CommunityPost[]>(MOCK_POSTS);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [regionFilter, setRegionFilter] = useState("ALL");
  const [orgKeyword, setOrgKeyword] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const filteredPosts = posts.filter((p) => {
    if (typeFilter !== "ALL" && p.postType !== typeFilter) return false;
    if (regionFilter !== "ALL" && p.region !== regionFilter) return false;
    if (orgKeyword && !p.organizationName.includes(orgKeyword)) return false;
    if (dateFrom && p.createdAt < dateFrom) return false;
    if (dateTo && p.createdAt > dateTo) return false;
    return true;
  });

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredPosts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredPosts.map((p) => p.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    alert(`${selectedIds.size}개의 게시물이 삭제되었습니다.`);
    setSelectedIds(new Set());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">게시물 관리</h1>
        {selectedIds.size > 0 && (
          <Button variant="destructive" onClick={handleBulkDelete}>
            <Trash2 size={16} className="mr-1.5" />
            일괄 삭제 ({selectedIds.size})
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 bg-white p-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">유형</Label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="NEWS">소식</SelectItem>
              <SelectItem value="JOB">구인</SelectItem>
              <SelectItem value="RECRUIT">모집</SelectItem>
              <SelectItem value="FREE">자유</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">지역 (시/군/구)</Label>
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="서울 강남구">서울 강남구</SelectItem>
              <SelectItem value="서울 마포구">서울 마포구</SelectItem>
              <SelectItem value="서울 송파구">서울 송파구</SelectItem>
              <SelectItem value="경기 수원시">경기 수원시</SelectItem>
              <SelectItem value="부산 해운대구">부산 해운대구</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">단체명</Label>
          <Input
            value={orgKeyword}
            onChange={(e) => setOrgKeyword(e.target.value)}
            placeholder="단체명 검색"
            className="w-[160px]"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">작성일 (기간)</Label>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-[140px]"
            />
            <span className="text-gray-400">~</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-[140px]"
            />
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => {
            setTypeFilter("ALL");
            setRegionFilter("ALL");
            setOrgKeyword("");
            setDateFrom("");
            setDateTo("");
          }}
        >
          초기화
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
              <th className="px-4 py-3 text-center w-[40px]">
                <Checkbox
                  checked={selectedIds.size === filteredPosts.length && filteredPosts.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </th>
              <th className="px-4 py-3 text-center w-[60px]">NO</th>
              <th className="px-4 py-3 text-center">유형</th>
              <th className="px-4 py-3">제목</th>
              <th className="px-4 py-3">단체명</th>
              <th className="px-4 py-3">작성자</th>
              <th className="px-4 py-3">지역</th>
              <th className="px-4 py-3 text-center">조회수</th>
              <th className="px-4 py-3 text-center">좋아요</th>
              <th className="px-4 py-3 text-center">댓글수</th>
              <th className="px-4 py-3 text-center">고정</th>
              <th className="px-4 py-3">등록일</th>
              <th className="px-4 py-3 text-center w-[100px]">관리</th>
            </tr>
          </thead>
          <tbody>
            {filteredPosts.length === 0 ? (
              <tr>
                <td colSpan={13} className="px-4 py-12 text-center text-gray-400">
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              filteredPosts.map((post, idx) => (
                <tr
                  key={post.id}
                  className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${idx % 2 === 1 ? "bg-gray-50/50" : ""}`}
                >
                  <td className="px-4 py-3 text-center">
                    <Checkbox
                      checked={selectedIds.has(post.id)}
                      onCheckedChange={() => toggleSelect(post.id)}
                    />
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500">{idx + 1}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={POST_TYPE_VARIANTS[post.postType]}>
                      {POST_TYPE_LABELS[post.postType]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {post.isPinned && <Pin size={12} className="inline mr-1 text-blue-500" />}
                    {post.title}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{post.organizationName}</td>
                  <td className="px-4 py-3 text-gray-600">{post.authorName}</td>
                  <td className="px-4 py-3 text-gray-500">{post.region}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{post.viewCount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{post.likeCount}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{post.commentCount}</td>
                  <td className="px-4 py-3 text-center">
                    {post.isPinned ? (
                      <Badge variant="info" className="text-xs">고정</Badge>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{post.createdAt}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => alert(`게시물 상세: ${post.title}`)}
                        title="상세"
                      >
                        <Eye size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => alert(`게시물 삭제: ${post.title}`)}
                        title="삭제"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
