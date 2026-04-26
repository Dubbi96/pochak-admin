/**
 * Admin RBAC API — calls admin-service via gateway (/api/v1/admin/** → /admin/api/v1/**).
 */

import { gatewayApi } from "@/lib/api-client";

// ── Types ──────────────────────────────────────────────────────────

export interface AdminMember {
  id: number;
  loginId: string;
  name: string;
  phone: string;
  email: string;
  lastAccessAt: string | null;
  isBlocked: boolean;
  createdAt: string;
}

export interface GroupNode {
  id: number;
  name: string;
  code: string;
  description: string;
  parentId: number | null;
  children: GroupNode[];
}

export interface GroupDetail {
  id: number;
  name: string;
  code: string;
  description: string;
  parentId: number | null;
  memberIds: number[];
  roleIds: number[];
}

export interface RoleItem {
  id: number;
  name: string;
  code: string;
  description: string;
}

export interface RoleDetail extends RoleItem {
  menuIds: number[];
  functionIds: number[];
}

export interface MenuNode {
  id: number;
  name: string;
  code: string;
  type: "DIRECTORY" | "PAGE" | "LINK";
  url: string;
  icon: string;
  displayOrder: number;
  parentId: number | null;
  children: MenuNode[];
}

export interface MenuDetail {
  id: number;
  name: string;
  code: string;
  type: "DIRECTORY" | "PAGE" | "LINK";
  url: string;
  icon: string;
  displayOrder: number;
  parentId: number | null;
  i18nLabel: string;
}

export interface FunctionItem {
  id: number;
  code: string;
  name: string;
  controllerName: string;
  description: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiGroupTree = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiMenuTree = any;

function mapGroupNode(api: ApiGroupTree): GroupNode {
  return {
    id: api.id,
    name: api.groupName ?? api.name ?? "",
    code: api.groupCode ?? api.code ?? "",
    description: api.description ?? "",
    parentId: api.parentId ?? null,
    children: (api.children ?? []).map(mapGroupNode),
  };
}

function collectMenuIds(node: ApiMenuTree): number[] {
  if (!node) return [];
  const self = node.id != null ? [node.id] : [];
  const kids = (node.children ?? []).flatMap(collectMenuIds);
  return [...self, ...kids];
}

function mapMenuNode(api: ApiMenuTree): MenuNode {
  return {
    id: api.id,
    name: api.menuName ?? api.name ?? "",
    code: api.menuCode ?? api.code ?? "",
    type: (api.menuType ?? api.type ?? "PAGE") as MenuNode["type"],
    url: api.menuPath ?? api.url ?? "",
    icon: api.iconName ?? api.icon ?? "",
    displayOrder: api.sortOrder ?? api.displayOrder ?? 0,
    parentId: api.parentId ?? null,
    children: (api.children ?? []).map(mapMenuNode),
  };
}

function mapAdminMember(api: Record<string, unknown>): AdminMember {
  return {
    id: Number(api.id),
    loginId: String(api.loginId ?? ""),
    name: String(api.name ?? ""),
    phone: String(api.phone ?? ""),
    email: String(api.email ?? ""),
    lastAccessAt: api.lastLoginAt ? String(api.lastLoginAt) : null,
    isBlocked: Boolean(api.isBlocked),
    createdAt: api.createdAt ? String(api.createdAt) : "",
  };
}

function mapRoleItem(api: Record<string, unknown>): RoleItem {
  return {
    id: Number(api.id),
    name: String(api.roleName ?? api.name ?? ""),
    code: String(api.roleCode ?? api.code ?? ""),
    description: String(api.description ?? ""),
  };
}

function mapFunctionItem(api: Record<string, unknown>): FunctionItem {
  const method = api.httpMethod ? String(api.httpMethod) : "";
  const pathStr = api.apiPath ? String(api.apiPath) : "";
  return {
    id: Number(api.id),
    code: String(api.functionCode ?? api.code ?? ""),
    name: String(api.functionName ?? api.name ?? ""),
    controllerName: [method, pathStr].filter(Boolean).join(" ") || pathStr,
    description: String(api.description ?? ""),
  };
}

// ── API Object ─────────────────────────────────────────────────────

export const adminApi = {
  members: {
    async list(_search?: string, page = 0, size = 200): Promise<AdminMember[]> {
      const params: Record<string, string> = {
        page: String(page),
        size: String(size),
      };
      const pageData = await gatewayApi.get<{
        content?: Record<string, unknown>[];
        number?: number;
      }>("/api/v1/admin/rbac/members", params);
      const rows = pageData.content ?? [];
      return rows.map(mapAdminMember);
    },
    async create(
      data: Omit<AdminMember, "id" | "lastAccessAt" | "isBlocked" | "createdAt"> & { password: string }
    ): Promise<AdminMember> {
      const body = {
        loginId: data.loginId,
        password: data.password,
        name: data.name,
        email: data.email || undefined,
        phone: data.phone || undefined,
      };
      const created = await gatewayApi.post<Record<string, unknown>>("/api/v1/admin/rbac/members", body);
      return mapAdminMember(created);
    },
    async update(
      id: number,
      data: Partial<Pick<AdminMember, "name" | "phone" | "email">> & { password?: string }
    ): Promise<AdminMember> {
      const body: Record<string, string | undefined> = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
      };
      const updated = await gatewayApi.put<Record<string, unknown>>(`/api/v1/admin/rbac/members/${id}`, body);
      return mapAdminMember(updated);
    },
    async delete(id: number): Promise<void> {
      await gatewayApi.delete(`/api/v1/admin/rbac/members/${id}`);
    },
    async block(id: number): Promise<void> {
      await gatewayApi.patch(`/api/v1/admin/rbac/members/${id}/block`);
    },
    async unblock(id: number): Promise<void> {
      await gatewayApi.patch(`/api/v1/admin/rbac/members/${id}/unblock`);
    },
  },

  groups: {
    async tree(): Promise<GroupNode[]> {
      const raw = await gatewayApi.get<ApiGroupTree[]>("/api/v1/admin/rbac/groups");
      return (raw ?? []).map(mapGroupNode);
    },
    async detail(id: number): Promise<GroupDetail> {
      const [g, memberRows, roleRows] = await Promise.all([
        gatewayApi.get<ApiGroupTree>(`/api/v1/admin/rbac/groups/${id}`),
        gatewayApi.get<Record<string, unknown>[]>(`/api/v1/admin/rbac/groups/${id}/members`),
        gatewayApi.get<Record<string, unknown>[]>(`/api/v1/admin/rbac/groups/${id}/roles`),
      ]);
      return {
        id: g.id,
        name: g.groupName ?? "",
        code: g.groupCode ?? "",
        description: g.description ?? "",
        parentId: g.parentId ?? null,
        memberIds: (memberRows ?? []).map((m) => Number(m.id)),
        roleIds: (roleRows ?? []).map((r) => Number(r.id)),
      };
    },
    async create(data: {
      name: string;
      code: string;
      description: string;
      parentId: number | null;
    }): Promise<GroupNode> {
      const body = {
        groupCode: data.code,
        groupName: data.name,
        description: data.description || undefined,
        parentId: data.parentId ?? undefined,
      };
      const created = await gatewayApi.post<ApiGroupTree>("/api/v1/admin/rbac/groups", body);
      return mapGroupNode(created);
    },
    async update(id: number, data: Partial<GroupDetail>): Promise<GroupDetail> {
      const body = {
        groupName: data.name,
        description: data.description,
      };
      await gatewayApi.put(`/api/v1/admin/rbac/groups/${id}`, body);
      return adminApi.groups.detail(id);
    },
    async delete(id: number): Promise<void> {
      await gatewayApi.delete(`/api/v1/admin/rbac/groups/${id}`);
    },
    async assignMembers(groupId: number, memberIds: number[]): Promise<void> {
      await gatewayApi.post(`/api/v1/admin/rbac/groups/${groupId}/members`, { memberIds });
    },
    async assignRoles(groupId: number, roleIds: number[]): Promise<void> {
      await gatewayApi.post(`/api/v1/admin/rbac/groups/${groupId}/roles`, { roleIds });
    },
    async removeMembers(groupId: number, memberIds: number[]): Promise<void> {
      if (memberIds.length === 0) return;
      await gatewayApi.deleteWithBody(`/api/v1/admin/rbac/groups/${groupId}/members`, { memberIds });
    },
    async removeRoles(groupId: number, roleIds: number[]): Promise<void> {
      if (roleIds.length === 0) return;
      await gatewayApi.deleteWithBody(`/api/v1/admin/rbac/groups/${groupId}/roles`, { roleIds });
    },
  },

  roles: {
    async list(): Promise<RoleItem[]> {
      const raw = await gatewayApi.get<Record<string, unknown>[]>("/api/v1/admin/rbac/roles");
      return (raw ?? []).map(mapRoleItem);
    },
    async detail(id: number): Promise<RoleDetail> {
      const r = await gatewayApi.get<Record<string, unknown> & { menus?: ApiMenuTree[]; functions?: Record<string, unknown>[] }>(
        `/api/v1/admin/rbac/roles/${id}`
      );
      const base = mapRoleItem(r);
      const menuIds = (r.menus ?? []).flatMap(collectMenuIds);
      const functionIds = (r.functions ?? []).map((f) => Number(f.id));
      return { ...base, menuIds, functionIds };
    },
    async create(data: Omit<RoleItem, "id">): Promise<RoleItem> {
      const body = {
        roleCode: data.code,
        roleName: data.name,
        description: data.description || undefined,
      };
      const created = await gatewayApi.post<Record<string, unknown>>("/api/v1/admin/rbac/roles", body);
      return mapRoleItem(created);
    },
    async update(id: number, data: Partial<RoleItem>): Promise<RoleItem> {
      const body = {
        roleName: data.name,
        description: data.description,
      };
      const updated = await gatewayApi.put<Record<string, unknown>>(`/api/v1/admin/rbac/roles/${id}`, body);
      return mapRoleItem(updated);
    },
    async delete(id: number): Promise<void> {
      await gatewayApi.delete(`/api/v1/admin/rbac/roles/${id}`);
    },
    async assignMenus(roleId: number, menuIds: number[]): Promise<void> {
      await gatewayApi.put(`/api/v1/admin/rbac/roles/${roleId}/menus`, { menuIds });
    },
    async assignFunctions(roleId: number, functionIds: number[]): Promise<void> {
      await gatewayApi.put(`/api/v1/admin/rbac/roles/${roleId}/functions`, { functionIds });
    },
  },

  menus: {
    async tree(): Promise<MenuNode[]> {
      const raw = await gatewayApi.get<ApiMenuTree[]>("/api/v1/admin/rbac/menus");
      return (raw ?? []).map(mapMenuNode);
    },
    async detail(id: number): Promise<MenuDetail> {
      const m = await gatewayApi.get<Record<string, unknown>>(`/api/v1/admin/rbac/menus/${id}`);
      return {
        id: Number(m.id),
        name: String(m.menuName ?? m.name ?? ""),
        code: String(m.menuCode ?? m.code ?? ""),
        type: (m.menuType ?? m.type ?? "PAGE") as MenuDetail["type"],
        url: String(m.menuPath ?? m.url ?? ""),
        icon: String(m.iconName ?? m.icon ?? ""),
        displayOrder: Number(m.sortOrder ?? m.displayOrder ?? 0),
        parentId: m.parentId != null ? Number(m.parentId) : null,
        i18nLabel: String(m.i18nLabel ?? m.menuName ?? ""),
      };
    },
    async create(data: Omit<MenuDetail, "id">): Promise<MenuDetail> {
      const body = {
        menuCode: data.code,
        menuName: data.name,
        menuPath: data.url || undefined,
        iconName: data.icon || undefined,
        parentId: data.parentId ?? undefined,
        sortOrder: data.displayOrder,
      };
      const created = await gatewayApi.post<Record<string, unknown>>("/api/v1/admin/rbac/menus", body);
      return adminApi.menus.detail(Number(created.id));
    },
    async update(id: number, data: Partial<MenuDetail>): Promise<MenuDetail> {
      const body = {
        menuName: data.name,
        menuPath: data.url,
        iconName: data.icon,
        sortOrder: data.displayOrder,
      };
      await gatewayApi.put(`/api/v1/admin/rbac/menus/${id}`, body);
      return adminApi.menus.detail(id);
    },
    async delete(id: number): Promise<void> {
      await gatewayApi.delete(`/api/v1/admin/rbac/menus/${id}`);
    },
  },

  functions: {
    async list(_search?: string): Promise<FunctionItem[]> {
      const raw = await gatewayApi.get<Record<string, unknown>[]>("/api/v1/admin/rbac/functions");
      return (raw ?? []).map(mapFunctionItem);
    },
    async create(data: Omit<FunctionItem, "id">): Promise<FunctionItem> {
      const body = {
        functionCode: data.code,
        functionName: data.name,
        apiPath: data.controllerName || undefined,
        description: data.description || undefined,
      };
      const created = await gatewayApi.post<Record<string, unknown>>("/api/v1/admin/rbac/functions", body);
      return mapFunctionItem(created);
    },
    async update(id: number, data: Partial<FunctionItem>): Promise<FunctionItem> {
      const body = {
        functionName: data.name,
        apiPath: data.controllerName,
        description: data.description,
      };
      const updated = await gatewayApi.put<Record<string, unknown>>(`/api/v1/admin/rbac/functions/${id}`, body);
      return mapFunctionItem(updated);
    },
    async delete(id: number): Promise<void> {
      await gatewayApi.delete(`/api/v1/admin/rbac/functions/${id}`);
    },
  },
};
