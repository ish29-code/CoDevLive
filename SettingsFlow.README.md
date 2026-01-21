⚙️ Settings Management Flow — CoDevLive

This document explains the complete Settings System implemented in CoDevLive.
It manages user preferences, security options, notifications, privacy controls, and account actions, including Two-Factor Authentication (2FA).

Each user has exactly one settings document, automatically created on first access.

🏗️ Tech Stack Used
Frontend

React + Context API

Fetch API

Component-based settings dashboard

Toast notifications

Conditional UI rendering

Backend

Node.js + Express

MongoDB + Mongoose

Speakeasy (TOTP / 2FA)

QRCode generator

Protected routes middleware

🧩 Settings Data Model

Each user has a single settings document.

MongoDB Schema
Settings
│
├── userId              → Reference to User (unique)
│
├── emailNotifications  → Boolean
├── productUpdates      → Boolean
│
├── twoFA
│   ├── enabled         → Boolean
│   └── secret          → Base32 secret
│
├── reduceMotion        → Boolean
├── publicProfile       → Boolean
├── language            → String
│
├── createdAt
└── updatedAt


✔ One settings document per user
✔ Auto-created if missing
✔ Fully customizable preferences

🔐 Route Protection

All settings routes are protected by authentication middleware.

Authorization: Bearer <token>
x-auth-type: jwt OR firebase


Authenticated user ID is attached as:

req.user.id

📦 Backend API Endpoints
Endpoint	Method	Purpose
/api/settings	GET	Fetch user settings
/api/settings	PUT	Update settings fields
/api/settings/2fa/setup	POST	Generate 2FA QR & secret
/api/settings/2fa/verify	POST	Verify OTP & enable 2FA
⚙️ Backend Settings Flow
➤ Fetch Settings

Frontend calls GET /api/settings

Auth middleware validates user

Settings document searched by userId

If not found → auto-created

Settings returned to frontend

This guarantees every user always has a settings document.

➤ Update Settings

Frontend sends changed fields via PUT /api/settings

Backend filters unsafe fields:

Prevents manual editing of twoFA, _id, userId

MongoDB findOneAndUpdate with upsert:true

Updated settings returned

✔ Secure field-level update
✔ No unauthorized 2FA manipulation
✔ Atomic update operation

🔔 Notification Preferences

Users can toggle:

Email notifications

Product updates

Each toggle:

Updates MongoDB instantly

UI refreshes state

Toast confirms action

🔒 Privacy Controls

Users can toggle:

Public / Private profile visibility

State stored in:

settings.publicProfile


Frontend reflects current visibility with badges.

🎨 Appearance Settings

Users can:

Switch Light / Dark mode

Preference stored in localStorage

UI updates globally through ThemeContext

🌐 Language Selection

Users can:

Select interface language

Language stored in database

UI reflects current selection

♿ Accessibility

Users can enable:

Reduce Motion mode

Stored as:

settings.reduceMotion


Used to control animation preferences in UI.

🛡️ Two-Factor Authentication (2FA) Flow
➤ Setup 2FA

User clicks Enable 2FA

Backend generates a secret using Speakeasy

QR Code generated from otpauth_url

Secret stored in DB with enabled:false

QR Code returned to frontend

➤ Verify 2FA

User scans QR in Google Authenticator / Authy

User enters 6-digit OTP

Backend verifies OTP using Speakeasy TOTP

If valid:

twoFA.enabled = true

Success response returned

➤ Enabled State

Once enabled:

✔ Account protected by time-based OTP
✔ UI displays enabled badge
✔ Secret never exposed again

🧠 2FA Security Notes

OTP window allows small time drift

Secret stored only in Base32 form

User cannot manually edit 2FA fields

Only verified OTP enables protection

🔑 Password Reset from Settings

From settings page:

Local (MongoDB) users → Password reset link via email

Firebase (Google/GitHub) users → Firebase reset email

Handled seamlessly from same UI.

🚨 Danger Zone Actions
➤ Logout

Clears token & user session

Redirects to auth page

➤ Delete Account

Confirmation prompt shown

Backend deletes user data

Local session cleared

User redirected safely

💻 Frontend Settings Flow
User opens Settings page
        ↓
Frontend GET /api/settings
        ↓
Settings loaded into UI
        ↓
User toggles preferences OR enables 2FA
        ↓
Frontend calls PUT / POST endpoints
        ↓
MongoDB updates stored preferences
        ↓
Updated state reflected instantly

📁 Environment Variables Required

Backend .env

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

JWT_SECRET=your_jwt_secret


(No Cloudinary needed for settings)

🧬 Auto-Create Strategy

If settings do not exist:

Settings.create({ userId })


This ensures:

✔ No null settings state
✔ No onboarding step required
✔ Immediate usable defaults

📈 What This Settings System Demonstrates

✅ Secure user preferences management
✅ Atomic MongoDB updates
✅ Safe field filtering
✅ Full 2FA implementation
✅ QR + OTP verification
✅ Protected sensitive operations
✅ Clean UI/UX state sync
