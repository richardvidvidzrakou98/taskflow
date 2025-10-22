import { User, Project, Task, UserRole } from '@/types';
import usersData from '@/data/users.json';
import projectsData from '@/data/projects.json';
import tasksData from '@/data/tasks.json';

// In-memory data storage for production compatibility
// Note: Data will reset on each deployment/restart - this is for demo purposes
// In production, you would use a database like PostgreSQL, MongoDB, etc.

let users: User[] = usersData.map(u => ({ ...u, role: u.role as UserRole }));
let projects: Project[] = [...projectsData];
let tasks: Task[] = tasksData.map(t => ({ 
  ...t, 
  status: t.status as 'pending' | 'done' 
}));

// Helper functions for data persistence
// Note: In production (Vercel), file system is read-only, so we use in-memory storage
// Data will persist during the serverless function lifecycle but reset on cold starts
function saveData() {
  // In development, we could save to files, but in production this is a no-op
  // since Vercel's file system is read-only
  if (process.env.NODE_ENV === 'development') {
    console.log('Data updated (in-memory storage for production compatibility)');
  }
}

// User operations
export function getAllUsers(): User[] {
  return [...users];
}

export function updateUserRole(email: string, newRole: UserRole): User | null {
  const userIndex = users.findIndex(u => u.email === email);
  if (userIndex === -1) return null;
  
  users[userIndex] = { ...users[userIndex], role: newRole };
  saveData(); // Persist changes
  return users[userIndex];
}

// Project operations
export function getAllProjects(): Project[] {
  return [...projects];
}

export function getProjectById(id: number): Project | null {
  return projects.find(p => p.id === id) || null;
}

export function createProject(projectData: Omit<Project, 'id'>): Project {
  const newId = Math.max(...projects.map(p => p.id), 0) + 1;
  const newProject: Project = { ...projectData, id: newId };
  projects.push(newProject);
  saveData(); // Persist changes
  return newProject;
}

export function updateProject(id: number, updates: Partial<Omit<Project, 'id'>>): Project | null {
  const projectIndex = projects.findIndex(p => p.id === id);
  if (projectIndex === -1) return null;
  
  projects[projectIndex] = { ...projects[projectIndex], ...updates };
  saveData(); // Persist changes
  return projects[projectIndex];
}

export function deleteProject(id: number): boolean {
  const projectIndex = projects.findIndex(p => p.id === id);
  if (projectIndex === -1) return false;
  
  projects.splice(projectIndex, 1);
  // Also delete associated tasks
  tasks = tasks.filter(t => t.projectId !== id);
  saveData(); // Persist changes
  return true;
}

// Task operations
export function getAllTasks(): Task[] {
  return [...tasks];
}

export function getTasksByProject(projectId: number): Task[] {
  return tasks.filter(t => t.projectId === projectId);
}

export function getTasksByAssignee(assigneeEmail: string): Task[] {
  return tasks.filter(t => t.assignedTo === assigneeEmail);
}

export function getTaskById(id: number): Task | null {
  return tasks.find(t => t.id === id) || null;
}

export function createTask(taskData: Omit<Task, 'id'>): Task {
  const newId = Math.max(...tasks.map(t => t.id), 0) + 1;
  const newTask: Task = { ...taskData, id: newId };
  tasks.push(newTask);
  saveData(); // Persist changes
  return newTask;
}

export function updateTask(id: number, updates: Partial<Omit<Task, 'id'>>): Task | null {
  const taskIndex = tasks.findIndex(t => t.id === id);
  if (taskIndex === -1) return null;
  
  tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
  saveData(); // Persist changes
  return tasks[taskIndex];
}

export function deleteTask(id: number): boolean {
  const taskIndex = tasks.findIndex(t => t.id === id);
  if (taskIndex === -1) return false;
  
  tasks.splice(taskIndex, 1);
  saveData(); // Persist changes
  return true;
}

// Analytics
export function getTaskStats() {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  
  return {
    total: totalTasks,
    completed: completedTasks,
    pending: pendingTasks,
    completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  };
}