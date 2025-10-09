# MyEMS – Energy Management System

A lightweight energy management dashboard with:

- ✅ Device inventory (CRUD)  
- 📊 Energy stats & report cards (Daily / Weekly / Monthly / Yearly + Date Range)  
- 📁 CSV Import / Export for Devices & Energy  
- 🧠 MongoDB-backed API with graceful `localStorage` fallback for the UI  
- 🔐 Basic Auth endpoints (login + profile)  
- 🧪 Jest test suite (CRUD, reports, auth, CSV)  
- 🐳 Dockerized full stack (App + MongoDB)

This project serves a static SPA (`index.html` in the repo root) and an Express API on the same port.

---

## 🧭 Table of Contents

- [Architecture](#architecture)  
- [Endpoints](#endpoints)  
- [CSV Import/Export](#csv-importexport)  
- [Getting Started (Local)](#getting-started-local)  
- [Getting Started (Docker)](#getting-started-docker)  
- [Configuration](#configuration)  
- [Running Tests](#running-tests)  
- [Troubleshooting](#troubleshooting)  
- [Screenshots](#screenshots)  
- [License](#license)

---

## 🏗️ Architecture

root/
├── index.html # SPA entry (kept at repo root)
├── css/ # Stylesheets
├── js/ # Client app (services, controllers, views)
├── models/ # Mongoose models
├── controllers/ # Express controllers (incl. CSV)
├── routes/ # API route modules
├── config/
│ └── database.js # Mongo connection helper
├── server.js # Express app (serves SPA + API)
├── tests/ # Jest tests (run locally, not in Docker)
├── Dockerfile
└── docker-compose.yml


- **Front-end**: Plain JavaScript + Chart.js.  
  - CSV UI is available on **Devices** and **Reports** pages.  
- **Back-end**: Express + Mongoose.  
  - CSV endpoints use `multer` (in-memory) and `csv-parse`.

---

## 🌐 Endpoints

### **Health**
- `GET /api/health`

### **Auth**
- `POST /api/auth/login`
- `PUT /api/auth/profile`

### **Devices**
- `GET /api/devices`
- `POST /api/devices`
- `GET /api/devices/:id`
- `PUT /api/devices/:id`
- `DELETE /api/devices/:id`

### **Energy**
- `GET /api/energy`
- `GET /api/energy/stats`

### **Reports**
- `GET /api/reports`
- `POST /api/reports/generate`  
  Body:  
  ```json
  {
    "type": "daily|weekly|monthly|yearly|range",
    "from": "YYYY-MM-DD",
    "to": "YYYY-MM-DD"
  }


CSV

GET /api/csv/devices/export

POST /api/csv/devices/import (multipart field: file)

(You can add similar endpoints for Energy if needed.)

📁 CSV Import/Export

Devices CSV format:

name,type,powerRating,location,status,userId
Desk Lamp,lighting,60,Lab A,active,USER_ID_OPTIONAL
Heater X,heating,1200,Room 2,inactive,USER_ID_OPTIONAL

## 🧰 Getting Started (Local)
Prerequisites

Node.js v22+

MongoDB 7+


1) Install dependencies
npm ci

2) Configure .env (optional)
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/myems
NODE_ENV=development


If .env is absent, server.js falls back to mongodb://127.0.0.1:27017/myems.

3) Start the app
npm start


Open: http://localhost:3000

## 🐳 Getting Started (Docker)

This repo includes a production-ready Dockerfile and Compose stack (App + MongoDB).

1) Build & run
docker compose up --build


App: http://localhost:3000

Mongo: mongodb://mongo:27017/myems (inside the network)

2) Stop
docker compose down


Mongo data persists in the mongo_data named volume.

3) Reset everything
docker compose down -v


💡 The app container uses the service DNS name mongo for database connection, not localhost.

## ⚙️ Configuration
Key	Default	Description
PORT	3000	API + SPA port
MONGODB_URI	mongodb://127.0.0.1:27017/myems	MongoDB connection string
NODE_ENV	development	development or production

In Docker Compose, the app uses:
MONGODB_URI=mongodb://mongo:27017/myems

## 🧪 Running Tests

Tests run locally — they use in-memory MongoDB for speed and isolation.

npm ci
npx jest --clearCache
npm test


You should see suites for:

✅ devices.test.js (CRUD)

✅ reports.test.js (generate + listing)

✅ auth.test.js (login happy path, fail path)

✅ users.test.js (CRUD)

✅ csv.test.js (devices export/import)

## 🛠 Troubleshooting

CSV import returns 400
→ Ensure the upload field is named file and the CSV includes at least name,type.

Login “auto redirect” issue
→ The UI currently allows bypassing login in dev mode. Adjust ApiService.login for stricter enforcement.

Port already in use
→ Change PORT in .env or docker-compose.yml and restart.

Mongo connection refused in Docker
→ Check that the app uses mongodb://mongo:27017/myems, not 127.0.0.1


## 🖼 Screenshots

### 🧭 Dashboard View
![Main Dashboard](https://github.com/khowalyashu/Energy-Management-System-GP-/raw/dev/ReadMe-Images/MainDashboard.png)

### 🔐 Login View
![Login View](https://github.com/khowalyashu/Energy-Management-System-GP-/raw/dev/ReadMe-Images/LoginView.PNG)

### 👥 Users Management
![Users View](https://github.com/khowalyashu/Energy-Management-System-GP-/raw/dev/ReadMe-Images/UsersView.png)

### ➕ Add User
![Add User](https://github.com/khowalyashu/Energy-Management-System-GP-/raw/dev/ReadMe-Images/AddUserView.png)

### 📝 Devices
![Devices](https://github.com/khowalyashu/Energy-Management-System-GP-/raw/dev/ReadMe-Images/DevicesView.png)

### 📝 Add Device
![Add Device](https://github.com/khowalyashu/Energy-Management-System-GP-/raw/dev/ReadMe-Images/DeviceAddView.png)

### 📊 Reports
![Reports View](https://github.com/khowalyashu/Energy-Management-System-GP-/raw/dev/ReadMe-Images/ReportsView.png)

### ⚙️ Settings
![Settings View](https://github.com/khowalyashu/Energy-Management-System-GP-/raw/dev/ReadMe-Images/SettingsView.png)

### 🧠 MongoDB Compass
![DB View - Mongo Compass](https://github.com/khowalyashu/Energy-Management-System-GP-/raw/dev/ReadMe-Images/DBView-MongoCompass.PNG)



	
	











