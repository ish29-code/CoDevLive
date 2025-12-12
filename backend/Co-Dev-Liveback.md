# 🖥️ CodevLive Backend — Documentation (MongoDB Only)

The backend powers real-time collaboration, AI tooling, automated code execution, plagiarism detection, proctoring, and admin features — all running on Node.js, Express, MongoDB, and Socket.io.

---

# 🔧 Backend Tech Stack

| Tool | Purpose |
|------|---------|
| **Node.js + Express** | API server |
| **MongoDB + Mongoose** | Authentication, sessions, submissions |
| **Socket.io** | Real-time communication |
| **Judge0 API** | Code execution |
| **OpenAI API** | AI review, hints, explanation |
| **WebRTC signaling via Socket.io** | Video calling |
| **Multer** | Resume/File uploads |
| **AST Parser Libraries** | Plagiarism detection |
| **JWT** | User authentication |
| **bcryptjs** | Password hashing |
| **Redis (Optional)** | Scaling sockets |

---

# 📁 Backend Folder Structure (Expanded)



server/
├── src/
│   ├── config/
│   │   ├── db.js        # Mongo connection
│   │   └── env.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Room.js
│   │   ├── Message.js
│   │   ├── Session.js          # Editor session
│   │   ├── DSAProblem.js
│   │   ├── Submission.js       # Raw code submissions
│   │   ├── Plagiarism.js
│   │   └── AIReview.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── roomController.js
│   │   ├── codeController.js
│   │   ├── chatController.js
│   │   ├── dsaController.js
│   │   ├── aiController.js
│   │   ├── resumeController.js
│   │   ├── plagiarismController.js
│   │   ├── proctoringController.js
│   │   └── adminController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── roomRoutes.js
│   │   ├── codeRoutes.js
│   │   ├── chatRoutes.js
│   │   ├── dsaRoutes.js
│   │   ├── aiRoutes.js
│   │   ├── resumeRoutes.js
│   │   ├── plagiarismRoutes.js
│   │   ├── proctoringRoutes.js
│   │   └── adminRoutes.js
│   ├── sockets/
│   │   ├── editorSocket.js
│   │   ├── chatSocket.js
│   │   ├── proctoringSocket.js
│   │   └── notificationSocket.js
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   ├── roleMiddleware.js
│   │   └── errorHandler.js
│   ├── utils/
│   │   ├── normalizeCode.js
│   │   ├── plagiarismCheck.js
│   │   ├── aiHelper.js
│   │   ├── codeRunner.js
│   │   └── logger.js
│   ├── server.js
│   └── app.js
├── package.json
└── README.md


---

# 🧠 Detailed Controller Responsibilities

## 1️⃣ Auth Controller
Handles:
- Registration  
- Login  
- JWT token generation  
- Password hashing  
- Token validation  

Stores data in Mongo:  
`User` collection → `{ username, email, passwordHash }`

---

## 2️⃣ Room Controller
- Create rooms  
- Join rooms  
- Fetch room list  
- Manage roles (teacher / student / interviewer)  

Stores in Mongo:  
`Room` collection → `{ roomId, name, members, creator }`

---

## 3️⃣ Code Controller
Handles:
- Executing code via Judge0
- Managing languages
- Saving raw code submission in Mongo
- Returning compiler output  

Data saved in Mongo:  
`Submission` → `{ user, code, language, result }`

---

## 4️⃣ AI Controller
AI Powered features:
- Code Review  
- Error Detection  
- Explanation of code  
- Testcase generation  
- Suggest improvements  

Data saved in Mongo:  
`AIReview` → `{ prompt, aiResult, user, createdAt }`

---

## 5️⃣ Plagiarism Controller
Steps:
1. Normalize code (remove whitespace, comments)
2. Tokenize  
3. Compare AST structure  
4. Compute similarity score  
5. Match against DB submissions  

Mongo stores:
`Plagiarism` → `{ submission1, submission2, similarity }`

---

## 6️⃣ DSA Controller
- Fetch problems  
- Track solved questions  
- Mark difficulty  
- User performance tracking  

Mongo stores problem bank.

---

## 7️⃣ Chat Controller
- Save chat messages  
- Fetch chat history  
- Socket.io real-time messaging  

Mongo stores:
`Message` → `{ roomId, user, text }`

---

## 8️⃣ Proctoring Controller
- Webcam monitoring  
- Screen monitoring  
- Tab change detection  
- Violation logs  

Mongo stores:
`ProctoringLogs` → `{ user, roomId, eventType, timestamp }`

---

## 9️⃣ Admin Controller
- Manage rooms, users  
- System logs  
- Ban users  
- Delete submissions  
- Fetch platform analytics  

---

# 💬 Socket Architecture (Deep)

## Editor Socket
Events:
- `editor:join`
- `editor:leave`
- `editor:codeChange`
- `editor:cursorChange`

## Chat Socket
- `chat:message`
- `chat:typing`

## Proctoring Socket
- `proctor:stream`
- `proctor:alert`

## Notification Socket
- `notify:room`
- `notify:user`

Each socket is loaded from:
`server/src/sockets/*.js`

---

# 🔍 Plagiarism Detection Logic (Deep Detail)

**Techniques used:**
### 1. String Similarity (Levenshtein)
Quick comparison.

### 2. Token Matching  
Using AST parsers:
- Remove identifiers  
- Keep structure  

### 3. AST Structural Comparison  
To detect code copied from ChatGPT with variable name changes.

### 4. Match Scoring
Produce:
- percentage  
- matched submissions  
- code diff  

---

# ⚙ Database Models

MongoDB Models:
- User  
- Room  
- Message  
- Session  
- Submission  
- DSAProblem  
- Plagiarism  
- AIReview  
- ProctoringLogs  

---

# 🔐 Authentication Flow
1. User logs in  
2. Backend returns JWT  
3. All protected APIs require bearer token  
4. Socket.io also receives token for authentication  

---

# 🚀 Deployment Architecture
Recommended stack:
- Backend → Render / Railway / EC2  
- MongoDB → MongoDB Atlas  
- Frontend → Vercel  
- Socket Scaling → Redis Adapter  
- Object Storage → Cloudinary / S3  

---

© 2025 CodevLive Backend — Real-time, AI-powered, Secure, and Production Ready
