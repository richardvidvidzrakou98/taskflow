import { User, Project, Task, UserRole } from '@/types';
import usersData from '@/data/users.json';
import projectsData from '@/data/projects.json';
import tasksData from '@/data/tasks.json';
import fs from 'fs';
import path from 'path';

// In a real app, these would be database operations
// For now, we'll work with in-memory copies of the JSON data

let users: User[] = usersData.map(u => ({ ...u, role: u.role as UserRole }));
let projects: Project[] = [...projectsData];
let tasks: Task[] = tasksData.map(t => ({ 
  ...t, 
  status: t.status as 'pending' | 'done' 
}));

// Helper functions to persist data to files
function saveUsersToFile() {
  const filePath = path.join(process.cwd(), 'data', 'users.json');
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
}

function saveProjectsToFile() {
  const filePath = path.join(process.cwd(), 'data', 'projects.json');
  fs.writeFileSync(filePath, JSON.stringify(projects, null, 2));
}

function saveTasksToFile() {
  const filePath = path.join(process.cwd(), 'data', 'tasks.json');
  fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2));
}

// User operations
export function getAllUsers(): User[] {
  return [...users];
}

export function updateUserRole(email: string, newRole: UserRole): User | null {
  const userIndex = users.findIndex(u => u.email === email);
  if (userIndex === -1) return null;
  
  users[userIndex] = { ...users[userIndex], role: newRole };
  saveUsersToFile(); // Persist to file
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
  saveProjectsToFile(); // Persist to file
  return newProject;
}

export function updateProject(id: number, updates: Partial<Omit<Project, 'id'>>): Project | null {
  const projectIndex = projects.findIndex(p => p.id === id);
  if (projectIndex === -1) return null;
  
  projects[projectIndex] = { ...projects[projectIndex], ...updates };
  saveProjectsToFile(); // Persist to file
  return projects[projectIndex];
}

export function deleteProject(id: number): boolean {
  const projectIndex = projects.findIndex(p => p.id === id);
  if (projectIndex === -1) return false;
  
  projects.splice(projectIndex, 1);
  // Also delete associated tasks
  tasks = tasks.filter(t => t.projectId !== id);
  saveProjectsToFile(); // Persist projects
  saveTasksToFile(); // Persist tasks (since we deleted some)
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
  saveTasksToFile(); // Persist to file
  return newTask;
}

export function updateTask(id: number, updates: Partial<Omit<Task, 'id'>>): Task | null {
  const taskIndex = tasks.findIndex(t => t.id === id);
  if (taskIndex === -1) return null;
  
  tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
  saveTasksToFile(); // Persist to file
  return tasks[taskIndex];
}

export function deleteTask(id: number): boolean {
  const taskIndex = tasks.findIndex(t => t.id === id);
  if (taskIndex === -1) return false;
  
  tasks.splice(taskIndex, 1);
  saveTasksToFile(); // Persist to file
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