# CKKC Electrical Supply Management System ⚡

A full-stack **MERN-based Electrical Supply Management System** designed to manage products, inventory, customers, suppliers, purchasing, sales, and business operations.

The system was built as a real-world business application with a focus on:

* Secure authentication and authorization
* Role-based access control
* Product and inventory management
* Customer management
* Supplier and purchasing workflows
* Sales and stock release workflows
* Inventory movement tracking
* Request validation
* Centralized error handling
* Security hardening
* Reusable frontend architecture
* Responsive UI
* Maintainable API → Service → Page → Component architecture

The project started as a backend-focused MERN application and evolved into a complete business management system with transactional inventory logic and a React-based frontend.

---

# ⚡ Project Overview

CKKC Electrical Supply is designed for an electrical supply business that needs to manage products, stock levels, customers, purchasing, and sales from a centralized system.

The application separates **master data**, **transactions**, and **inventory movements** to maintain a clear and reliable business workflow.

### Core Business Flow

```text
Products
   │
   ├── Product Information
   ├── Category
   └── Inventory Levels
          │
          ├── Purchase Received
          │       ↓
          │    Stock IN
          │
          └── Sale Released
                  ↓
               Stock OUT
```

Manual stock corrections are handled separately through inventory adjustments.

```text
Manage Stock
     ↓
ADJUSTMENT
     ↓
Update Current Stock
```

---

# 🛠️ Tech Stack

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* bcrypt
* Express Validator
* Helmet
* Express Rate Limit

## Frontend

* React
* Vite
* React Router
* Tailwind CSS
* Axios
* React Icons

## Database

* MongoDB Atlas
* Mongoose ODM
* MongoDB transactions
* Population / document relationships
* Database indexes

---

# ✨ Features

## 🔐 Authentication

The application includes a complete authentication foundation:

* User registration
* User login
* JWT authentication
* Protected API routes
* Protected frontend routes
* Logout
* Password hashing with bcrypt
* Forgot Password flow
* Reset Password flow
* Authentication Context

### Development Password Reset

During local development, the Forgot Password flow returns the reset token directly in the API response for testing.

This is intentionally a development-only implementation.

Before production deployment, this should be replaced with an email-based password reset system.

---

# 👥 Role-Based Access Control

The backend implements role-based authorization to control access to different business operations.

Example roles include:

* Owner
* Admin
* Sales
* Purchasing
* Accounting

Routes use authorization middleware to determine whether the authenticated user has permission to perform a specific action.

Example:

```text
Authentication
      ↓
JWT Verification
      ↓
Authorization
      ↓
Controller
```

This prevents authenticated users from automatically gaining access to every business operation.

---

# 🛡️ Security Hardening

Security was treated as part of the application's architecture rather than an afterthought.

Implemented security measures include:

* JWT authentication
* Password hashing
* Protected routes
* Role-based authorization
* Request validation
* Rate limiting
* Brute-force protection
* Account enumeration protection
* Helmet security headers
* Centralized error handling
* Security logging
* Dependency vulnerability auditing
* Reference validation
* Validation middleware

Dependency audit:

```bash
npm audit
```

The backend was also regression-tested after security hardening to ensure that the security changes did not break existing business functionality.

---

# 📦 Product Management

The Products module manages the application's product master data.

### Product Information

* SKU
* Product name
* Description
* Category
* Unit
* Minimum stock / reorder level
* Current stock
* Status

### Product CRUD

```text
GET     /api/products
POST    /api/products
GET     /api/products/:id
PUT     /api/products/:id
DELETE  /api/products/:id
```

### Important Business Rule

`currentStock` is **not manually editable through Product CRUD**.

Inventory quantity is controlled through inventory movement transactions.

This prevents product master-data updates from bypassing inventory logic.

---

# 📊 Inventory Management

The Inventory module monitors current product stock levels.

### Inventory Dashboard

The inventory page provides:

* Total Products
* In Stock
* Low Stock
* Out of Stock

### Inventory Filters

Users can filter inventory by:

* Product search
* SKU
* Product name
* Description
* Category
* Stock status

### Stock Status Logic

```text
Current Stock = 0
        ↓
Out of Stock

Current Stock <= Minimum Stock
        ↓
Low Stock

Current Stock > Minimum Stock
        ↓
In Stock
```

### Manage Stock

Manual stock corrections are handled through an inventory adjustment workflow.

```text
Manage Stock
     ↓
Enter New Stock
     ↓
Create ADJUSTMENT Movement
     ↓
Recalculate Stock
     ↓
Update Product.currentStock
```

Successful adjustments display a Toast notification to provide immediate feedback to the user.

---

# 🔄 Inventory Movement System

Inventory movements provide the transaction layer responsible for changing stock.

Supported movement types:

```text
IN
OUT
ADJUSTMENT
```

Movement references:

```text
PURCHASE
SALE
ADJUSTMENT
```

Valid combinations are intentionally restricted:

```text
IN          → PURCHASE
OUT         → SALE
ADJUSTMENT  → ADJUSTMENT
```

This prevents invalid combinations such as manually creating a SALE stock-out without an actual Sale transaction.

---

# 🧮 Stock Calculation

Current stock is derived from inventory movements.

The backend recalculates stock based on movement history:

```text
IN
  +
OUT
  -
ADJUSTMENT
  =
Current Stock
```

Adjustments establish the corrected stock quantity.

Stock updates are performed transactionally to help maintain data consistency between:

```text
Inventory Movement
        +
Product.currentStock
```

---

# 👤 Customer Management

The Customer module manages customer master data and customer-related sales statistics.

### Customer Information

* Customer Code
* Customer Name
* Contact Person
* Email
* Phone
* Address
* Status

### Customer CRUD

```text
GET     /api/customers
POST    /api/customers
GET     /api/customers/:id
PUT     /api/customers/:id
DELETE  /api/customers/:id
```

### Customer Statistics

Customer statistics are calculated dynamically from Sales data.

The system displays:

* Total Orders
* Total Purchases

Cancelled sales are excluded from these calculations.

This avoids storing duplicated derived statistics inside the Customer document.

---

# 🏭 Supplier Management

The Supplier module is designed to manage supplier information and support the purchasing workflow.

Planned/implemented supplier functionality includes:

* Supplier master data
* Supplier contact information
* Supplier status
* Supplier purchasing relationship

The Supplier module follows the same architecture used by the Product and Customer modules.

---

# 🧾 Purchasing

Purchasing is responsible for recording inventory acquisitions from suppliers.

Purchase records contain:

* Purchase Number
* Supplier
* Purchase Date
* Purchase Status
* Items
* Quantity
* Actual Unit Cost
* Total Cost

Purchase statuses:

```text
draft
received
cancelled
```

When a purchase is received, the corresponding inventory movement is:

```text
Purchase Received
       ↓
IN / PURCHASE
       ↓
Increase Stock
```

---

# 🛒 Sales

Sales records represent customer transactions.

Sale records contain:

* Sales Number
* Customer
* Sale Date
* Items
* Quantity
* Unit Price
* Unit Cost
* Profit
* Subtotal
* Direct Expenses
* Commission
* Total Amount
* Total Cost
* Total Profit

Sale statuses include:

```text
draft
completed
released
cancelled
```

When a sale is released:

```text
Sale Released
      ↓
OUT / SALE
      ↓
Inventory Deduction
```

Released sales are protected from modification or deletion to preserve inventory transaction integrity.

---

# 🧱 Backend Architecture

The backend follows a modular layered architecture.

```text
backend/

├── config/
│
├── controllers/
│
├── middleware/
│
├── models/
│
├── routes/
│
├── validators/
│
├── utils/
│
├── app.js
└── server.js
```

The application separates:

```text
Routes
   ↓
Validation
   ↓
Middleware
   ↓
Controller
   ↓
Model
   ↓
MongoDB
```

This keeps business logic organized and easier to maintain.

---

# 🔄 Backend Request Flow

Normal request:

```text
Client
   ↓
Route
   ↓
Authentication
   ↓
Authorization
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
Centralized Error Middleware
   ↓
JSON Error Response
```

---

# 🎨 Frontend Architecture

The frontend follows a reusable layered structure:

```text
API
 ↓
Service
 ↓
Page
 ↓
Component
```

Example:

```text
customerApi.js
      ↓
customerService.js
      ↓
Customers.jsx
      ↓
CustomerForm.jsx
```

This separation keeps API communication independent from page-level UI logic.

---

# 🧩 Reusable UI Patterns

The application uses reusable UI patterns for:

* Forms
* Modals
* Toast notifications
* Loading states
* Error states
* Tables
* Filters
* Status badges
* Responsive layouts

### Toast Notifications

Data-changing operations provide user feedback through Toast notifications.

Examples:

```text
Customer created successfully.
Customer updated successfully.
Customer deleted successfully.

Stock adjusted successfully.

Product created successfully.
Product updated successfully.
Product deleted successfully.
```

---

# 📱 Responsive UI

The frontend is built using Tailwind CSS and supports responsive layouts for different screen sizes.

Major UI areas include:

* Dashboard
* Tables
* Forms
* Filters
* Modals
* Navigation
* Authentication pages

Dark mode is also supported throughout the application.

---

# 🗄️ Database Relationships

The system uses MongoDB document references to connect business entities.

Examples:

```text
Product
   ↓
Category

Sale
   ↓
Customer

Purchase
   ↓
Supplier

InventoryMovement
   ↓
Product
```

Mongoose `populate()` is used where related information needs to be returned with the primary document.

---

# 🔒 Data Integrity Rules

Several business rules were implemented to protect the integrity of the system.

### Product Stock

Product CRUD cannot directly modify `currentStock`.

### Inventory

Stock changes must occur through inventory movements.

### Inventory Movement

Invalid movement/reference combinations are rejected.

### Sales

Released sales cannot be modified or deleted.

### Customers

Customer statistics are derived from sales instead of being manually maintained.

### Validation

Invalid IDs, missing required fields, invalid enum values, invalid quantities, and invalid business references are rejected by backend validation.

---

# 🧪 Testing & Regression

The application was tested incrementally throughout development.

Testing included:

* Authentication testing
* Authorization testing
* CRUD testing
* Validation testing
* Duplicate record testing
* Invalid input testing
* Inventory stock calculations
* Stock status testing
* Customer statistics
* Search and filtering
* Toast notifications
* API error handling
* Security regression testing

Example inventory states tested:

```text
0 / 20
→ Out of Stock

15 / 20
→ Low Stock

30 / 20
→ In Stock
```

Customer testing included:

```text
Create customer          ✅
Duplicate code           ✅
Required fields          ✅
Invalid email            ✅
Search                   ✅
Status filter            ✅
Update                   ✅
Delete                   ✅
Success Toast            ✅
```

---

# 🚀 Installation

## 1. Clone Repository

```bash
git clone <repository-url>
```

Enter the project:

```bash
cd CKKC-ELECTRICAL-SUPPLY
```

---

# 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the backend directory.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Never commit the real `.env` file.

Use `.env.example` as the template for required environment variables.

---

# 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

---

# ▶️ Running the Application

## Backend

From the `backend` folder:

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

## Frontend

From the `frontend` folder:

```bash
npm run dev
```

Vite development server:

```text
http://localhost:5173
```

---

# 🏗️ Production Build

Create the frontend production build:

```bash
cd frontend
npm run build
```

The production build will be generated inside:

```text
frontend/dist
```

---

# 🔍 Security Audit

Run dependency vulnerability checks:

```bash
npm audit
```

Dependencies should be reviewed and updated regularly before production deployment.

---

# 📈 Development Approach

The project was developed incrementally rather than building every feature at once.

The general development process was:

```text
Business Requirement
        ↓
Database Model
        ↓
Validator
        ↓
Controller
        ↓
Route
        ↓
API
        ↓
Service
        ↓
React Page
        ↓
Reusable Component
        ↓
Integration
        ↓
Testing
        ↓
Finalize
```

This approach helped isolate problems and allowed each module to be tested before moving to the next one.

---

# 🗺️ Project Progress

Current completed areas include:

```text
Project Architecture       ✅
MongoDB                     ✅
Mongoose                    ✅

Authentication              ✅
JWT                         ✅
Password Hashing            ✅
Protected Routes            ✅
RBAC                        ✅

Request Validation          ✅
Centralized Errors          ✅
Rate Limiting               ✅
Security Headers            ✅
Security Logging            ✅
Dependency Audit             ✅

Products                    ✅
Inventory                   ✅
Customers                   ✅

Purchasing                  🚧
Sales                       🚧
Suppliers                   🚧

Frontend Architecture       ✅
Reusable Components         ✅
Dark Mode                   ✅
Responsive UI               ✅
Toast Notifications         ✅

Deployment                  ⏳
```

---

# 🎯 Future Improvements

Planned improvements include:

* Complete Supplier module
* Complete Purchasing frontend workflow
* Complete Sales frontend workflow
* Inventory movement history
* Advanced dashboard analytics
* Email-based password reset
* Automated testing
* CI/CD pipeline
* Production deployment
* Additional reporting features

---

# 💡 Project Goals

The main goals of CKKC Electrical Supply are:

1. Build a realistic full-stack business application.
2. Apply secure MERN development practices.
3. Implement real inventory transaction logic.
4. Practice scalable backend architecture.
5. Build reusable React frontend patterns.
6. Apply role-based access control.
7. Develop a system that can eventually be used in a real business environment.

---

# 📚 What This Project Demonstrates

This project demonstrates practical experience with:

* Full-stack MERN development
* REST API development
* MongoDB data modeling
* Mongoose relationships
* JWT authentication
* RBAC
* Backend validation
* Security hardening
* Rate limiting
* Error handling
* Inventory transaction logic
* CRUD operations
* React state management
* React forms
* API/service separation
* Tailwind CSS
* Responsive UI
* Dark mode
* Git/GitHub workflow
* Regression testing
* Business process modeling

---

# ❤️ Built With MERN

CKKC Electrical Supply was built as a real-world full-stack application to demonstrate how a MERN stack system can be designed around actual business requirements rather than only simple CRUD examples.

**CKKC Electrical Supply ⚡**

A practical MERN business management system focused on **security, maintainability, data integrity, and real-world workflows.**
