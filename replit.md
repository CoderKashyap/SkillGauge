# QuizMaster - Skill Assessment Platform

A comprehensive full-stack quiz management system built with React, Express, and PostgreSQL. Users can take skill-based quizzes and track their performance, while admins manage questions, users, and generate detailed reports.

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Authentication**: JWT-based login/register system with role-based access
- **User Dashboard**: Quiz selection, interactive quiz taking, performance analytics
- **Admin Panel**: Sidebar navigation for managing skills, questions, users, and reports
- **Design**: Material Design-inspired UI with dark mode support, responsive layouts
- **Charts**: Performance visualizations using Recharts

### Backend (Express + PostgreSQL)
- **Database**: Normalized PostgreSQL schema with Drizzle ORM
- **Auth**: JWT tokens with role-based middleware (admin/user)
- **APIs**: Complete CRUD endpoints with validation using Zod
- **Caching**: In-memory cache for performance reports (5-minute TTL)
- **Security**: Bcrypt password hashing, protected routes, required SESSION_SECRET

## 📊 Database Schema

### Tables
- **users**: User accounts with roles (admin/user)
- **skills**: Skill categories for organizing questions
- **questions**: MCQ questions linked to skills with options and correct answers
- **quiz_attempts**: Records of completed quizzes with scores
- **quiz_answers**: Individual answers for each quiz attempt

### Key Relations
- Skills → Questions (one-to-many)
- Users → Quiz Attempts (one-to-many)
- Skills → Quiz Attempts (one-to-many)
- Quiz Attempts → Quiz Answers (one-to-many)

## 🔑 Key Features

### User Features
- Register and login with secure authentication
- Browse available skill categories
- Take interactive multiple-choice quizzes
- View real-time quiz progress and results
- Track performance with charts and analytics
- Identify skill gaps based on scores

### Admin Features
- Manage skill categories (create, edit, delete)
- Build question banks with multiple options
- View all users and their roles
- Generate comprehensive reports:
  - User performance analytics
  - Skill gap analysis
  - Time-based filtering (week/month/all time)
  - Interactive charts and tables

## 🚀 Setup & Development

### Environment Variables
```bash
DATABASE_URL=<postgres_connection_string>
SESSION_SECRET=<secure_random_string>  # Required for JWT signing
```

### Database Setup
```bash
npm run db:push  # Push schema to PostgreSQL
```

### Running the App
```bash
npm run dev  # Starts both Express server and Vite dev server
```

The app runs on port 5000 with:
- Backend API: `/api/*`
- Frontend: served by Vite

## 📁 Project Structure

```
├── client/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route pages (auth, dashboard, admin)
│   │   ├── lib/            # Auth context, query client
│   │   └── App.tsx         # Main app with routing
├── server/
│   ├── routes.ts           # API endpoints
│   ├── storage.ts          # Database operations
│   ├── middleware/         # Auth middleware
│   └── db.ts               # Database connection
├── shared/
│   └── schema.ts           # Shared types and validation
└── design_guidelines.md    # UI/UX design specifications
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with username/password

### Skills (Public read, Admin write)
- `GET /api/skills` - List all skills
- `GET /api/skills/:id` - Get skill details
- `POST /api/skills` - Create skill (admin)
- `PATCH /api/skills/:id` - Update skill (admin)
- `DELETE /api/skills/:id` - Delete skill (admin)

### Questions (Protected, Admin write)
- `GET /api/questions` - List all questions with skills
- `GET /api/questions/by-skill/:skillId` - Get questions by skill
- `POST /api/questions` - Create question (admin)
- `PATCH /api/questions/:id` - Update question (admin)
- `DELETE /api/questions/:id` - Delete question (admin)

### Quiz Attempts (Protected)
- `POST /api/quiz-attempts` - Submit quiz with answers
- `GET /api/quiz-attempts/my-attempts` - Get user's attempts
- `GET /api/quiz-attempts/all` - Get all attempts (admin)

### Users (Admin only)
- `GET /api/users` - List all users

## 🎨 Design System

- **Colors**: Vibrant blue primary, success green, warning orange, error red
- **Typography**: Inter for UI, JetBrains Mono for code/scores
- **Components**: Shadcn UI with custom theming
- **Dark Mode**: Full support with theme toggle
- **Responsive**: Mobile-first design with Tailwind CSS

## 🧪 Testing Notes

### Critical User Journeys
1. **User Flow**: Register → Login → Select Skill → Take Quiz → View Results → Performance Dashboard
2. **Admin Flow**: Login (admin) → Add Skill → Create Questions → View Reports

### Known Behaviors
- Quiz scores calculated automatically on submission
- Performance reports cached for 5 minutes
- Skills deletion cascades to questions and attempts
- JWT tokens expire after 7 days

## 📝 Recent Changes (Oct 11, 2025)

### Fixes Applied
- ✅ Fixed queryClient URL building for multi-part query keys
- ✅ Added empty response handling for DELETE operations
- ✅ Made SESSION_SECRET mandatory for security
- ✅ Removed nested anchor tags causing React warnings

### Architecture Decisions
- Used PostgreSQL instead of MySQL (Replit platform constraint)
- Implemented in-memory caching instead of Redis for MVP
- JWT authentication over session-based for scalability
- Role-based access control with middleware pattern

## 🔄 Future Enhancements

Potential next-phase features:
- Unit tests for backend routes (Jest)
- Advanced caching with Redis
- Data export functionality (CSV/PDF)
- Quiz timers and question shuffling
- Detailed analytics with more chart types
- Skill progression tracking over time
