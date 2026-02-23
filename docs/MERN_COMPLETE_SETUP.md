# 🚀 MERN Stack Complete Setup & Deployment Guide

## Quick Start (5 Minutes)

### Prerequisites
- ✅ Node.js (v16+)
- ✅ MongoDB Atlas Account (free tier available at mongodb.com/cloud/atlas)
- ✅ VS Code or any code editor

---

## 📁 Directory Structure Setup

```
c:\Vs code\Indian Railways\
├── frontend/              → React Client (Vite)
├── backend/               → Express Server (Node.js)
├── app.js                 → Vanilla JS (already here!)
├── index.html, booking.html, etc.
└── ... (other files)
```

**Note:** Your vanilla JS files stay where they are. Just add `frontend/` and `backend/` folders alongside them.

---

## ⚙️ PART 1: Backend Setup (Express + MongoDB)

### Step 1: Create Backend Folder
```powershell
# In your workspace (same level as app.js)
mkdir backend
cd backend
```

### Step 2: Initialize Node Project
```powershell
npm init -y
```

### Step 3: Install Dependencies
```powershell
npm install express mongoose cors dotenv
npm install --save-dev nodemon
```

### Step 4: Create Files
Create these files in `railway-backend/`:

1. **Copy `railway-backend-server.js` → `server.js`**
2. **Copy `railway-backend-.env` → `.env`**
3. **Copy `railway-backend-package.json` → `package.json`** (replace existing)

### Step 5: Update `.env` with MongoDB Atlas
```
# Your MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/railwayDB?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
```

**How to get YOUR MongoDB Atlas connection string:**

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new project
4. Create a cluster (M0 free tier is fine)
5. Click "Connect" button
6. Select "Drivers" (not "MongoDB Compass")
7. Copy the connection string
8. In the string, replace:
   - `<password>` with your database user password
   - `railwayDB` is your database name (will be created automatically)
9. Paste into `.env` as `MONGODB_URI`
10. ✅ Also whitelist your IP: In "Network Access" → Add "0.0.0.0/0" (for development)

### Step 6: Start Backend
```powershell
npm run dev
# Expected: 🚀 Railway Booking API Server
# Port: 5000
```

✅ **Backend Ready!**

---

## ⚙️ PART 2: Frontend Setup (React + Vite)

### Step 1: Create React App
```powershell
# In your workspace (same level as app.js, NOT inside backend)
npm create vite@latest frontend -- --template react
cd frontend
npm install
```

### Step 2: Install Axios
```powershell
npm install axios
```

### Step 3: Create Folder Structure
```powershell
# Inside railway-frontend/src/
mkdir components pages api
```

### Step 4: Copy Components

Copy these files to `railway-frontend/src/`:

**Main Files:**
- `railway-frontend-App.jsx` → `App.jsx`
- `railway-frontend-App.css` → `App.css`

**Components folder** (`src/components/`):
- `railway-frontend-Navigation.jsx` → `Navigation.jsx`

**Pages folder** (`src/pages/`):
- `railway-frontend-Home.jsx` → `Home.jsx`
- `railway-frontend-Booking.jsx` → `Booking.jsx`
- `railway-frontend-Status.jsx` → `Status.jsx`
- `railway-frontend-Confirmed.jsx` → `Confirmed.jsx`
- `railway-frontend-Waiting.jsx` → `Waiting.jsx`
- `railway-frontend-Cancellation.jsx` → `Cancellation.jsx`

### Step 5: Create API Client

Create `src/api/client.js`:

```javascript
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

export const bookPassenger = (data) => API.post('/passengers', data);
export const getConfirmed = () => API.get('/passengers/confirmed');
export const getWaiting = () => API.get('/passengers/waiting');
export const cancelPassenger = (pnr) => API.delete(`/passengers/${pnr}`);
export const statusByPNR = (pnr) => API.get(`/passengers/${pnr}`);
export const getStats = () => API.get('/stats');

export default API;
```

### Step 6: Start Frontend
```powershell
npm run dev
# Expected: http://localhost:5173
```

✅ **Frontend Ready!**

---

## 🌐 Running Full MERN Stack

**✅ MongoDB Atlas is cloud-hosted** - No need to run local MongoDB!

### Terminal 1: Backend
```powershell
cd backend
npm run dev
# Shows: 🚀 Server running on http://localhost:5000
```

### Terminal 2: Frontend
```powershell
cd frontend
npm run dev
# Shows: Local: http://localhost:5173
```

✅ **Open http://localhost:5173 in browser**

---

## 🧪 Testing the Application

### Test 1: Create Demo Data
1. Click **"🌱 Seed Demo Data"**
2. Should see 7 passengers seeded
3. Check Confirmed/Waiting lists

### Test 2: Sorting (Confirmed List)
1. Go to **"✅ Confirmed"** page
2. Click **"🔢 Sort by Age"**
3. See passengers sorted by age
4. Try other sort options

### Test 3: Priority Queue
1. Seed demo data
2. Check **"⏳ Waiting"** list
3. Diya (65) should be #1 (senior priority!)

### Test 4: Binary Search (PNR Lookup)
1. Go to **"📋 Check Status"**
2. Enter a PNR (e.g., 100001)
3. Instant lookup (O(log n) performance)

### Test 5: Cancellation
1. Go to **"❌ Cancel"**
2. Enter confirmed passenger PNR
3. See auto-promotion from waiting

---

## 📊 API Endpoints

### Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/passengers` | Get all passengers |
| `GET` | `/passengers/confirmed` | Get confirmed passengers |
| `GET` | `/passengers/waiting` | Get waiting passengers |
| `GET` | `/passengers/:pnr` | Get single passenger by PNR |
| `POST` | `/passengers` | Book new passenger |
| `DELETE` | `/passengers/:pnr` | Cancel passenger |
| `GET` | `/stats` | Get capacity stats |
| `PUT` | `/capacity` | Update train capacity |
| `POST` | `/seed` | Seed demo data |
| `POST` | `/reset` | Reset all data |
| `GET` | `/health` | Health check |

---

## 🔌 API Examples

### Book Passenger
```bash
POST http://localhost:5000/api/passengers
Content-Type: application/json

{
  "name": "Rajeev Kumar",
  "age": 28,
  "gender": "Male",
  "contact": "9999999999"
}
```

### Get Confirmed (with Sorting)
```bash
GET http://localhost:5000/api/passengers/confirmed?sortBy=age&order=asc
```

### Get Single Passenger (Binary Search)
```bash
GET http://localhost:5000/api/passengers/100001
```

### Cancel Ticket
```bash
DELETE http://localhost:5000/api/passengers/100001
```

---

## 🐛 Troubleshooting

### Backend won't start
```powershell
# Check if port 5000 is in use
netstat -ano | findstr :5000

# If in use, kill the process
taskkill /PID <PID> /F

# Or change PORT in .env to 5001
```

### MongoDB Atlas connection error
```
Error: MongoError: authentication failed
Error: connect ECONNREFUSED
```

**Solution:**
1. ✅ Check connection string in `.env` is correct
2. ✅ Verify password is correct (special chars need URL encoding)
3. ✅ Whitelist your IP: Go to Atlas → Security → Network Access → Add 0.0.0.0/0
4. ✅ Format example: `mongodb+srv://user:password@cluster.mongodb.net/railwayDB?retryWrites=true&w=majority`
5. ✅ Copy connection string directly from Atlas dashboard (not manually typed)

### CORS error
```
Access to XMLHttpRequest... blocked by CORS policy
```

**Solution:**
- Backend already has CORS enabled
- Make sure backend is running on 5000
- Check baseURL in axios (should be `http://localhost:5000/api`)

### Frontend won't load
```powershell
# Check if React dev server is running
# Usually http://localhost:5173

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm node_modules package-lock.json
npm install
npm run dev
```

---

## 📦 Building for Production

### Frontend Build
```powershell
cd frontend
npm run build
# Creates: dist/ folder (upload to hosting)
```

### Backend Build
No build needed! Simply deploy `backend/` folder

---

## ☁️ Deployment Options

### Deploy Backend (Heroku, Railway, Render)

**Using Render.com:**
```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial commit"
git push -u origin main

# 2. Go to render.com → New → Web Service
# 3. Connect GitHub repo
# 4. Set environment: Node
# 5. Set build command: npm install
# 6. Set start command: npm start
# 7. Add env variables (MONGODB_URI)
```

### Deploy Frontend (Vercel, Netlify)

**Using Vercel:**
```bash
npm i -g vercel
vercel

# Then update API_URL in App.jsx to backend URL
# Redeploy
```

---

## 🎓 DSA Concepts Review

### 1. Stack (LIFO)
- **Use Case**: Undo functionality
- **Time**: O(1) push/pop
- **Code**: `actionStack.push()`, `actionStack.pop()`

### 2. Sorting
- **Use Case**: Display sorted data
- **Time**: O(n log n) average
- **Types**: Merge Sort, Quick Sort, Heap Sort

### 3. Binary Search
- **Use Case**: Fast PNR lookup
- **Time**: O(log n) vs O(n) for linear
- **Requirement**: Data must be sorted first

### 4. Priority Queue
- **Use Case**: Senior citizen priority
- **Time**: O(1) enqueue, O(n) dequeue
- **Implementation**: Array with conditional insert

---

## 📚 Project Files Summary

### Current Directory (Vanilla JS)
```
c:\Vs code\Indian Railways\
├── app.js (with DSA features)
├── index.html
├── booking.html
├── cancellation.html
├── confirmed.html
├── status.html
├── waiting.html
├── styles.css
├── DSA_FEATURES.md
└── MERN_SETUP_GUIDE.md (this file)
```

### Backend Files Created
```
backend/
├── server.js
├── package.json
├── .env
└── ... (MongoDB will create databases automatically)
```

### Frontend Files Created
```
frontend/
├── src/
│   ├── components/
│   │   └── Navigation.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Booking.jsx
│   │   ├── Status.jsx
│   │   ├── Confirmed.jsx
│   │   ├── Waiting.jsx
│   │   └── Cancellation.jsx
│   ├── api/
│   │   └── client.js
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── index.html
├── vite.config.js
└── package.json
```

---

## ✅ Checklist

- [ ] Backend Created & Running (5000)
- [ ] Frontend Created & Running (5173)
- [ ] MongoDB Connected
- [ ] Demo Data Seeds Successfully
- [ ] Sorting Works
- [ ] Binary Search Works
- [ ] Priority Queue Works
- [ ] Cancellation & Promotion Works

---

## 🎉 You're Done!

**Congratulations!** Your MERN Stack Railway Booking app is ready with:

✅ **Frontend**: React with Vite (Fast & Modern)
✅ **Backend**: Express with MongoDB (Scalable)
✅ **Database**: MongoDB (Persistent Storage)
✅ **DSA Features**: Stack, Sorting, Binary Search, Priority Queue
✅ **Real-time**: Live stats updates

---

## 📖 Next Steps

1. **Learn React Hooks**: useState, useEffect, useCallback
2. **Learn Express Middleware**: Authentication, Validation
3. **Learn MongoDB**: Indexing, Aggregation Pipeline
4. **Deploy to Cloud**: Heroku, AWS, Azure, GCP
5. **Add New Features**: Authentication, Payment Gateway, Notifications

---

## 🆘 Need Help?

**Common Issues:**
- MongoDB Atlas connection fails? → Verify connection string and whitelist IP (0.0.0.0/0)
- Port already in use? → Change PORT in .env (5001, 5002, etc.)
- Components not found? → Check folder structure matches above
- Network error? → Ensure backend is running on 5000
- "AuthenticationFailed"? → Check password in connection string, URL encode special chars

**Resources:**
- Vite: https://vitejs.dev
- Express: https://expressjs.com
- MongoDB: https://mongodb.com
- React: https://react.dev

---

**Happy Coding! 🚀🚂**

