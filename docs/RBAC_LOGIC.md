# Role-Based Access Control (RBAC) Logic

TaskFlow implements a comprehensive RBAC system that controls access to features and data based on user roles.

## User Roles

### 1. Admin

**Highest privilege level with full system access**

**Permissions:**

- ✅ View all projects in the system
- ✅ Create new projects
- ✅ Edit/delete any project
- ✅ View all tasks in the system
- ✅ Create tasks in any project
- ✅ Edit/delete any task
- ✅ Assign tasks to any user
- ✅ Mark any task as done/pending
- ✅ View all user accounts
- ✅ Access admin dashboard with system-wide statistics

**Dashboard Statistics:**

- Total projects in system
- Total tasks in system
- Total users in system
- Completed tasks across all projects

### 2. Manager

**Project ownership and team management**

**Permissions:**

- ✅ View all projects (but can only edit owned projects)
- ✅ Create new projects (becomes owner)
- ✅ Edit/delete projects they own
- ✅ View tasks in their projects
- ✅ Create tasks in their projects
- ✅ Edit/delete tasks in their projects
- ✅ Assign tasks in their projects
- ✅ Mark tasks as done/pending in their projects
- ✅ View team members for task assignment
- ❌ Cannot access other managers' projects
- ❌ Cannot view system-wide admin statistics

**Dashboard Statistics:**

- Projects they own
- Tasks in their projects
- Team members available
- Completed tasks in their projects

### 3. Member

**Task execution with limited access**

**Permissions:**

- ✅ View projects where they have assigned tasks
- ✅ View tasks assigned to them
- ✅ Mark their own tasks as done/pending
- ❌ Cannot create projects
- ❌ Cannot create tasks
- ❌ Cannot edit/delete tasks
- ❌ Cannot assign tasks to others
- ❌ Cannot view tasks not assigned to them
- ❌ Cannot view projects without their tasks

**Dashboard Statistics:**

- Projects they work on (have tasks in)
- Tasks assigned to them
- Their completed tasks
- Their pending tasks

## RBAC Implementation

### Frontend Access Control

#### 1. Route Protection

```typescript
// Authentication check in pages
const { user } = useAuth();
if (!user) return <LoginPage />;
```

#### 2. Component-Level Access

```typescript
// Conditional rendering based on role
{
  user.role === "admin" && <CreateProjectButton />;
}

{
  (user.role === "admin" || user.role === "manager") && <AddTaskButton />;
}
```

#### 3. Data Filtering

```typescript
// Projects filtering by role
if (user.role === "admin") {
  filteredProjects = allProjects;
} else if (user.role === "manager") {
  filteredProjects = allProjects.filter((p) => p.owner === user.email);
} else if (user.role === "member") {
  const memberProjectIds = new Set(myTasks.map((t) => t.projectId));
  filteredProjects = allProjects.filter((p) => memberProjectIds.has(p.id));
}
```

### Backend API Protection

#### 1. Authentication Middleware

```typescript
// Every API route validates auth token
const authToken = request.cookies.get("auth-token")?.value;
const user = validateAuthToken(authToken);
if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
```

#### 2. Permission Checks

```typescript
// Permission validation using RBAC functions
if (!hasPermission(user.role, PERMISSIONS.PROJECT_CREATE)) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

#### 3. Data Access Control

```typescript
// Task deletion - only owners and admins
export function canDeleteTask(
  user: AuthUser,
  task: Task,
  project?: Project
): boolean {
  if (user.role === "admin") return true;
  if (user.role === "manager" && project?.owner === user.email) return true;
  return false;
}
```

## Permission Matrix

| Action                     | Admin | Manager | Member |
| -------------------------- | ----- | ------- | ------ |
| View all projects          | ✅    | ✅      | ❌     |
| View own/relevant projects | ✅    | ✅      | ✅     |
| Create projects            | ✅    | ✅      | ❌     |
| Edit owned projects        | ✅    | ✅      | ❌     |
| Delete owned projects      | ✅    | ✅      | ❌     |
| View all tasks             | ✅    | ❌      | ❌     |
| View project tasks         | ✅    | ✅\*    | ❌     |
| View assigned tasks        | ✅    | ✅      | ✅     |
| Create tasks               | ✅    | ✅\*    | ❌     |
| Edit tasks                 | ✅    | ✅\*    | ❌     |
| Delete tasks               | ✅    | ✅\*    | ❌     |
| Mark tasks done/pending    | ✅    | ✅\*    | ✅\*\* |

\*Only in projects they own
\*\*Only their own assigned tasks

## Security Features

### 1. Token-Based Authentication

- JWT tokens stored in HTTP-only cookies
- Token validation on every API request
- Automatic token expiration

### 2. Role Validation

- User role stored in token payload
- Backend validates role permissions
- Frontend hides unauthorized UI elements

### 3. Data Isolation

- Members only see relevant projects/tasks
- Managers restricted to owned projects
- API responses filtered by user permissions

### 4. Input Validation

- All API endpoints validate required fields
- Type checking with TypeScript
- Sanitization of user inputs

## Error Handling

### Authentication Errors

- **401 Unauthorized**: Invalid or missing token
- **403 Forbidden**: Valid user but insufficient permissions
- **404 Not Found**: Resource doesn't exist or user can't access it

### Frontend Error States

- Loading states during authentication
- Error messages for failed actions
- Graceful degradation for unauthorized features
- Empty states when no data is available

## Best Practices Implemented

1. **Principle of Least Privilege**: Users get minimum necessary permissions
2. **Defense in Depth**: Both frontend and backend validate permissions
3. **Fail Secure**: Deny access when in doubt
4. **Consistent UX**: Clear feedback about permissions and restrictions
5. **Audit Trail**: All actions logged with user context
