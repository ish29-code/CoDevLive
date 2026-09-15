# 🚀 CoDevLive — Real-Time Collaborative Coding & Interview Platform

> A distributed, production-grade platform enabling live coding interviews with WebRTC video, synchronized editors, host-controlled workflows, and asynchronous job processing.

Built with scalability, fault tolerance, and real-time performance in mind.

---

## 🔥 Why CoDevLive?

Technical interviews today require more than just video calls.

CoDevLive provides:

✅ Live collaborative coding  
✅ Real-time video communication  
✅ Host-controlled interview rooms  
✅ Async system design (queues + workers)  
✅ Horizontally scalable WebSockets  
✅ Secure authentication  
✅ Distributed event handling  

This project demonstrates **production-level backend engineering**, not just UI development.

---

# 🧠 System Architecture

Client (React)
↓
API Gateway (Express)
↓
Auth Middleware (JWT / Firebase)
↓
Core Services
• Interview Service
• Realtime Socket Layer
• Code Sync Engine
• Queue Producer
↓
Redis
↓
BullMQ Workers
↓
Email Service (Nodemailer)

yaml
Copy code

---

# ⚡ Key Engineering Highlights

## ✅ Real-Time System Design
- WebSocket-powered collaborative coding
- Live participant approval workflows
- Instant state sync across multiple interviewers
- Auto-removal of approved/rejected requests using socket events

---

## ✅ Distributed Queue Architecture
Implemented **BullMQ + Redis** to offload non-critical tasks.

### Why?

Sending emails synchronously blocks the event loop.

Instead:

User Login
↓
Job added to Redis Queue
↓
Worker processes job
↓
Email sent

yaml
Copy code

✔ Reduced API latency  
✔ Prevented server blocking  
✔ Improved throughput  

---

## ✅ Horizontally Scalable Socket Layer

Redis Pub/Sub allows multiple socket servers.

Meaning the system is ready for:

👉 load balancers  
👉 container orchestration  
👉 multi-node deployments  

---

## ✅ Secure Authentication Flow

Supports:

- JWT authentication
- Firebase OAuth (Google + GitHub)

### Flow:
Login → Token Generated → Axios Interceptor → Middleware Verification → Protected Routes

yaml
Copy code

Security features:

✔ Hashed passwords  
✔ Token validation  
✔ Route protection  

---

## ✅ Host-Controlled Interview System

Unlike basic meeting apps:

- Only host/interviewer can approve participants  
- Students have restricted privileges  
- Role-based event broadcasting  

When one interviewer approves:

👉 request disappears instantly for ALL interviewers.

**True distributed state sync.**

---

## ✅ WebRTC Peer-to-Peer Video

Low latency communication without routing media through the server.

Benefits:

✔ Reduced bandwidth cost  
✔ Faster video streams  
✔ Better scalability  

---

## ✅ Fault Tolerance Strategy

Redis is in-memory — crashes can happen.

Design considerations:

- Queue-based retry strategy
- Worker recovery
- Optional Redis replication
- Data persisted in MongoDB

System prioritizes **event durability**.

---

# 🛠 Tech Stack

## Frontend
- React.js  
- Monaco Editor  
- Socket.io-client  
- Axios  
- React Router  

---

## Backend
- Node.js  
- Express.js  
- MongoDB  
- JWT  
- Firebase Auth  

---

## Realtime & Distributed Systems
- Socket.io  
- Redis  
- BullMQ  

---

## Infrastructure Ready
- Docker-friendly architecture  
- Redis horizontal scaling  
- Worker-based processing  

---

# ⭐ Core Features

### 🔹 Live Coding Interviews
- Real-time editor sync
- Host-controlled problem selection
- Multi-interviewer support

---

### 🔹 Async Email Pipeline
Welcome emails processed without blocking API requests.

---

### 🔹 DSA Tracker
Pattern-based problem tracking with:

- Solve mode  
- Revision mode  
- Dedicated practice rooms  

---

### 🔹 Anti-Cheat Signals
Detects:

- Tab switching  
- Window blur  

Events visible to interviewers in real time.

---

# 📊 Engineering Decisions

## Why Queue Instead of Direct Email?

Because synchronous I/O is dangerous under load.

Queues provide:

✔ backpressure  
✔ retry mechanisms  
✔ failure isolation  

---

## Why Redis?

Chosen for:

- Sub-millisecond latency  
- Pub/Sub capability  
- Queue backing  
- Rate limiting support  

(Not used as primary DB due to RAM cost.)

---

## Why WebRTC?

Avoids server bandwidth explosion.

Peer-to-peer = scalable.

---

# 🚀 Getting Started

## Prerequisites
- Node 18+
- MongoDB
- Redis

---


### 1️⃣ Clone the Repository

```bash
git clone https://github.com/ish29-code/codevlive.git
cd codevlive
```

---

## 📦 Install Dependencies

Install packages for backend, frontend, and workers:

```bash
npm install --prefix backend
npm install --prefix frontend
npm install --prefix workers
```

---

## 🔐 Environment Variables

Create a `.env` file inside the **backend** folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key

REDIS_HOST=127.0.0.1
REDIS_PORT=6379

EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

---

## ⚡ Run Redis

Start the Redis server:

```bash
redis-server
```

Verify Redis is running:

```bash
redis-cli ping
```

Expected output:

```
PONG
```

---

## ▶️ Start the Application

### Start Backend
```bash
cd backend
npm run dev
```

---

### Start Worker (Queue Processor)
```bash
cd workers
npm run dev
```

---

### Start Frontend
```bash
cd frontend
npm start
```

Your app should now be running 🚀

---

# 🔮 Future Enhancements

- Kubernetes deployment for container orchestration  
- Auto-scaling WebSocket clusters  
- Secure code execution sandbox using Docker  
- Interview session recording  
- AI-powered candidate evaluation  

---

<img width="1751" height="929" alt="Screenshot From 2026-09-15 17-12-16" src="https://github.com/user-attachments/assets/48a2741c-c87e-4f16-8dc0-189aae8d091d" />


# 👩‍💻 Author-

**Ishika Deshpande**  
Backend-focused Full Stack Engineer passionate about distributed systems, real-time architecture, and scalable backend design.
