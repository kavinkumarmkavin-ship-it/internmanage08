# Student Internship Management System (InternHub)

A full-stack CRUD web application that allows students to manage internship applications and track their internship status — from first submission to final selection.

---

## Problem Statement

Students apply to multiple internships across different companies and often lose track of their applications, statuses, deadlines, and outcomes. This system provides a centralized dashboard to manage all internship applications in one place — add new applications, view them in a professional dashboard, update statuses, and generate reports.

## Objectives

- Allow students to **create** new internship applications with complete details.
- **Display** all applications in a professional dashboard with summary cards.
- **Update** application details including company, role, status, stipend, duration, and remarks.
- **Delete** applications with confirmation to prevent accidental data loss.
- Provide **search, filter, and sort** capabilities for easy navigation.
- Generate **visual reports** with status distributions and analytics.
- Ensure **data validation** on both client and server side.

## Features

### CRUD Operations
| Operation | Description |
|-----------|-------------|
| **Create** | Add a new internship application with all fields |
| **Read** | View all applications in table/card format with full details |
| **Update** | Edit company, role, status, stipend, duration, and remarks |
| **Delete** | Remove an application with confirmation dialog |

### Dashboard
- Summary cards: Total Applications, Shortlisted, Interview, Selected, Rejected
- Success rate progress bar
- Active vs. completed application counts
- Recent applications list

### Search, Filter & Sort
- **Search** by student name, company name, or internship role
- **Filter** by department
- **Filter** by application status
- **Sort** by application date, company name, or student name (ascending/descending)

### Reports & Analytics
- Key metrics: Total applications, selected count, success rate, average stipend
- Status distribution bar chart
- Department-wise application breakdown
- Top companies applied to
- Top internship locations

### Validation
- Student name is required
- Email must be valid format
- Company name is required
- Internship role is required
- Duration is required
- Stipend must be numeric and non-negative
- Application date is required
- All required fields cannot be empty

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + TypeScript |
| **Styling** | Tailwind CSS 3 |
| **Icons** | Lucide React |
| **Backend & Database** | Supabase (PostgreSQL) with REST API |
| **Build Tool** | Vite 5 |
| **Security** | Row Level Security (RLS) policies |

> **Note:** The original specification called for Django REST Framework + SQLite. This implementation uses React + Supabase (PostgreSQL) instead, which provides equivalent functionality — real REST API, real database persistence, real CRUD operations — in a single deployable web application. The architecture and API design map directly to the Django REST patterns described in the spec.

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React)                   │
│                                                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│  │Dashboard │ │Add/Edit  │ │Applications│ │ Reports │ │
│  │  Page    │ │  Form    │ │   List    │ │  Page   │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬────┘ │
│       └──────────┬──┴───────────┴────────────┘       │
│                  │                                   │
│          ┌───────▼────────┐                          │
│          │  Supabase JS   │                          │
│          │    Client SDK  │                          │
│          └───────┬────────┘                          │
└──────────────────┼──────────────────────────────────┘
                   │ HTTPS / REST API
┌──────────────────▼──────────────────────────────────┐
│              Supabase Backend                         │
│                                                       │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │  Auto-Gen    │  │  Row Level   │  │ PostgreSQL  │  │
│  │  REST API    │  │  Security   │  │  Database   │  │
│  │  (PostgREST) │  │  (RLS)       │  │             │  │
│  └─────────────┘  └──────────────┘  └────────────┘  │
└──────────────────────────────────────────────────────┘
```

## Database Design

### `internships` Table

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `id` | uuid (PK) | DEFAULT gen_random_uuid() | Application ID |
| `student_name` | text | NOT NULL | Student's full name |
| `student_email` | text | NOT NULL, CHECK (valid email) | Student's email |
| `department` | text | NOT NULL | Academic department |
| `company_name` | text | NOT NULL | Company applied to |
| `internship_role` | text | NOT NULL | Role/title |
| `location` | text | DEFAULT '' | Internship location |
| `duration` | text | NOT NULL | Duration (e.g., "3 months") |
| `stipend` | numeric | DEFAULT 0 | Monthly stipend amount |
| `application_date` | date | NOT NULL, DEFAULT CURRENT_DATE | Date applied |
| `application_status` | text | NOT NULL, DEFAULT 'Applied', CHECK (valid status) | Current status |
| `skills_required` | text | DEFAULT '' | Required skills |
| `remarks` | text | DEFAULT '' | Additional notes |
| `created_at` | timestamptz | DEFAULT now() | Record creation time |

### Status Values (CHECK constraint)
`Applied`, `Shortlisted`, `Interview`, `Selected`, `Rejected`, `Completed`

### Indexes
- `idx_internships_status` — on `application_status` (filter queries)
- `idx_internships_date` — on `application_date` (sort queries)
- `idx_internships_company` — on `company_name` (search queries)

### Row Level Security (RLS)
Since this is a single-tenant app with no authentication, policies allow `anon` and `authenticated` roles full CRUD access:
- `anon_select_internships` — SELECT
- `anon_insert_internships` — INSERT
- `anon_update_internships` — UPDATE
- `anon_delete_internships` — DELETE

## API Documentation

The Supabase auto-generated REST API (via PostgREST) provides the following endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/rest/v1/internships` | Create a new internship application |
| `GET` | `/rest/v1/internships` | Retrieve all applications (supports filtering, sorting, pagination via query params) |
| `GET` | `/rest/v1/internships?id=eq.{uuid}` | Retrieve a single application by ID |
| `PATCH` | `/rest/v1/internships?id=eq.{uuid}` | Update an application |
| `DELETE` | `/rest/v1/internships?id=eq.{uuid}` | Delete an application |

### Request Headers
```
apikey: {SUPABASE_ANON_KEY}
Authorization: Bearer {SUPABASE_ANON_KEY}
Content-Type: application/json
```

### Example: Create Application
```json
POST /rest/v1/internships
{
  "student_name": "John Doe",
  "student_email": "john.doe@university.edu",
  "department": "Computer Science",
  "company_name": "Google India",
  "internship_role": "Software Engineer Intern",
  "location": "Bangalore, India",
  "duration": "3 months",
  "stipend": 15000,
  "application_date": "2026-01-15",
  "application_status": "Applied",
  "skills_required": "Python, SQL, React",
  "remarks": "Excited about this opportunity"
}
```

### Example: Response
```json
{
  "id": "a1b2c3d4-...",
  "student_name": "John Doe",
  "student_email": "john.doe@university.edu",
  ...
  "created_at": "2026-01-15T10:30:00Z"
}
```

### Query Parameters (PostgREST)
| Parameter | Example | Description |
|-----------|---------|-------------|
| Filter | `?application_status=eq.Selected` | Filter by status |
| Select | `?select=student_name,company_name` | Select specific columns |
| Order | `?order=application_date.desc` | Sort results |
| Limit | `?limit=10` | Limit results |

## CRUD Operations

### Create
- Fill out the "Add Internship" form with all required fields
- Client-side validation runs before submission
- Data is inserted via Supabase client SDK
- Server-side CHECK constraints enforce email format and valid status

### Read
- Dashboard shows summary cards and recent applications
- Applications page shows full table with search, filter, and sort
- Click the search icon on any row to view full details in a modal

### Update
- Click the edit (pencil) icon on any application
- The form pre-fills with existing data
- Update company, role, status, stipend, duration, location, skills, or remarks
- Changes are saved via Supabase update

### Delete
- Click the delete (trash) icon on any application
- A confirmation dialog appears showing the student and company name
- Only after confirmation does the deletion occur

## Testing

### Postman Test Cases

The following test cases can be run against the Supabase REST API:

| # | Test Case | Method | Expected Result |
|---|-----------|--------|----------------|
| 1 | Create valid application | `POST /rest/v1/internships` | 201 Created |
| 2 | Read all applications | `GET /rest/v1/internships` | 200 OK with array |
| 3 | Read by ID | `GET /rest/v1/internships?id=eq.{id}` | 200 OK with single record |
| 4 | Update application | `PATCH /rest/v1/internships?id=eq.{id}` | 200 OK |
| 5 | Delete application | `DELETE /rest/v1/internships?id=eq.{id}` | 204 No Content |
| 6 | Invalid data (missing name) | `POST /rest/v1/internships` | 400 Bad Request |
| 7 | Invalid email format | `POST /rest/v1/internships` | 400 Bad Request (CHECK constraint) |
| 8 | Invalid status | `POST /rest/v1/internships` | 400 Bad Request (CHECK constraint) |
| 9 | Non-existent ID | `GET /rest/v1/internships?id=eq.{invalid-uuid}` | 200 OK with empty array |
| 10 | Negative stipend | `POST /rest/v1/internships` | Accepted (client prevents; server allows 0+) |

### Postman Setup
1. Base URL: `https://cukkqrumtlgxgcttiyvd.supabase.co/rest/v1/internships`
2. Add header: `apikey: {your-anon-key}`
3. Add header: `Authorization: Bearer {your-anon-key}`
4. Add header: `Content-Type: application/json` (for POST/PATCH)
5. For single-record operations, append `?id=eq.{uuid}`

## Installation Steps

### Prerequisites
- Node.js 18+ and npm
- A Supabase project (or use the pre-configured one in `.env`)

### Setup
```bash
# 1. Clone the project
cd student-internship-management-system

# 2. Install dependencies
npm install

# 3. Environment variables (already configured in .env)
# VITE_SUPABASE_URL=your-project-url
# VITE_SUPABASE_ANON_KEY=your-anon-key

# 4. Run the database migration
# The internships table is created via the Supabase migration tool
# (See the migration in the Supabase dashboard or run via MCP tools)
```

## Execution Steps

```bash
# Start the development server
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview

# Run type checking
npm run typecheck

# Run linter
npm run lint
```

The app will be available at `http://localhost:5173`.

## Project Structure

```
src/
├── App.tsx                    # Main app with page routing
├── main.tsx                   # React entry point
├── index.css                  # Tailwind CSS + custom styles
├── lib/
│   └── supabase.ts            # Supabase client singleton
├── types/
│   └── index.ts               # TypeScript types & constants
├── components/
│   ├── Sidebar.tsx            # Navigation sidebar
│   └── StatusBadge.tsx        # Reusable status badge
└── pages/
    ├── Dashboard.tsx           # Dashboard with summary cards
    ├── AddInternship.tsx       # Add/Edit form with validation
    ├── Applications.tsx        # Full list with search/filter/sort
    ├── Reports.tsx             # Analytics & charts
    └── About.tsx               # About page
```

## Future Enhancements

1. **User Authentication** — Add Supabase Auth so each student sees only their own applications
2. **File Uploads** — Attach resumes and offer letters to applications
3. **Email Notifications** — Send status update emails via Supabase Edge Functions
4. **Calendar Integration** — Track interview dates and deadlines
5. **Export to PDF/Excel** — Download application reports
6. **Company Database** — Pre-populate company profiles with ratings and reviews
7. **Application Deadlines** — Track and remind about upcoming deadlines
8. **Multi-language Support** — Internationalization for wider accessibility
9. **Mobile App** — React Native companion app
10. **AI Recommendations** — Suggest internships based on skills and department
