/**
 * Admin RBAC API service
 * Calls real admin API via gateway, with mock fallback.
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

// ── Mock Data ──────────────────────────────────────────────────────

const MOCK_MEMBERS: AdminMember[] = [
  { id: 1, loginId: "admin", name: "최고관리자", phone: "010-1234-5678", email: "admin@pochak.com", lastAccessAt: "2026-03-19 09:00", isBlocked: false, createdAt: "2025-01-01" },
  { id: 2, loginId: "manager01", name: "김운영", phone: "010-2345-6789", email: "manager01@pochak.com", lastAccessAt: "2026-03-18 14:30", isBlocked: false, createdAt: "2025-02-15" },
  { id: 3, loginId: "hk_admin", name: "박관리", phone: "010-3456-7890", email: "hk@pochak.com", lastAccessAt: "2026-03-17 11:20", isBlocked: true, createdAt: "2025-03-10" },
  { id: 4, loginId: "sales01", name: "이영업", phone: "010-4567-8901", email: "sales01@pochak.com", lastAccessAt: "2026-03-19 08:15", isBlocked: false, createdAt: "2025-04-01" },
  { id: 5, loginId: "support01", name: "정지원", phone: "010-5678-9012", email: "support@pochak.com", lastAccessAt: null, isBlocked: false, createdAt: "2025-05-20" },
];

const MOCK_GROUP_TREE: GroupNode[] = [
  {
    id: 1, name: "전체", code: "ROOT", description: "최상위 그룹", parentId: null,
    children: [
      {
        id: 2, name: "본사 운영팀", code: "HQ_OPS", description: "본사 운영 관리 그룹", parentId: 1,
        children: [
          { id: 4, name: "시스템 관리", code: "HQ_SYS", description: "시스템 관리 담당", parentId: 2, children: [] },
          { id: 5, name: "콘텐츠 관리", code: "HQ_CNT", description: "콘텐츠 관리 담당", parentId: 2, children: [] },
        ],
      },
      {
        id: 3, name: "영업팀", code: "SALES", description: "영업 관리 그룹", parentId: 1,
        children: [
          { id: 6, name: "서울 영업", code: "SALES_SEL", description: "서울 지역 영업", parentId: 3, children: [] },
        ],
      },
    ],
  },
];

const MOCK_ROLES: RoleItem[] = [
  { id: 1, name: "마스터 BO", code: "MASTER_BO", description: "전체 권한을 가진 마스터 관리자" },
  { id: 2, name: "HK 관리자", code: "HK_ADMIN", description: "HK 관련 관리 권한" },
  { id: 3, name: "일반 BO", code: "GENERAL_BO", description: "일반 백오피스 운영 권한" },
  { id: 4, name: "영업 권한", code: "SALES", description: "영업 관련 기능 접근 권한" },
  { id: 5, name: "콘텐츠 관리자", code: "CONTENT_MGR", description: "콘텐츠 관리 전용 권한" },
];

const MOCK_MENU_TREE: MenuNode[] = [
  {
    id: 1, name: "대시보드", code: "DASHBOARD", type: "PAGE", url: "/", icon: "LayoutDashboard", displayOrder: 1, parentId: null,
    children: [],
  },
  {
    id: 2, name: "운영 관리", code: "OPERATIONS", type: "DIRECTORY", url: "", icon: "Settings", displayOrder: 2, parentId: null,
    children: [
      { id: 21, name: "멤버관리", code: "OPS_MEMBERS", type: "PAGE", url: "/operations/members", icon: "Users", displayOrder: 1, parentId: 2, children: [] },
      { id: 22, name: "그룹관리", code: "OPS_GROUPS", type: "PAGE", url: "/operations/groups", icon: "Building2", displayOrder: 2, parentId: 2, children: [] },
      { id: 23, name: "권한관리", code: "OPS_PERMS", type: "PAGE", url: "/operations/permissions", icon: "Shield", displayOrder: 3, parentId: 2, children: [] },
      { id: 24, name: "메뉴관리", code: "OPS_MENUS", type: "PAGE", url: "/operations/menus", icon: "Menu", displayOrder: 4, parentId: 2, children: [] },
      { id: 25, name: "세부기능관리", code: "OPS_FUNCS", type: "PAGE", url: "/operations/features", icon: "Layers", displayOrder: 5, parentId: 2, children: [] },
    ],
  },
  {
    id: 3, name: "장비 관리", code: "EQUIPMENT", type: "DIRECTORY", url: "", icon: "Camera", displayOrder: 3, parentId: null,
    children: [
      { id: 31, name: "카메라관리", code: "EQ_CAMERAS", type: "PAGE", url: "/equipment/cameras", icon: "Camera", displayOrder: 1, parentId: 3, children: [] },
      { id: 32, name: "VPU장비", code: "EQ_VPU", type: "PAGE", url: "/equipment/vpu-devices", icon: "Cpu", displayOrder: 2, parentId: 3, children: [] },
    ],
  },
  {
    id: 4, name: "구장 관리", code: "STADIUMS", type: "PAGE", url: "/stadiums", icon: "MapPin", displayOrder: 4, parentId: null,
    children: [],
  },
  {
    id: 5, name: "콘텐츠 관리", code: "CONTENTS", type: "DIRECTORY", url: "", icon: "Video", displayOrder: 5, parentId: null,
    children: [
      { id: 51, name: "라이브", code: "CNT_LIVE", type: "PAGE", url: "/contents/live", icon: "Play", displayOrder: 1, parentId: 5, children: [] },
      { id: 52, name: "VOD", code: "CNT_VOD", type: "PAGE", url: "/contents/vod", icon: "Video", displayOrder: 2, parentId: 5, children: [] },
    ],
  },
  {
    id: 6, name: "회원 관리", code: "MEMBERS", type: "DIRECTORY", url: "", icon: "UserCheck", displayOrder: 6, parentId: null,
    children: [
      { id: 61, name: "회원리스트", code: "MBR_LIST", type: "PAGE", url: "/members/list", icon: "UserCheck", displayOrder: 1, parentId: 6, children: [] },
      { id: 62, name: "블랙리스트", code: "MBR_BLACK", type: "PAGE", url: "/members/blacklist", icon: "UserX", displayOrder: 2, parentId: 6, children: [] },
    ],
  },
];

const MOCK_FUNCTIONS: FunctionItem[] = [
  { id: 1, code: "MEMBER_CREATE", name: "멤버 등록", controllerName: "AdminMemberController", description: "관리자 멤버 등록 기능" },
  { id: 2, code: "MEMBER_UPDATE", name: "멤버 수정", controllerName: "AdminMemberController", description: "관리자 멤버 정보 수정" },
  { id: 3, code: "MEMBER_DELETE", name: "멤버 삭제", controllerName: "AdminMemberController", description: "관리자 멤버 삭제" },
  { id: 4, code: "MEMBER_BLOCK", name: "멤버 차단", controllerName: "AdminMemberController", description: "관리자 멤버 차단/해제" },
  { id: 5, code: "GROUP_CREATE", name: "그룹 등록", controllerName: "AdminGroupController", description: "관리 그룹 등록" },
  { id: 6, code: "GROUP_UPDATE", name: "그룹 수정", controllerName: "AdminGroupController", description: "관리 그룹 수정" },
  { id: 7, code: "ROLE_ASSIGN", name: "권한 할당", controllerName: "AdminRoleController", description: "권한 할당 기능" },
  { id: 8, code: "MENU_MANAGE", name: "메뉴 관리", controllerName: "AdminMenuController", description: "CMS 메뉴 관리" },
  { id: 9, code: "CONTENT_PUBLISH", name: "콘텐츠 게시", controllerName: "ContentController", description: "콘텐츠 게시 기능" },
  { id: 10, code: "CONTENT_DELETE", name: "콘텐츠 삭제", controllerName: "ContentController", description: "콘텐츠 삭제 기능" },
  { id: 11, code: "STADIUM_MANAGE", name: "구장 관리", controllerName: "StadiumController", description: "구장 등록/수정/삭제" },
  { id: 12, code: "USER_BAN", name: "회원 차단", controllerName: "UserController", description: "앱 회원 차단 기능" },
];

// ── Helpers ────────────────────────────────────────────────────────

function delay(ms = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let nextMemberId = MOCK_MEMBERS.length + 1;
let nextFunctionId = MOCK_FUNCTIONS.length + 1;

// ── API Object ─────────────────────────────────────────────────────

export const adminApi = {
  members: {
    async list(search?: string): Promise<AdminMember[]> {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      const apiResult = await gatewayApi.get<AdminMember[]>("/api/v1/admin/bo-members", params);
      if (apiResult) return apiResult;
      console.warn("[admin-api] Backend unavailable, using mock data");
      await delay();
      if (!search) return [...MOCK_MEMBERS];
      const q = search.toLowerCase();
      return MOCK_MEMBERS.filter(
        (m) =>
          m.loginId.toLowerCase().includes(q) ||
          m.name.toLowerCase().includes(q) ||
          m.phone.includes(q)
      );
    },
    async create(data: Omit<AdminMember, "id" | "lastAccessAt" | "isBlocked" | "createdAt">): Promise<AdminMember> {
      const apiResult = await gatewayApi.post<AdminMember>("/api/v1/admin/bo-members", data);
      if (apiResult) return apiResult;
      console.warn("[admin-api] Backend unavailable, using mock data");
      await delay();
      const member: AdminMember = {
        ...data,
        id: nextMemberId++,
        lastAccessAt: null,
        isBlocked: false,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      MOCK_MEMBERS.push(member);
      return member;
    },
    async update(id: number, data: Partial<AdminMember>): Promise<AdminMember> {
      const apiResult = await gatewayApi.put<AdminMember>(`/api/v1/admin/bo-members/${id}`, data);
      if (apiResult) return apiResult;
      console.warn("[admin-api] Backend unavailable, using mock data");
      await delay();
      const idx = MOCK_MEMBERS.findIndex((m) => m.id === id);
      if (idx === -1) throw new Error("Member not found");
      MOCK_MEMBERS[idx] = { ...MOCK_MEMBERS[idx], ...data };
      return MOCK_MEMBERS[idx];
    },
    async delete(id: number): Promise<void> {
      const apiResult = await gatewayApi.delete(`/api/v1/admin/bo-members/${id}`);
      if (apiResult !== null) return;
      console.warn("[admin-api] Backend unavailable, using mock data");
      await delay();
      const idx = MOCK_MEMBERS.findIndex((m) => m.id === id);
      if (idx !== -1) MOCK_MEMBERS.splice(idx, 1);
    },
    async block(id: number): Promise<void> {
      const apiResult = await gatewayApi.put(`/api/v1/admin/bo-members/${id}/block`);
      if (apiResult !== null) return;
      console.warn("[admin-api] Backend unavailable, using mock data");
      await delay();
      const m = MOCK_MEMBERS.find((m) => m.id === id);
      if (m) m.isBlocked = true;
    },
    async unblock(id: number): Promise<void> {
      const apiResult = await gatewayApi.put(`/api/v1/admin/bo-members/${id}/unblock`);
      if (apiResult !== null) return;
      console.warn("[admin-api] Backend unavailable, using mock data");
      await delay();
      const m = MOCK_MEMBERS.find((m) => m.id === id);
      if (m) m.isBlocked = false;
    },
  },

  groups: {
    async tree(): Promise<GroupNode[]> {
      const apiResult = await gatewayApi.get<GroupNode[]>("/api/v1/admin/groups/tree");
      if (apiResult) return apiResult;
      console.warn("[admin-api] Backend unavailable, using mock data");
      await delay();
      return JSON.parse(JSON.stringify(MOCK_GROUP_TREE));
    },
    async detail(id: number): Promise<GroupDetail> {
      const apiResult = await gatewayApi.get<GroupDetail>(`/api/v1/admin/groups/${id}`);
      if (apiResult) return apiResult;
      console.warn("[admin-api] Backend unavailable, using mock data");
      await delay();
      const find = (nodes: GroupNode[]): GroupNode | null => {
        for (const n of nodes) {
          if (n.id === id) return n;
          const found = find(n.children);
          if (found) return found;
        }
        return null;
      };
      const node = find(MOCK_GROUP_TREE);
      if (!node) throw new Error("Group not found");
      return {
        id: node.id,
        name: node.name,
        code: node.code,
        description: node.description,
        parentId: node.parentId,
        memberIds: [1, 2],
        roleIds: [1],
      };
    },
    async create(data: { name: string; code: string; description: string; parentId: number | null }): Promise<GroupNode> {
      const apiResult = await gatewayApi.post<GroupNode>("/api/v1/admin/groups", data);
      if (apiResult) return apiResult;
      console.warn("[admin-api] Backend unavailable, using mock data");
      await delay();
      return { ...data, id: Date.now(), children: [] };
    },
    async update(id: number, data: Partial<GroupDetail>): Promise<GroupDetail> {
      const apiResult = await gatewayApi.put<GroupDetail>(`/api/v1/admin/groups/${id}`, data);
      if (apiResult) return apiResult;
      console.warn("[admin-api] Backend unavailable, using mock data");
      await delay();
      return { id, name: "", code: "", description: "", parentId: null, memberIds: [], roleIds: [], ...data };
    },
    async delete(id: number): Promise<void> {
      const apiResult = await gatewayApi.delete(`/api/v1/admin/groups/${id}`);
      if (apiResult !== null) return;
      console.warn("[admin-api] Backend unavailable, using mock data");
      await delay();
      void id;
    },
    async assignMembers(groupId: number, memberIds: number[]): Promise<void> {
      const apiResult = await gatewayApi.put(`/api/v1/admin/groups/${groupId}/members`, { memberIds });
      if (apiResult !== null) return;
      console.warn("[admin-api] Backend unavailable, using mock data");
      await delay();
      void groupId;
      void memberIds;
    },
    async assignRoles(groupId: number, roleIds: number[]): Promise<void> {
      const apiResult = await gatewayApi.put(`/api/v1/admin/groups/${groupId}/roles`, { roleIds });
      if (apiResult !== null) return;
      console.warn("[admin-api] Backend unavailable, using mock data");
      await delay();
      void groupId;
      void roleIds;
    },
  },

  roles: {
    async list(): Promise<RoleItem[]> {
      const apiResult = await gatewayApi.get<RoleItem[]>("/api/v1/admin/roles");
      if (apiResult) return apiResult;
      console.warn("[admin-api] Backend unavailable, using mock data");
      await delay();
      return [...MOCK_ROLES];
    },
    async detail(id: number): Promise<RoleDetail> {
      const apiResult = await gatewayApi.get<RoleDetail>(`/api/v1/admin/roles/${id}`);
      if (apiResult) return apiResult;
      console.warn("[admin-api] Backend unavailable, using mock data");
      await delay();
      const role = MOCK_ROLES.find((r) => r.id === id);
      if (!role) throw new Error("Role not found");
      return { ...role, menuIds: [1, 2, 21, 22], functionIds: [1, 2, 3] };
    },
    async create(data: Omit<RoleItem, "id">): Promise<RoleItem> {
      const apiResult = await gatewayApi.post<RoleItem>("/api/v1/admin/roles", data);
      if (apiResult) return apiResult;
      console.warn("[admin-api] Backend unavailable, using mock data");
      await delay();
      return { ...data, id: Date.now() };
    },
    async update(id: number, data: Partial<RoleItem>): Promise<RoleItem> {
      const apiResult = await gatewayApi.put<RoleItem>(`/api/v1/admin/roles/${id}`, data);
      if (apiResult) return apiResult;
      console.warn("[admin-api] Backend unavailable, using mock data");
      await delay();
      return { id, name: "", code: "", description: "", ...data };
    },
    async delete(id: number): Promise<void> {
      const apiResult = await gatewayApi.delete(`/api/v1/admin/roles/${id}`);
      if (apiResult !== null) return;
      console.warn("[admin-api] Backend unavailable, using mock data");
      await delay();
      void id;
    },
    async assignMenus(roleId: number, menuIds: number[]): Promise<void> {
      const apiResult = await gatewayApi.put(`/api/v1/admin/roles/${roleId}/menus`, { menuIds });
      if (apiResult !== null) return;
      console.warn("[admin-api] Backend unavailable, using mock data");
      await delay();
      void roleId;
      void menuIds;
    },
    async assignFunctions(roleId: number, functionIds: number[]): Promise<void> {
      const apiResult = await gatewayApi.put(`/api/v1/admin/roles/${roleId}/functions`, { functionIds });
      if (apiResult !== null) return;
      console.warn("[admin-api] Backend unavailable, using mock data");
      await delay();
      void roleId;
      void functionIds;
    },
  },

  menus: {
    async tree(): Promise<MenuNode[]> {
      const apiResult = await gatewayApi.get<MenuNode[]>("/api/v1/admin/menus/tree");
      if (apiResult) return apiResult;
      console.warn("[admin-api] Backend unavailable, using mock data");
      await delay();
      return JSON.parse(JSON.stringify(MOCK_MENU_TREE));
    },
    async detail(id: number): Promise<MenuDetail> {
      const apiResult = await gatewayApi.get<MenuDetail>(`/api/v1/admin/menus/${id}`);
      if (apiResult) return apiResult;
      console.warn("[admin-api] Backend unavailable, using mock data");
      await delay();
      const find = (nodes: MenuNode[]): MenuNode | null => {
        for (const n of nodes) {
          if (n.id === id) return n;
          const found = find(n.children);
          if (found) return found;
        }
        return null;
      };
      const node = find(MOCK_MENU_TREE);
      if (!node) throw new Error("Menu not found");
      return {
        id: node.id,
        name: node.name,
        code: node.code,
        type: node.type,
        url: node.url,
        icon: node.icon,
        displayOrder: node.displayOrder,
        parentId: node.parentId,
        i18nLabel: node.name,
      };
    },
    async create(data: Omit<MenuDetail, "id">): Promise<MenuDetail> {
      const apiResult = await gatewayApi.post<MenuDetail>("/api/v1/admin/menus", data);
      if (apiResult) return apiResult;
      console.warn("[admin-api] Backend unavailable, using mock data");
      await delay();
      return { ...data, id: Date.now() };
    },
    async update(id: number, data: Partial<MenuDetail>): Promise<MenuDetail> {
      const apiResult = await gatewayApi.put<MenuDetail>(`/api/v1/admin/menus/${id}`, data);
      if (apiResult) return apiResult;
      console.warn("[admin-api] Backend unavailable, using mock data");
      await delay();
      return { id, name: "", code: "", type: "PAGE", url: "", icon: "", displayOrder: 0, parentId: null, i18nLabel: "", ...data };
    },
    async delete(id: number): Promise<void> {
      const apiResult = await gatewayApi.delete(`/api/v1/admin/menus/${id}`);
      if (apiResult !== null) return;
      console.warn("[admin-api] Backend unavailable, using mock data");
      await delay();
      void id;
    },
  },

  functions: {
    async list(search?: string): Promise<FunctionItem[]> {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      const apiResult = await gatewayApi.get<FunctionItem[]>("/api/v1/admin/functions", params);
      if (apiResult) return apiResult;
      console.warn("[admin-api] Backend unavailable, using mock data");
      await delay();
      if (!search) return [...MOCK_FUNCTIONS];
      const q = search.toLowerCase();
      return MOCK_FUNCTIONS.filter(
        (f) =>
          f.code.toLowerCase().includes(q) ||
          f.name.toLowerCase().includes(q)
      );
    },
    async create(data: Omit<FunctionItem, "id">): Promise<FunctionItem> {
      const apiResult = await gatewayApi.post<FunctionItem>("/api/v1/admin/functions", data);
      if (apiResult) return apiResult;
      console.warn("[admin-api] Backend unavailable, using mock data");
      await delay();
      const fn: FunctionItem = { ...data, id: nextFunctionId++ };
      MOCK_FUNCTIONS.push(fn);
      return fn;
    },
    async update(id: number, data: Partial<FunctionItem>): Promise<FunctionItem> {
      const apiResult = await gatewayApi.put<FunctionItem>(`/api/v1/admin/functions/${id}`, data);
      if (apiResult) return apiResult;
      console.warn("[admin-api] Backend unavailable, using mock data");
      await delay();
      const idx = MOCK_FUNCTIONS.findIndex((f) => f.id === id);
      if (idx === -1) throw new Error("Function not found");
      MOCK_FUNCTIONS[idx] = { ...MOCK_FUNCTIONS[idx], ...data };
      return MOCK_FUNCTIONS[idx];
    },
    async delete(id: number): Promise<void> {
      const apiResult = await gatewayApi.delete(`/api/v1/admin/functions/${id}`);
      if (apiResult !== null) return;
      console.warn("[admin-api] Backend unavailable, using mock data");
      await delay();
      const idx = MOCK_FUNCTIONS.findIndex((f) => f.id === id);
      if (idx !== -1) MOCK_FUNCTIONS.splice(idx, 1);
    },
  },
};
