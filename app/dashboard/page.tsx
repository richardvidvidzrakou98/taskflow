'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Loading from '@/components/Loading';
import { Task, Project } from '@/types';
import { hasPermission, PERMISSIONS } from '@/lib/rbac';

interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  myTasks: number;
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [availableUsers, setAvailableUsers] = useState<{ email: string; role: string }[]>([]);
  
  // Add Task Modal State
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  // Create Project Modal State
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [projectsRes, tasksRes, usersRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/tasks'),
        fetch('/api/users'),
      ]);

      if (projectsRes.ok && tasksRes.ok) {
        const projects: Project[] = await projectsRes.json();
        const tasks: Task[] = await tasksRes.json();

        // Calculate stats based on user role
        const myTasks = tasks.filter(task => task.assignedTo === user?.email);
        const completedTasks = tasks.filter(task => task.status === 'done');
        const pendingTasks = tasks.filter(task => task.status === 'pending');

        // Calculate role-appropriate project counts
        let userProjectCount = 0;
        if (user?.role === 'admin') {
          // Admin sees all projects
          userProjectCount = projects.length;
        } else if (user?.role === 'manager') {
          // Manager sees projects they own
          userProjectCount = projects.filter(project => project.owner === user.email).length;
        } else if (user?.role === 'member') {
          // Member sees only projects where they have tasks
          const memberProjectIds = new Set(myTasks.map(task => task.projectId));
          userProjectCount = memberProjectIds.size;
        }

        setStats({
          totalProjects: userProjectCount,
          totalTasks: user?.role === 'member' ? myTasks.length : tasks.length,
          completedTasks: completedTasks.length,
          pendingTasks: pendingTasks.length,
          myTasks: myTasks.length,
        });

        // Set recent projects based on user role
        let relevantProjects: Project[] = [];
        if (user?.role === 'admin') {
          relevantProjects = projects;
        } else if (user?.role === 'manager') {
          relevantProjects = projects.filter(project => project.owner === user.email);
        } else if (user?.role === 'member') {
          const memberProjectIds = new Set(myTasks.map(task => task.projectId));
          relevantProjects = projects.filter(project => memberProjectIds.has(project.id));
        }
        setRecentProjects(relevantProjects.slice(0, 3));
        // Show recent tasks assigned to current user
        setRecentTasks(myTasks.slice(0, 4));
      }

      // Fetch available users for task assignment
      if (usersRes.ok) {
        const users = await usersRes.json();
        setAvailableUsers(users);
      } else {
        console.error('Failed to fetch users:', usersRes.status, await usersRes.text());
        // Fallback: use current user at least
        if (user?.email) {
          setAvailableUsers([{ email: user.email, role: user.role }]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskAssignee.trim() || !selectedProjectId) return;

    setIsCreatingTask(true);
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle,
          assignedTo: newTaskAssignee,
          projectId: selectedProjectId,
          status: 'pending'
        })
      });

      if (!response.ok) throw new Error('Failed to create task');

      const newTask = await response.json();
      
      // If task is assigned to current user, add it to recent tasks
      if (newTask.assignedTo === user?.email) {
        setRecentTasks(prev => [newTask, ...prev].slice(0, 4));
      }
      
      // Update stats
      setStats(prev => prev ? {
        ...prev,
        totalTasks: prev.totalTasks + 1,
        pendingTasks: prev.pendingTasks + 1,
        myTasks: newTask.assignedTo === user?.email ? prev.myTasks + 1 : prev.myTasks
      } : null);
      
      // Reset form and close modal
      setNewTaskTitle('');
      setNewTaskAssignee('');
      setSelectedProjectId(null);
      setShowAddTaskModal(false);
    } catch (err) {
      console.error('Failed to create task:', err);
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || !newProjectDescription.trim()) return;

    setIsCreatingProject(true);
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProjectName.trim(),
          description: newProjectDescription.trim(),
          owner: user?.email
        })
      });

      if (!response.ok) throw new Error('Failed to create project');

      const newProject = await response.json();
      
      // Update recent projects
      setRecentProjects(prev => [newProject, ...prev].slice(0, 3));
      
      // Update stats
      setStats(prev => prev ? {
        ...prev,
        totalProjects: prev.totalProjects + 1
      } : null);
      
      // Reset form and close modal
      setNewProjectName('');
      setNewProjectDescription('');
      setShowCreateProjectModal(false);
    } catch (err) {
      console.error('Failed to create project:', err);
    } finally {
      setIsCreatingProject(false);
    }
  };

  if (authLoading || isLoading) {
    return <Loading text="Loading dashboard" />;
  }

  if (!user) {
    return null;
  }

  const getFirstName = (email: string) => {
    const name = email.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <div className="app-background min-h-screen">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif' }}>
                Welcome back, {getFirstName(user.email)}!
              </h1>
              <p className="text-lg text-purple-200" style={{ fontFamily: '"Source Sans Pro", "Helvetica Neue", Arial, sans-serif' }}>
                {user.role === 'admin' ? 'Manage your entire organization' : 
                 user.role === 'manager' ? 'Oversee your projects and team' : 
                 'Stay on top of your tasks'}
              </p>
            </div>
            
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Projects Statistics */}
          <div className="app-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-gray-900" style={{ fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif' }}>
                {stats?.totalProjects || 0}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1" style={{ fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif' }}>
              {user.role === 'admin' ? 'Total Projects' : user.role === 'manager' ? 'My Projects' : 'Active Projects'}
            </h3>
            <p className="text-gray-600" style={{ fontFamily: '"Source Sans Pro", "Helvetica Neue", Arial, sans-serif', fontSize: '14px' }}>
              {user.role === 'admin' ? 'All projects in system' : 
               user.role === 'manager' ? 'Projects you own' : 
               'Projects you work on'}
            </p>
          </div>

          {/* Tasks Statistics */}
          <div className="app-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-gray-900" style={{ fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif' }}>
                {user.role === 'member' ? (stats?.myTasks || 0) : (stats?.totalTasks || 0)}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1" style={{ fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif' }}>
              {user.role === 'member' ? 'My Tasks' : 'Total Tasks'}
            </h3>
            <p className="text-gray-600" style={{ fontFamily: '"Source Sans Pro", "Helvetica Neue", Arial, sans-serif', fontSize: '14px' }}>
              {user.role === 'member' ? 'Tasks assigned to you' : 'All tasks in system'}
            </p>
          </div>

          {/* Completed Tasks */}
          <div className="app-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-gray-900" style={{ fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif' }}>
                {stats?.completedTasks || 0}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1" style={{ fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif' }}>
              Completed
            </h3>
            <p className="text-gray-600" style={{ fontFamily: '"Source Sans Pro", "Helvetica Neue", Arial, sans-serif', fontSize: '14px' }}>
              Tasks marked as done
            </p>
          </div>

          {/* Users Statistics (Admin/Manager only) */}
          {(user.role === 'admin' || user.role === 'manager') && (
            <div className="app-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>
                <span className="text-2xl font-bold text-gray-900" style={{ fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif' }}>
                  {availableUsers.length}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1" style={{ fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif' }}>
                {user.role === 'admin' ? 'Total Users' : 'Team Members'}
              </h3>
              <p className="text-gray-600" style={{ fontFamily: '"Source Sans Pro", "Helvetica Neue", Arial, sans-serif', fontSize: '14px' }}>
                {user.role === 'admin' ? 'Registered users' : 'Available for tasks'}
              </p>
            </div>
          )}

          {/* Pending Tasks (Member only - replaces users card) */}
          {user.role === 'member' && (
            <div className="app-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-2xl font-bold text-gray-900" style={{ fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif' }}>
                  {stats?.pendingTasks || 0}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1" style={{ fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif' }}>
                Pending
              </h3>
              <p className="text-gray-600" style={{ fontFamily: '"Source Sans Pro", "Helvetica Neue", Arial, sans-serif', fontSize: '14px' }}>
                Tasks to complete
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions Section */}
        <div className="app-card p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif' }}>
                Quick Actions
              </h2>
              <p className="text-gray-600" style={{ fontFamily: '"Source Sans Pro", "Helvetica Neue", Arial, sans-serif', fontSize: '16px' }}>
                Quickly access common features and tools
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {/* Create Project Button (Admin only) */}
              {user.role === 'admin' && (
                <button
                  onClick={() => setShowCreateProjectModal(true)}
                  className="btn-primary px-6 py-3 flex items-center gap-2"
                  style={{ fontFamily: '"Roboto", "Open Sans", system-ui, sans-serif' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Project
                </button>
              )}

              {/* Add Task Button (Admin/Manager) */}
              {(user.role === 'admin' || user.role === 'manager') && (
                <button
                  onClick={() => {
                    setNewTaskAssignee(user?.email || '');
                    setShowAddTaskModal(true);
                  }}
                  className="px-6 py-3 flex items-center gap-2 font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-all duration-200"
                  style={{ fontFamily: '"Roboto", "Open Sans", system-ui, sans-serif' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Add Task
                </button>
              )}

              {/* View Tasks Button (All users) */}
              <a
                href="/tasks"
                className="px-6 py-3 flex items-center gap-2 font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-all duration-200"
                style={{ fontFamily: '"Roboto", "Open Sans", system-ui, sans-serif' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              View {user.role === 'member' ? 'My' : 'All'} Tasks
              </a>

              {/* View Projects Button (All users) */}
              <a
                href="/projects"
                className="px-6 py-3 flex items-center gap-2 font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-all duration-200"
                style={{ fontFamily: '"Roboto", "Open Sans", system-ui, sans-serif' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                View Projects
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="app-card max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 id="modal-title" className="heading-secondary">Add New Task</h2>
              <button
                onClick={() => setShowAddTaskModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4" role="form" aria-label="Add new task form">
              <div>
                <label htmlFor="task-title" className="block text-body font-medium text-gray-700 mb-2">
                  Task Title
                </label>
                <input
                  id="task-title"
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-body"
                  placeholder="Enter task title"
                  required
                  aria-describedby="task-title-error"
                />
              </div>

              <div>
                <label htmlFor="task-assignee" className="block text-body font-medium text-gray-700 mb-2">
                  Assign To
                </label>
                <select
                  id="task-assignee"
                  value={newTaskAssignee}
                  onChange={(e) => setNewTaskAssignee(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-body"
                  required
                  aria-describedby="task-assignee-help"
                >
                  <option value="">Select assignee</option>
                  {availableUsers.length > 0 ? (
                    availableUsers.map((userOption) => (
                      <option key={userOption.email} value={userOption.email}>
                        {userOption.email} ({userOption.role})
                      </option>
                    ))
                  ) : (
                    <option disabled>Loading users...</option>
                  )}
                </select>
                <p id="task-assignee-help" className="text-caption text-gray-500 mt-1">
                  Select a user to assign this task to
                </p>
              </div>

              <div>
                <label htmlFor="task-project" className="block text-body font-medium text-gray-700 mb-2">
                  Project
                </label>
                <select
                  id="task-project"
                  value={selectedProjectId || ''}
                  onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-body"
                  required
                  aria-describedby="task-project-help"
                >
                  <option value="">Select a project</option>
                  {recentProjects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                <p id="task-project-help" className="text-caption text-gray-500 mt-1">
                  Choose which project this task belongs to
                </p>
              </div>

              <div className="flex space-x-3 pt-4" role="group" aria-label="Form actions">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-body font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  aria-label="Cancel task creation"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingTask}
                  className="flex-1 btn-primary py-3 text-body font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  aria-label={isCreatingTask ? "Creating task, please wait" : "Create new task"}
                >
                  {isCreatingTask ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="project-modal-title">
          <div className="app-card max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 id="project-modal-title" className="text-xl font-bold text-gray-900" style={{ fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif' }}>
                Create New Project
              </h2>
              <button
                onClick={() => setShowCreateProjectModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4" role="form" aria-label="Create new project form">
              <div>
                <label htmlFor="project-name" className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: '"Roboto", "Open Sans", system-ui, sans-serif' }}>
                  Project Name
                </label>
                <input
                  id="project-name"
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ fontFamily: '"Source Sans Pro", "Helvetica Neue", Arial, sans-serif', fontSize: '15px' }}
                  placeholder="Enter project name"
                  required
                />
              </div>

              <div>
                <label htmlFor="project-description" className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: '"Roboto", "Open Sans", system-ui, sans-serif' }}>
                  Description
                </label>
                <textarea
                  id="project-description"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ fontFamily: '"Source Sans Pro", "Helvetica Neue", Arial, sans-serif', fontSize: '15px' }}
                  rows={3}
                  placeholder="Enter project description"
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateProjectModal(false)}
                  className="px-4 py-2 font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
                  style={{ fontFamily: '"Roboto", "Open Sans", system-ui, sans-serif', fontSize: '15px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingProject}
                  className="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: '"Roboto", "Open Sans", system-ui, sans-serif', fontSize: '15px' }}
                >
                  {isCreatingProject ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}