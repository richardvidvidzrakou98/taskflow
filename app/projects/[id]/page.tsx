'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Loading from '@/components/Loading';
import ConfirmationModal from '@/components/ConfirmationModal';
import { Project, Task } from '@/types';
import { canEditProject, canCreateTask, canEditTask, canMarkTaskDone } from '@/lib/rbac';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskAssignee, setEditTaskAssignee] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        fetch(`/api/projects/${id}`),
        fetch(`/api/tasks?projectId=${id}`)
      ]);

      if (!projectRes.ok || !tasksRes.ok) {
        throw new Error('Failed to fetch project data');
      }

      const projectData = await projectRes.json();
      const tasksData = await tasksRes.json();

      setProject(projectData);
      setTasks(tasksData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch project data');
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
      console.error('Failed to update task:', err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskAssignee.trim()) return;

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle,
          assignedTo: newTaskAssignee,
          projectId: Number(id),
          status: 'pending'
        })
      });

      if (!response.ok) throw new Error('Failed to create task');

      const newTask = await response.json();
      setTasks([...tasks, newTask]);
      setNewTaskTitle('');
      setNewTaskAssignee('');
      setShowNewTaskForm(false);
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleEditTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editTaskTitle.trim() || !editTaskAssignee.trim()) return;

    try {
      const response = await fetch(`/api/tasks/${editingTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTaskTitle,
          assignedTo: editTaskAssignee
        })
      });

      if (!response.ok) throw new Error('Failed to update task');

      const updatedTask = await response.json();
      setTasks(tasks.map(task => 
        task.id === editingTask.id ? updatedTask : task
      ));
      setEditingTask(null);
      setEditTaskTitle('');
      setEditTaskAssignee('');
    } catch (err) {
      console.error('Failed to update task:', err);
    }
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

      setTasks(tasks.filter(task => task.id !== taskToDelete));
      setShowDeleteConfirm(false);
      setTaskToDelete(null);
    } catch (err) {
      console.error('Failed to delete task:', err);
      setShowDeleteConfirm(false);
      setTaskToDelete(null);
    }
  };

  const cancelDeleteTask = () => {
    setShowDeleteConfirm(false);
    setTaskToDelete(null);
  };

  const startEditingTask = (task: Task) => {
    setEditingTask(task);
    setEditTaskTitle(task.title);
    setEditTaskAssignee(task.assignedTo);
  };

  if (isLoading) return <Loading />;
  if (error) return <div className="text-red-600 p-4">{error}</div>;
  if (!project) return <div className="text-gray-600 p-4">Project not found</div>;

  return (
    <div className="app-background min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
            <div>
              <button
                onClick={() => router.back()}
                className="text-purple-200 hover:text-white mb-4 flex items-center gap-2"
                style={{ fontFamily: '"Roboto", "Open Sans", system-ui, sans-serif' }}
              >
                ← Back to Projects
              </button>
              <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif' }}>
                {project.name}
              </h1>
              <p className="text-lg text-purple-200 mb-2" style={{ fontFamily: '"Source Sans Pro", "Helvetica Neue", Arial, sans-serif' }}>
                {project.description}
              </p>
              <p className="text-purple-200" style={{ fontFamily: '"Source Sans Pro", "Helvetica Neue", Arial, sans-serif', fontSize: '14px' }}>
                Owner: {project.owner}
              </p>
            </div>
            {user && canCreateTask(user, project) && (
              <button
                onClick={() => setShowNewTaskForm(true)}
                className="btn-primary px-8 py-4"
                style={{ fontFamily: '"Roboto", "Open Sans", system-ui, sans-serif' }}
              >
                <span className="mr-2">+</span>
                Add Task
              </button>
            )}
          </div>

          {/* New Task Form */}
          {showNewTaskForm && (
            <div className="app-card mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif' }}>
                Create New Task
              </h3>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: '"Roboto", "Open Sans", system-ui, sans-serif' }}>
                      Task Title
                    </label>
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{ fontFamily: '"Source Sans Pro", "Helvetica Neue", Arial, sans-serif', fontSize: '15px' }}
                      placeholder="Enter task title"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: '"Roboto", "Open Sans", system-ui, sans-serif' }}>
                      Assign to (email)
                    </label>
                    <input
                      type="email"
                      value={newTaskAssignee}
                      onChange={(e) => setNewTaskAssignee(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{ fontFamily: '"Source Sans Pro", "Helvetica Neue", Arial, sans-serif', fontSize: '15px' }}
                      placeholder="Enter assignee email"
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="submit"
                    className="btn-primary px-4 py-2"
                    style={{ fontFamily: '"Roboto", "Open Sans", system-ui, sans-serif', fontSize: '15px' }}
                  >
                    Create Task
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewTaskForm(false)}
                    className="px-4 py-2 font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
                    style={{ fontFamily: '"Roboto", "Open Sans", system-ui, sans-serif', fontSize: '15px' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Edit Task Form */}
          {editingTask && (
            <div className="app-card mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif' }}>
                Edit Task
              </h3>
              <form onSubmit={handleEditTask} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: '"Roboto", "Open Sans", system-ui, sans-serif' }}>
                      Task Title
                    </label>
                    <input
                      type="text"
                      value={editTaskTitle}
                      onChange={(e) => setEditTaskTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{ fontFamily: '"Source Sans Pro", "Helvetica Neue", Arial, sans-serif', fontSize: '15px' }}
                      placeholder="Enter task title"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: '"Roboto", "Open Sans", system-ui, sans-serif' }}>
                      Assign to (email)
                    </label>
                    <input
                      type="email"
                      value={editTaskAssignee}
                      onChange={(e) => setEditTaskAssignee(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{ fontFamily: '"Source Sans Pro", "Helvetica Neue", Arial, sans-serif', fontSize: '15px' }}
                      placeholder="Enter assignee email"
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="submit"
                    className="btn-primary px-4 py-2"
                    style={{ fontFamily: '"Roboto", "Open Sans", system-ui, sans-serif', fontSize: '15px' }}
                  >
                    Update Task
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTask(null);
                      setEditTaskTitle('');
                      setEditTaskAssignee('');
                    }}
                    className="px-4 py-2 font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
                    style={{ fontFamily: '"Roboto", "Open Sans", system-ui, sans-serif', fontSize: '15px' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tasks List */}
          <div className="app-card">
            <div className="pb-6 border-b border-gray-200 mb-6">
              <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif' }}>
                Tasks ({tasks.length})
              </h2>
            </div>
            <div className="space-y-4">
              {tasks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500" style={{ fontFamily: '"Source Sans Pro", "Helvetica Neue", Arial, sans-serif', fontSize: '16px' }}>
                    No tasks in this project yet
                  </p>
                </div>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} className="task-card">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-2 truncate" style={{ fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif', fontSize: '17px' }}>
                          {task.title}
                        </h3>
                        <div className="text-gray-500 space-y-1" style={{ fontFamily: '"Source Sans Pro", "Helvetica Neue", Arial, sans-serif', fontSize: '14px' }}>
                          <p className="truncate">Assigned to: {task.assignedTo}</p>
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
                          {user && canMarkTaskDone(user, task, project) && (
                            <button
                              onClick={() => handleTaskStatusToggle(task.id, task.status)}
                              className="btn-primary px-3 py-1.5 text-sm whitespace-nowrap"
                              style={{ fontFamily: '"Roboto", "Open Sans", system-ui, sans-serif' }}
                            >
                              Mark as {task.status === 'pending' ? 'Done' : 'Pending'}
                            </button>
                          )}
                          
                          {user && canEditTask(user, task, project) && (
                            <button
                              onClick={() => startEditingTask(task)}
                              className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-all duration-200 whitespace-nowrap"
                              style={{ fontFamily: '"Roboto", "Open Sans", system-ui, sans-serif' }}
                            >
                              Edit
                            </button>
                          )}
                          
                          {user && canEditTask(user, task, project) && (
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
                  </div>
                ))
              )}
            </div>
          </div>
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