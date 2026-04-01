# 📋 Smart Attendance Management System
### B.Tech Computer Science Major Project

---

## 🗂 Folder Structure

```
smart-attendance/
│
├── backend/                        ← Node.js + Express API
│   ├── config/
│   │   └── db.js                   ← MySQL connection
│   ├── controllers/
│   │   ├── authController.js       ← Login / Register
│   │   ├── qrController.js         ← QR generate & scan
│   │   └── analyticsController.js  ← Charts data
│   ├── middleware/
│   │   ├── authMiddleware.js        ← JWT check
│   │   └── roleMiddleware.js        ← Role check
│   ├── routes/
│   │   ├── auth.js
│   │   ├── qr.js
│   │   ├── attendance.js
│   │   └── analytics.js
│   ├── .env                         ← Your secrets (fill this)
│   ├── package.json
│   └── server.js                   ← Entry point
│
├── frontend/                        ← React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx            ← Login page
│   │   │   ├── Navbar.jsx           ← Top navigation
│   │   │   ├── QRGenerator.jsx      ← Faculty: generate QR
│   │   │   ├── QRScanner.jsx        ← Student: scan QR
│   │   │   └── Analytics.jsx        ← Charts & reports
│   │   ├── App.jsx                  ← Routes
│   │   └── main.jsx                 ← React entry
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── database/
    └── schema.sql                   ← All MySQL tables
```

---

## ⚙️ Step-by-Step Setup

### Step 1 — Install MySQL
Download MySQL 8.0 from https://dev.mysql.com/downloads/
Remember your root password.

### Step 2 — Create the Database (Supabase/Postgres)
1. Go to Supabase Dashboard > SQL Editor.
2. Paste/run `database/schema_postgres.sql`.
3. Get DATABASE_URL from Settings > Database.

### Step 3 — Setup Backend
```bash
cd smart-attendance/backend
npm install
```

Open the `.env` file and fill in:
```
DB_PASSWORD=your_mysql_root_password
JWT_SECRET=any_random_long_string_like_abc123xyz789
```
Leave everything else as is for local development.

Start the backend:
```bash
npm run dev
```
You should see:
```
✅ MySQL connected
Server running on port 5000
```

### Step 4 — Setup Frontend
Open a NEW terminal window:
```bash
cd smart-attendance/frontend
npm install
npm run dev
```
You should see:
```
Local: http://localhost:5173/
```

### Step 5 — Open in Browser
Go to: **http://localhost:5173**

---

## 🔑 Default Login (after running schema.sql)

| Role    | Email                  | Password   |
|---------|------------------------|------------|
| Admin   | admin@college.edu      | **abc** |
| Faculty | rahul@college.edu      | **abc** |
| Student | cs21001@college.edu    | **abc** |

> ⚠️ Update schema.sql with proper bcrypt-hashed passwords before demo.
> Use this site to generate: https://bcrypt-generator.com/ (12 rounds)

---

## 🔄 How the System Works

```
1. Faculty logs in  →  Goes to /faculty
2. Selects subject  →  Clicks "Generate QR"
3. QR appears on screen (valid 5 mins)
4. Students log in  →  Go to /student
5. Click "Start QR Scanner"
6. Scan the QR with phone camera
7. Server validates: token ✓ not expired ✓ not duplicate ✓
8. Attendance marked as PRESENT ✅
9. Faculty sees live list update on screen
10. Analytics page shows charts, defaulters, trends
```

---

## 📡 API Endpoints

| Method | URL                              | Who    | What it does             |
|--------|----------------------------------|--------|--------------------------|
| POST   | /api/auth/login                  | All    | Login → returns JWT      |
| POST   | /api/auth/register               | Admin  | Add new user             |
| POST   | /api/qr/generate                 | Faculty| Create QR for a session  |
| POST   | /api/qr/mark-attendance          | Student| Scan & mark present      |
| GET    | /api/qr/session/:id              | Faculty| Live attendance list      |
| GET    | /api/analytics/student-summary   | Student| Own subject-wise %       |
| GET    | /api/analytics/defaulters        | Faculty| Students below 75%       |
| GET    | /api/analytics/branch            | Admin  | Branch-wise stats        |
| GET    | /api/analytics/monthly/:sub_id   | Faculty| Monthly trend data       |

---

## 📦 npm Packages Used

**Backend:**
```
express, cors, helmet, dotenv, bcryptjs, jsonwebtoken, qrcode, mysql2, nodemailer, nodemon
```

**Frontend:**
```
react, react-dom, react-router-dom, axios, recharts, html5-qrcode, vite
```

---

## ❓ Common Issues

**"DB connection error" on backend start**
→ Wrong DATABASE_URL or DB_* in .env (use Supabase creds)

**"Cannot GET /api/..."**
→ Backend not running. Run `npm run dev` in backend folder.

**QR camera not opening**
→ Browser needs HTTPS or localhost. Use Chrome on localhost.

**"Module not found"**
→ Run `npm install` again in that folder.
