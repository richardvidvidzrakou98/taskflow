import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken } from '@/lib/auth';
import { getAllTasks, getTasksByAssignee, getTasksByProject, createTask, getProjectById } from '@/lib/data';
import { hasPermission, PERMISSIONS, canCreateTask } from '@/lib/rbac';

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

    if (!hasPermission(user.role, PERMISSIONS.TASK_VIEW)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const url = new URL(request.url);
    const projectId = url.searchParams.get('projectId');

    // Filter tasks based on role and project
    let tasks;
    if (projectId) {
      tasks = getTasksByProject(parseInt(projectId));
      // Further filter based on user role
      if (user.role === 'member') {
        tasks = tasks.filter(task => task.assignedTo === user.email);
      }
    } else {
      if (user.role === 'admin') {
        tasks = getAllTasks();
      } else if (user.role === 'member') {
        tasks = getTasksByAssignee(user.email);
      } else {
        // Manager sees all tasks
        tasks = getAllTasks();
      }
    }

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authToken = request.cookies.get('auth-token')?.value;
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = validateAuthToken(authToken);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { title, assignedTo, projectId, status = 'pending' } = await request.json();

    if (!title || !assignedTo || !projectId) {
      return NextResponse.json(
        { error: 'Title, assignedTo, and projectId are required' },
        { status: 400 }
      );
    }

    // Check if project exists
    const project = getProjectById(projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Check permissions
    if (!canCreateTask(user, project)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const task = createTask({ title, assignedTo, projectId, status });
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}