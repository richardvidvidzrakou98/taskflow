'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-lg border-b border-white/20" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent" aria-label="TaskFlow home">
                TaskFlow
              </Link>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-6">
              <Link
                href="/dashboard"
                className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive('/dashboard')
                    ? 'bg-purple-100 text-purple-700 shadow-sm'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/projects"
                className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive('/projects')
                    ? 'bg-purple-100 text-purple-700 shadow-sm'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                Projects
              </Link>
              <Link
                href="/tasks"
                className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive('/tasks')
                    ? 'bg-purple-100 text-purple-700 shadow-sm'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                Tasks
              </Link>
              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive('/admin')
                      ? 'bg-purple-100 text-purple-700 shadow-sm'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  Admin
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {user.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {user.email.split('@')[0]}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              aria-label="Logout from account"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="sm:hidden bg-white/95 backdrop-blur-md border-t border-white/20">
        <div className="px-4 pt-2 pb-3 space-y-1">
          <Link
            href="/dashboard"
            className={`block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
              isActive('/dashboard')
                ? 'bg-purple-100 text-purple-700'
                : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/projects"
            className={`block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
              isActive('/projects')
                ? 'bg-purple-100 text-purple-700'
                : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
            }`}
          >
            Projects
          </Link>
          <Link
            href="/tasks"
            className={`block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
              isActive('/tasks')
                ? 'bg-purple-100 text-purple-700'
                : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
            }`}
          >
            Tasks
          </Link>
          {user.role === 'admin' && (
            <Link
              href="/admin"
              className={`block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                isActive('/admin')
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
              }`}
            >
              Admin
            </Link>
          )}
          
          {/* Mobile user info */}
          <div className="flex items-center space-x-3 px-3 py-2 border-t border-gray-200 mt-3 pt-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {user.email.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                {user.email.split('@')[0]}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}