# ⚡ Energy Management System (EMS)

A **web application** for managing energy data, built with **Node.js** and **MongoDB**.  
It provides APIs for performing **CRUD operations** on users, devices, energy data, and reports.

---

## 🧩 Features
- RESTful APIs for user, device, and energy management
- MongoDB backend with containerized setup
- Docker Compose orchestration for easy deployment
- `/api/student` endpoint for verification

---

## 🛠️ Prerequisites
Before running the project, make sure you have:

- **Node.js v20 or later** (for local development)
- **Docker** and **Docker Compose** (for containerized deployment)
- **MongoDB** (handled automatically via Docker)

---

## 💻 Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yashkhowal/Energy-Management-System-GP.git
2. **Navigate to the project directory**
   ```bash
   cd Energy-Management-System-GP
3. **nstall dependencies**
   ```bash
   npm install
4. **Start the application**
   ```bash
   npm start
5. **Access the server**
   ```bash
   http://localhost:3000
6. **Example API Route**
   ```bash
   http://localhost:3000/api/users

## 🐳 Running with Docker
This project uses Docker Compose to orchestrate the Node.js application (ems-app) and MongoDB database.
### ✅ Prerequisites
Docker and Docker Compose installed on your machine
### 🧱 Build the Docker images
    docker compose up --build
### 🚀 Run containers in detached mode
    docker compose up -d
##### The application will be accessible at 
http://localhost:3000
MongoDB runs on port 27017 (internal to the Docker network, connected to the app)


### 🧰 Useful Commands
#### View logs
docker compose logs
#### Follow logs for a specific service
docker compose logs -f ems-app
docker compose logs -f mongo
#### List running containers
docker ps
#### Stop and remove a conflicting container (example)
docker stop <container_id_or_name>
docker rm <container_id_or_name>
### 🧪 Quick API Smoke Test
#### Get all users
curl http://localhost:3000/api/users
#### Health/verification
curl http://localhost:3000/api/student
#### 🛟 Troubleshooting
Port already in use (3000/27017):
Stop the process using the port or change the mapped port in docker-compose.yml.
lsof -i :3000
kill -9 <PID>
Mongo container name conflict (e.g., /mongo already exists):
#### Remove or rename the old container.
docker ps -a
docker stop mongo
docker rm mongo
docker compose up --build
Cannot connect to DB in local (non-Docker) run:
Ensure MongoDB is running locally on 127.0.0.1:27017, or update your local .env/config to point to the correct MongoDB URI.
### 📄 License
This project is licensed under the MIT License.

