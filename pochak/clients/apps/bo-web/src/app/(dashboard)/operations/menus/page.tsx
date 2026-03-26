"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminApi as adminRbacApi, type MenuNode, type MenuDetail } from "@/services/admin-api";
import { adminApi } from "@/lib/api-client";
import { ChevronDown, ChevronRight, FolderOpen, Folder, FileText, Plus, Save, Trash2 } from "lucide-react";

// ── Tree Item ───────────────────────────────────────────────────────

function MenuTreeItem({
  node,
  depth,
  selectedId,
  onSelect,
}: {
  node: MenuNode;
  depth: number;
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  const [expanded, setExpanded] = useState(depth < 1);
  const hasChildren = node.children.length > 0;
  const isSelected = node.id === selectedId;

  const icon =
    node.type === "DIRECTORY" ? (
      expanded && hasChildren ? (
        <FolderOpen size={14} className="text-amber-500" />
      ) : (
        <Folder size={14} className="text-gray-400" />
      )
    ) : (
      <FileText size={14} className="text-blue-400" />
    );

  return (
    <div>
      <div
        className={`flex w-full items-center gap-1.5 rounded px-2 py-1.5 text-sm transition-colors hover:bg-gray-100 ${
          isSelected ? "bg-emerald-50 font-medium text-emerald-700" : "text-gray-700"
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="shrink-0 rounded p-0.5 hover:bg-gray-200"
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        <span className="shrink-0">{icon}</span>
        <button
          type="button"
          onClick={() => onSelect(node.id)}
          className="min-w-0 flex-1 truncate text-left"
        >
          {node.name}
        </button>
        <span className="ml-auto text-xs text-gray-400">{node.displayOrder}</span>
      </div>
      {expanded &&
        node.children.map((child) => (
          <MenuTreeItem key={child.id} node={child} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} />
        ))}
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────

export default function MenusPage() {
  const [tree, setTree] = useState<MenuNode[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<MenuDetail | null>(null);
  const [form, setForm] = useState({
    name: "",
    code: "",
    type: "PAGE" as MenuDetail["type"],
    url: "",
    icon: "",
    displayOrder: 0,
    i18nLabel: "",
  });

  const loadTree = useCallback(async () => {
    // Try real API first, fall back to mock
    // TODO(Phase 4B): remove mock fallback once backend is stable
    const apiResult = await adminApi.get<MenuNode[]>("/admin/api/v1/operations/menus/tree");
    if (apiResult) {
      setTree(apiResult);
      return;
    }
    const data = await adminRbacApi.menus.tree();
    setTree(data);
  }, []);

  useEffect(() => {
    loadTree();
  }, [loadTree]);

  useEffect(() => {
    if (selectedId === null) {
      setDetail(null);
      return;
    }
    adminRbacApi.menus.detail(selectedId).then((d) => {
      setDetail(d);
      setForm({
        name: d.name,
        code: d.code,
        type: d.type,
        url: d.url,
        icon: d.icon,
        displayOrder: d.displayOrder,
        i18nLabel: d.i18nLabel,
      });
    });
  }, [selectedId]);

  const handleSave = async () => {
    if (!detail) return;
    await adminRbacApi.menus.update(detail.id, { ...form, parentId: detail.parentId });
    alert("저장되었습니다.");
    loadTree();
  };

  const handleDelete = async () => {
    if (!detail) return;
    if (!confirm(`"${detail.name}" 메뉴를 삭제하시겠습니까?`)) return;
    await adminRbacApi.menus.delete(detail.id);
    setSelectedId(null);
    setDetail(null);
    loadTree();
  };

  const handleAddChild = async () => {
    if (selectedId === null) return;
    const name = prompt("새 하위 메뉴 이름을 입력하세요.");
    if (!name) return;
    const code = name.toUpperCase().replace(/\s+/g, "_");
    await adminRbacApi.menus.create({
      name,
      code,
      type: "PAGE",
      url: "",
      icon: "",
      displayOrder: 0,
      parentId: selectedId,
      i18nLabel: name,
    });
    loadTree();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">메뉴관리</h1>
      </div>

      <div className="flex gap-4">
        {/* Left Panel - Tree */}
        <div className="w-72 shrink-0 rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-700">CMS 메뉴 트리</h2>
            <Button size="sm" variant="ghost" onClick={handleAddChild} disabled={selectedId === null} title="하위 메뉴 추가">
              <Plus size={14} />
            </Button>
          </div>
          <div className="max-h-[calc(100vh-240px)] overflow-y-auto p-2">
            {tree.map((node) => (
              <MenuTreeItem key={node.id} node={node} depth={0} selectedId={selectedId} onSelect={setSelectedId} />
            ))}
          </div>
        </div>

        {/* Right Panel - Detail */}
        <div className="min-w-0 flex-1">
          {!detail ? (
            <div className="flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400">
              좌측에서 메뉴를 선택하세요.
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-700">메뉴 상세</h2>
                <div className="flex gap-2">
                  <Button size="sm" variant="destructive" onClick={handleDelete}>
                    <Trash2 size={14} className="mr-1" />
                    삭제
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save size={14} className="mr-1" />
                    저장
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>메뉴 타입</Label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as MenuDetail["type"] })}
                    className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
                  >
                    <option value="DIRECTORY">디렉토리</option>
                    <option value="PAGE">페이지</option>
                    <option value="LINK">링크</option>
                  </select>
                </div>
                <div>
                  <Label>메뉴 코드</Label>
                  <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
                </div>
                <div>
                  <Label>메뉴명</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <Label>언어 값 (i18n)</Label>
                  <Input value={form.i18nLabel} onChange={(e) => setForm({ ...form, i18nLabel: e.target.value })} />
                </div>
                <div>
                  <Label>매핑 URL</Label>
                  <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="/path" />
                </div>
                <div>
                  <Label>아이콘</Label>
                  <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="lucide icon name" />
                </div>
                <div>
                  <Label>표시 순서</Label>
                  <Input
                    type="number"
                    value={form.displayOrder}
                    onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>상위 메뉴 ID</Label>
                  <Input value={detail.parentId ?? "없음 (최상위)"} disabled />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
