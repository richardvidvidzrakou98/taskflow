# TaskFlow - Role-Based Task Management System

A modern, responsive task management application built with Next.js 15, featuring role-based access control (RBAC) and real-time task tracking.

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[Setup Guide](docs/SETUP_GUIDE.md)** - Complete installation and configuration instructions
- **[RBAC Logic](docs/RBAC_LOGIC.md)** - Detailed role-based access control implementation
- **[API Reference](docs/API_REFERENCE.md)** - Complete API documentation with examples
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment instructions for various platforms

## 🚀 Features

### Core Functionality

- **Authentication System** - Secure login with JWT-like tokens
- **Role-Based Access Control (RBAC)** - Three user roles with distinct permissions
- **Project Management** - Create, view, and manage projects
- **Task Management** - Full CRUD operations with status tracking
- **Admin Panel** - User management and system analytics
- **Real-time Updates** - Instant UI updates without page refreshes

### User Roles & Permissions

#### Admin

- Full access to all features
- User role management
- System analytics dashboard
- All project and task operations

#### Manager

- Create and manage their own projects
- Create, edit, and delete tasks in their projects
- View all tasks and projects
- Assign tasks to team members

#### Member

- View all projects and tasks
- Mark their assigned tasks as complete/pending
- Limited to read-only access for most features

### Technical Features

- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Loading States** - Elegant loading animations and feedback
- **Error Handling** - Comprehensive error states and user feedback
- **Empty States** - Informative messages for empty data scenarios
- **Data Persistence** - JSON file-based storage with auto-save
- **Route Protection** - Middleware-based authentication guards

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Authentication**: Custom JWT-like implementation
- **Data Storage**: JSON files (users.json, projects.json, tasks.json)
- **State Management**: React hooks and context
- **UI Components**: Custom components with consistent design system

## 📦 Installation & Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd taskflow
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Access the application**
   - Open [http://localhost:3000](http://localhost:3000) in your browser
   - The app will automatically redirect to the login page

## 🔐 Demo Credentials

The application comes with pre-configured demo accounts:

| Role        | Email                | Password | Capabilities                        |
| ----------- | -------------------- | -------- | ----------------------------------- |
| **Admin**   | admin@taskflow.com   | 123456   | Full system access, user management |
| **Manager** | manager@taskflow.com | 123456   | Project creation, task management   |
| **Member**  | member@taskflow.com  | 123456   | Task viewing, status updates        |

## 📁 Project Structure

```
taskflow/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin panel
│   ├── dashboard/         # Main dashboard
│   ├── login/             # Authentication
│   ├── projects/          # Project management
│   ├── tasks/             # Task management
│   └── api/               # API routes
├── components/            # Reusable UI components
├── contexts/              # React context providers
├── data/                  # JSON data files
├── lib/                   # Utility functions and RBAC
├── middleware.ts          # Route protection
└── types/                 # TypeScript definitions
```

## 🎯 Key Pages & Features

### Dashboard (`/dashboard`)

- Overview statistics and recent activity
- Quick task creation modal
- Recent projects and tasks display
- Role-based content visibility

### Projects (`/projects`)

- Grid view of all projects
- Project creation (Admin/Manager only)
- Individual project detail pages
- Task management within projects

### Tasks (`/tasks`)

- Comprehensive task listing
- Status filtering (All, Pending, Done)
- Role-based task operations
- Bulk task management

### Admin Panel (`/admin`)

- User role management
- System analytics dashboard
- User statistics and task metrics
- Admin-only access controls

## 🔒 Security Features

- **Route Protection**: Middleware-based authentication
- **RBAC Enforcement**: Both UI and API level permissions
- **Secure Tokens**: HTTP-only cookie storage
- **Input Validation**: Form validation and sanitization
- **Error Boundaries**: Graceful error handling

## 🎨 Design System

- **Color Scheme**: Purple gradient theme with professional aesthetics
- **Typography**: Arial/Helvetica font family for readability
- **Components**: Consistent card designs and button styles
- **Responsive**: Mobile-first design with breakpoint optimization
- **Accessibility**: Semantic HTML and keyboard navigation support

## 📱 Responsive Design

The application is fully responsive with:

- **Mobile**: Optimized for phones (320px+)
- **Tablet**: Enhanced layout for tablets (768px+)
- **Desktop**: Full-featured desktop experience (1024px+)
- **Mobile Navigation**: Collapsible menu for smaller screens

## Deployment

### Development

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

### Production Deployment

The application can be deployed to any platform supporting Next.js:

- **Vercel** (Recommended)
- **Netlify**
- **Railway**
- **Docker containers**

## 📋 API Endpoints

### Authentication

- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - User logout

### Projects

- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/[id]` - Get project details
- `PATCH /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

### Tasks

- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `PATCH /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task

### Admin

- `GET /api/admin/users` - List users
- `PATCH /api/admin/users` - Update user roles
- `GET /api/admin/analytics` - System analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔧 Development Notes

- **Data Persistence**: Uses JSON files for simplicity, can be easily migrated to databases
- **Authentication**: Custom implementation for educational purposes
- **RBAC**: Comprehensive role-based access control system
- **Error Handling**: Robust error boundaries and user feedback
- **Performance**: Optimized with React best practices and Tailwind CSS

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

Built with ❤️ using Next.js and TypeScript
