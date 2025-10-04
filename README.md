Energy Management System — Dockerization Guide

This guide explains how to run the EMS project in Docker.

---

## 1) Prerequisites
- Docker Desktop (Windows/macOS) or Docker Engine + Docker Compose v2 (Linux)
- Internet access for the first build/pull

---

## 2) Environment

Create a `.env` file in the repository root (if it doesn’t already exist):

```env
# App
PORT=3000

# Database (Compose uses service DNS "mongo")
MONGODB_URI=mongodb://mongo:27017/myems
MONGO_URI=mongodb://mongo:27017/myems

# Student identity for /api/student
STUDENT_NAME=Your Full Name
STUDENT_ID=YourStudentID


If you run the API without the Mongo container (single-container mode), set:

MONGODB_URI=mongodb://localhost:27017/myems
MONGO_URI=mongodb://localhost:27017/myems


3) Quick Start (API + Mongo with Docker Compose)

# from repo root
docker compose up --build

Access:

App: http://localhost:3000

Student endpoint: http://localhost:3000/api/student

Expected /api/student output:

{ "name": "Your Full Name", "studentId": "YourStudentID" }


Useful commands:

# stop and remove containers/networks
docker compose down

# follow logs
docker compose logs -f

# rebuild clean
docker compose build --no-cache


4) Single-Container Mode (use your own/local MongoDB)

Use only if MongoDB is already running on your host.

# ensure .env points to localhost as shown in Section 2 (single-container note)
docker build -t myems:latest .
docker run --name myems -p 3000:3000 --env-file .env myems:latest


Access:

App: http://localhost:3000

Student endpoint: http://localhost:3000/api/student

Stop/remove:

docker rm -f myems

5) Test From Scratch

git clone <your-repo-url>
cd <repo>
# if .env.example exists:
cp .env.example .env
# set STUDENT_NAME and STUDENT_ID in .env
docker compose up --build
 

 Verify:

Home page at http://localhost:3000

GET http://localhost:3000/api/student returns your JSON

Other API routes behave as expected

6) Troubleshooting

Compose warns “attribute version is obsolete”
Remove the top-level version: key from docker-compose.yml (Compose v2 ignores it).

API can’t connect to Mongo (ECONNREFUSED 127.0.0.1:27017 / ::1:27017)
Inside containers, localhost is the API container. Use
MONGODB_URI=mongodb://mongo:27017/myems when running with Compose.

Port already in use
Change PORT in .env (e.g., 4000) and re-run. Compose maps ${PORT}:3000.

Stale build / strange runtime
docker compose build --no-cache && docker compose up --build

Inspect logs
docker compose logs -f (or docker logs -f <container>)