/**
 * Admin RBAC API service
 * Calls real admin API via gateway.
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

// ── API Object ─────────────────────────────────────────────────────

export const adminApi = {
  members: {
    async list(search?: string): Promise<AdminMember[]> {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      return gatewayApi.get<AdminMember[]>("/api/v1/admin/bo-members", params);
    },
    async create(data: Omit<AdminMember, "id" | "lastAccessAt" | "isBlocked" | "createdAt">): Promise<AdminMember> {
      return gatewayApi.post<AdminMember>("/api/v1/admin/bo-members", data);
    },
    async update(id: number, data: Partial<AdminMember>): Promise<AdminMember> {
      return gatewayApi.put<AdminMember>(`/api/v1/admin/bo-members/${id}`, data);
    },
    async delete(id: number): Promise<void> {
      await gatewayApi.delete(`/api/v1/admin/bo-members/${id}`);
    },
    async block(id: number): Promise<void> {
      await gatewayApi.put(`/api/v1/admin/bo-members/${id}/block`);
    },
    async unblock(id: number): Promise<void> {
      await gatewayApi.put(`/api/v1/admin/bo-members/${id}/unblock`);
    },
  },

  groups: {
    async tree(): Promise<GroupNode[]> {
      return gatewayApi.get<GroupNode[]>("/api/v1/admin/groups/tree");
    },
    async detail(id: number): Promise<GroupDetail> {
      return gatewayApi.get<GroupDetail>(`/api/v1/admin/groups/${id}`);
    },
    async create(data: { name: string; code: string; description: string; parentId: number | null }): Promise<GroupNode> {
      return gatewayApi.post<GroupNode>("/api/v1/admin/groups", data);
    },
    async update(id: number, data: Partial<GroupDetail>): Promise<GroupDetail> {
      return gatewayApi.put<GroupDetail>(`/api/v1/admin/groups/${id}`, data);
    },
    async delete(id: number): Promise<void> {
      await gatewayApi.delete(`/api/v1/admin/groups/${id}`);
    },
    async assignMembers(groupId: number, memberIds: number[]): Promise<void> {
      await gatewayApi.put(`/api/v1/admin/groups/${groupId}/members`, { memberIds });
    },
    async assignRoles(groupId: number, roleIds: number[]): Promise<void> {
      await gatewayApi.put(`/api/v1/admin/groups/${groupId}/roles`, { roleIds });
    },
  },

  roles: {
    async list(): Promise<RoleItem[]> {
      return gatewayApi.get<RoleItem[]>("/api/v1/admin/roles");
    },
    async detail(id: number): Promise<RoleDetail> {
      return gatewayApi.get<RoleDetail>(`/api/v1/admin/roles/${id}`);
    },
    async create(data: Omit<RoleItem, "id">): Promise<RoleItem> {
      return gatewayApi.post<RoleItem>("/api/v1/admin/roles", data);
    },
    async update(id: number, data: Partial<RoleItem>): Promise<RoleItem> {
      return gatewayApi.put<RoleItem>(`/api/v1/admin/roles/${id}`, data);
    },
    async delete(id: number): Promise<void> {
      await gatewayApi.delete(`/api/v1/admin/roles/${id}`);
    },
    async assignMenus(roleId: number, menuIds: number[]): Promise<void> {
      await gatewayApi.put(`/api/v1/admin/roles/${roleId}/menus`, { menuIds });
    },
    async assignFunctions(roleId: number, functionIds: number[]): Promise<void> {
      await gatewayApi.put(`/api/v1/admin/roles/${roleId}/functions`, { functionIds });
    },
  },

  menus: {
    async tree(): Promise<MenuNode[]> {
      return gatewayApi.get<MenuNode[]>("/api/v1/admin/menus/tree");
    },
    async detail(id: number): Promise<MenuDetail> {
      return gatewayApi.get<MenuDetail>(`/api/v1/admin/menus/${id}`);
    },
    async create(data: Omit<MenuDetail, "id">): Promise<MenuDetail> {
      return gatewayApi.post<MenuDetail>("/api/v1/admin/menus", data);
    },
    async update(id: number, data: Partial<MenuDetail>): Promise<MenuDetail> {
      return gatewayApi.put<MenuDetail>(`/api/v1/admin/menus/${id}`, data);
    },
    async delete(id: number): Promise<void> {
      await gatewayApi.delete(`/api/v1/admin/menus/${id}`);
    },
  },

  functions: {
    async list(search?: string): Promise<FunctionItem[]> {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      return gatewayApi.get<FunctionItem[]>("/api/v1/admin/functions", params);
    },
    async create(data: Omit<FunctionItem, "id">): Promise<FunctionItem> {
      return gatewayApi.post<FunctionItem>("/api/v1/admin/functions", data);
    },
    async update(id: number, data: Partial<FunctionItem>): Promise<FunctionItem> {
      return gatewayApi.put<FunctionItem>(`/api/v1/admin/functions/${id}`, data);
    },
    async delete(id: number): Promise<void> {
      await gatewayApi.delete(`/api/v1/admin/functions/${id}`);
    },
  },
};
