"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  adminApi as adminRbacApi,
  type RoleItem,
  type RoleDetail,
  type MenuNode,
  type FunctionItem,
} from "@/services/admin-api";
import { adminApi } from "@/lib/api-client";
import { Shield, Plus, Save, Trash2, ChevronDown, ChevronRight } from "lucide-react";

// ── Menu Tree Checkbox ──────────────────────────────────────────────

function MenuCheckTree({
  nodes,
  depth,
  checked,
  onToggle,
}: {
  nodes: MenuNode[];
  depth: number;
  checked: Set<number>;
  onToggle: (id: number) => void;
}) {
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set(nodes.map((n) => n.id)));

  const toggle = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <>
      {nodes.map((node) => {
        const hasChildren = node.children.length > 0;
        const isExpanded = expanded.has(node.id);

        return (
          <div key={node.id}>
            <div
              className="flex items-center gap-1.5 py-1 text-sm"
              style={{ paddingLeft: `${depth * 20 + 4}px` }}
            >
              {hasChildren ? (
                <button onClick={() => toggle(node.id)} className="p-0.5 text-gray-400 hover:text-gray-600">
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
              ) : (
                <span className="w-5" />
              )}
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={checked.has(node.id)}
                  onChange={() => onToggle(node.id)}
                  className="h-4 w-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-gray-700">{node.name}</span>
                <span className="text-xs text-gray-400">({node.code})</span>
              </label>
            </div>
            {hasChildren && isExpanded && (
              <MenuCheckTree nodes={node.children} depth={depth + 1} checked={checked} onToggle={onToggle} />
            )}
          </div>
        );
      })}
    </>
  );
}

// ── Page ────────────────────────────────────────────────────────────

export default function PermissionsPage() {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<RoleDetail | null>(null);
  const [form, setForm] = useState({ name: "", code: "", description: "" });
  const [menuTree, setMenuTree] = useState<MenuNode[]>([]);
  const [functions, setFunctions] = useState<FunctionItem[]>([]);
  const [checkedMenus, setCheckedMenus] = useState<Set<number>>(new Set());
  const [checkedFunctions, setCheckedFunctions] = useState<Set<number>>(new Set());

  const loadRoles = useCallback(async () => {
    // Try real API first, fall back to mock
    // TODO(Phase 4B): remove mock fallback once backend is stable
    const apiResult = await adminApi.get<RoleItem[]>("/admin/api/v1/operations/roles");
    if (apiResult) {
      setRoles(apiResult);
      return;
    }
    const data = await adminRbacApi.roles.list();
    setRoles(data);
  }, []);

  useEffect(() => {
    loadRoles();
    adminRbacApi.menus.tree().then(setMenuTree);
    adminRbacApi.functions.list().then(setFunctions);
  }, [loadRoles]);

  useEffect(() => {
    if (selectedId === null) {
      setDetail(null);
      return;
    }
    adminRbacApi.roles.detail(selectedId).then((d) => {
      setDetail(d);
      setForm({ name: d.name, code: d.code, description: d.description });
      setCheckedMenus(new Set(d.menuIds));
      setCheckedFunctions(new Set(d.functionIds));
    });
  }, [selectedId]);

  const handleSave = async () => {
    if (!detail) return;
    await adminRbacApi.roles.update(detail.id, form);
    await adminRbacApi.roles.assignMenus(detail.id, Array.from(checkedMenus));
    await adminRbacApi.roles.assignFunctions(detail.id, Array.from(checkedFunctions));
    alert("저장되었습니다.");
    loadRoles();
  };

  const handleDelete = async () => {
    if (!detail) return;
    if (!confirm(`"${detail.name}" 권한을 삭제하시겠습니까?`)) return;
    await adminRbacApi.roles.delete(detail.id);
    setSelectedId(null);
    setDetail(null);
    loadRoles();
  };

  const handleCreate = async () => {
    const name = prompt("새 권한 이름을 입력하세요.");
    if (!name) return;
    const code = name.toUpperCase().replace(/\s+/g, "_");
    await adminRbacApi.roles.create({ name, code, description: "" });
    loadRoles();
  };

  const toggleMenu = (id: number) => {
    setCheckedMenus((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleFunction = (id: number) => {
    setCheckedFunctions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">권한관리</h1>
      </div>

      <div className="flex gap-4">
        {/* Left Panel - Role List */}
        <div className="w-64 shrink-0 rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-700">권한 목록</h2>
            <Button size="sm" variant="ghost" onClick={handleCreate}>
              <Plus size={14} />
            </Button>
          </div>
          <div className="max-h-[calc(100vh-240px)] overflow-y-auto p-2">
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedId(r.id)}
                className={`flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm transition-colors hover:bg-gray-100 ${
                  r.id === selectedId ? "bg-emerald-50 font-medium text-emerald-700" : "text-gray-700"
                }`}
              >
                <Shield size={14} className={r.id === selectedId ? "text-emerald-500" : "text-gray-400"} />
                {r.name}
              </button>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="min-w-0 flex-1 space-y-4">
          {!detail ? (
            <div className="flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400">
              좌측에서 권한을 선택하세요.
            </div>
          ) : (
            <>
              {/* Role Detail */}
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-700">역할 상세 정보</h2>
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
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <Label>권한명</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div>
                    <Label>코드</Label>
                    <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
                  </div>
                  <div>
                    <Label>설명</Label>
                    <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* Menu Access */}
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <h2 className="mb-3 text-sm font-semibold text-gray-700">메뉴 접근 권한</h2>
                <div className="max-h-72 overflow-y-auto rounded border border-gray-100 p-2">
                  <MenuCheckTree nodes={menuTree} depth={0} checked={checkedMenus} onToggle={toggleMenu} />
                </div>
              </div>

              {/* Function Permissions */}
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <h2 className="mb-3 text-sm font-semibold text-gray-700">세부 기능 권한</h2>
                <div className="max-h-64 overflow-y-auto rounded border border-gray-100">
                  {functions.map((fn) => (
                    <label
                      key={fn.id}
                      className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={checkedFunctions.has(fn.id)}
                        onChange={() => toggleFunction(fn.id)}
                        className="h-4 w-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span className="font-medium text-gray-700">{fn.name}</span>
                      <span className="text-xs text-gray-400">({fn.code})</span>
                      <span className="ml-auto text-xs text-gray-400">{fn.controllerName}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
