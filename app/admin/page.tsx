'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Loading from '@/components/Loading';
import { User, UserRole } from '@/types';

interface Analytics {
  totalUsers: number;
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  completionRate: number;
  usersByRole: {
    admin: number;
    manager: number;
    member: number;
  };
}

export default function AdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAdminData();
    }
  }, [user]);

  const fetchAdminData = async () => {
    try {
      const [usersRes, analyticsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/analytics')
      ]);

      if (!usersRes.ok || !analyticsRes.ok) {
        throw new Error('Failed to fetch admin data');
      }

      const usersData = await usersRes.json();
      const analyticsData = await analyticsRes.json();

      setUsers(usersData);
      setAnalytics(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch admin data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userEmail: string, newRole: UserRole) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, role: newRole })
      });

      if (!response.ok) throw new Error('Failed to update user role');

      // Update local state
      setUsers(users.map(u => 
        u.email === userEmail ? { ...u, role: newRole } : u
      ));

      // Refresh analytics
      fetchAdminData();
    } catch (err) {
      console.error('Failed to update user role:', err);
      setError('Failed to update user role');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="app-background min-h-screen">
        <Navbar />
        <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="app-card border-l-4 border-red-500">
              <p className="text-body text-red-700">Access denied. Admin privileges required.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) return <Loading text="Loading admin panel..." />;

  return (
    <div className="app-background min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="heading-primary text-white mb-2">Admin Panel</h1>
            <p className="text-body text-purple-200">Manage users and view system analytics</p>
          </div>

          {error && (
            <div className="app-card border-l-4 border-red-500 mb-6">
              <p className="text-body text-red-700">{error}</p>
            </div>
          )}

          {/* Analytics Section */}
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
              <div className="app-card">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-body font-medium">👥</span>
                    </div>
                  </div>
                  <div className="ml-4 w-0 flex-1">
                    <dt className="text-caption font-medium text-gray-500 truncate">
                      Total Users
                    </dt>
                    <dd className="heading-secondary text-gray-900">
                      {analytics.totalUsers}
                    </dd>
                  </div>
                </div>
              </div>

              <div className="app-card">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-body font-medium">📁</span>
                    </div>
                  </div>
                  <div className="ml-4 w-0 flex-1">
                    <dt className="text-caption font-medium text-gray-500 truncate">
                      Total Projects
                    </dt>
                    <dd className="heading-secondary text-gray-900">
                      {analytics.totalProjects}
                    </dd>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm font-medium">📋</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Tasks
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {analytics.totalTasks}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm font-medium">%</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Completion Rate
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {analytics.completionRate}%
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Task Analytics */}
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Task Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Completed</span>
                    <span className="text-sm font-medium text-green-600">
                      {analytics.completedTasks}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pending</span>
                    <span className="text-sm font-medium text-yellow-600">
                      {analytics.pendingTasks}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Users by Role</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Admins</span>
                    <span className="text-sm font-medium text-red-600">
                      {analytics.usersByRole.admin}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Managers</span>
                    <span className="text-sm font-medium text-blue-600">
                      {analytics.usersByRole.manager}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Members</span>
                    <span className="text-sm font-medium text-green-600">
                      {analytics.usersByRole.member}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User Management */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">User Management</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Change Role
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((userItem) => (
                    <tr key={userItem.email}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {userItem.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          userItem.role === 'admin' 
                            ? 'bg-red-100 text-red-800'
                            : userItem.role === 'manager'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {userItem.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={userItem.role}
                          onChange={(e) => handleRoleChange(userItem.email, e.target.value as UserRole)}
                          disabled={userItem.email === user.email} // Prevent self-role change
                          className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        >
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                          <option value="member">Member</option>
                        </select>
                        {userItem.email === user.email && (
                          <p className="text-xs text-gray-500 mt-1">Cannot change own role</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}