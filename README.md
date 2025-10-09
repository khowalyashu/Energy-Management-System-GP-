<<<<<<< HEAD
<<<<<<< HEAD
# Energy-Management-System-GP-
Energy Management System
=======
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



	
	





>>>>>>> cf28bf32eaca46dd4a795038602b87c0286e2f32






=======
# Energy Management System

A full-stack web application for monitoring and managing energy consumption across multiple devices.

## 🚀 Quick Start

### Prerequisites

- **Node.js** v14+
- **MongoDB** v4.4+

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Start MongoDB (in separate terminal)
mongod --dbpath C:\data\db

# 3. Start the server
npm start

# 4. Open browser
http://localhost:3000
```

---

## 📁 Project Structure

```
├── server.js                 # Express server entry point
├── package.json             # Dependencies & scripts
│
├── config/
│   └── database.js          # MongoDB connection
│
├── models/                  # MongoDB schemas
│   ├── User.js
│   ├── Device.js
│   ├── EnergyData.js
│   └── Report.js            # ✨ Enhanced with 10 new features
│
├── controllers/             # Backend logic
│   ├── authController.js
│   ├── deviceController.js
│   ├── energyController.js
│   ├── reportController.js  # ✨ CSV/Excel export functions
│   └── userController.js
│
├── routes/                  # API endpoints
│   ├── auth.js
│   ├── devices.js
│   ├── energy.js
│   ├── reports.js           # ✨ Export routes: /export/csv, /export/excel
│   └── users.js
│
├── middleware/
│   ├── auth.js              # JWT authentication
│   └── admin.js             # Admin role check
│
├── js/                      # Frontend (MVC pattern)
│   ├── app.js               # Main app initialization
│   ├── models/              # Frontend data models
│   ├── views/               # UI rendering
│   ├── controllers/         # Frontend logic
│   └── services/
│       ├── ApiService.js    # ✨ Fixed download functions
│       └── StorageService.js
│
├── css/                     # Stylesheets
├── assets/                  # Images, icons
└── index.html              # Single page app entry
```

---

## 🔑 Key Features

### Core Functionality

- ✅ User authentication (JWT)
- ✅ Device management (CRUD operations)
- ✅ Real-time energy monitoring
- ✅ Report generation (daily, weekly, monthly, yearly)
- ✅ Role-based access control (Admin/User)

### 🆕 Enhanced Report Features (Recently Added)

1. **Excel Export** - Formatted `.xlsx` files with color-coded headers
2. **CSV Export** - Includes average daily usage calculations
3. **Last Updated Timestamp** - Track report modifications
4. **Device Type Filter** - Filter reports by device category
5. **Weekly Statistics** - Total, min, max, average consumption
6. **Month-over-Month Comparison** - Track usage trends
7. **Error Handling** - User-friendly messages for missing data
8. **Filename Search** - Quick report lookup
9. **Peak Hours Highlighting** - Identify high consumption periods
10. **Cost Estimates** - Configurable cost per kWh calculations

---

## 🛠️ Tech Stack

**Backend:**

- Node.js + Express.js
- MongoDB + Mongoose
- JWT for authentication
- ExcelJS for Excel generation

**Frontend:**

- Vanilla JavaScript (MVC pattern)
- Chart.js for visualizations
- No framework dependencies

---

## 📡 API Endpoints

### Authentication

```
POST /api/auth/register    # Create new user
POST /api/auth/login       # Login & get JWT token
GET  /api/auth/me          # Get current user
```

### Devices

```
GET    /api/devices        # List all devices
POST   /api/devices        # Create device
PUT    /api/devices/:id    # Update device
DELETE /api/devices/:id    # Delete device
```

### Energy Data

```
GET  /api/energy           # Get energy consumption data
POST /api/energy           # Log new energy data
```

### Reports ⭐

```
GET    /api/reports                      # List reports (with filters)
GET    /api/reports/:id                  # Get single report
POST   /api/reports/generate             # Generate new report
GET    /api/reports/:id/export/csv       # Download CSV
GET    /api/reports/:id/export/excel     # Download Excel
DELETE /api/reports/:id                  # Delete report
```

---

## 🔧 Environment Variables

Create a `.env` file (optional):

```env
MONGODB_URI=mongodb://127.0.0.1:27017/myems
PORT=3000
JWT_SECRET=your_secret_key_change_in_production
```

Defaults are used if `.env` is not present.

---

## 🐛 Common Issues & Fixes

### MongoDB Connection Failed

```bash
# Make sure MongoDB is running
mongod --dbpath C:\data\db

# Or check if running
Get-Process mongod
```

### Port 3000 Already in Use

Change port in `.env`:

```env
PORT=3001
```

### Downloads Not Working

- Ensure you're logged in (JWT token required)
- Check browser console for errors (F12)
- Verify server is running

---

## 📝 Code Changes for Next Developer

### Recent Modifications (Download Feature Fix)

**File: `js/services/ApiService.js`** (Lines 273-318)

**Problem:** Downloads were navigating to `file:///` URLs instead of downloading files.

**Solution:** Changed from `window.open()` to `fetch()` with blob download:

```javascript
function exportReportCSV(id) {
  const token = localStorage.getItem("token");
  const url = `${window.location.origin}${BASE}/reports/${id}/export/csv`;

  fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((response) => response.blob())
    .then((blob) => {
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    });
}
```

Same pattern for `exportReportExcel()`.

---

## 🧪 Testing

### Manual Testing

1. Start server and MongoDB
2. Login with test credentials
3. Create devices
4. Generate energy data
5. Generate reports
6. Test CSV/Excel downloads

### Test Credentials

After running `npm run init-db`:

- **Admin:** `admin@myems.com` / `Admin123!`
- **User:** `user@myems.com` / `User123!`

---

## 📦 Dependencies

Main packages:

```json
{
  "express": "^4.21.2", // Web framework
  "mongoose": "^8.18.0", // MongoDB ODM
  "jsonwebtoken": "^9.0.2", // JWT auth
  "bcryptjs": "^2.4.3", // Password hashing
  "exceljs": "^4.4.0", // Excel generation
  "cors": "^2.8.5", // CORS middleware
  "dotenv": "^16.6.1" // Environment variables
}
```

---

## 🎯 Future Enhancements Ideas

- Real-time WebSocket updates
- Email notifications for high usage
- Mobile responsive design improvements
- Advanced analytics dashboard
- Integration with IoT devices
- Automated report scheduling
- Data export to cloud storage

---

## 📄 License

See LICENSE file for details.

---

## 👨‍💻 For Developers

### Adding New Features

1. **Backend**: Add controller function → Add route → Test with Postman
2. **Frontend**: Add service method → Add controller logic → Update view
3. **Database**: Modify schema in `models/` → Run migration if needed

### File Naming Conventions

- Controllers: `camelCase` functions, `PascalCase` files
- Routes: lowercase with hyphens
- Models: `PascalCase` singular names

### Code Style

- Use `async/await` for async operations
- Always handle errors with try/catch
- Use `lean()` for MongoDB read operations
- JWT token in `Authorization: Bearer <token>` header

---

**Need help?** Check the code comments or console logs for debugging info.
>>>>>>> edd6ab99103d2eaf707de84c7e82e804d9e70762
