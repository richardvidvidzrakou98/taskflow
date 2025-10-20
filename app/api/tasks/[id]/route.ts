import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken } from '@/lib/auth';
import { getTaskById, updateTask, deleteTask, getProjectById } from '@/lib/data';
import { canEditTask, canMarkTaskDone } from '@/lib/rbac';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authToken = request.cookies.get('auth-token')?.value;
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = validateAuthToken(authToken);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const taskId = parseInt(params.id);
    const task = getTaskById(taskId);
    
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const project = getProjectById(task.projectId);
    
    // Check if user can access this task
    if (user.role === 'member' && task.assignedTo !== user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authToken = request.cookies.get('auth-token')?.value;
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = validateAuthToken(authToken);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const taskId = parseInt(params.id);
    const task = getTaskById(taskId);
    
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const project = getProjectById(task.projectId);
    const updates = await request.json();

    // Check permissions based on what's being updated
    if (updates.status !== undefined) {
      // Status changes (mark as done/pending)
      if (!canMarkTaskDone(user, task, project || undefined)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else {
      // Other updates (title, assignee, etc.)
      if (!canEditTask(user, task, project || undefined)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const updatedTask = updateTask(taskId, updates);
    
    if (!updatedTask) {
      return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authToken = request.cookies.get('auth-token')?.value;
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = validateAuthToken(authToken);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const taskId = parseInt(params.id);
    const task = getTaskById(taskId);
    
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const project = getProjectById(task.projectId);
    
    if (!canEditTask(user, task, project || undefined)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const deleted = deleteTask(taskId);
    
    if (!deleted) {
      return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}