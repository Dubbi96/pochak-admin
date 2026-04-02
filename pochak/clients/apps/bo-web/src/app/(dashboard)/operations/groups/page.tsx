"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminApi as adminRbacApi, type GroupNode, type GroupDetail, type AdminMember, type RoleItem } from "@/services/admin-api";
import { adminApi } from "@/lib/api-client";
import { ChevronDown, ChevronRight, FolderOpen, Folder, Plus, Save, Trash2, Search } from "lucide-react";

// ── Tree Item ───────────────────────────────────────────────────────

function TreeItem({
  node,
  depth,
  selectedId,
  onSelect,
}: {
  node: GroupNode;
  depth: number;
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children.length > 0;
  const isSelected = node.id === selectedId;

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
        {expanded && hasChildren ? (
          <FolderOpen size={14} className="shrink-0 text-amber-500" />
        ) : (
          <Folder size={14} className="shrink-0 text-gray-400" />
        )}
        <button
          type="button"
          onClick={() => onSelect(node.id)}
          className="min-w-0 flex-1 truncate text-left"
        >
          {node.name}
        </button>
      </div>
      {expanded &&
        node.children.map((child) => (
          <TreeItem key={child.id} node={child} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} />
        ))}
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────

export default function GroupsPage() {
  const [tree, setTree] = useState<GroupNode[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<GroupDetail | null>(null);
  const [allMembers, setAllMembers] = useState<AdminMember[]>([]);
  const [allRoles, setAllRoles] = useState<RoleItem[]>([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [assignedMemberIds, setAssignedMemberIds] = useState<Set<number>>(new Set());
  const [assignedRoleIds, setAssignedRoleIds] = useState<Set<number>>(new Set());
  const [form, setForm] = useState({ name: "", code: "", description: "" });

  const loadTree = useCallback(async () => {
    // Try real API first, fall back to mock
    // TODO(Phase 4B): remove mock fallback once backend is stable
    const apiResult = await adminApi.get<GroupNode[]>("/admin/api/v1/operations/groups/tree");
    if (apiResult) {
      setTree(apiResult);
      return;
    }
    const data = await adminRbacApi.groups.tree();
    setTree(data);
  }, []);

  useEffect(() => {
    loadTree();
    adminRbacApi.members.list().then(setAllMembers);
    adminRbacApi.roles.list().then(setAllRoles);
  }, [loadTree]);

  useEffect(() => {
    if (selectedId === null) {
      setDetail(null);
      return;
    }
    adminRbacApi.groups.detail(selectedId).then((d) => {
      setDetail(d);
      setForm({ name: d.name, code: d.code, description: d.description });
      setAssignedMemberIds(new Set(d.memberIds));
      setAssignedRoleIds(new Set(d.roleIds));
    });
  }, [selectedId]);

  const handleSave = async () => {
    if (!detail) return;
    await adminRbacApi.groups.update(detail.id, form);
    await adminRbacApi.groups.assignMembers(detail.id, Array.from(assignedMemberIds));
    await adminRbacApi.groups.assignRoles(detail.id, Array.from(assignedRoleIds));
    alert("저장되었습니다.");
    loadTree();
  };

  const handleDelete = async () => {
    if (!detail) return;
    if (!confirm(`"${detail.name}" 그룹을 삭제하시겠습니까?`)) return;
    await adminRbacApi.groups.delete(detail.id);
    setSelectedId(null);
    setDetail(null);
    loadTree();
  };

  const handleAddChild = async () => {
    if (selectedId === null) return;
    const name = prompt("새 하위 그룹 이름을 입력하세요.");
    if (!name) return;
    const code = name.toUpperCase().replace(/\s+/g, "_");
    await adminRbacApi.groups.create({ name, code, description: "", parentId: selectedId });
    loadTree();
  };

  const toggleMember = (id: number) => {
    setAssignedMemberIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleRole = (id: number) => {
    setAssignedRoleIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredMembers = allMembers.filter(
    (m) =>
      !memberSearch ||
      m.name.includes(memberSearch) ||
      m.loginId.toLowerCase().includes(memberSearch.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">그룹관리</h1>
      </div>

      <div className="flex gap-4">
        {/* Left Panel - Tree */}
        <div className="w-72 shrink-0 rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-700">그룹 목록</h2>
            <Button size="sm" variant="ghost" onClick={handleAddChild} disabled={selectedId === null} title="하위 그룹 추가">
              <Plus size={14} />
            </Button>
          </div>
          <div className="max-h-[calc(100vh-240px)] overflow-y-auto p-2">
            {tree.map((node) => (
              <TreeItem key={node.id} node={node} depth={0} selectedId={selectedId} onSelect={setSelectedId} />
            ))}
          </div>
        </div>

        {/* Right Panel - Detail */}
        <div className="min-w-0 flex-1 space-y-4">
          {!detail ? (
            <div className="flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400">
              좌측에서 그룹을 선택하세요.
            </div>
          ) : (
            <>
              {/* Group Detail */}
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-700">그룹 상세 정보</h2>
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
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label>그룹명</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div>
                    <Label>코드</Label>
                    <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>설명</Label>
                    <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* Member Assignment */}
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <h2 className="mb-3 text-sm font-semibold text-gray-700">멤버 할당</h2>
                <div className="mb-2 flex items-center gap-2">
                  <Search size={14} className="text-gray-400" />
                  <Input
                    placeholder="멤버 검색 (이름, 아이디)"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="max-w-xs"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto rounded border border-gray-100">
                  {filteredMembers.map((m) => (
                    <label
                      key={m.id}
                      className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={assignedMemberIds.has(m.id)}
                        onChange={() => toggleMember(m.id)}
                        className="h-4 w-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span className="font-medium text-gray-700">{m.name}</span>
                      <span className="text-gray-400">({m.loginId})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Role Assignment */}
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <h2 className="mb-3 text-sm font-semibold text-gray-700">권한 할당</h2>
                <div className="max-h-48 overflow-y-auto rounded border border-gray-100">
                  {allRoles.map((r) => (
                    <label
                      key={r.id}
                      className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={assignedRoleIds.has(r.id)}
                        onChange={() => toggleRole(r.id)}
                        className="h-4 w-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span className="font-medium text-gray-700">{r.name}</span>
                      <span className="text-gray-400">({r.code})</span>
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
