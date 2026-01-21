👤 Profile Management Flow — CoDevLive

This document explains the complete Profile System implemented in CoDevLive.
It covers how users create, update, upload, and retrieve their profiles — including photo & resume uploads using Cloudinary.

This system is designed to provide a single persistent professional profile per user.

🏗️ Tech Stack Used
Frontend

React + Context API

Fetch API / FormData

File Upload handling

Skill auto-suggestion system

Local UI state management

Backend

Node.js + Express

MongoDB + Mongoose

Cloudinary (media storage)

Multer / express-fileupload

Protected Routes (JWT/Firebase middleware)

🧩 Profile Data Model

Each user has exactly one profile.

MongoDB Schema
Profile
│
├── user        → Reference to User (unique)
├── name
├── school
├── college
├── location
├── bio
├── skills      → Array of strings
├── linkedin
├── github
├── twitter
├── photo       → Cloudinary image URL
├── resume      → Cloudinary file URL
├── createdAt
└── updatedAt


✔ One profile per user
✔ Automatically timestamps changes
✔ Skills stored as flexible array

🔐 Route Protection

All profile routes are protected by the auth middleware.
Only logged-in users can access or update their own profile.

Authorization: Bearer <token>
x-auth-type: jwt OR firebase


Middleware verifies token and attaches:

req.user.id

📦 Backend API Endpoints
Endpoint	Method	Purpose
/api/profile/me	GET	Fetch logged-in user’s profile
/api/profile/me	PUT	Create or Update profile
⚙️ Backend Profile Flow
➤ Fetch Profile

Request hits /api/profile/me

Auth middleware verifies user

Profile collection searched by userId

Profile returned to frontend

If not found → 404 Profile not found

➤ Create / Update Profile (Upsert)

Frontend sends FormData containing:

Text fields

Skills array

Optional photo file

Optional resume file

Backend:

Reads fields from req.body

Parses skills JSON array

Uploads photo to Cloudinary

Uploads resume to Cloudinary

Receives secure URLs

MongoDB findOneAndUpdate with upsert:true

If profile exists → update

If not → create new

Updated profile returned

Cloudinary URLs stored permanently

☁️ Cloudinary Upload Handling

Two separate upload folders:

File Type	Cloudinary Folder	Resource Type
Profile Photo	profiles/photos	image
Resume File	profiles/resumes	raw

Returned secure_url is stored in database.

No files are stored on your server — fully cloud-based.

💻 Frontend Profile Flow
➤ Load Profile on Page Refresh

On Profile page mount

Token fetched from localStorage

GET /api/profile/me

Profile data stored in component state

UI populated automatically

➤ Edit Mode

User clicks Edit Profile

Form fields become editable

User can:

Change text fields

Add/remove skills

Upload new photo

Upload new resume

➤ Skills Auto-Suggestion

User types in skill input

Skills filtered from predefined SKILLS list

Suggestions dropdown shown

Clicking suggestion adds skill tag

Skills stored as array

➤ Save Profile

FormData constructed

PUT /api/profile/me

Backend uploads files if present

MongoDB upsert executed

Updated URLs returned

AuthContext updated:

Name

Profile Photo

UI updated instantly

➤ Logout Handling

When user logs out:

Profile state resets

Edit mode exits

No stale data remains

🧠 Atomic Upsert Strategy

Profile creation uses:

findOneAndUpdate(
   { user: userId },
   { $set: updatedFields },
   { upsert: true }
)


This guarantees:

✔ No duplicate profiles
✔ No race conditions
✔ Safe concurrent updates

🛡️ Security Measures

Profile routes require authentication

User ID never passed manually (taken from token)

Cloudinary credentials stored in environment variables

No direct file access from frontend

Secure Cloudinary URLs only

📁 Environment Variables

Backend .env:

CLOUDINARY_NAME=xxxx
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx

🔄 Complete Profile Flow Summary
User logs in
    ↓
Opens Profile Page
    ↓
Frontend GET /profile/me
    ↓
Profile loaded into UI
    ↓
User edits fields & uploads files
    ↓
Frontend PUT /profile/me (FormData)
    ↓
Backend uploads to Cloudinary
    ↓
MongoDB upsert profile
    ↓
Updated profile returned
    ↓
UI refreshed instantly

📈 What This Profile System Demonstrates

✅ Real-world CRUD operations
✅ Cloud-based media uploads
✅ Secure protected routes
✅ Atomic database updates
✅ FormData handling
✅ State synchronization with AuthContext
✅ Clean UX edit/save pattern
