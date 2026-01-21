🎥 CoDevLive – Real-Time Technical Interview Platform

CoDevLive is a full-stack real-time technical interview platform that simulates modern remote coding interviews.
It supports video calling, live code editor, role-based entry, approval-based joining, problem assignment, hint control, anti-cheat tracking, and final evaluation.

This README explains the complete interview flow — from room creation to interview completion — exactly as implemented in this project.

🚀 Core Features
👥 Role System

Host (Creator) – Creates interview room & controls approvals

Interviewer – Conducts interview, assigns problems, controls hints

Student – Solves problems during interview

🔐 Secure Join & Approval Workflow

Host joins directly

Other users request to join

Host approves/rejects

Only approved users enter interview room

🎥 Video + Screen Sharing

Pre-join camera/mic check

Toggle mic, camera, screen sharing

WebRTC + Socket.IO signaling

💻 Live Code Editor

Monaco Editor

Multi-language support

Run code inside browser

Real-time synced environment

🧠 Problem Assignment

Interviewer selects coding problem

Instantly appears to student

Starter code auto-loaded

💡 Controlled Hint System

Interviewer unlocks hints one-by-one

Student only sees approved hints

🛡️ Anti-Cheat Detection

Detects:

Tab switching

Window blur

Sends events to interviewer timeline

📝 Evaluation & Feedback

Interviewer rates student

Saves evaluation to database

🧩 Tech Stack

Frontend

React.js

React Router

Socket.IO Client

Monaco Editor

Tailwind CSS

Backend

Node.js + Express

MongoDB + Mongoose

Socket.IO Server

JWT Authentication

📂 Database Models
Interview
roomId
createdBy        // host user
interviewers[]   // optional co-interviewers
problemId
interviewerJoined
status           // scheduled | live | ended

InterviewParticipant
interviewId
userId
role    // interviewer | student
status  // pending | approved
joinedAt

InterviewEvaluation

Stores final scoring and feedback.

🧭 Complete Interview Workflow

This section describes exactly what happens in your system.

🟢 1. Creating Interview Room

Frontend: InterviewHome

Host clicks Create Interview

POST /interview/create


Backend:

Generates unique roomId

Creates Interview document

Response:

{ roomId }


Frontend:
Redirects host to:

/interview/lobby/:roomId

🟡 2. Opening Lobby

Frontend: InterviewLobby

On page load:

GET /interview/:roomId


Backend:

Checks if current user is creator

If creator → auto-assigns role interviewer + approved

Frontend:

If host → role locked as Interviewer

Others choose Interviewer or Student

🎥 3. Camera & Mic Check

Before joining:

Browser requests camera/mic permission

User must:

Enable camera

Enable mic

Accept instructions

Select role

Join button activates only when all conditions true.

🔐 4. Joining Interview

Frontend:

POST /interview/join
body: { roomId, role }

Backend Join Logic
If Host:

Upserts participant:

role: interviewer
status: approved


Returns:

{ direct: true }


Frontend redirects to Interview Room

If Existing Participant:

Returns stored role & latest status

If New Participant:

Creates participant:

status: pending


Emits socket event:

join-request → roomId


Returns:

{ direct: false, status: "pending" }


Frontend redirects user to Waiting Page

⏳ 5. Waiting Page

Frontend: InterviewWait

Polls backend every second:

GET /interview/:roomId


If:

approved === true


→ Redirects to Interview Room

Host never stays on waiting page.

🧑‍💼 6. Host Receives Join Requests

Frontend: InterviewRoom (Host)

Socket Listener:

socket.on("join-request")


Displays pending users

Shows Approve / Reject buttons

✅ 7. Approving Participant

Frontend:

POST /interview/approve
body: { roomId, userId }


Backend:

Confirms requester is host

Updates participant:

status = approved


Emits:

participant-approved → roomId


Waiting page polling detects approval → joins room

❌ 8. Rejecting Participant
POST /interview/reject


Deletes pending participant

Emits:

participant-rejected


User redirected back to lobby

🎬 9. Entering Interview Room

Frontend: InterviewRoom

On load:

GET /interview/:roomId


Backend returns:

myRole
approved
isCreator
interviewerJoined
problemId


UI adjusts automatically:

Interviewer sees controls

Student sees waiting / problem area

💻 10. Assigning Problem

Interviewer Action:

POST /interview/assign-problem
body: { roomId, problemId }


Backend:

Confirms interviewer permission

Saves problemId

Emits:

problem-assigned → roomId


Frontend:

Loads problem description

Loads starter code

💡 11. Hint System

Interviewer:

Unlocks hint count

Clicks “Show to Student”

socket.emit("toggle-hints", { roomId, show: true, count })


Backend Socket:

hints-visibility → students


Student:

Displays only unlocked hints

🛡️ 12. Anti-Cheat Detection

Student Browser Events:

Window blur

Tab change

socket.emit("cheat-event", { roomId, type })


Interviewer:
Receives cheat events in timeline

🎥 13. Video & Screen Sharing

Frontend Component: VideoCall

WebRTC signaling via Socket.IO:

webrtc-offer
webrtc-answer
ice-candidate


Users can toggle:

Mic

Camera

Screen Share

⏱️ 14. Interview Timer

Timer starts when room loads

Interviewer can pause/resume

Timeline logs important actions

📝 15. Ending Interview & Evaluation

Interviewer clicks End

Evaluation modal opens

Ratings submitted:

POST /interview/evaluation


Saved in database

🏁 Interview Completed

Interview session ends.
All participants exit the room.

🔌 Socket Events Summary
Event	From → To	Purpose
join-room	client → server	Join room
join-request	server → host	Join approval request
participant-approved	server → client	Approval notification
participant-rejected	server → client	Rejection notification
problem-assigned	server → clients	Sync selected problem
toggle-hints	interviewer → server	Request hint visibility
hints-visibility	server → student	Show hints
cheat-event	student → interviewer	Anti-cheat logs
webrtc-offer/answer/ice	clients	Video call signaling
🧠 Reliability Design

✔ Database stores participant states
✔ Polling ensures recovery if socket missed
✔ Role-guarded API routes
✔ Host-controlled access
✔ Real-time updates via sockets

🏆 What This Project Demonstrates

Full-stack real-time system design

Role-based access control

WebRTC video integration

Live collaborative coding

Anti-cheat engineering

Database + Socket sync strategy

💬 Final Note

This project replicates real remote technical interviews used in modern hiring.
It combines system design, real-time communication, and secure role management into one complete platform.
