# 🎓 School Fee Management System

![Java](https://img.shields.io/badge/Java-17-blue)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.13-brightgreen)
![React](https://img.shields.io/badge/React-18-blue)
![MySQL](https://img.shields.io/badge/MySQL-8.x-orange)

## 🌐 Live Deployment

You can access the live application here:

| Service | URL |
| :--- | :--- |
| **Frontend** | [Click Here](https://school-fee-management-system-five.vercel.app) |
| **Backend API** | [Click Here](https://school-fee-management-system-xccm.onrender.com/api) |


## 📌 Description

The **School Fee Management System** is a full-stack web application designed to streamline and automate fee-related operations in educational institutions.  

It enables efficient management of students, fee structures, payment tracking, and reporting through a secure and user-friendly interface.

👥 The system supports three user roles:
- **Admin**
- **Accountant**
- **Parent**

---
## Features

### Admin Features:
- Student Management (Add, Edit, Delete students with parent linking)
- Fee Structure Management (Create fee heads like Tuition, Transport, Library, Lab)
- Set class-wise fee amounts
- User Management (Create Accountant and Parent users)
- Record payments and generate receipts
- View daily, monthly collection reports
- View defaulter list
- Real-time dashboard with analytics

### Accountant Features:
- View students
- Record fee payments (Cash, Card, Online)
- Generate PDF receipts
- View collection reports

### Parent Features:
- View child's fee details
- Track payment history
- Check pending amounts

### General Features:
- JWT Authentication
- Role-based access control
- Mobile responsive design
- Profile settings
- Change password functionality

## Tech Stack

### Backend:
- Java 17
- Spring Boot 3.5.13
- Spring Data JPA
- MySQL 8.x
- JWT for authentication
- Maven for dependency management

### Frontend:
- React 18
- Vite
- Tailwind CSS 3
- Axios for API calls
- React Router DOM 7
- React Hot Toast for notifications
- Lucide React for icons

## Database Tables
- users (id, email, password, role, name)
- students (id, roll_no, name, class, section, parent_email, parent_name, parent_id)
- fee_heads (id, name)
- fee_structure (id, class, fee_head_id, amount)
- payments (id, receipt_no, student_id, amount_paid, payment_date, payment_mode, remarks)

## API Endpoints

Authentication:
- POST /api/auth/login - User login
- POST /api/auth/change-password - Change password

Students:
- GET /api/students - Get all students
- POST /api/students - Add student
- PUT /api/students/{id} - Update student
- DELETE /api/students/{id} - Delete student
- GET /api/students/{id}/pending-fee - Get pending fee

Payments:
- POST /api/payments/record - Record payment
- GET /api/payments/student/{id} - Get student payments
- GET /api/payments/collection/daily - Daily collection report
- GET /api/payments/collection/monthly - Monthly collection report
- GET /api/payments/defaulters - Get defaulter list

Fee Structure:
- GET /api/fee-structure/heads - Get fee heads
- POST /api/fee-structure/heads - Add fee head
- DELETE /api/fee-structure/heads/{id} - Delete fee head
- GET /api/fee-structure/class/{class} - Get fee by class
- POST /api/fee-structure - Add or update fee

Users:
- GET /api/users - Get all users (Admin only)
- POST /api/users - Create user (Admin only)
- PUT /api/users/{id} - Update user
- DELETE /api/users/{id} - Delete user (Admin only)

## Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@school.com | admin123 |
## Installation Steps

### Prerequisites:
- Java 17 or higher
- MySQL 8 or higher
- Node.js 18 or higher
- npm or yarn

### Backend Setup:
1. Navigate to backend folder: `cd backend`
2. Update MySQL password in `src/main/resources/application.properties`
3. Run: `mvnw spring-boot:run`
4. Backend runs on port 8080

### Frontend Setup:
1. Navigate to frontend folder: `cd frontend`
2. Run: `npm install`
3. Run: `npm run dev`
4. Frontend runs on port 5173

### Database Setup:
- Spring Boot auto-creates tables when run with `ddl-auto=update`
- Or manually run the schema.sql file

## Project Structure

## 📁 Project Structure

```bash
School-Fee-Management-System/
├── backend/
│   └── src/main/java/com/school/fee_management/
│       ├── config/        # CORS & Security Config
│       ├── controller/    # REST APIs
│       ├── entity/        # JPA Entities
│       ├── repository/    # Data Access Layer
│       └── service/       # Business Logic
│
├── frontend/
│   └── src/
│       ├── components/    # UI Components
│       ├── pages/         # Application Pages
│       ├── services/      # API Calls
│       ├── routes/        # Routing
│       └── utils/         # Helpers
│
├── database/
│   └── schema.sql
│
└── README.md
```

## Author
Syed Mubeen
GitHub: https://github.com/Syed-Mubeen-11

## Output Format
Generate a well-formatted, clean, and professional README.md file with proper markdown formatting including headings, tables, code blocks, and badges. Add a "Star this repository" line at the end.
