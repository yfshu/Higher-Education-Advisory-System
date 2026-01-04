# BackToSchool - Higher Education Advisory System

A comprehensive AI-powered platform for Malaysian students to discover, compare, and apply to university programs and scholarships. The system provides personalized recommendations using machine learning and OpenAI validation.

## 📋 Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Running the System](#running-the-system)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [AI/ML Integration](#aiml-integration)
- [System Workflow](#system-workflow)
- [Development Guidelines](#development-guidelines)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

BackToSchool is a full-stack web application designed to help Malaysian students navigate their higher education journey. The system combines:

- **AI-Powered Recommendations**: Machine learning model for personalized program and field recommendations
- **OpenAI Integration**: Second-layer validation and natural language explanations
- **Comprehensive Search**: Advanced filtering for programs, universities, and scholarships
- **Comparison Tools**: Side-by-side program comparison with AI-generated insights
- **Scholarship Discovery**: Find and track scholarship opportunities
- **Admin Dashboard**: Complete management system for programs, universities, scholarships, and users

---

## 🏗️ System Architecture

The system follows a **microservices architecture** with three main components:

```
┌─────────────────┐
│   Frontend       │  Next.js 16 (React 19)
│   (Dashboard)    │  Port: 3000
└────────┬─────────┘
         │
         │ HTTP/REST API
         │
┌────────▼─────────┐
│   Backend        │  NestJS (Node.js)
│   (API Server)   │  Port: 5001
└────────┬─────────┘
         │
         ├──────────────┬──────────────────┐
         │              │                  │
┌────────▼──────┐ ┌─────▼──────┐ ┌────────▼────────┐
│  Supabase     │ │  OpenAI    │ │  Python AI     │
│  (Database & │ │  API       │ │  Service       │
│   Auth)       │ │            │ │  Port: 8000    │
└───────────────┘ └────────────┘ └────────────────┘
```

### Component Responsibilities

1. **Frontend (Dashboard)**:

   - User interface and interactions
   - Client-side routing and state management
   - PDF generation and export
   - Visual effects (Aurora, Particles)

2. **Backend (NestJS)**:

   - RESTful API endpoints
   - Authentication and authorization
   - Business logic and data validation
   - Integration with Supabase, OpenAI, and Python AI service
   - Rate limiting and caching

3. **Python AI Service**:

   - ML model inference (Logistic Regression)
   - Field interest prediction
   - Program recommendation scoring
   - Feature extraction and normalization

4. **Supabase**:

   - PostgreSQL database
   - Authentication (JWT-based)
   - Row Level Security (RLS)
   - Storage for avatars and files

5. **OpenAI API**:
   - Field prediction validation
   - Program recommendation explanations
   - AI chat assistant
   - Comparison summaries

---

## ✨ Features

### For Students

#### 1. **AI-Powered Recommendations**

- **Field Recommendations**: ML model predicts top 5 fields of interest based on:
  - Academic background (SPM/STPM grades, subjects taken)
  - Interests and skills (rated 1-5)
  - Extracurricular activities
  - Study level preferences
- **Program Recommendations**: Top 3 programs per selected field with:
  - ML confidence scores
  - OpenAI-generated explanations
  - Match reasons (budget, location, field alignment, etc.)
  - Recommendation history tracking

#### 2. **Program Search & Discovery**

- Advanced filtering by:
  - Field of interest
  - Study level (Foundation, Diploma, Bachelor)
  - Location (State, City)
  - Tuition fee range
  - Duration
  - Entry requirements
- Real-time search with debouncing
- Pagination and sorting options
- Detailed program pages with:
  - Curriculum, facilities, career outcomes
  - Entry requirements (formatted from JSON)
  - University information
  - Application deadlines

#### 3. **Program Comparison**

- Side-by-side comparison of two programs
- AI-generated comparison summary:
  - Key differences
  - Strengths and weaknesses
  - Suitability by student profile
  - Cost & career implications
- PDF export with:
  - Complete comparison table
  - AI explanation
  - Professional formatting
  - Page breaks and proper layout

#### 4. **Scholarship Discovery**

- Browse available scholarships
- Filter by:
  - Type (Merit-based, Need-based, Academic, Other)
  - Status (Active, Expired, Draft)
  - Location
  - Amount range
- Detailed scholarship pages
- Application tracking

#### 5. **Saved Items Management**

- Save programs and scholarships
- Organize favorites
- Quick access from dashboard
- Cache management for performance

#### 6. **Profile Management**

- Academic background:
  - Qualifications (SPM, STPM, A-Level, etc.)
  - Subject grades
  - CGPA
  - Extracurricular activities
- Interests & Skills:
  - Field interests (multiple selection)
  - Interest ratings (1-5 scale)
  - Skill ratings (1-5 scale)
- Preferences:
  - Study level
  - Budget range
  - Location preferences
  - Duration preferences
- Avatar upload with cropping
- Recommendation history:
  - Past field recommendations
  - Past program recommendations
  - Filter by date and type
  - Session grouping

#### 7. **Help & Support**

- FAQ section with search
- AI Chat Assistant:
  - Natural language queries
  - Context-aware responses
  - Knowledge about programs, scholarships, universities
  - Friendly, conversational tone

### For Administrators

#### 1. **Dashboard Overview**

- Key metrics:
  - Total students
  - Total programs
  - Total scholarships
  - Recommendations made
  - Open alerts
- Recent user registrations
- Recently added programs
- Quick action buttons

#### 2. **Program Management**

- Create, read, update, delete programs
- Bulk operations
- Advanced search and filtering
- Program wizard for easy creation
- Detailed program editing

#### 3. **University Management**

- Manage university information
- Location and contact details
- University-program relationships

#### 4. **Scholarship Management**

- Create and manage scholarships
- Set eligibility requirements
- Track application deadlines
- Monitor scholarship status

#### 5. **User Management**

- View all registered students
- User profile details
- Account status management (active/inactive)
- Ban/unban functionality
- User search and filtering

#### 6. **Content Management**

- Manage FAQ entries
- Help center content
- System announcements

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 16.1.1 (App Router)
- **UI Library**: React 19.1.0
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI (Shadcn UI)
- **State Management**: React Context API
- **Forms**: React Hook Form
- **PDF Generation**: jsPDF 3.0.4
- **WebGL Effects**: OGL 1.0.11 (Aurora, Particles)
- **Icons**: Lucide React
- **Notifications**: Sonner (Toast)
- **Theme**: next-themes (Dark mode support)

### Backend

- **Framework**: NestJS 11.0.1
- **Language**: TypeScript 5.7.3
- **Database Client**: Supabase JS 2.74.0
- **Validation**: class-validator, class-transformer
- **API Documentation**: Swagger/OpenAPI
- **HTTP Client**: Axios
- **Email**: Nodemailer
- **AI Integration**: OpenAI SDK 6.15.0

### AI/ML Service

- **Framework**: FastAPI 0.115.0
- **Language**: Python 3.x
- **ML Library**: scikit-learn 1.5.1
- **Model Format**: Joblib (.pkl)
- **Server**: Uvicorn

### Database & Auth

- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth (JWT)
- **Storage**: Supabase Storage (avatars)

### Development Tools

- **Package Manager**: npm
- **Linting**: ESLint
- **Type Checking**: TypeScript
- **Version Control**: Git

---

## 📁 Project Structure

```
Higher-Education-Advisory-System/
├── dashboard/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/              # Next.js App Router pages
│   │   │   ├── admin/        # Admin pages
│   │   │   ├── auth/         # Authentication pages
│   │   │   ├── student/      # Student pages
│   │   │   └── page.tsx      # Landing page
│   │   ├── components/       # React components
│   │   │   ├── admin/        # Admin components
│   │   │   ├── auth/         # Auth components
│   │   │   ├── layout/       # Layout components
│   │   │   ├── ui/           # Shadcn UI components
│   │   │   ├── Aurora.tsx    # Aurora effect component
│   │   │   └── Particles.jsx # Particles effect component
│   │   ├── contexts/         # React contexts
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utilities and API clients
│   │   │   ├── api/          # API client functions
│   │   │   └── auth/         # Auth utilities
│   │   ├── middleware.ts     # Next.js middleware
│   │   └── utils/            # Helper functions
│   ├── public/               # Static assets
│   ├── package.json
│   └── next.config.ts
│
├── backend/                   # NestJS backend application
│   ├── src/
│   │   ├── api/              # API modules
│   │   │   ├── admin/        # Admin endpoints
│   │   │   ├── ai/           # AI recommendation endpoints
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   ├── compare/      # Program comparison endpoints
│   │   │   ├── fields/       # Field of interest endpoints
│   │   │   ├── help/         # Help/FAQ endpoints
│   │   │   ├── profile/     # Student profile endpoints
│   │   │   ├── programs/    # Program endpoints
│   │   │   ├── saved-items/ # Saved items endpoints
│   │   │   ├── scholarships/# Scholarship endpoints
│   │   │   └── universities/# University endpoints
│   │   ├── guards/           # Auth guards
│   │   ├── supabase/         # Supabase service and types
│   │   ├── app.module.ts     # Root module
│   │   └── main.ts           # Application entry point
│   ├── migrations/           # Database migrations
│   ├── package.json
│   └── tsconfig.json
│
├── ai_service/               # Python FastAPI ML service
│   ├── main.py              # FastAPI application
│   ├── field_prediction.py  # Field prediction utilities
│   ├── model/               # ML model files
│   │   └── best_logistic_regression_model.pkl
│   ├── requirements.txt
│   ├── Dockerfile
│   └── README.md
│
└── README.md                # This file
```

---

## 📦 Prerequisites

Before setting up the system, ensure you have:

- **Node.js** 20.x or higher
- **npm** 9.x or higher
- **Python** 3.9 or higher
- **PostgreSQL** (via Supabase cloud or local instance)
- **Supabase Account** (for database and authentication)
- **OpenAI API Key** (for AI features)

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Higher-Education-Advisory-System
```

### 2. Set Up Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Note your project URL and anon key
3. Run database migrations from `backend/migrations/` in Supabase SQL Editor
4. Set up Storage bucket for avatars (name: `profile-avatars`, public: false)

### 3. Set Up Frontend (Dashboard)

```bash
cd dashboard
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BACKEND_URL=http://localhost:5001
```

### 4. Set Up Backend

```bash
cd backend
npm install
```

Create `.env`:

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# AI Service
AI_SERVICE_URL=http://localhost:8000

# Server
PORT=5001

# Email (Optional, for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 5. Set Up Python AI Service

```bash
cd ai_service
pip install -r requirements.txt
```

Ensure the model file exists:

- `model/best_logistic_regression_model.pkl`

---

## 🔧 Environment Variables

### Frontend (`.env.local`)

| Variable                        | Description              | Example                   |
| ------------------------------- | ------------------------ | ------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL     | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key | `eyJhbGc...`              |
| `NEXT_PUBLIC_BACKEND_URL`       | Backend API URL          | `http://localhost:5001`   |

### Backend (`.env`)

| Variable                    | Description               | Required                                      |
| --------------------------- | ------------------------- | --------------------------------------------- |
| `SUPABASE_URL`              | Supabase project URL      | ✅ Yes                                        |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | ✅ Yes                                        |
| `OPENAI_API_KEY`            | OpenAI API key            | ⚠️ Optional (AI features disabled if missing) |
| `AI_SERVICE_URL`            | Python AI service URL     | ✅ Yes                                        |
| `PORT`                      | Backend server port       | ❌ No (default: 5001)                         |
| `SMTP_HOST`                 | SMTP server for emails    | ❌ No                                         |
| `SMTP_PORT`                 | SMTP port                 | ❌ No                                         |
| `SMTP_USER`                 | SMTP username             | ❌ No                                         |
| `SMTP_PASS`                 | SMTP password             | ❌ No                                         |

### Python AI Service

No environment variables required. Model path is hardcoded to `model/best_logistic_regression_model.pkl`.

---

## ▶️ Running the System

### Development Mode

**Terminal 1 - Python AI Service:**

```bash
cd ai_service
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 - Backend:**

```bash
cd backend
npm run dev
```

**Terminal 3 - Frontend:**

```bash
cd dashboard
npm run dev
```

### Production Mode

**Build Frontend:**

```bash
cd dashboard
npm run build
npm start
```

**Build Backend:**

```bash
cd backend
npm run build
npm run start:prod
```

**Python AI Service (Production):**

```bash
cd ai_service
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000
```

### Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **Backend Swagger**: http://localhost:5001/api
- **Python AI Service**: http://localhost:8000
- **Python AI Health Check**: http://localhost:8000/health

---

## 📚 API Documentation

### Backend API Endpoints

The backend provides RESTful APIs organized by feature:

#### Authentication (`/api/auth`)

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/update-password` - Update password

#### AI Recommendations (`/api/ai`)

- `POST /api/ai/recommend/fields` - Get field recommendations
- `POST /api/ai/recommend/programs-by-field` - Get program recommendations for a field
- `GET /api/ai/recommendations/history` - Get recommendation history

#### Programs (`/api/programs`)

- `GET /api/programs` - List programs (with filters)
- `GET /api/programs/:id` - Get program details
- `POST /api/programs` - Create program (admin)
- `PUT /api/programs/:id` - Update program (admin)
- `DELETE /api/programs/:id` - Delete program (admin)

#### Scholarships (`/api/scholarships`)

- `GET /api/scholarships` - List scholarships
- `GET /api/scholarships/:id` - Get scholarship details
- `POST /api/scholarships` - Create scholarship (admin)
- `PUT /api/scholarships/:id` - Update scholarship (admin)
- `DELETE /api/scholarships/:id` - Delete scholarship (admin)

#### Comparison (`/api/compare`)

- `POST /api/compare/ai-explain` - Generate AI comparison explanation

#### Profile (`/api/profile`)

- `GET /api/profile` - Get student profile
- `PUT /api/profile` - Update student profile
- `POST /api/profile/avatar` - Upload avatar

#### Saved Items (`/api/saved-items`)

- `GET /api/saved-items` - Get saved programs and scholarships
- `POST /api/saved-items/program/:id` - Save program
- `DELETE /api/saved-items/program/:id` - Unsave program
- `POST /api/saved-items/scholarship/:id` - Save scholarship
- `DELETE /api/saved-items/scholarship/:id` - Unsave scholarship

#### Admin (`/api/admin`)

- `GET /api/admin/metrics` - Get dashboard metrics
- `GET /api/admin/users` - List users
- `GET /api/admin/users/:id` - Get user details
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

### Python AI Service Endpoints

- `GET /health` - Health check
- `POST /predict-fields` - Predict field interests
- `POST /recommend` - Get program recommendations

### Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <supabase_access_token>
```

Tokens are obtained from Supabase Auth after login.

---

## 🗄️ Database Schema

### Core Tables

#### `student_profile`

Stores student academic and personal information:

- `user_id` (UUID, FK to auth.users)
- `study_level`, `cgpa`, `qualification_type`
- `grades` (JSONB), `subjects_taken` (JSONB)
- `interests` (JSONB), `skills` (JSONB)
- `field_ids` (integer array)
- `budget`, `preferred_states`, `preferred_duration`
- `extracurricular` (boolean)
- `avatar_url`, `phone_number`, `country_code`

#### `programs`

University program information:

- `id`, `name`, `description`
- `university_id` (FK), `field_id` (FK)
- `level`, `duration_months`, `start_month`
- `tuition_fee_amount`, `tuition_fee_period`, `tuition_fee_currency`
- `entry_requirements` (JSONB), `curriculum` (JSONB)
- `career_outcomes` (JSONB), `facilities` (JSONB)
- `employment_rate`, `average_salary`, `satisfaction_rate`, `rating`
- `deadline`, `status`

#### `universities`

University information:

- `id`, `name`, `description`
- `location` (city, state, country)
- `contact_info` (JSONB)
- `website`, `logo_url`

#### `scholarships`

Scholarship information:

- `id`, `name`, `provider`, `description`
- `amount`, `type`, `location`
- `deadline`, `status`
- `eligibility_requirements` (JSONB)
- `benefits` (text)
- `application_url`

#### `field_of_interest`

Field categories:

- `id`, `name`, `description`

#### `saved_programs` & `saved_scholarships`

User saved items:

- `user_id` (FK), `program_id`/`scholarship_id` (FK)
- `created_at`

#### `ai_recommendations`

AI recommendation history:

- `recommendation_id` (UUID)
- `user_id` (FK)
- `recommendation_type` ('field' or 'program')
- `field_of_interest_id`, `field_name`
- `program_id`, `program_name`
- `ml_confidence_score`, `ml_rank`
- `openai_validated`, `openai_adjusted_score`, `openai_explanation`
- `final_rank`, `final_score`
- `powered_by` (text array)
- `recommendation_session_id` (UUID)
- `created_at`, `updated_at`

#### `help_support`

FAQ and help content:

- `id`, `question`, `answer`
- `category`, `created_by` (FK to admin)

### Relationships

- `programs.university_id` → `universities.id`
- `programs.field_id` → `field_of_interest.id`
- `saved_programs.user_id` → `auth.users.id`
- `saved_scholarships.user_id` → `auth.users.id`
- `ai_recommendations.user_id` → `auth.users.id`
- `ai_recommendations.field_of_interest_id` → `field_of_interest.id`
- `ai_recommendations.program_id` → `programs.id`

---

## 🤖 AI/ML Integration

### Machine Learning Model

**Model Type**: Logistic Regression (scikit-learn)
**Purpose**: Predict field interests and program compatibility
**Features**: 47 features including:

- Subject grades (15 subjects)
- Subjects taken (15 binary flags)
- Interest scores (multiple fields)
- Skill scores (multiple skills)
- Academic level, CGPA, budget
- Program attributes (tuition, duration, field, level)

**Model File**: `ai_service/model/best_logistic_regression_model.pkl`

### Recommendation Workflow

#### Step 1: Field Interest Prediction

1. Student profile data sent to Python AI service
2. ML model predicts probabilities for all field categories
3. Top 5 fields selected and normalized to sum to 100%
4. Optional: OpenAI validates and re-ranks fields
5. Results saved to `ai_recommendations` table

#### Step 2: Program Recommendation (Per Field)

1. User selects a field of interest
2. Backend filters programs by:
   - Field match
   - Study level
   - Budget (with 50% tolerance)
   - Location (preference, not hard filter)
3. ML model scores each program (0-1 confidence)
4. Top 3 programs selected
5. OpenAI validates and explains recommendations:
   - Compares similar programs
   - Highlights differences (fees, location, outcomes)
   - Explains why Program A > Program B
   - Flags weak matches
6. Results saved to `ai_recommendations` table

### OpenAI Integration

**Used For**:

1. **Field Validation**: Re-ranks ML predictions based on semantic understanding
2. **Program Explanation**: Generates natural language explanations for recommendations
3. **Comparison Summaries**: Creates detailed program comparison explanations
4. **AI Chat Assistant**: Answers student questions about programs, scholarships, universities

**Configuration**:

- API key stored in backend `.env` only
- Never exposed to frontend
- Rate limiting applied
- Fallback to ML-only if OpenAI fails

---

## 🔄 System Workflow

### User Registration & Authentication

1. User visits landing page
2. Clicks "Get Started" or "Sign In"
3. Registration flow:
   - Email, password, full name
   - Phone number (optional)
   - Email verification (Supabase handles)
4. Login:
   - Supabase Auth generates JWT token
   - Token stored in HTTP-only cookies
   - Token sent in Authorization header for API calls
5. Role assignment:
   - Default: `student` (in `user_metadata.role`)
   - Admin: `admin` (in `app_metadata.role`)

### AI Recommendation Flow

1. **Student completes profile**:

   - Academic background (grades, subjects)
   - Interests and skills
   - Preferences (budget, location, level)

2. **Field Recommendation**:

   - Student clicks "Start AI Recommendation"
   - Backend fetches profile
   - Python AI service predicts field interests
   - OpenAI validates (optional)
   - Top 5 fields displayed with percentages

3. **Program Recommendation**:

   - Student selects a field
   - Backend filters programs by field and constraints
   - ML model scores programs
   - Top 3 selected
   - OpenAI generates explanations
   - Results displayed with match reasons

4. **History Tracking**:
   - All recommendations saved to database
   - Accessible in profile history tab
   - Grouped by session
   - Filterable by date and type

### Program Comparison Flow

1. Student selects two programs to compare
2. Comparison page displays side-by-side table
3. Student clicks "Generate AI Explanation"
4. Backend calls OpenAI with program details
5. AI generates comparison summary
6. Summary displayed in expandable card
7. Student can export to PDF:
   - Includes comparison table
   - Includes AI explanation
   - Professional formatting
   - Downloadable file

### Search & Discovery Flow

1. Student navigates to Search page
2. Applies filters (field, level, location, budget, duration)
3. Backend queries Supabase with filters
4. Results paginated and displayed
5. Student can:
   - View program details
   - Save to favorites
   - Compare with another program
   - Apply filters

### Admin Management Flow

1. Admin logs in (role: `admin`)
2. Accesses admin dashboard
3. Can manage:
   - Programs (CRUD operations)
   - Universities (CRUD operations)
   - Scholarships (CRUD operations)
   - Users (view, update, ban/unban, delete)
   - Content (FAQ management)
4. All changes reflected immediately
5. Metrics updated in real-time

---

## 💻 Development Guidelines

### Code Style

- **Frontend**: TypeScript strict mode, ESLint rules
- **Backend**: NestJS conventions, class-validator for DTOs
- **Python**: PEP 8 style, type hints

### Git Workflow

- Feature branches for new features
- Descriptive commit messages
- Pull requests for code review

### Testing

- Backend: Jest unit tests (when implemented)
- Frontend: Manual testing (test suite can be added)
- Python: Manual testing (pytest can be added)

### Adding New Features

1. **Backend**:

   - Create module in `src/api/`
   - Define DTOs for request/response
   - Implement service logic
   - Add controller endpoints
   - Register module in `app.module.ts`

2. **Frontend**:

   - Create page in `src/app/`
   - Add API client function in `src/lib/api/`
   - Create components in `src/components/`
   - Update navigation if needed

3. **Database**:
   - Create migration SQL file
   - Run in Supabase SQL Editor
   - Update TypeScript types if needed

### Environment-Specific Config

- Development: Local services, hot reload
- Production: Environment variables, optimized builds
- Staging: Separate Supabase project, test data

---

## 🐛 Troubleshooting

### Common Issues

#### 1. **Python AI Service Not Starting**

- **Error**: `ModuleNotFoundError` or `model not found`
- **Solution**:
  - Ensure `requirements.txt` dependencies installed
  - Check `model/best_logistic_regression_model.pkl` exists
  - Verify Python version (3.9+)

#### 2. **Backend Can't Connect to Supabase**

- **Error**: `Invalid API key` or connection timeout
- **Solution**:
  - Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env`
  - Check Supabase project is active
  - Verify network connectivity

#### 3. **Frontend Build Errors**

- **Error**: TypeScript errors or module not found
- **Solution**:
  - Run `npm install` in dashboard directory
  - Clear `.next` folder: `npm run clean`
  - Check `next.config.ts` for transpilePackages

#### 4. **OpenAI API Errors**

- **Error**: `401 Unauthorized` or rate limit
- **Solution**:
  - Verify `OPENAI_API_KEY` in backend `.env`
  - Check API key is valid and has credits
  - System falls back to ML-only if OpenAI fails

#### 5. **Authentication Issues**

- **Error**: `Unauthorized` or redirect loops
- **Solution**:
  - Clear browser cookies
  - Check Supabase Auth settings
  - Verify middleware.ts configuration
  - Check role assignment in user metadata

#### 6. **Recommendations Not Showing**

- **Error**: Empty results or "No programs found"
- **Solution**:
  - Verify Python AI service is running
  - Check student profile is complete
  - Verify programs exist in database
  - Check backend logs for ML model errors
  - Ensure field_id mapping is correct

#### 7. **PDF Export Issues**

- **Error**: "Failed to export PDF" or text overlap
- **Solution**:
  - Check browser console for errors
  - Verify jsPDF is installed
  - Clear browser cache
  - Try different browser

### Debugging Tips

1. **Check Logs**:

   - Backend: Console output shows detailed logs
   - Python: Logs show feature extraction and predictions
   - Frontend: Browser console for client-side errors

2. **Verify Services**:

   - Python AI: http://localhost:8000/health
   - Backend: http://localhost:5001/api (Swagger)
   - Frontend: http://localhost:3000

3. **Database Queries**:

   - Use Supabase Dashboard SQL Editor
   - Check RLS policies are correct
   - Verify foreign key relationships

4. **Network Issues**:
   - Check CORS settings in backend
   - Verify environment variables
   - Test API endpoints with Postman/curl

---

## 📝 Additional Notes

### Performance Optimizations

- **Caching**: Recommendation results cached in sessionStorage
- **Pagination**: Large lists paginated (10-20 items per page)
- **Debouncing**: Search inputs debounced (300ms)
- **Lazy Loading**: Images and components loaded on demand
- **Code Splitting**: Next.js automatic code splitting

### Security Features

- **Authentication**: JWT tokens via Supabase Auth
- **Authorization**: Role-based access control (student/admin)
- **Row Level Security**: Supabase RLS policies
- **Input Validation**: class-validator on all DTOs
- **Rate Limiting**: Applied to AI endpoints
- **CORS**: Configured for specific origins
- **API Keys**: Never exposed to frontend

### Future Enhancements

- Email notifications for deadlines
- Application tracking system
- Advanced analytics dashboard
- Mobile app (React Native)
- Multi-language support
- Social features (reviews, ratings)

---

## 📄 License

[Add your license here]

---

## 👥 Contributors

[Add contributor information]

---

## 📞 Support

For issues, questions, or contributions, please:

- Open an issue on GitHub
- Contact: support@backtoschool.my
- Phone: +60 3-2345-6789

---

**Last Updated**: January 2025
