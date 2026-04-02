"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminApi as adminRbacApi, type FunctionItem } from "@/services/admin-api";
import { adminApi } from "@/lib/api-client";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";

// ── Modal ───────────────────────────────────────────────────────────

function FunctionModal({
  item,
  onClose,
  onSave,
}: {
  item: FunctionItem | null;
  onClose: () => void;
  onSave: (data: Omit<FunctionItem, "id">) => void;
}) {
  const isEdit = !!item;
  const [form, setForm] = useState({
    code: item?.code ?? "",
    name: item?.name ?? "",
    controllerName: item?.controllerName ?? "",
    description: item?.description ?? "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-bold text-gray-900">
          {isEdit ? "세부기능 수정" : "세부기능 등록"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>코드</Label>
            <Input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="FUNCTION_CODE"
              required
            />
          </div>
          <div>
            <Label>Function명</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Controller명</Label>
            <Input
              value={form.controllerName}
              onChange={(e) => setForm({ ...form, controllerName: e.target.value })}
            />
          </div>
          <div>
            <Label>설명</Label>
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
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

export default function FeaturesPage() {
  const [items, setItems] = useState<FunctionItem[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<FunctionItem | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const apiParams: Record<string, string> = {};
      if (search) apiParams.keyword = search;

      const apiResult = await adminApi.get<FunctionItem[]>(
        "/admin/api/v1/operations/functions",
        apiParams
      );
      if (apiResult) {
        setItems(apiResult);
      }
    } catch {
      /* API error - data remains in initial empty state */
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

  const handleEdit = (item: FunctionItem) => {
    setEditTarget(item);
    setModalOpen(true);
  };

  const handleSave = async (data: Omit<FunctionItem, "id">) => {
    if (editTarget) {
      await adminRbacApi.functions.update(editTarget.id, data);
    } else {
      await adminRbacApi.functions.create(data);
    }
    setModalOpen(false);
    setEditTarget(null);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await adminRbacApi.functions.delete(id);
    load();
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">세부기능관리</h1>
        <Button onClick={handleCreate}>
          <Plus size={16} className="mr-1" />
          등록
        </Button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-3">
        <Search size={16} className="text-gray-400" />
        <Input
          placeholder="코드, Function명 검색"
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
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-500">NO</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-500">아이디</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-500">코드</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-500">Function명</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-500">Controller명</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-500">설명</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-500">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  로딩 중...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              items.map((item, idx) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{item.id}</td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-700">
                      {item.code}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{item.name}</td>
                  <td className="px-4 py-3 text-gray-500">{item.controllerName}</td>
                  <td className="px-4 py-3 text-gray-500">{item.description}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}>
                        <Pencil size={14} />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(item.id)}>
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
        <FunctionModal
          item={editTarget}
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
