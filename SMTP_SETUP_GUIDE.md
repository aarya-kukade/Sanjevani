# Sanjivani - SMTP Backend Setup Guide

## The Problem (Fixed)
- ❌ Live Server (127.0.0.1:5500) is a **static file server** - it cannot handle API requests
- ❌ Frontend was trying to fetch `/api/send-contact` from Live Server
- ❌ Result: **405 Method Not Allowed** + **Unexpected end of JSON input**

## The Solution
Run a **Node.js + Express backend** on port **5000** to handle all API requests including contact form emails via Gmail SMTP.

---

## Quick Start (3 Steps)

### Step 1: Install Node.js
Download & install from https://nodejs.org/ (LTS recommended)

### Step 2: Install Dependencies
Open PowerShell in the Sanjivani folder:
```powershell
npm install
```

### Step 3: Create `.env` File & Configure Gmail
1. Rename `.env.example` to `.env`
2. Go to https://myaccount.google.com/security/apppasswords
3. Select "Mail" → "Windows Computer"
4. Copy the **16-character password** (with spaces)
5. Update `.env`:
```
EMAIL_USER=jb1270628@gmail.com

EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
PORT=5000
```

### Step 4: Start Backend Server
```powershell
npm start
```

You should see:
```
============================================================
✅ Sanjivani Backend Server Started
📍 Server running on: http://localhost:5000
📧 Email: jb1270628@gmail.com

📝 Health check: http://localhost:5000/api/health
============================================================
```

### Step 5: Start Frontend (Keep Backend Running)
Open a **new PowerShell window** and run Live Server or open the HTML directly.

---

## Architecture

```
Frontend (Live Server - Port 5500)
         ↓ fetch('/api/send-contact')
         ↓
Backend (Express - Port 5000)
         ↓ Nodemailer + Gmail SMTP
         ↓
Gmail SMTP Server
         ↓
jb1270628@gmail.com
 ✉️
```

---

## File Structure

```
Sanjeevani/
├── server.js                 ← Backend (Express + Nodemailer)
├── package.json              ← Node dependencies
├── .env                       ← Gmail credentials (create from .env.example)
├── .env.example               ← Template (do NOT edit, copy to .env)
├── contact.html               ← Frontend form (fetches to localhost:5000)
├── index.html, app.js, etc    ← Frontend files
└── SMTP_SETUP_GUIDE.md        ← This file
```

---

## How It Works

1. User fills contact form and clicks "Send Message"
2. Frontend JavaScript collects form data
3. `fetch()` sends POST request to: `http://localhost:5000/api/send-contact`
4. Backend validates data
5. Nodemailer connects to Gmail SMTP
6. Email sent to: `jb1270628@gmail.com
`
7. Success message shown to user

---

## Email Features

✅ Professional HTML formatting  
✅ All form fields properly organized  
✅ Reply-to set to sender's email  
✅ Subject line includes inquiry type  
✅ Timestamp & tracking  

---

## Troubleshooting

### "Cannot connect to server"
- Make sure backend is running: `npm start`
- Check that port 5000 is open
- Firewall might be blocking it

### "SMTP Connection Error"
- Gmail 2-Step Verification enabled? https://myaccount.google.com/security/how-it-works-signup
- Is the 16-character **App Password** correct in `.env`? (NOT your regular Gmail password)
- Did you restart the server after updating `.env`?

### "Unexpected end of JSON input"
- ❌ DON'T use Live Server for APIs
- ✅ Backend must be running on `localhost:5000`
- The issue is fixed - this was the original problem

### "npm: command not found"
- Node.js not installed
- Download from https://nodejs.org/
- Restart PowerShell after installing

### Port 5000 already in use
Change `PORT=5000` to `PORT=5001` in `.env`

### "Failed to execute 'json' on 'Response'"
Backend not running. Start it with: `npm start`

---

## Important Notes

🔒 **Security:**
- Never commit `.env` to version control
- `.env` contains sensitive credentials
- `.env` is already in `.gitignore` (if using git)

📱 **Different Network:**
- If accessing from another machine, replace `localhost` with backend IP
- Example: `http://192.168.1.100:5000/api/send-contact`

⚙️ **Development vs Production:**
- Development: `npm start` (local testing)
- Production: Deploy on server (Heroku, AWS, DigitalOcean, etc.)

---

## Commands Reference

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `npm start` | Start backend server |
| `npm run dev` | Start with auto-reload (requires nodemon) |
| `Ctrl + C` | Stop server |

---

## Contact Form Endpoint

**URL:** `http://localhost:5000/api/send-contact`  
**Method:** `POST`  
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "from_name": "John Doe",
  "from_email": "john@example.com",
  "phone": "+91 9876543210",
  "hospital": "My Hospital",
  "subject": "Sales Inquiry",
  "message": "I'm interested in Sanjivani..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Your message has been sent successfully...",
  "messageId": "message-id-from-gmail"
}
```

**Error Response (400/500):**
```json
{
  "success": false,
  "error": "Error description"
}
```

---

## Support

For issues:
1. Check browser console (F12) for error messages
2. Check backend terminal output
3. Review this guide's troubleshooting section
4. Contact: jb1270628@gmail.com


---

**Last Updated:** April 20, 2026

