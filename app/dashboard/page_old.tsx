'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Loading from '@/components/Loading';
import { Task, Project } from '@/types';

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

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [projectsRes, tasksRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/tasks'),
      ]);

      if (projectsRes.ok && tasksRes.ok) {
        const projects: Project[] = await projectsRes.json();
        const tasks: Task[] = await tasksRes.json();

        // Calculate stats
        const myTasks = tasks.filter(task => task.assignedTo === user?.email);
        const completedTasks = tasks.filter(task => task.status === 'done');
        const pendingTasks = tasks.filter(task => task.status === 'pending');

        setStats({
          totalProjects: projects.length,
          totalTasks: tasks.length,
          completedTasks: completedTasks.length,
          pendingTasks: pendingTasks.length,
          myTasks: myTasks.length,
        });

        // Get recent items (limit to 3 projects, 4 tasks)
        setRecentProjects(projects.slice(0, 3));
        setRecentTasks(myTasks.slice(0, 4));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return <Loading text="Loading dashboard..." />;
  }

  if (!user) {
    return null;
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getUserFirstName = (email: string) => {
    return email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1);
  };

  return (
    <div className="gradient-bg min-h-screen">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {getGreeting()}, {getUserFirstName(user.email)}!
              </h1>
              <p className="text-gray-600">Have a nice day</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {getUserFirstName(user.email).charAt(0)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Projects */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Projects Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">My Projects</h2>
                <span className="text-purple-200 text-sm">{stats?.totalProjects} total</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {recentProjects.map((project, index) => (
                  <div key={project.id} className="purple-card p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <span className="text-purple-200 text-xs">
                        Project {project.id}
                      </span>
                    </div>
                    
                    <h3 className="text-white font-bold text-lg mb-1">
                      {project.name}
                    </h3>
                    <p className="text-purple-200 text-sm mb-4">
                      {project.description}
                    </p>
                    
                    <div className="text-purple-200 text-xs">
                      Owner: {project.owner.split('@')[0]}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Section */}
            {stats && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Progress</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-bold">📊</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Task Completion</p>
                        <p className="text-sm text-gray-600">
                          {stats.completedTasks} of {stats.totalTasks} completed
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-purple-600">
                        {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">My Tasks</p>
                        <p className="text-sm text-gray-600">Tasks assigned to me</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">{stats.myTasks}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Tasks */}
          <div className="space-y-6">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Tasks</h3>
                <button className="btn-primary px-4 py-2 text-sm">
                  + Add Task
                </button>
              </div>
              
              <div className="space-y-3">
                {recentTasks.length > 0 ? (
                  recentTasks.map((task) => (
                    <div key={task.id} className="task-item p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs font-bold">📝</span>
                        </div>
                        <span className={task.status === 'done' ? 'status-done' : 'status-pending'}>
                          {task.status}
                        </span>
                      </div>
                      
                      <h4 className="font-semibold text-gray-800 text-sm mb-1">
                        {task.title}
                      </h4>
                      <p className="text-xs text-gray-600">
                        Project #{task.projectId}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No tasks assigned yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            {stats && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-purple-50 rounded-xl">
                    <p className="text-2xl font-bold text-purple-600">{stats.totalProjects}</p>
                    <p className="text-xs text-gray-600">Projects</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-xl">
                    <p className="text-2xl font-bold text-orange-600">{stats.pendingTasks}</p>
                    <p className="text-xs text-gray-600">Pending</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <p className="text-2xl font-bold text-green-600">{stats.completedTasks}</p>
                    <p className="text-xs text-gray-600">Completed</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <p className="text-2xl font-bold text-blue-600">{stats.myTasks}</p>
                    <p className="text-xs text-gray-600">My Tasks</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}