# FixMate – Smart Household Service System

> **Live:** [https://fixmate-gci6.onrender.com](https://fixmate-gci6.onrender.com)

FixMate is a full-stack web platform that connects household users with verified local service professionals. Users can create service requests, workers can manage assigned jobs, and admins supervise platform activity. The platform features **geo-aware auto-assignment** using the Haversine formula to find the nearest available worker.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Roles & Capabilities](#roles--capabilities)
  - [Role Flow Diagrams](#role-flow-diagrams)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Database Setup](#database-setup)
  - [Environment Configuration](#environment-configuration)
  - [Running the Project](#running-the-project)
- [API Documentation](#api-documentation)
  - [Authentication](#authentication)
  - [Users](#users)
  - [Workers](#workers)
  - [Service Requests](#service-requests)
  - [Ratings](#ratings)
  - [Admin](#admin)
- [Database Schema](#database-schema)
- [Frontend Overview](#frontend-overview)
- [Notable Implementation Details](#notable-implementation-details)
- [Scripts](#scripts)
- [License](#license)

---

## Tech Stack

| Layer         | Technology                                                  |
|---------------|-------------------------------------------------------------|
| **Frontend**  | Vanilla HTML5, CSS3, JavaScript (ES Modules) – no framework |
| **Backend**   | Node.js with Express.js 5 (ES Modules)                      |
| **Database**  | MySQL via `mysql2/promise` (connection pool)                |
| **Auth**      | JWT (`jsonwebtoken`) with server-side token blacklist       |
| **Image Upload** | Cloudinary CDN (via `multer-storage-cloudinary`)       |
| **Email**     | Nodemailer with Gmail SMTP                                  |
| **Logging**   | Winston + `winston-daily-rotate-file`                       |
| **Password Hashing** | bcrypt                                                |
| **File Upload Middleware** | Multer + Cloudinary Storage                   |
| **Other**     | `cors`, `dotenv`, Haversine formula in SQL for geo-distance |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend (Vanilla HTML/CSS/JS)                            │
│  ├── index.html (landing page)                             │
│  ├── pages/ (auth, user, worker, admin, error pages)       │
│  ├── assets/js/pages/ (page-specific logic)                │
│  ├── assets/js/components/ (reusable UI cards)             │
│  └── assets/js/utils/ (API client, auth, storage, toast)   │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP (fetch) — JSON
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Backend (Express.js 5)                                    │
│  ├── server.js (entry point + static serving)              │
│  ├── routes/ → controllers/ → models/                      │
│  ├── middleware/ (auth, role guard, error handler, logger) │
│  ├── utils/ (mailer, logger, response helpers)             │
│  └── config/ (MySQL connection pool)                       │
└──────────────────────┬──────────────────────────────────────┘
                       │ mysql2/promise
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  MySQL Database (fixmate_db)                               │
│  Tables: users, workers, service_requests, ratings,        │
│          service_types, tokens, blacklisted_tokens,        │
│          admin_logs                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Roles & Capabilities

| Role    | Capabilities                                                                             |
|---------|------------------------------------------------------------------------------------------|
| **User** | Register/login, create service requests (with optional problem photo), auto-assign nearest worker or manually select one, track/cancel requests, rate workers |
| **Worker** | Register with a skill category, accept/reject assigned jobs, update availability (Available/Busy/Offline), update GPS location, view ratings |
| **Admin** | Approve/reject new worker registrations, view/manage all service requests site-wide, update own profile |

### Role Flows

**User Flow**
```
Register / Login
       │
       ▼
Create Service Request (category, location, description, optional photo)
       │
       ▼
  ┌────┴────┐
  │         │
  ▼         ▼
Auto      Manual Select
Assign    a specific worker
  │         │
  └────┬────┘
       │
       ▼
Request Pending ───→ Cancel (anytime)
       │
       ▼
  Worker Response
  ┌────┴────┐
  │         │
  ▼         ▼
Accept    Reject
  │         │
  │    System re-assigns
  │    to next nearest
  │    worker
  │
  ▼
Service in Progress
       │
       ▼
Worker marks Completed
       │
       ▼
Rate Worker (1-5) → Request Closed
```

**Worker Flow**
```
Register with skill category
       │
       ▼
  Admin Approval
  ┌────┴────┐
  │         │
  ▼         ▼
Approved  Rejected
  │         │
  │    Registration deleted
  │
  ▼
Status: Available
  │
  ├────────────────────┐
  │                    │
  ▼                    ▼
Update GPS /        View Ratings
Availability        & Profile
  │
  ▼
Receive Assigned Request
  │
  ▼
  ┌────┴────┐
  │         │
  ▼         ▼
Accept    Reject
  │         │
  │    Request returns
  │    to assignment pool
  │
  ▼
Service in Progress
       │
       ▼
Mark Completed
       │
       ▼
Receive Rating from User
       │
       ▼
Back to Available
```

**Admin Flow**
```
Login
  │
  ▼
  ┌───────────┬───────────┐
  │           │           │
  ▼           ▼           ▼
View       View All    Update Own
Pending    Service     Profile
Workers    Requests
  │           │
  ▼           ▼
┌───┴───┐   Monitor all
│       │   requests
Approve Reject across all
  │       │  statuses
  ▼       ▼
Worker   Worker
set to   deleted
Available
```
---

## Features

### User Features
- Register and login (JWT-based)
- Create service requests with description, location (lat/lng), category, optional problem image (uploaded to Cloudinary)
- **Auto-assignment** of the nearest available worker using Haversine distance formula in SQL
- Option to **manually select** a specific worker
- View, track, and cancel own requests
- **Rate workers** (1–5) with a comment after service completion
- Email verification on registration
- Forgot / reset password flow

### Worker Features
- Register with a skill category (Plumbing, Electrician, Cleaning, AC Repair, Painting, etc.)
- Update availability status (Available / Busy / Offline)
- Update GPS location (latitude/longitude)
- Accept or reject assigned service requests
- View assigned requests and received ratings
- Email verification on registration

### Admin Features
- View pending workers who need approval
- Approve workers (sets them to Available) or reject/delete them
- View all service requests system-wide
- View and update own admin profile
- Activity logging via `admin_logs` table

### System / Infrastructure
- JWT authentication with token blacklisting on logout
- Email verification flow (registration, forgot/reset password, resend verification)
- Responsive dark-themed UI with custom CSS design system
- Winston logging to rotating files (`combined.log` + `error.log`) and console
- MySQL connection pooling (10 connections)
- Standardized API response helpers (`success`, `error`, `paginated`)
- Global error handler middleware
- Request/response logger middleware

---

## Project Structure

```
smart-household-service-system/
├── README.md
├── .gitignore
├── backend/
│   ├── .env                      # Environment variables
│   ├── package.json
│   ├── server.js                 # Express entry point
│   ├── database.sql              # Full MySQL schema + migrations
│   ├── config/
│   │   └── db.js                 # MySQL connection pool
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── mapController.js      # Placeholder
│   │   ├── ratingController.js
│   │   ├── serviceController.js
│   │   ├── userController.js
│   │   └── workerController.js
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification + blacklist
│   │   ├── errorHandler.js       # Global error handler
│   │   ├── requestLogger.js      # API request/response logger
│   │   └── roleMiddleware.js     # Admin role guard
│   ├── models/
│   │   ├── ratingModel.js
│   │   ├── serviceModel.js
│   │   ├── tokenModel.js
│   │   ├── userModel.js
│   │   └── workerModel.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── mapRoutes.js          # Placeholder
│   │   ├── ratingRoutes.js
│   │   ├── serviceRoutes.js
│   │   ├── userRoutes.js
│   │   └── workerRoutes.js
│   ├── utils/
│   │   ├── logger.js             # Winston logger
│   │   ├── mailer.js             # Nodemailer SMTP transport
│   │   └── responseHelper.js     # Standardized response helpers
│   └── logs/
│       ├── combined.log
│       └── error.log
├── frontend/
│   ├── index.html                # Landing page
│   ├── assets/
│   │   ├── css/
│   │   │   ├── global.css        # Dark-theme design system
│   │   │   └── aboutUs.css
│   │   └── js/
│   │       ├── config/
│   │       │   ├── api.js        # API_BASE_URL + endpoint constants
│   │       │   └── categories.js # Service categories
│   │       ├── components/
│   │       │   ├── navbar.js
│   │       │   ├── footer.js
│   │       │   ├── requestCard.js
│   │       │   ├── skeletonCard.js
│   │       │   ├── starRating.js
│   │       │   ├── workerCard.js
│   │       │   ├── workerPendingCard.js
│   │       │   └── workerRequestcard.js
│   │       ├── pages/
│   │       │   ├── admin/
│   │       │   │   ├── dashboard.js
│   │       │   │   ├── pending-workers.js
│   │       │   │   ├── profile.js
│   │       │   │   └── work-requests.js
│   │       │   ├── auth/
│   │       │   │   ├── forgot-password.js
│   │       │   │   ├── login.js
│   │       │   │   ├── logout.js
│   │       │   │   ├── register-user.js
│   │       │   │   ├── register-worker.js
│   │       │   │   └── reset-password.js
│   │       │   ├── user/
│   │       │   │   ├── create-request.js
│   │       │   │   ├── dashboard.js
│   │       │   │   ├── find-workers.js
│   │       │   │   ├── my-requests.js
│   │       │   │   ├── profile.js
│   │       │   │   └── update-profile.js
│   │       │   ├── worker/
│   │       │   │   ├── dashboard.js
│   │       │   │   ├── my-requests.js
│   │       │   │   ├── profile.js
│   │       │   │   ├── ratings.js
│   │       │   │   ├── update-location.js
│   │       │   │   └── update-profile.js
│   │       │   └── landing.js
│   │       └── utils/
│   │           ├── api-client.js  # Fetch wrapper with auth & error handling
│   │           ├── auth.js        # applyLogin, logoutLocal, currentUser, requireAuth
│   │           ├── image-viewer.js
│   │           ├── role-protection.js # enforceRole() guard
│   │           ├── storage.js     # localStorage token/user CRUD
│   │           ├── toast.js       # Toast notification system
│   │           └── validation.js  # isEmail, isRequired, minLength
│   └── pages/
│       ├── aboutUs.html
│       ├── auth/
│       │   ├── forgot-password.html
│       │   ├── login.html
│       │   ├── register-user.html
│       │   ├── register-worker.html
│       │   └── reset-password.html
│       ├── error/
│       │   └── unauthorized.html
│       ├── user/
│       │   ├── create-request.html
│       │   ├── dashboard.html
│       │   ├── find-workers.html
│       │   ├── my-requests.html
│       │   ├── profile.html
│       │   └── update-profile.html
│       └── worker/
│           ├── dashboard.html
│           ├── my-requests.html
│           ├── profile.html
│           ├── ratings.html
│           ├── update-location.html
│           └── update-profile.html
```

---

## Getting Started

### Prerequisites

- **Node.js** v18+ (for ES module support)
- **MySQL** server (8.0+ recommended)
- A **Gmail account** with an app password (for SMTP email features)

### Installation

```bash
# Clone the repository
git clone https://github.com/ShahriarSajib/smart-household-service-system.git
cd smart-household-service-system

# Install backend dependencies
cd backend
npm install
```

### Database Setup

```bash
# Create the database and run migrations
mysql -u root -p < backend/database.sql
```

This creates the `fixmate_db` database with all tables and runs the ALTER TABLE migrations. The schema includes:

- `users` – platform users and admins
- `workers` – service professionals with skill categories and GPS location
- `service_types` – available service categories
- `service_requests` – job requests with status tracking
- `ratings` – worker ratings from users
- `tokens` – email verification and password reset tokens
- `blacklisted_tokens` – revoked JWT tokens
- `admin_logs` – audit trail for admin actions

### Environment Configuration

Copy or edit `backend/.env` with your configuration:

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=fixmate_db

JWT_SECRET=your_jwt_secret_key
BASE_URL=http://localhost:5000

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_FROM="FixMate <no-reply@fixmate.local>"
```

### Running the Project

```bash
# Start the backend server (serves both API and frontend)
cd backend
npm start
# OR
node server.js
```

The server starts at **http://localhost:5000**. It:
- Serves the frontend as static files
- Exposes the REST API at `/api`

Open your browser to **http://localhost:5000** to access the landing page.

---

## API Documentation

**Base URL:** `http://localhost:5000/api`

All protected endpoints require:
```
Authorization: Bearer <jwt_token>
```

### Authentication

| Method | Endpoint                     | Auth | Description                        |
|--------|------------------------------|------|------------------------------------|
| POST   | `/api/auth/register/user`    | No   | Register a new user                |
| POST   | `/api/auth/register/worker`  | No   | Register a new worker              |
| POST   | `/api/auth/login`            | No   | Login (returns JWT token)          |
| POST   | `/api/auth/logout`           | Yes  | Logout (blacklists token)          |
| GET    | `/api/auth/verify-email`     | No   | Verify email via token query param |
| POST   | `/api/auth/resend-verification` | No | Resend verification email        |
| POST   | `/api/auth/forgot-password`  | No   | Send password reset email          |
| POST   | `/api/auth/reset-password`   | No   | Reset password with token          |
| PUT    | `/api/auth/change-password`  | Yes  | Change password (logged in)        |

### Users

| Method | Endpoint                          | Auth | Description              |
|--------|-----------------------------------|------|--------------------------|
| GET    | `/api/users/profile/:id`          | Yes  | Get user profile         |
| PUT    | `/api/users/profile/update/:id`   | Yes  | Update name/email/pic    |

### Workers

| Method | Endpoint                             | Auth | Description                |
|--------|--------------------------------------|------|----------------------------|
| GET    | `/api/workers/profile/:id`           | Yes  | Get worker profile         |
| PUT    | `/api/workers/profile/update/:id`    | Yes  | Update worker profile + pic|
| PUT    | `/api/workers/:id/status`            | Yes  | Update availability        |
| PUT    | `/api/workers/:id/location`          | Yes  | Update GPS coords          |
| GET    | `/api/workers/:id/requests`          | Yes  | Get assigned requests      |
| GET    | `/api/workers/:id/ratings`           | Yes  | Get received ratings       |
| GET    | `/api/workers/nearby`                | Yes  | Get nearby workers         |

### Service Requests

| Method | Endpoint                          | Auth | Description               |
|--------|-----------------------------------|------|---------------------------|
| POST   | `/api/requests`                   | Yes  | Create a service request  |
| GET    | `/api/requests/user/:id`          | Yes  | Get user's requests       |
| GET    | `/api/requests/worker/:id`        | Yes  | Get worker's requests     |
| PUT    | `/api/requests/:id/accept`        | Yes  | Accept a request          |
| PUT    | `/api/requests/:id/reject`        | Yes  | Reject a request          |
| PUT    | `/api/requests/:id/cancel`        | Yes  | Cancel a request          |
| PUT    | `/api/requests/:id/complete`      | Yes  | Mark request as completed |

### Ratings

| Method | Endpoint                          | Auth | Description              |
|--------|-----------------------------------|------|--------------------------|
| POST   | `/api/ratings`                    | Yes  | Rate a completed request |
| GET    | `/api/ratings/worker/:id`         | Yes  | Get worker ratings       |

### Admin

| Method | Endpoint                             | Auth | Role  | Description              |
|--------|--------------------------------------|------|-------|--------------------------|
| GET    | `/api/admin/workers/pending`         | Yes  | Admin | List pending workers     |
| PUT    | `/api/admin/workers/:id/approve`     | Yes  | Admin | Approve a worker         |
| PUT    | `/api/admin/workers/:id/reject`      | Yes  | Admin | Reject/delete a worker   |
| GET    | `/api/admin/work-requests`           | Yes  | Admin | View all service requests|
| GET    | `/api/admin/profile`                 | Yes  | Admin | Get admin profile        |
| PUT    | `/api/admin/profile/update`          | Yes  | Admin | Update admin profile     |

---

## Database Schema

### `users`
| Column          | Type         | Description                     |
|-----------------|--------------|---------------------------------|
| id              | INT (PK)     | Auto-increment                  |
| name            | VARCHAR(255) | Full name                       |
| email           | VARCHAR(255) | Email (unique)                  |
| password_hash   | VARCHAR(255) | bcrypt hash                     |
| role            | ENUM         | user / admin                    |
| phone           | VARCHAR(20)  | Phone number                    |
| email_verified  | TINYINT(1)   | 0 or 1                          |
| profilePic      | TEXT         | Cloudinary URL                   |
| created_at      | TIMESTAMP    | Auto-generated                  |

### `workers`
| Column          | Type         | Description                     |
|-----------------|--------------|---------------------------------|
| id              | INT (PK)     | Auto-increment                  |
| name            | VARCHAR(255) | Full name                       |
| email           | VARCHAR(255) | Email (unique)                  |
| password_hash   | VARCHAR(255) | bcrypt hash                     |
| skill_category  | VARCHAR(100) | e.g., Plumbing, Electrician     |
| location        | TEXT         | Human-readable address          |
| latitude        | DECIMAL(10,7)| GPS latitude                    |
| longitude       | DECIMAL(10,7)| GPS longitude                   |
| availability    | ENUM         | Available / Busy / Offline      |
| rating          | DECIMAL(3,2) | Average rating                  |
| rating_count    | INT          | Number of ratings               |
| phone           | VARCHAR(20)  | Phone number                    |
| email_verified  | TINYINT(1)   | 0 or 1                          |
| profilePic      | TEXT         | Cloudinary URL                   |
| created_at      | TIMESTAMP    | Auto-generated                  |

### `service_requests`
| Column            | Type         | Description                     |
|-------------------|--------------|---------------------------------|
| id                | INT (PK)     | Auto-increment                  |
| user_id           | INT (FK)     | References users.id             |
| category          | VARCHAR(100) | Service category                |
| description       | TEXT         | Problem description             |
| location          | TEXT         | Human-readable address          |
| latitude          | DECIMAL(10,7)| GPS latitude                    |
| longitude         | DECIMAL(10,7)| GPS longitude                   |
| status            | ENUM         | Pending / Assigned / Accepted / Cancelled / Completed |
| assigned_worker_id| INT (FK)     | References workers.id           |
| service_type_id   | INT (FK)     | References service_types.id     |
| problem_pic       | TEXT         | Cloudinary URL of problem image |
| user_has_rated    | TINYINT(1)   | 0 or 1                          |
| created_at        | TIMESTAMP    | Auto-generated                  |

### `ratings`
| Column     | Type         | Description                     |
|------------|--------------|---------------------------------|
| id         | INT (PK)     | Auto-increment                  |
| request_id | INT (FK)     | References service_requests.id  |
| rater_id   | INT          | User who gave the rating        |
| ratee_id   | INT          | Worker who received the rating  |
| score      | TINYINT      | 1–5                             |
| comment    | TEXT         | Optional feedback               |
| created_at | TIMESTAMP    | Auto-generated                  |

### Other Tables
- **`service_types`** – id, name (unique), description
- **`tokens`** – id, user_id, worker_id, token, type, expires_at
- **`blacklisted_tokens`** – id, token, user_id, worker_id, expires_at
- **`admin_logs`** – id, admin_id, action_type, description, created_at

---

## Frontend Overview

The frontend is built with **vanilla JavaScript (ES Modules)** — no frameworks. Key design decisions:

- **Utility modules** (`utils/`): Centralized API client with auth headers, localStorage token management, toast notifications, form validation, role-based page protection
- **Reusable components** (`components/`): Navbar, request cards, worker cards, star ratings, skeleton loading cards
- **Page scripts** (`pages/`): One ES module per page, loaded as `type="module"` scripts
- **Configuration** (`config/`): Centralized API endpoint constants and service category definitions
- **Dark theme**: CSS custom properties with indigo accent (`--primary: #6366f1`)

---

## Notable Implementation Details

### Nearest Worker Algorithm (Haversine in SQL)
The auto-assignment logic in `serviceController.js` uses a raw SQL query with the Haversine formula to find the nearest available worker within a search radius:

```sql
6371 * ACOS(
  COS(RADIANS(:lat)) * COS(RADIANS(latitude)) *
  COS(RADIANS(longitude) - RADIANS(:lng)) +
  SIN(RADIANS(:lat)) * SIN(RADIANS(latitude))
) AS distance
```

### Image Handling
- Images uploaded to **Cloudinary CDN** via `multer-storage-cloudinary`
- Profile pictures and problem images stored as Cloudinary URLs in `TEXT` columns
- Automatic image resizing (max 1000×1000) and quality optimization
- Accepted formats: jpg, jpeg, png, gif, webp

### Email Verification Flow
1. User registers → token inserted into `tokens` table → verification email sent
2. User clicks link → `GET /api/auth/verify-email?token=...` marks email as verified
3. Password reset uses the same token mechanism

### JWT Blacklist
- On logout, the token is stored in `blacklisted_tokens` with its expiry
- `authMiddleware` checks the blacklist table on every protected request
- Expired blacklisted tokens are automatically cleaned up

### Authentication Flow
1. Login returns a JWT token and user/worker/admin data
2. Token stored in `localStorage` via `storage.js`
3. Every API call includes `Authorization: Bearer <token>` via `api-client.js`
4. Role-based page protection via `role-protection.js` (`enforceRole()`)

### Logging
- Winston logs every API request (method, route, status, body, query)
- Errors logged with full stack traces
- Log files rotated daily via `winston-daily-rotate-file`
- Output to both files (`combined.log`, `error.log`) and console

---

## Scripts

| Command      | Description                    |
|--------------|--------------------------------|
| `npm start`  | Run `node server.js`           |
| `npm test`   | Placeholder (no tests defined) |

---

## License

This project is developed as a academic/skill-building project. All rights reserved.
