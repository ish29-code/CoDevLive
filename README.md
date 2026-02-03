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

## Installation

```bash
git clone https://github.com/yourusername/codevlive.git
cd codevlive
Install Dependencies
```bash

Copy code
npm install --prefix backend
npm install --prefix frontend
npm install --prefix workers
Environment Variables
Create .env inside backend:

env
Copy code
PORT=5000
MONGO_URI=your_uri
JWT_SECRET=your_secret

REDIS_HOST=127.0.0.1
REDIS_PORT=6379

EMAIL_USER=your_email
EMAIL_PASS=your_password
Run Redis
bash
Copy code
redis-server
Verify:

nginx
Copy code
PONG
Start Services
Backend
arduino
Copy code
npm run dev
Worker
arduino
Copy code
cd workers
npm run dev
Frontend
powershell
Copy code
npm start
🔮 Future Enhancements
Kubernetes deployment

Auto-scaling socket clusters

Code execution sandbox (Docker)

Interview recording

AI-based candidate evaluation

👩‍💻 Author
Ishika Deshpande

Backend-focused Full Stack Engineer passionate about distributed systems and real-time architecture.

