import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken } from '@/lib/auth';
import { getProjectById, updateProject, deleteProject } from '@/lib/data';
import { canEditProject, hasPermission, PERMISSIONS } from '@/lib/rbac';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    if (!hasPermission(user.role, PERMISSIONS.PROJECT_VIEW)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const projectId = parseInt(id);
    const project = getProjectById(projectId);
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const projectId = parseInt(id);
    const project = getProjectById(projectId);
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (!canEditProject(user, project)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updates = await request.json();
    const updatedProject = updateProject(projectId, updates);
    
    if (!updatedProject) {
      return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
    }

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('Update project error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const projectId = parseInt(id);
    const project = getProjectById(projectId);
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (!canEditProject(user, project)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const deleted = deleteProject(projectId);
    
    if (!deleted) {
      return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}