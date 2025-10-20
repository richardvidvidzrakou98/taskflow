'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Loading from '@/components/Loading';
import ConfirmationModal from '@/components/ConfirmationModal';
import { Task, Project } from '@/types';
import { canMarkTaskDone, canEditTask, canDeleteTask } from '@/lib/rbac';

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('all');
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ title: '', assignedTo: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/projects')
      ]);

      if (!tasksRes.ok || !projectsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const tasksData = await tasksRes.json();
      const projectsData = await projectsRes.json();

      setTasks(tasksData);
      setProjects(projectsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskStatusToggle = async (taskId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'pending' ? 'done' : 'pending';
    
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update task');

      // Update local state
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus as 'pending' | 'done' } : task
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task status');
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setEditForm({ title: task.title, assignedTo: task.assignedTo });
  };

  const handleSaveEdit = async () => {
    if (!editingTaskId) return;

    try {
      const response = await fetch(`/api/tasks/${editingTaskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) throw new Error('Failed to update task');

      // Update local state
      setTasks(tasks.map(task => 
        task.id === editingTaskId ? { ...task, ...editForm } : task
      ));

      setEditingTaskId(null);
      setEditForm({ title: '', assignedTo: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditForm({ title: '', assignedTo: '' });
  };

  const handleDeleteTask = async (taskId: number) => {
    setTaskToDelete(taskId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      const response = await fetch(`/api/tasks/${taskToDelete}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete task');

      // Update local state
      setTasks(tasks.filter(task => task.id !== taskToDelete));
      setShowDeleteConfirm(false);
      setTaskToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      setShowDeleteConfirm(false);
      setTaskToDelete(null);
    }
  };

  const cancelDeleteTask = () => {
    setShowDeleteConfirm(false);
    setTaskToDelete(null);
  };

  const getProjectName = (projectId: number) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || `Project ${projectId}`;
  };

  const getProject = (projectId: number) => {
    return projects.find(p => p.id === projectId);
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  if (isLoading) return <Loading />;

  return (
    <div className="app-background min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif' }}>
                {user?.role === 'member' ? 'My Tasks' : 'All Tasks'}
              </h1>
              <p className="text-lg text-purple-200" style={{ fontFamily: '"Source Sans Pro", "Helvetica Neue", Arial, sans-serif' }}>Track and manage your tasks</p>
            </div>
            
            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === 'all'
                    ? 'btn-primary text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
                style={{ fontFamily: '"Roboto", "Open Sans", system-ui, sans-serif', fontSize: '15px' }}
              >
                All
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === 'pending'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
                style={{ fontFamily: '"Roboto", "Open Sans", system-ui, sans-serif', fontSize: '15px' }}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter('done')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === 'done'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
                style={{ fontFamily: '"Roboto", "Open Sans", system-ui, sans-serif', fontSize: '15px' }}
              >
                Done
              </button>
            </div>
          </div>

          {error && (
            <div className="app-card border-l-4 border-red-500 mb-6">
              <p className="text-red-700" style={{ fontFamily: '"Source Sans Pro", "Helvetica Neue", Arial, sans-serif', fontSize: '16px' }}>{error}</p>
            </div>
          )}

          {filteredTasks.length === 0 ? (
            <div className="app-card text-center">
              <p className="text-gray-500" style={{ fontFamily: '"Source Sans Pro", "Helvetica Neue", Arial, sans-serif', fontSize: '16px' }}>
                {filter === 'all' ? 'No tasks found' : `No ${filter} tasks found`}
              </p>
            </div>
          ) : (
            <div className="app-card">
              <div className="pb-6 border-b border-gray-200 mb-6">
                <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif' }}>
                  Tasks ({filteredTasks.length})
                </h2>
              </div>
              <div className="space-y-4">
                {filteredTasks.map((task) => {
                  const project = getProject(task.projectId);
                  const isEditing = editingTaskId === task.id;
                  
                  return (
                    <div key={task.id} className="task-card">
                      {isEditing ? (
                        // Edit Form
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: '"Roboto", "Open Sans", system-ui, sans-serif' }}>
                                Task Title
                              </label>
                              <input
                                type="text"
                                value={editForm.title}
                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                style={{ fontFamily: '"Source Sans Pro", "Helvetica Neue", Arial, sans-serif', fontSize: '15px' }}
                                placeholder="Enter task title"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: '"Roboto", "Open Sans", system-ui, sans-serif' }}>
                                Assigned To
                              </label>
                              <input
                                type="text"
                                value={editForm.assignedTo}
                                onChange={(e) => setEditForm({ ...editForm, assignedTo: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                style={{ fontFamily: '"Source Sans Pro", "Helvetica Neue", Arial, sans-serif', fontSize: '15px' }}
                                placeholder="Enter assignee"
                              />
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <button
                              onClick={handleSaveEdit}
                              className="btn-primary px-4 py-2"
                              style={{ fontFamily: '"Roboto", "Open Sans", system-ui, sans-serif', fontSize: '15px' }}
                            >
                              Save Changes
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-4 py-2 font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
                              style={{ fontFamily: '"Roboto", "Open Sans", system-ui, sans-serif', fontSize: '15px' }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Task Display
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 mb-2 truncate" style={{ fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif', fontSize: '17px' }}>
                              {task.title}
                            </h3>
                            <div className="text-gray-500 space-y-1" style={{ fontFamily: '"Source Sans Pro", "Helvetica Neue", Arial, sans-serif', fontSize: '14px' }}>
                              <p className="truncate">Project: {getProjectName(task.projectId)}</p>
                              <p className="truncate">Assigned to: {task.assignedTo}</p>
                              {user?.role !== 'member' && (
                                <p className="truncate">Owner: {project?.owner}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            <span
                              className={`status-badge ${
                                task.status === 'done' ? 'status-done' : 'status-pending'
                              } shrink-0`}
                              style={{ fontFamily: '"Roboto", "Open Sans", system-ui, sans-serif' }}
                            >
                              {task.status}
                            </span>
                            
                            <div className="flex flex-wrap gap-2">
                              {user && project && canMarkTaskDone(user, task, project) && (
                                <button
                                  onClick={() => handleTaskStatusToggle(task.id, task.status)}
                                  className="btn-primary px-3 py-1.5 text-sm whitespace-nowrap"
                                  style={{ fontFamily: '"Roboto", "Open Sans", system-ui, sans-serif' }}
                                >
                                  Mark as {task.status === 'pending' ? 'Done' : 'Pending'}
                                </button>
                              )}
                              
                              {user && project && canEditTask(user, task, project) && (
                                <button
                                  onClick={() => handleEditTask(task)}
                                  className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-all duration-200 whitespace-nowrap"
                                  style={{ fontFamily: '"Roboto", "Open Sans", system-ui, sans-serif' }}
                                >
                                  Edit
                                </button>
                              )}
                              
                              {user && project && canDeleteTask(user, task, project) && (
                                <button
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-all duration-200 whitespace-nowrap"
                                  style={{ fontFamily: '"Roboto", "Open Sans", system-ui, sans-serif' }}
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteTask}
        onCancel={cancelDeleteTask}
        type="danger"
      />
    </div>
  );
}