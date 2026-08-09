# MERN Starter Kit 🚀

A reusable **MERN Stack starter kit** for building full-stack web applications faster.

This starter kit provides a clean and scalable foundation with:

* JWT authentication
* Protected routes
* CRUD architecture
* MongoDB relationships
* Request validation
* Centralized error handling
* Security hardening
* Rate limiting
* Reusable React UI components
* Authentication pages and flows
* Responsive UI foundation

The goal is simple:

> **Clone the starter kit, replace the business logic, and start building the actual application.**

---

# Tech Stack

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* bcrypt Password Hashing
* Express Validator
* Helmet
* Express Rate Limit

## Frontend

* React
* React Router
* Tailwind CSS
* Axios
* React Hot Toast

---

# Features

## 🔐 Authentication

* User Registration
* User Login
* JWT Authentication
* Remember Me
* Protected Routes
* Logout
* Forgot Password
* Reset Password
* Password Hashing with bcrypt
* Authentication Context

> **Development Note:**
> The current Forgot Password implementation returns the reset token directly in the API response for local development and testing.
> Before production, this should be replaced with an email-based password reset flow.

---

# 🛡️ Security

The starter kit includes several security hardening measures:

* Rate Limiting
* Brute-force Protection
* Account Enumeration Protection
* Helmet Security Headers
* Request Validation
* Centralized Error Handling
* JWT Authentication
* Password Hashing
* Security Logging
* Dependency Vulnerability Auditing

Dependency audit:

```bash
npm audit
```

Current audit status:

```text
found 0 vulnerabilities
```

---

# 🎨 Reusable UI Components

The frontend includes reusable UI components:

```text
client/src/components/ui/

├── Button.jsx
├── Card.jsx
├── Input.jsx
├── Modal.jsx
├── Select.jsx
└── Spinner.jsx
```

### Button

Supports:

* Variants
* Sizes
* Loading state
* Disabled state
* Full-width mode

Example:

```jsx
<Button
  type="submit"
  loading={loading}
  fullWidth
>
  Login
</Button>
```

### Input

Supports:

* Labels
* Input types
* Placeholders
* Disabled state
* Error messages
* Reusable styling

### Select

Reusable dropdown component for forms and filters.

### Card

Reusable container component for page sections and content.

### Modal

Reusable modal/dialog component.

### Spinner

Reusable loading indicator used by loading states.

---

# 📄 Frontend Pages

Current starter pages:

```text
client/src/pages/

├── Home.jsx
├── Login.jsx
├── Register.jsx
├── ForgotPassword.jsx
├── ResetPassword.jsx
├── Dashboard.jsx
└── NotFound.jsx
```

## Home

Displays different content depending on authentication state.

Authenticated users can:

* Access Dashboard
* Logout

Unauthenticated users can:

* Login
* Register

## Login

Includes:

* Email
* Password
* Remember Me
* Loading state
* Error handling
* Forgot Password link

## Register

Includes:

* First Name
* Last Name
* Email
* Password
* Loading state
* Success notification

## Forgot Password

Includes:

* Email input
* Loading state
* Development reset token display
* Copy token
* Continue to Reset Password

## Reset Password

Includes:

* Reset token
* New password
* Confirm password
* Password matching validation
* Loading state
* Success/error handling

## Dashboard

Example protected page used to demonstrate authentication and protected routes.

## Not Found

Reusable 404 page with navigation back to Home.

---

# 🏗️ Backend Architecture

The backend follows a modular architecture:

```text
server
│
├── config
│   └── db.js
│
├── controllers
│
├── middleware
│   ├── authMiddleware.js
│   ├── errorMiddleware.js
│   ├── notFound.js
│   └── validationMiddleware.js
│
├── models
│
├── routes
│
├── validators
│
├── utils
│
├── app.js
└── server.js
```

---

# Backend Request Flow

Normal request:

```text
Client
   ↓
Route
   ↓
Validation
   ↓
Controller
   ↓
Database
   ↓
Response
```

Error flow:

```text
Controller
   ↓
next(error)
   ↓
Error Middleware
   ↓
JSON Error Response
```

---

# CRUD Architecture

The starter kit includes an example CRUD architecture using Items and Categories.

## Items

```text
GET    /api/items
POST   /api/items
GET    /api/items/:id
PUT    /api/items/:id
DELETE /api/items/:id
```

Features:

* Create Item
* Read Items
* Read Single Item
* Update Item
* Delete Item
* Category Relationship
* MongoDB `populate()`

## Categories

```text
GET  /api/categories
POST /api/categories
```

Example:

```json
{
  "name": "Food"
}
```

The Category module serves as a reference for MongoDB relationships.

---

# Authentication API

## Register

```text
POST /api/auth/register
```

Example request:

```json
{
  "firstName": "Darren",
  "lastName": "Test",
  "email": "test@example.com",
  "password": "password123"
}
```

## Login

```text
POST /api/auth/login
```

The login system returns an authentication token used for protected API requests.

---

# Installation

## 1. Clone Repository

```bash
git clone your-repository-url
```

Enter the project:

```bash
cd mern-starter-kit
```

---

# 2. Install Backend Dependencies

```bash
cd server
npm install
```

---

# 3. Install Frontend Dependencies

```bash
cd ../client
npm install
```

---

# 4. Environment Setup

Create a `.env` file inside the `server` folder.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Never commit the real `.env` file to Git.

Use `.env.example` as the template for required environment variables.

---

# Running the Application

## Backend

From the `server` folder:

```bash
npm run dev
```

Production/start command:

```bash
npm start
```

Server:

```text
http://localhost:5000
```

## Frontend

From the `client` folder:

```bash
npm run dev
```

Vite development server:

```text
http://localhost:5173
```

---

# Production Build

To create the frontend production build:

```bash
cd client
npm run build
```

The build output is generated inside:

```text
client/dist
```

---

# Security Audit

Run dependency vulnerability checks from the appropriate project folder:

```bash
npm audit
```

The starter kit should be checked regularly for dependency vulnerabilities before deployment.

---

# Git Workflow

The starter kit is designed to act as a reusable project foundation.

Recommended workflow for a new application:

```text
MERN Starter Kit
       ↓
Clone Repository
       ↓
Rename Project
       ↓
Create New GitHub Repository
       ↓
Replace Business Logic
       ↓
Build Application
       ↓
Deploy
```

Example:

```text
mern-starter-kit
       ↓
bigasan-pautang-system
       ↓
grocery-pos-system
       ↓
inventory-system
       ↓
other client projects
```

The original starter kit should remain as the reusable master template.

---

# Project Purpose

This project serves as a reusable foundation for future MERN applications and client projects.

Instead of repeatedly starting from:

```text
React setup
Express setup
MongoDB setup
Authentication
JWT
Validation
Error handling
Security
Reusable UI
```

the developer can start from this foundation and focus on the actual business requirements.

---

# Current Status

```text
Architecture              ✅
MongoDB                   ✅
Mongoose                  ✅
Authentication            ✅
JWT                       ✅
Password Hashing          ✅
Protected Routes          ✅
Request Validation        ✅
CRUD Architecture         ✅
MongoDB Relationships     ✅
Centralized Errors        ✅
Rate Limiting             ✅
Security Headers          ✅
Security Logging          ✅
Dependency Audit          ✅
Reusable UI               ✅
Responsive UI Foundation ✅
Loading States            ✅
Frontend Build            ✅
Server Startup            ✅
MongoDB Connection        ✅
```

---

# Future Enhancements

Possible future improvements:

* Email-based password reset
* Refresh token authentication
* Role-based access control expansion
* File upload support
* Advanced dashboard layouts
* Automated testing
* CI/CD pipeline
* Production deployment templates

These features can be added when a specific project requires them.

---

# Built With ❤️

Built as a reusable MERN foundation for future applications and client projects.

**MERN Starter Kit 🚀**
