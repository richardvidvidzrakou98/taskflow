import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken } from '@/lib/auth';
import { getAllUsers, updateUserRole } from '@/lib/data';
import { UserRole } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const authToken = request.cookies.get('auth-token')?.value;
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = validateAuthToken(authToken);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const users = getAllUsers();
    // Remove password from response for security
    const safeUsers = users.map(({ password, ...user }) => user);
    
    return NextResponse.json(safeUsers);
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authToken = request.cookies.get('auth-token')?.value;
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = validateAuthToken(authToken);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { email, role } = await request.json();

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      );
    }

    if (!['admin', 'manager', 'member'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Prevent users from changing their own role
    if (email === user.email) {
      return NextResponse.json(
        { error: 'Cannot change your own role' },
        { status: 400 }
      );
    }

    const updatedUser = updateUserRole(email, role as UserRole);
    
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Remove password from response
    const { password, ...safeUser } = updatedUser;
    return NextResponse.json(safeUser);
  } catch (error) {
    console.error('Update user role error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}