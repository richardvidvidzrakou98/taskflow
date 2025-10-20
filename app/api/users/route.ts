import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken } from '@/lib/auth';
import { getAllUsers } from '@/lib/data';
import { hasPermission, PERMISSIONS } from '@/lib/rbac';

export async function GET(request: NextRequest) {
  try {
    const authToken = request.cookies.get('auth-token')?.value;
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = validateAuthToken(authToken);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Allow all authenticated users to view user list for task assignment
    // but restrict based on their role
    const users = getAllUsers();
    let userEmails;
    
    if (user.role === 'admin' || user.role === 'manager') {
      // Admins and managers can see all users
      userEmails = users.map(({ email, role }) => ({ email, role }));
    } else {
      // Members can only see themselves and managers/admins for task assignment
      userEmails = users
        .filter(u => u.role === 'admin' || u.role === 'manager' || u.email === user.email)
        .map(({ email, role }) => ({ email, role }));
    }
    
    return NextResponse.json(userEmails);
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}