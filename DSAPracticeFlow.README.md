🧠 DSA Practice Flow — CoDevLive

This document explains the complete DSA Practice System in CoDevLive.
It covers how problems are stored, displayed pattern-wise, solved in a live coding room, judged, and how progress & leaderboards are updated.

This system is inspired by LeetCode-style problem solving, combined with pattern-based preparation and progress tracking.

🏗️ Tech Stack Used
Frontend

React + Hooks

Monaco Code Editor

Pattern-wise DSA Tracker UI

Practice Room with Timer & Hints

Circular Progress Visualization

Backend

Node.js + Express

MongoDB + Mongoose

Custom Judge Engine

Secure Submission & Progress APIs

🧩 Core Database Models
📘 Problem Model

Stores complete coding problems.

Problem
│
├── title
├── slug
├── difficulty (Easy / Medium / Hard)
├── pattern (Arrays, DP, Graphs, etc.)
├── description
├── constraints
├── examples[]
├── testCases[]   → input / expected output
├── tags[]
├── companies[]
├── stats.totalSubmissions
├── stats.acceptedSubmissions
├── isPublished
├── timestamps


✔ Indexed for fast filtering by pattern & difficulty
✔ Judge-ready test cases stored in DB

📝 Submission Model

Stores every code submission.

Submission
│
├── userId
├── problemId
├── code
├── language
├── verdict (Accepted / Wrong Answer / TLE / Runtime Error)
├── runtime
├── memory
├── timestamps


✔ Full submission history
✔ Used for analytics and review later

📊 DSA Progress Model

Tracks per-user progress per problem.

DsaProgress
│
├── userId
├── problemId
├── solved (true/false)
├── attempts
├── lastStatus
├── lastSubmittedCode
├── lastLanguage
├── submissions[] (history)
├── firstAttemptAt
├── solvedAt
├── timestamps


✔ Unique index (userId + problemId)
✔ Ensures one progress document per problem per user

📦 Backend API Endpoints
Endpoint	Method	Purpose
/api/problems	GET	Fetch all problems (pattern-wise list)
/api/problems/:id	GET	Fetch single problem
/api/submissions	POST	Submit code to judge
/api/progress/me	GET	Get logged-in user progress
/api/leaderboard	GET	Global leaderboard
⚙️ Backend Flow
➤ Fetch All Problems

Frontend calls /api/problems

Backend returns:

title, difficulty, pattern


Used to build pattern-wise DSA Tracker

➤ Fetch Single Problem

Frontend opens Practice Room

Calls /api/problems/:id

Full problem content + examples + test cases returned

➤ Submit Solution

User writes code in Practice Room

Clicks Run / Submit

Frontend sends:

problemId, code, language


Backend:

Loads problem test cases

Passes code + test cases to Judge

Judge executes & returns verdict

Submission saved to database

If verdict = Accepted → Progress updated

Result returned to frontend

➤ Judge Engine
judge({
  code,
  testCases,
  language
})


Returns:

{
  verdict: "Accepted" | "Wrong Answer" | "TLE" | "Runtime Error"
}


This simulates real online coding platform judging.

➤ Progress Update Logic

When Accepted:

✔ Problem added to solved list
✔ Attempts incremented
✔ Solved timestamp stored
✔ Stats updated
✔ Duplicate solves prevented

➤ Fetch My Progress

Frontend calls /api/progress/me

Backend returns:

Solved problems

Stats by difficulty

Current & max streak

Used to show progress dashboard.

➤ Leaderboard

Backend sorts users by total solved count

Returns top 50 users

Displayed in DSA Tracker sidebar

💻 Frontend Flow
➤ DSA Tracker Page

Pattern-wise visualization:

Arrays

Sliding Window

Binary Search

etc.

Each pattern shows:

✔ Total problems
✔ Solved count
✔ Circular progress
✔ Expandable list

Search bar filters problems instantly.

➤ Practice Room

When user clicks Solve:

Opens /practice-room/:id

Contains:

✔ Problem statement
✔ Examples
✔ Hints (unlock one-by-one)
✔ Code editor (Monaco)
✔ Timer
✔ Language selector
✔ Run button
✔ Output panel

➤ Hint System

Hints are revealed sequentially:

Show Hint 1 → Show Hint 2 → ...


Encourages guided problem solving like real interviews.

➤ Code Execution

(Currently frontend simulated)

Later integrates backend judge:

POST /api/submissions


Returns:

✔ Accepted
✔ Runtime Error
✔ Output log

➤ Timer & Pause

Each problem has:

✔ Live timer
✔ Pause / Resume
✔ Tracks time spent solving

📈 Progress Visualization

Circular progress component displays:

(solved / total) * 100%


Used in:

✔ Overall DSA progress
✔ Pattern-wise progress

🏆 Leaderboard

Right panel shows:

✔ Rank
✔ Username
✔ Total solved problems

Encourages competitive practice.

🔐 Route Protection

Submission & progress routes require authentication:

Authorization: Bearer <token>


Ensures each user’s progress is private & secure.

🧠 What This DSA System Demonstrates

✅ Real-world coding platform architecture
✅ Custom judge integration
✅ Problem management system
✅ Pattern-wise preparation
✅ Timed coding environment
✅ Hint unlocking mechanism
✅ Persistent progress tracking
✅ Competitive leaderboard

🚀 Future Ready Extensions

This design easily scales to:

Multiple test case judging

Code execution containers

Language-specific runtimes

Editorial pages

Daily challenge problems
