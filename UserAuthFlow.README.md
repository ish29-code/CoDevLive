
🔐 User Authentication Flow — CoDevLive -

This document explains the complete user authentication system implemented in CoDevLive.
It includes Local JWT Authentication and Firebase Social Authentication, along with password reset, session persistence, and route protection.

This system is designed to handle multiple auth providers cleanly while maintaining a single unified user database.

🏗️ Tech Stack Used
Frontend

React + Context API

Firebase Authentication (Google / GitHub / Email)

Axios / Fetch

LocalStorage for session persistence...

Backend

Node.js + Express

MongoDB + Mongoose

JWT (JSON Web Token)

Firebase Admin SDK

Bcrypt for password hashing

Nodemailer for password reset emails

👤 User Model

Each user is stored in MongoDB with:

fullName

email (unique)

password (only for local users)

provider → "local" | "google" | "github"

resetToken + resetTokenExpiry (for password reset)

Passwords are hashed automatically before saving.

🔑 Authentication Methods
1. Local Email / Password Authentication
➤ Signup Flow

User submits fullName, email, password

Backend checks if user exists

Password is hashed using bcrypt

User saved in MongoDB with provider "local"

JWT token generated and returned

Frontend stores:

token in localStorage

user object in localStorage

AuthContext updates global session

➤ Login Flow

User submits email, password

Backend finds user and compares bcrypt hash

JWT token generated if valid

Frontend stores token + user

User redirected to protected pages

➤ Logout Flow

Token and user removed from localStorage

Firebase session (if any) signed out

AuthContext resets user state

2. Social Login (Google / GitHub)

Handled using Firebase Authentication.

➤ Social Login Flow

User clicks “Login with Google” or “Login with GitHub”

Firebase popup authenticates user

Firebase returns ID Token

Frontend sends ID Token to backend

Backend Firebase Admin verifies token

Backend:

Finds or creates user in MongoDB

Sets provider = "google" or "github"

Backend issues JWT for application session

Frontend stores JWT + user in localStorage

AuthContext updates session

This ensures:

Firebase handles OAuth

Backend controls database + session

🔁 Session Persistence (Auto Login)

On app load:

AuthContext checks localStorage for stored token + user

If found → calls backend /profile/me

Backend verifies JWT

Profile data refreshed

User session restored without re-login

🔒 Route Protection (Backend)

A single middleware handles both auth types:

Auth Middleware Logic

Reads Authorization: Bearer <token>

Reads x-auth-type header:

"jwt" → verifies JWT

"firebase" → verifies Firebase ID token

Finds user in MongoDB

Attaches req.user

Blocks request if invalid

All protected routes require this middleware.

🔁 Password Reset Flow (Local Users Only)
➤ Forgot Password

User enters email

Backend finds "local" user

Generates secure reset token

Stores token + expiry in DB

Sends email with reset link

➤ Reset Password

User opens link with token

Submits new password

Backend verifies token + expiry

Hashes new password

Clears reset token fields

User can log in again

Firebase users use Firebase’s built-in reset instead.

🧠 Frontend AuthContext Responsibilities

AuthContext manages:

Current user state

Login / Signup

Social login

Logout

Password reset

Auto session restore

Updating stored user profile

All auth actions go through this single global context.

🔐 Token Storage Strategy

Stored in localStorage:

token → JWT for backend authentication

user → basic user profile

Used in every API request:

Authorization: Bearer <token>
x-auth-type: jwt


or for Firebase:

Authorization: Bearer <firebase_id_token>
x-auth-type: firebase

📦 API Endpoints Summary
Endpoint	Method	Purpose
/api/auth/signup	POST	Local user signup
/api/auth/login	POST	Local login
/api/auth/firebase-login	POST	Social login sync
/api/auth/me	GET	Get current user
/api/auth/logout	POST	Logout
/api/auth/forgot-password	POST	Send reset email
/api/auth/reset-password	POST	Reset password
🛡️ Security Measures

Password hashing using bcrypt

JWT signed with secret key

Firebase token verification using Admin SDK

Token expiry enforcement

Protected backend routes

Email verification for reset

⚙️ Environment Variables
Backend .env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
FIREBASE_SERVICE_ACCOUNT_JSON=your_firebase_json
EMAIL_USER=your_email
EMAIL_PASS=your_email_password

Frontend .env
VITE_FIREBASE_API_KEY=...
VITE_API_URL=http://localhost:5000

🔄 Complete Auth Flow Diagram (Text)
User Action
   ↓
Frontend AuthContext
   ↓
Local Login → Backend JWT → MongoDB
Social Login → Firebase → Backend Verify → MongoDB → JWT
   ↓
Token stored in LocalStorage
   ↓
Protected API Requests with Middleware
   ↓
Session Restored on Page Reload

📈 What This Auth System Demonstrates

✅ Multi-provider authentication
✅ Secure password handling
✅ JWT-based session management
✅ Firebase OAuth integration
✅ Clean backend authorization middleware
✅ Frontend session restoration
✅ Real-world password reset flow
