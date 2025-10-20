import { UserRole, AuthUser, Project, Task } from '@/types';

export interface Permission {
  resource: string;
  action: string;
}

export const PERMISSIONS = {
  // Project permissions
  PROJECT_VIEW: { resource: 'project', action: 'view' },
  PROJECT_CREATE: { resource: 'project', action: 'create' },
  PROJECT_EDIT: { resource: 'project', action: 'edit' },
  PROJECT_DELETE: { resource: 'project', action: 'delete' },
  
  // Task permissions
  TASK_VIEW: { resource: 'task', action: 'view' },
  TASK_CREATE: { resource: 'task', action: 'create' },
  TASK_EDIT: { resource: 'task', action: 'edit' },
  TASK_DELETE: { resource: 'task', action: 'delete' },
  TASK_ASSIGN: { resource: 'task', action: 'assign' },
  
  // User permissions
  USER_VIEW: { resource: 'user', action: 'view' },
  USER_EDIT: { resource: 'user', action: 'edit' },
  USER_DELETE: { resource: 'user', action: 'delete' },
  
  // Admin permissions
  ADMIN_ACCESS: { resource: 'admin', action: 'access' },
} as const;

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    PERMISSIONS.PROJECT_VIEW,
    PERMISSIONS.PROJECT_CREATE,
    PERMISSIONS.PROJECT_EDIT,
    PERMISSIONS.PROJECT_DELETE,
    PERMISSIONS.TASK_VIEW,
    PERMISSIONS.TASK_CREATE,
    PERMISSIONS.TASK_EDIT,
    PERMISSIONS.TASK_DELETE,
    PERMISSIONS.TASK_ASSIGN,
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_EDIT,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.ADMIN_ACCESS,
  ],
  manager: [
    PERMISSIONS.PROJECT_VIEW,
    PERMISSIONS.PROJECT_CREATE,
    PERMISSIONS.PROJECT_EDIT,
    PERMISSIONS.TASK_VIEW,
    PERMISSIONS.TASK_CREATE,
    PERMISSIONS.TASK_EDIT,
    PERMISSIONS.TASK_DELETE,
    PERMISSIONS.TASK_ASSIGN,
  ],
  member: [
    PERMISSIONS.PROJECT_VIEW,
    PERMISSIONS.TASK_VIEW,
  ],
};

export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  return rolePermissions.some(
    p => p.resource === permission.resource && p.action === permission.action
  );
}

export function canAccessProject(user: AuthUser, project: Project): boolean {
  if (user.role === 'admin') return true;
  if (user.role === 'manager' && project.owner === user.email) return true;
  if (user.role === 'member') return true; // Members can view all projects
  return false;
}

export function canEditProject(user: AuthUser, project: Project): boolean {
  if (user.role === 'admin') return true;
  if (user.role === 'manager' && project.owner === user.email) return true;
  return false;
}

export function canAccessTask(user: AuthUser, task: Task, project?: Project): boolean {
  if (user.role === 'admin') return true;
  if (user.role === 'manager' && project?.owner === user.email) return true;
  if (user.role === 'member' && task.assignedTo === user.email) return true;
  return false;
}

export function canEditTask(user: AuthUser, task: Task, project?: Project): boolean {
  if (user.role === 'admin') return true;
  if (user.role === 'manager' && project?.owner === user.email) return true;
  return false;
}

export function canDeleteTask(user: AuthUser, task: Task, project?: Project): boolean {
  if (user.role === 'admin') return true;
  if (user.role === 'manager' && project?.owner === user.email) return true;
  return false;
}

export function canMarkTaskDone(user: AuthUser, task: Task, project?: Project): boolean {
  if (user.role === 'admin') return true;
  if (user.role === 'manager' && project?.owner === user.email) return true;
  if (user.role === 'member' && task.assignedTo === user.email) return true;
  return false;
}

export function canCreateTask(user: AuthUser, project: Project): boolean {
  if (user.role === 'admin') return true;
  if (user.role === 'manager' && project.owner === user.email) return true;
  return false;
}