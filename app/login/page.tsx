'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Loading from '@/components/Loading';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, login, isHydrated } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (isHydrated && user) {
      router.push('/dashboard');
    }
  }, [user, router, isHydrated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      login(data.user, data.token);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const demoUsers = [
    { email: 'admin@taskflow.com', role: 'Admin', color: 'bg-purple-500' },
    { email: 'manager@taskflow.com', role: 'Manager', color: 'bg-blue-500' },
    { email: 'member@taskflow.com', role: 'Member', color: 'bg-green-500' },
  ];

  const fillCredentials = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
  };

  if (!isHydrated) {
    return <Loading text="Loading..." />;
  }

  if (user) {
    return <Loading text="Redirecting..." />;
  }

  return (
    <div className="app-background min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="heading-primary text-white mb-2">
            Welcome to TaskFlow
          </h1>
          <p className="text-body text-purple-200">
            Role-based task management system
          </p>
        </div>

        {/* Login Card */}
        <div className="app-card">
          <div className="text-center mb-6">
            <h2 className="heading-secondary text-gray-800">Sign In</h2>
            <p className="text-body text-gray-600 mt-2">Access your dashboard</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-body font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-body"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-body font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-body"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-4 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-body"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Demo Credentials Card */}
        <div className="app-card">
          <h3 className="heading-secondary text-gray-800 mb-4 text-center">
             Demo Accounts
          </h3>
          <div className="space-y-4">
            {demoUsers.map((user, index) => (
              <div
                key={user.email}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 ${user.color} rounded-full flex items-center justify-center`}>
                    <span className="text-white font-bold text-body">
                      {user.role.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-body font-medium text-gray-800">{user.role}</p>
                    <p className="text-caption text-gray-600">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => fillCredentials(user.email, '123456')}
                  className="text-purple-600 hover:text-purple-700 text-body font-medium px-4 py-2 rounded-lg hover:bg-purple-50 transition-all duration-200"
                  disabled={isLoading}
                >
                  Use
                </button>
              </div>
            ))}
          </div>
          <p className="text-caption text-gray-500 text-center mt-4">
            All demo accounts use password: <span className="font-mono bg-gray-200 px-2 py-1 rounded">123456</span>
          </p>
        </div>
      </div>
    </div>
  );
}