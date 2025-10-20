# TaskFlow Setup Guide

This guide will walk you through setting up TaskFlow on your local development environment.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v8.0.0 or higher) or **yarn**
- **Git**

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/taskflow.git
cd taskflow
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

The application uses file-based data storage, so no database setup is required. All data is stored in JSON files in the `data/` directory.

### 4. Start Development Server

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

## Default User Accounts

The application comes with pre-configured user accounts for testing:

### Admin Account

- **Email:** `admin@taskflow.com`
- **Password:** `admin123`
- **Role:** Admin
- **Permissions:** Full system access

### Manager Account

- **Email:** `manager@taskflow.com`
- **Password:** `manager123`
- **Role:** Manager
- **Permissions:** Can create/edit/delete tasks in owned projects

### Member Account

- **Email:** `member@taskflow.com`
- **Password:** `member123`
- **Role:** Member
- **Permissions:** Can view and mark own tasks as done

## File Structure

```
taskflow/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── projects/          # Project management pages
│   ├── tasks/             # Task management pages
│   └── login/             # Authentication pages
├── components/            # Reusable React components
├── contexts/              # React contexts (Auth)
├── data/                  # JSON data files
│   ├── users.json         # User accounts
│   ├── projects.json      # Projects data
│   └── tasks.json         # Tasks data
├── docs/                  # Documentation files
├── lib/                   # Utility libraries
│   ├── auth.ts           # Authentication logic
│   ├── data.ts           # Data access layer
│   └── rbac.ts           # Role-based access control
└── types/                 # TypeScript type definitions
```

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run type checking
npm run type-check

# Run linting
npm run lint
```

## Common Issues & Solutions

### Port Already in Use

If port 3000 is already in use:

```bash
npm run dev -- --port 3001
```

### Permission Errors

Make sure you have write permissions to the `data/` directory for user authentication and data persistence.

### Clear Browser Cache

If you experience login issues, clear your browser cache and cookies for `localhost:3000`.

## Next Steps

After successful setup:

1. Read the [RBAC Documentation](./RBAC_LOGIC.md) to understand the permission system
2. Check the [API Documentation](./API_REFERENCE.md) for backend integration details
3. Review the [Deployment Guide](./DEPLOYMENT.md) for production deployment
