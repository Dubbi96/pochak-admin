import { gatewayApi } from "@/lib/api-client";

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
type AnyRecord = any;

function mapMember(row: AnyRecord): AdminMember {
  return {
    id: Number(row.id),
    loginId: String(row.loginId ?? ""),
    name: String(row.name ?? ""),
    phone: String(row.phone ?? ""),
    email: String(row.email ?? ""),
    lastAccessAt: row.lastLoginAt ? String(row.lastLoginAt) : null,
    isBlocked: Boolean(row.isBlocked),
    createdAt: row.createdAt ? String(row.createdAt) : "",
  };
}

function mapGroupNode(row: AnyRecord): GroupNode {
  return {
    id: Number(row.id),
    name: String(row.groupName ?? row.name ?? ""),
    code: String(row.groupCode ?? row.code ?? ""),
    description: String(row.description ?? ""),
    parentId: row.parentId != null ? Number(row.parentId) : null,
    children: (row.children ?? []).map(mapGroupNode),
  };
}

function mapRole(row: AnyRecord): RoleItem {
  return {
    id: Number(row.id),
    name: String(row.roleName ?? row.name ?? ""),
    code: String(row.roleCode ?? row.code ?? ""),
    description: String(row.description ?? ""),
  };
}

function mapMenuNode(row: AnyRecord): MenuNode {
  return {
    id: Number(row.id),
    name: String(row.menuName ?? row.name ?? ""),
    code: String(row.menuCode ?? row.code ?? ""),
    type: (row.menuType ?? row.type ?? "PAGE") as MenuNode["type"],
    url: String(row.menuPath ?? row.url ?? ""),
    icon: String(row.iconName ?? row.icon ?? ""),
    displayOrder: Number(row.sortOrder ?? row.displayOrder ?? 0),
    parentId: row.parentId != null ? Number(row.parentId) : null,
    children: (row.children ?? []).map(mapMenuNode),
  };
}

function flattenMenuIds(node: AnyRecord): number[] {
  const current = node?.id != null ? [Number(node.id)] : [];
  const child = (node?.children ?? []).flatMap(flattenMenuIds);
  return [...current, ...child];
}

function mapFunction(row: AnyRecord): FunctionItem {
  return {
    id: Number(row.id),
    code: String(row.functionCode ?? row.code ?? ""),
    name: String(row.functionName ?? row.name ?? ""),
    controllerName: [row.httpMethod, row.apiPath].filter(Boolean).join(" "),
    description: String(row.description ?? ""),
  };
}

export const adminApi = {
  members: {
    async list(_search?: string, page = 0, size = 200): Promise<AdminMember[]> {
      const result = await gatewayApi.get<{ content: AnyRecord[] }>("/api/v1/admin/rbac/members", {
        page: String(page),
        size: String(size),
      });
      return (result.content ?? []).map(mapMember);
    },
    async create(data: { loginId: string; name: string; phone: string; email: string; password: string }): Promise<AdminMember> {
      const created = await gatewayApi.post<AnyRecord>("/api/v1/admin/rbac/members", {
        loginId: data.loginId,
        password: data.password,
        name: data.name,
        phone: data.phone || undefined,
        email: data.email || undefined,
      });
      return mapMember(created);
    },
    async update(id: number, data: { name?: string; phone?: string; email?: string; password?: string }): Promise<AdminMember> {
      const updated = await gatewayApi.put<AnyRecord>(`/api/v1/admin/rbac/members/${id}`, data);
      return mapMember(updated);
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
      const tree = await gatewayApi.get<AnyRecord[]>("/api/v1/admin/rbac/groups");
      return (tree ?? []).map(mapGroupNode);
    },
    async detail(id: number): Promise<GroupDetail> {
      const [group, members, roles] = await Promise.all([
        gatewayApi.get<AnyRecord>(`/api/v1/admin/rbac/groups/${id}`),
        gatewayApi.get<AnyRecord[]>(`/api/v1/admin/rbac/groups/${id}/members`),
        gatewayApi.get<AnyRecord[]>(`/api/v1/admin/rbac/groups/${id}/roles`),
      ]);
      return {
        id: Number(group.id),
        name: String(group.groupName ?? ""),
        code: String(group.groupCode ?? ""),
        description: String(group.description ?? ""),
        parentId: group.parentId != null ? Number(group.parentId) : null,
        memberIds: (members ?? []).map((m) => Number(m.id)),
        roleIds: (roles ?? []).map((r) => Number(r.id)),
      };
    },
    async create(data: { name: string; code: string; description: string; parentId: number | null }): Promise<GroupNode> {
      const created = await gatewayApi.post<AnyRecord>("/api/v1/admin/rbac/groups", {
        groupCode: data.code,
        groupName: data.name,
        description: data.description || undefined,
        parentId: data.parentId ?? undefined,
      });
      return mapGroupNode(created);
    },
    async update(id: number, data: Partial<GroupDetail>): Promise<GroupDetail> {
      await gatewayApi.put(`/api/v1/admin/rbac/groups/${id}`, {
        groupName: data.name,
        description: data.description,
      });
      return adminApi.groups.detail(id);
    },
    async delete(id: number): Promise<void> {
      await gatewayApi.delete(`/api/v1/admin/rbac/groups/${id}`);
    },
    async assignMembers(groupId: number, memberIds: number[]): Promise<void> {
      if (memberIds.length === 0) return;
      await gatewayApi.post(`/api/v1/admin/rbac/groups/${groupId}/members`, { memberIds });
    },
    async removeMembers(groupId: number, memberIds: number[]): Promise<void> {
      if (memberIds.length === 0) return;
      await gatewayApi.deleteWithBody(`/api/v1/admin/rbac/groups/${groupId}/members`, { memberIds });
    },
    async assignRoles(groupId: number, roleIds: number[]): Promise<void> {
      if (roleIds.length === 0) return;
      await gatewayApi.post(`/api/v1/admin/rbac/groups/${groupId}/roles`, { roleIds });
    },
    async removeRoles(groupId: number, roleIds: number[]): Promise<void> {
      if (roleIds.length === 0) return;
      await gatewayApi.deleteWithBody(`/api/v1/admin/rbac/groups/${groupId}/roles`, { roleIds });
    },
  },
  roles: {
    async list(): Promise<RoleItem[]> {
      const rows = await gatewayApi.get<AnyRecord[]>("/api/v1/admin/rbac/roles");
      return (rows ?? []).map(mapRole);
    },
    async detail(id: number): Promise<RoleDetail> {
      const role = await gatewayApi.get<AnyRecord>(`/api/v1/admin/rbac/roles/${id}`);
      return {
        ...mapRole(role),
        menuIds: (role.menus ?? []).flatMap(flattenMenuIds),
        functionIds: (role.functions ?? []).map((f: AnyRecord) => Number(f.id)),
      };
    },
    async create(data: Omit<RoleItem, "id">): Promise<RoleItem> {
      const created = await gatewayApi.post<AnyRecord>("/api/v1/admin/rbac/roles", {
        roleCode: data.code,
        roleName: data.name,
        description: data.description || undefined,
      });
      return mapRole(created);
    },
    async update(id: number, data: Partial<RoleItem>): Promise<RoleItem> {
      const updated = await gatewayApi.put<AnyRecord>(`/api/v1/admin/rbac/roles/${id}`, {
        roleName: data.name,
        description: data.description,
      });
      return mapRole(updated);
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
      const rows = await gatewayApi.get<AnyRecord[]>("/api/v1/admin/rbac/menus");
      return (rows ?? []).map(mapMenuNode);
    },
    async detail(id: number): Promise<MenuDetail> {
      const row = await gatewayApi.get<AnyRecord>(`/api/v1/admin/rbac/menus/${id}`);
      return {
        id: Number(row.id),
        name: String(row.menuName ?? ""),
        code: String(row.menuCode ?? ""),
        type: (row.menuType ?? "PAGE") as MenuDetail["type"],
        url: String(row.menuPath ?? ""),
        icon: String(row.iconName ?? ""),
        displayOrder: Number(row.sortOrder ?? 0),
        parentId: row.parentId != null ? Number(row.parentId) : null,
        i18nLabel: String(row.i18nLabel ?? row.menuName ?? ""),
      };
    },
    async create(data: Omit<MenuDetail, "id">): Promise<MenuDetail> {
      const created = await gatewayApi.post<AnyRecord>("/api/v1/admin/rbac/menus", {
        menuCode: data.code,
        menuName: data.name,
        menuPath: data.url || undefined,
        iconName: data.icon || undefined,
        parentId: data.parentId ?? undefined,
        sortOrder: data.displayOrder,
      });
      return adminApi.menus.detail(Number(created.id));
    },
    async update(id: number, data: Partial<MenuDetail>): Promise<MenuDetail> {
      await gatewayApi.put(`/api/v1/admin/rbac/menus/${id}`, {
        menuName: data.name,
        menuPath: data.url,
        iconName: data.icon,
        sortOrder: data.displayOrder,
      });
      return adminApi.menus.detail(id);
    },
    async delete(id: number): Promise<void> {
      await gatewayApi.delete(`/api/v1/admin/rbac/menus/${id}`);
    },
  },
  functions: {
    async list(search?: string): Promise<FunctionItem[]> {
      const params: Record<string, string> = {};
      if (search) params.keyword = search;
      const rows = await gatewayApi.get<AnyRecord[]>("/api/v1/admin/rbac/functions", params);
      return (rows ?? []).map(mapFunction);
    },
    async create(data: Omit<FunctionItem, "id">): Promise<FunctionItem> {
      const created = await gatewayApi.post<AnyRecord>("/api/v1/admin/rbac/functions", {
        functionCode: data.code,
        functionName: data.name,
        apiPath: data.controllerName || undefined,
        description: data.description || undefined,
      });
      return mapFunction(created);
    },
    async update(id: number, data: Partial<FunctionItem>): Promise<FunctionItem> {
      const updated = await gatewayApi.put<AnyRecord>(`/api/v1/admin/rbac/functions/${id}`, {
        functionName: data.name,
        apiPath: data.controllerName,
        description: data.description,
      });
      return mapFunction(updated);
    },
    async delete(id: number): Promise<void> {
      await gatewayApi.delete(`/api/v1/admin/rbac/functions/${id}`);
    },
  },
};
