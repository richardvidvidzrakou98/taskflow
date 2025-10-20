import { AuthUser, User, UserRole } from '@/types';
import usersData from '@/data/users.json';

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export function validateCredentials(email: string, password: string): User | null {
  const user = usersData.find(u => u.email === email && u.password === password);
  return user ? { ...user, role: user.role as UserRole } : null;
}

export function getUserByEmail(email: string): User | null {
  const user = usersData.find(u => u.email === email);
  return user ? { ...user, role: user.role as UserRole } : null;
}

export function createAuthToken(user: AuthUser): string {
  // In a real app, this would be a proper JWT token
  return Buffer.from(JSON.stringify(user)).toString('base64');
}

export function validateAuthToken(token: string): AuthUser | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const user = JSON.parse(decoded) as AuthUser;
    // Verify user still exists
    const existingUser = getUserByEmail(user.email);
    if (!existingUser) return null;
    return user;
  } catch {
    return null;
  }
}

export function getAuthTokenFromCookies(cookies: string): string | null {
  const authCookie = cookies
    .split(';')
    .find(cookie => cookie.trim().startsWith('auth-token='));
  
  return authCookie ? authCookie.split('=')[1] : null;
}