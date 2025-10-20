import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken } from '@/lib/auth';
import { getAllUsers, getAllProjects, getTaskStats } from '@/lib/data';

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
    const projects = getAllProjects();
    const taskStats = getTaskStats();

    // Count users by role
    const usersByRole = {
      admin: users.filter(u => u.role === 'admin').length,
      manager: users.filter(u => u.role === 'manager').length,
      member: users.filter(u => u.role === 'member').length,
    };

    const analytics = {
      totalUsers: users.length,
      totalProjects: projects.length,
      totalTasks: taskStats.total,
      completedTasks: taskStats.completed,
      pendingTasks: taskStats.pending,
      completionRate: taskStats.completionRate,
      usersByRole,
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Get analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}