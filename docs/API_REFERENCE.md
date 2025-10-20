# API Reference

TaskFlow provides a RESTful API for managing users, projects, and tasks with role-based access control.

## Authentication

All API endpoints require authentication via JWT tokens stored in HTTP-only cookies.

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@taskflow.com",
  "password": "admin123"
}
```

**Response:**

```json
{
  "user": {
    "email": "admin@taskflow.com",
    "role": "admin"
  }
}
```

### Logout

```http
POST /api/auth/logout
```

**Response:**

```json
{
  "message": "Logged out successfully"
}
```

## Users API

### Get Users

```http
GET /api/users
```

**Permissions:**

- Admin: All users
- Manager: All users (for task assignment)
- Member: Self and managers/admins only

**Response:**

```json
[
  {
    "email": "admin@taskflow.com",
    "role": "admin"
  },
  {
    "email": "manager@taskflow.com",
    "role": "manager"
  }
]
```

## Projects API

### Get Projects

```http
GET /api/projects
```

**Permissions:**

- Admin: All projects
- Manager: All projects (edit only owned)
- Member: Projects with assigned tasks

**Response:**

```json
[
  {
    "id": 1,
    "name": "Website Redesign",
    "description": "Complete overhaul of company website",
    "owner": "manager@taskflow.com"
  }
]
```

### Create Project

```http
POST /api/projects
Content-Type: application/json

{
  "name": "New Project",
  "description": "Project description",
  "owner": "manager@taskflow.com"
}
```

**Permissions:** Admin, Manager

**Response:**

```json
{
  "id": 2,
  "name": "New Project",
  "description": "Project description",
  "owner": "manager@taskflow.com"
}
```

### Get Single Project

```http
GET /api/projects/{id}
```

**Permissions:** Based on role and project access

### Update Project

```http
PATCH /api/projects/{id}
Content-Type: application/json

{
  "name": "Updated Project Name",
  "description": "Updated description"
}
```

**Permissions:** Admin or project owner

### Delete Project

```http
DELETE /api/projects/{id}
```

**Permissions:** Admin or project owner

## Tasks API

### Get Tasks

```http
GET /api/tasks
GET /api/tasks?projectId=1
```

**Query Parameters:**

- `projectId` (optional): Filter tasks by project

**Permissions:**

- Admin: All tasks
- Manager: Tasks in owned projects
- Member: Only assigned tasks

**Response:**

```json
[
  {
    "id": 1,
    "title": "Design homepage mockup",
    "assignedTo": "member@taskflow.com",
    "projectId": 1,
    "status": "pending"
  }
]
```

### Create Task

```http
POST /api/tasks
Content-Type: application/json

{
  "title": "New Task",
  "assignedTo": "member@taskflow.com",
  "projectId": 1,
  "status": "pending"
}
```

**Permissions:** Admin or project owner

**Response:**

```json
{
  "id": 2,
  "title": "New Task",
  "assignedTo": "member@taskflow.com",
  "projectId": 1,
  "status": "pending"
}
```

### Update Task

```http
PATCH /api/tasks/{id}
Content-Type: application/json

{
  "title": "Updated Task Title",
  "assignedTo": "member@taskflow.com",
  "status": "done"
}
```

**Permissions:**

- Admin: Any task
- Manager: Tasks in owned projects
- Member: Only status updates on assigned tasks

### Delete Task

```http
DELETE /api/tasks/{id}
```

**Permissions:** Admin or project owner

## Error Responses

### 401 Unauthorized

```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden

```json
{
  "error": "Forbidden"
}
```

### 404 Not Found

```json
{
  "error": "Resource not found"
}
```

### 400 Bad Request

```json
{
  "error": "Name and description are required"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```

## Rate Limiting

Currently no rate limiting is implemented, but it's recommended for production deployments.

## Data Models

### User

```typescript
interface User {
  email: string;
  password: string; // hashed
  role: "admin" | "manager" | "member";
}
```

### Project

```typescript
interface Project {
  id: number;
  name: string;
  description: string;
  owner: string; // user email
}
```

### Task

```typescript
interface Task {
  id: number;
  title: string;
  assignedTo: string; // user email
  projectId: number;
  status: "pending" | "done";
}
```

## CORS Configuration

The API accepts requests from the same origin. For production, configure CORS settings appropriately.

## Authentication Headers

Authentication is handled via HTTP-only cookies. No additional headers are required once logged in.

## API Testing

Use tools like Postman, curl, or Insomnia to test the API endpoints. Remember to authenticate first to receive the necessary cookies.
