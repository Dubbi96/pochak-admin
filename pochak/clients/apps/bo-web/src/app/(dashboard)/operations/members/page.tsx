"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminApi as adminRbacApi, type AdminMember } from "@/services/admin-api";
import { adminApi } from "@/lib/api-client";
import { Plus, Search, Pencil, Trash2, ShieldOff, ShieldCheck } from "lucide-react";

// ── Modal ───────────────────────────────────────────────────────────

function MemberModal({
  member,
  onClose,
  onSave,
}: {
  member: AdminMember | null;
  onClose: () => void;
  onSave: (data: { loginId: string; name: string; phone: string; email: string; password?: string }) => void;
}) {
  const isEdit = !!member;
  const [form, setForm] = useState({
    loginId: member?.loginId ?? "",
    name: member?.name ?? "",
    phone: member?.phone ?? "",
    email: member?.email ?? "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-bold text-gray-900">
          {isEdit ? "멤버 수정" : "멤버 등록"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>아이디</Label>
            <Input
              value={form.loginId}
              onChange={(e) => setForm({ ...form, loginId: e.target.value })}
              disabled={isEdit}
              required
            />
          </div>
          <div>
            <Label>비밀번호{isEdit && " (변경 시 입력)"}</Label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required={!isEdit}
            />
          </div>
          <div>
            <Label>이름</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>연락처</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="010-0000-0000"
            />
          </div>
          <div>
            <Label>이메일</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit">{isEdit ? "수정" : "등록"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────

export default function MembersPage() {
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminMember | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Try real API first, fall back to mock
      // TODO(Phase 4B): remove mock fallback once backend is stable
      const apiParams: Record<string, string> = {};
      if (search) apiParams.keyword = search;

      const apiResult = await adminApi.get<AdminMember[]>(
        "/admin/api/v1/operations/members",
        apiParams
      );
      if (apiResult) {
        setMembers(apiResult);
        return;
      }

      // Mock fallback
      const data = await adminRbacApi.members.list(search || undefined);
      setMembers(data);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = () => {
    setEditTarget(null);
    setModalOpen(true);
  };

  const handleEdit = (m: AdminMember) => {
    setEditTarget(m);
    setModalOpen(true);
  };

  const handleSave = async (data: { loginId: string; name: string; phone: string; email: string }) => {
    try {
      if (editTarget) {
        await adminRbacApi.members.update(editTarget.id, data);
      } else {
        await adminRbacApi.members.create(data);
      }
      setModalOpen(false);
      setEditTarget(null);
      load();
    } catch (err) {
      console.error("[OperationMembers] Failed to save member:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      await adminRbacApi.members.delete(id);
      load();
    } catch (err) {
      console.error("[OperationMembers] Failed to delete member:", err);
    }
  };

  const handleToggleBlock = async (m: AdminMember) => {
    const action = m.isBlocked ? "해제" : "차단";
    if (!confirm(`이 멤버를 ${action}하시겠습니까?`)) return;
    try {
      if (m.isBlocked) {
        await adminRbacApi.members.unblock(m.id);
      } else {
        await adminRbacApi.members.block(m.id);
      }
      load();
    } catch (err) {
      console.error("[OperationMembers] Failed to toggle block:", err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">멤버관리</h1>
        <Button onClick={handleCreate}>
          <Plus size={16} className="mr-1" />
          등록
        </Button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-3">
        <Search size={16} className="text-gray-400" />
        <Input
          placeholder="아이디, 이름, 연락처 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm border-0 shadow-none focus-visible:ring-0"
        />
        <Button size="sm" variant="secondary" onClick={load}>
          검색
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full table-fixed text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="w-[60px] whitespace-nowrap px-4 py-3 font-medium text-gray-500">NO</th>
              <th className="w-[150px] whitespace-nowrap px-4 py-3 font-medium text-gray-500">아이디</th>
              <th className="w-[120px] whitespace-nowrap px-4 py-3 font-medium text-gray-500">멤버 이름</th>
              <th className="w-[140px] whitespace-nowrap px-4 py-3 font-medium text-gray-500">연락처</th>
              <th className="w-[160px] whitespace-nowrap px-4 py-3 font-medium text-gray-500">최근 접속일</th>
              <th className="w-[100px] whitespace-nowrap px-4 py-3 font-medium text-gray-500">차단상태</th>
              <th className="w-[100px] whitespace-nowrap px-4 py-3 font-medium text-gray-500">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  로딩 중...
                </td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              members.map((m, idx) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{m.loginId}</td>
                  <td className="px-4 py-3 text-gray-700">{m.name}</td>
                  <td className="px-4 py-3 text-gray-700">{m.phone}</td>
                  <td className="px-4 py-3 text-gray-500">{m.lastAccessAt ?? "-"}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleBlock(m)}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        m.isBlocked
                          ? "bg-red-50 text-red-700 hover:bg-red-100"
                          : "bg-green-50 text-green-700 hover:bg-green-100"
                      }`}
                    >
                      {m.isBlocked ? (
                        <>
                          <ShieldOff size={12} /> 차단
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={12} /> 정상
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(m)}>
                        <Pencil size={14} />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(m.id)}>
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

      {/* Modal */}
      {modalOpen && (
        <MemberModal
          member={editTarget}
          onClose={() => {
            setModalOpen(false);
            setEditTarget(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
