export type AdminRole = "SUPER_ADMIN" | "ADMIN" | "OPERATOR" | "VIEWER";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  groupId?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminMenu {
  id: string;
  name: string;
  path: string;
  icon?: string;
  parentId?: string;
  sortOrder: number;
  requiredRoles: AdminRole[];
  children?: AdminMenu[];
}

export interface AdminGroup {
  id: string;
  name: string;
  description?: string;
  permissions: AdminPermission[];
  memberCount: number;
  createdAt: string;
}

export interface AdminPermission {
  menuId: string;
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canApprove: boolean;
}

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "LOGIN"
  | "LOGOUT"
  | "APPROVE"
  | "REJECT"
  | "EXPORT";

export interface AuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  detail?: string;
  ipAddress: string;
  userAgent?: string;
  createdAt: string;
}
