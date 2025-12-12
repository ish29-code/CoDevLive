# 🌐 CodevLive — Frontend Documentation (Complete)

CodevLive is a real-time collaborative coding and learning platform built for:
✔ Students  
✔ Teachers  
✔ Interviewers  
✔ Developers  

Powerful features like live code editing, AI assistance, proctoring, plagiarism detection, DSA tracker, and interview mode make it a full ecosystem for coding education and assessments.

---

# 🚀 Frontend Tech Stack

| Technology | Why it’s used |
|------------|---------------|
| **React (Vite)** | Fast bundling, modern DX |
| **TailwindCSS** | Professional design, component speed |
| **shadcn/UI** | Modern UI components with accessibility |
| **Monaco Editor** | Same editor used in VS Code |
| **Socket.io Client** | Real-time sync for editor + chat |
| **Axios** | API calls |
| **React Router** | Page navigation |
| **Zustand / Context API** | Lightweight global state mgmt |
| **Lucide Icons** | Clean icon pack |
| **Framer Motion** | Page & UI animations |
| **WebRTC** | Video calling for interview mode |
| **LocalStorage** | Draft auto-saving |

---

# 🎨 UI Theme & Design Guide

## Color Palette
| Purpose | Color |
|---------|--------|
| Primary | `#3B82F6` (Blue) |
| Secondary | `#1E293B` (Slate Dark) |
| Background (Light) | `#F9FAFB` |
| Background (Dark) | `#0F172A` |
| Success | `#10B981` |
| Danger | `#EF4444` |

## Typography
- **Editor Font**: JetBrains Mono / Fira Code  
- **UI Font**: Inter / Poppins  

## Design Philosophy
- Minimal & clean  
- Professional SaaS look  
- Easy for teachers & interviewers  
- Comfortable for students  
- High contrast for coding environments  
- Dark mode first  

---

# 📁 Folder Structure (Deep Detail)

```bash
client/
├── public/
├── src/
│   ├── assets/                   # logos, icons, illustrations
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Sidebar.jsx
│   │   ├── Editor/
│   │   │   ├── MonacoEditorWrapper.jsx
│   │   │   ├── EditorTabs.jsx
│   │   │   ├── PresenceCursors.jsx
│   │   ├── Chat/
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── ChatBubble.jsx
│   │   ├── AI/
│   │   │   ├── AICodeReview.jsx
│   │   │   ├── AIExplain.jsx
│   │   │   ├── AITests.jsx
│   │   ├── Proctoring/
│   │   │   ├── WebcamStream.jsx
│   │   │   ├── ScreenShare.jsx
│   │   │   ├── Alerts.jsx
│   │   └── UI/                   # shadcn components
│   │       ├── Button.jsx
│   │       ├── Modal.jsx
│   │       ├── Card.jsx
│   │       ├── Input.jsx
│   │       ├── Dropdown.jsx
│   │       
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── About.jsx
│   │   ├── AuthPage.jsx
│   │   ├── Settings.jsx
│   │   ├── Dashboard.jsx
│   │   ├── EditorRoom.jsx
│   │   ├── ChatRoom.jsx
│   │   ├── Interview.jsx
│   │   ├── DSATracker.jsx
│   │   ├── AIAssistant.jsx
│   │   ├── Profile.jsx
│   │   ├── AdminPanel.jsx
│   │   ├── Notifications.jsx
│   │   ├── ResumeReview.jsx
│   │   ├── GitIntegration.jsx
│   │   ├── PlagiarismReport.jsx
│   │   └── Proctoring.jsx
│
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useSocket.js
│   │   ├── useTheme.js
│
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── SocketContext.jsx
│   │   ├── ThemeContext.jsx
│
│   ├── services/
│   │   ├── authService.js
│   │   ├── roomService.js
│   │   ├── dsaService.js
│   │   ├── aiService.js
│   │   ├── plagiarismService.js
│   │   ├── githubService.js
│
│   ├── utils/
│   │   ├── formatCode.js
│   │   ├── normalizeCode.js
│   │   ├── socketEvents.js
│
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
└── package.json


```
---

# ⚡ Key Frontend Pages (Explained in Detail)

### 🏠 Home Page (Minimal)
Just **"CodevLive"**, Login & Signup buttons.

### 📊 Dashboard
- Recent rooms  
- Joined sessions  
- DSA stats  
- Resume score  
- AI suggestions  

### 💻 Editor Room
- Monaco Editor  
- Collaborators cursors  
- Chat sidebar  
- Language selector  
- Run code  
- AI helper slide-out panel  
- Auto-save drafts  
- Testcase panel  

### 🎥 Interview Page
- Coding panel + Question  
- Timer  
- Video Call (WebRTC)  
- Proctoring alerts  
- Evaluation panel (for interviewer)  

### 🧮 DSA Tracker
- Solve history  
- Topics  
- Difficulty tracking  
- Time estimation  

### 🤖 AI Assistant
- Code review  
- Testcase generation  
- Explanation  
- Time/space complexity  

### 🔍 Plagiarism Page
- Shows similarity %  
- Matched submissions  
- Side-by-side diff  

---

# ✔ Why This Frontend Is Professional
- Clean, scalable structure  
- Production-grade UI design  
- Real-time coding + AI + proctoring  
- Perfect for Placements / Portfolio / Interview demo  

---

© 2025 CodevLive Frontend — Built with passion using React & AI ⚛️


```
---