export type UserRole = 'admin' | 'manager' | 'member';

export interface User {
  email: string;
  password: string;
  role: UserRole;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  owner: string;
}

export interface Task {
  id: number;
  projectId: number;
  title: string;
  assignedTo: string;
  status: 'pending' | 'done';
}

export interface AuthUser {
  email: string;
  role: UserRole;
}