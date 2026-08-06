# MERN Starter Kit 🚀

Reusable MERN stack boilerplate for building full-stack applications faster.

This starter kit provides a clean and scalable foundation for creating MERN applications with authentication, CRUD architecture, validation, database relationships, and reusable backend patterns.

---

# Tech Stack

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt Password Hashing
- Express Validator

## Frontend

- React
- Tailwind CSS

---

# Backend Features

✅ Express application structure
✅ MongoDB connection setup
✅ JWT authentication
✅ User registration and login
✅ Password hashing with bcrypt
✅ Request validation using Express Validator
✅ Centralized error handling
✅ Not Found middleware
✅ CRUD architecture pattern
✅ MongoDB relationships using populate()
✅ Reusable utility functions structure

---

# Backend Project Structure

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

Installation
1. Clone Repository
git clone your-repository-url

2. Install Dependencies
npm install

3. Environment Setup

Create a .env file inside the server folder.

Example:
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

Run Development Server
npm run dev

Server will run:

http://localhost:5000
API Modules
Authentication
Register User
POST /api/auth/register

Example Request:

{
  "firstName": "Darren",
  "lastName": "Test",
  "email": "test@example.com",
  "password": "password123"
}
Login User
POST /api/auth/login
Items Module

CRUD example with MongoDB relationship.

Routes
GET    /api/items
POST   /api/items
GET    /api/items/:id
PUT    /api/items/:id
DELETE /api/items/:id

Features:

✅ Create Item
✅ Read Items
✅ Update Item
✅ Delete Item
✅ Category Relationship
✅ Populate Category Data

Categories Module

Used as a reference relationship example.

Routes:

GET  /api/categories

POST /api/categories

Example:

{
  "name": "Food"
}
Error Handling Flow
Request

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


If Error:

Controller

   ↓

next(error)

   ↓

Error Middleware

   ↓

JSON Error Response
Future Improvements

Planned additions:

React frontend starter
Axios API layer
Authentication Context
Protected Routes
Reusable UI Components
Dashboard Layout
File Upload Support
Email Services
Purpose

This project serves as a reusable foundation for future MERN applications and client projects.

Instead of starting from scratch, developers can clone this starter kit and focus on building business-specific features.

Built with ❤️ using MERN Stack 🚀
