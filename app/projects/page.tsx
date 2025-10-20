'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Loading from '@/components/Loading';
import { Project, Task } from '@/types';
import { canEditProject } from '@/lib/rbac';
import Link from 'next/link';

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', description: '' });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      const [projectsRes, tasksRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/tasks')
      ]);

      if (!projectsRes.ok) throw new Error('Failed to fetch projects');
      
      const allProjects = await projectsRes.json();
      let filteredProjects = allProjects;

      // Filter projects based on user role
      if (user?.role === 'admin') {
        // Admin sees all projects
        filteredProjects = allProjects;
      } else if (user?.role === 'manager') {
        // Manager sees only projects they own
        filteredProjects = allProjects.filter((project: Project) => project.owner === user.email);
      } else if (user?.role === 'member') {
        // Member sees only projects where they have tasks
        if (tasksRes.ok) {
          const tasks = await tasksRes.json();
          const memberTasks = tasks.filter((task: any) => task.assignedTo === user.email);
          const memberProjectIds = new Set(memberTasks.map((task: any) => task.projectId));
          filteredProjects = allProjects.filter((project: Project) => memberProjectIds.has(project.id));
        } else {
          filteredProjects = []; // If tasks can't be fetched, show no projects
        }
      }

      setProjects(filteredProjects);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!createForm.name.trim() || !createForm.description.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createForm.name.trim(),
          description: createForm.description.trim(),
          owner: user?.email
        })
      });

      if (!response.ok) throw new Error('Failed to create project');

      const newProject = await response.json();
      setProjects([...projects, newProject]);
      setCreateForm({ name: '', description: '' });
      setShowCreateForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
    setCreateForm({ name: '', description: '' });
    setError('');
  };

  if (isLoading) return <Loading />;

  return (
    <div className="app-background min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="heading-primary text-white mb-2">
              {user?.role === 'admin' ? 'All Projects' : 
               user?.role === 'manager' ? 'My Projects' : 
               'Active Projects'}
            </h1>
            <p className="text-body text-purple-200">
              {user?.role === 'admin' ? 'Manage your project portfolio' : 
               user?.role === 'manager' ? 'Projects you own and manage' : 
               'Projects you are working on'}
            </p>
          </div>
          {user?.role === 'admin' && (
            <button 
              onClick={() => setShowCreateForm(true)}
              className="btn-primary px-8 py-4"
            >
              <span className="mr-2">+</span>
              New Project
            </button>
          )}
        </div>

        {/* Create Project Form Modal Overlay */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="app-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="heading-secondary text-gray-900 mb-4">Create New Project</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-body"
                    placeholder="Enter project name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-body"
                    rows={3}
                    placeholder="Enter project description"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleCreateProject}
                    disabled={isCreating}
                    className="btn-primary px-6 py-2 text-body disabled:opacity-50"
                  >
                    {isCreating ? 'Creating...' : 'Create Project'}
                  </button>
                  <button
                    onClick={handleCancelCreate}
                    className="px-6 py-2 text-body font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="app-card mb-6 border-l-4 border-red-500">
            <p className="text-body text-red-700">{error}</p>
          </div>
        )}

        {projects.length === 0 ? (
          <div className="app-card text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📁</span>
            </div>
            <h3 className="heading-secondary text-gray-800 mb-2">No projects found</h3>
            <p className="text-body text-gray-600">Get started by creating your first project</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <div
                key={project.id}
                className="project-card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-body">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  {user && canEditProject(user, project) && (
                    <span className="text-caption bg-white bg-opacity-20 text-white px-3 py-1 rounded-full font-medium">
                      Owner
                    </span>
                  )}
                </div>
                
                <h3 className="text-white mb-3">
                  {project.name}
                </h3>
                <p className="text-purple-200 mb-4 opacity-90">
                  {project.description.length > 80
                    ? project.description.substring(0, 80) + '...'
                    : project.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <span className="text-white text-caption font-bold">
                        {project.owner.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-caption text-purple-200">
                      {project.owner.split('@')[0]}
                    </span>
                  </div>
                  
                  <Link
                    href={`/projects/${project.id}`}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-medium text-caption flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                  >
                    <span>View</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}