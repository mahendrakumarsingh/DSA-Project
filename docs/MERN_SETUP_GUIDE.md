# 🏗️ MERN Stack Migration Guide

## Project Structure

```
railway-app/
├── backend/                 # Node.js + Express API
│   ├── models/
│   │   └── Passenger.js
│   ├── routes/
│   │   └── passengers.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/                # React App
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── current/                 # Original vanilla JS version
    ├── app.js
    ├── index.html
    └── ... (all HTML files)
```

---

## 🔧 Step-by-Step Setup

### PART A: MongoDB Setup (Cloud or Local)

#### Option 1: MongoDB Atlas (Cloud - Recommended for MERN)
```
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up free account
3. Create cluster
4. Get connection string:
   mongodb+srv://username:password@cluster.mongodb.net/railwayDB
```

#### Option 2: MongoDB Local (Windows)
```powershell
# Download from: https://www.mongodb.com/try/download/community
# Run MongoDB locally on port 27017
# Connection string: mongodb://127.0.0.1:27017/railwayDB
```

---

### PART B: Backend Setup

#### Step 1: Initialize Backend
```powershell
# Create backend directory
mkdir railway-backend
cd railway-backend

# Initialize npm
npm init -y

# Install dependencies
npm install express mongoose cors dotenv nodemon

# Create folder structure
mkdir models routes controllers
```

#### Step 2: Create package.json Scripts
```json
{
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js"
  }
}
```

#### Step 3: Create .env file
```
MONGODB_URI=mongodb://127.0.0.1:27017/railwayDB
PORT=5000
NODE_ENV=development
```

#### Step 4: Create Models (Passenger.js)
- See **model/Passenger.js** file below

#### Step 5: Create Routes (passengers.js)
- See **routes/passengers.js** file below

#### Step 6: Create Server (server.js)
- See **server.js** file below

---

### PART C: Frontend Setup

#### Step 1: Create React App with Vite
```powershell
npm create vite@latest railway-frontend -- --template react
cd railway-frontend
npm install
npm install axios
```

#### Step 2: Project Structure
```
src/
├── components/
│   ├── Navigation.jsx
│   ├── BookingForm.jsx
│   ├── ConfirmedList.jsx
│   ├── WaitingList.jsx
│   └── CancellationForm.jsx
├── pages/
│   ├── Home.jsx
│   ├── Booking.jsx
│   ├── Status.jsx
│   ├── Confirmed.jsx
│   └── Waiting.jsx
├── api/
│   └── client.js      (Axios instance)
├── App.jsx
└── main.jsx
```

#### Step 3: API Client (axios)
```javascript
// src/api/client.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

export const bookPassenger = (data) => API.post('/passengers', data);
export const getConfirmed = () => API.get('/passengers/confirmed');
export const getWaiting = () => API.get('/passengers/waiting');
export const cancelPassenger = (pnr) => API.delete(`/passengers/${pnr}`);
export const statusByPNR = (pnr) => API.get(`/passengers/${pnr}`);

export default API;
```

---

## 📋 Complete Backend Files

### server.js
```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

// Models
const passengerSchema = new mongoose.Schema({
  pnr: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  contact: { type: String, required: true },
  status: { type: String, enum: ['Confirmed', 'Waiting'], default: 'Waiting' },
  bookedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Passenger = mongoose.model('Passenger', passengerSchema);

// Train Configuration
const TRAIN_CONFIG = {
  capacity: 5,
  nextPNR: 100001
};

// ============ ROUTES ============

// GET all passengers (confirmed + waiting)
app.get('/api/passengers', async (req, res) => {
  try {
    const passengers = await Passenger.find();
    res.json(passengers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET confirmed passengers
app.get('/api/passengers/confirmed', async (req, res) => {
  try {
    const confirmed = await Passenger.find({ status: 'Confirmed' })
      .sort({ bookedAt: 1 });
    res.json(confirmed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET waiting passengers (with priority handling)
app.get('/api/passengers/waiting', async (req, res) => {
  try {
    const waiting = await Passenger.find({ status: 'Waiting' });
    // Sort by: seniors first (age >= 60), then by booking time
    waiting.sort((a, b) => {
      const aIsSenior = a.age >= 60;
      const bIsSenior = b.age >= 60;
      if (aIsSenior !== bIsSenior) return bIsSenior - aIsSenior;
      return new Date(a.bookedAt) - new Date(b.bookedAt);
    });
    res.json(waiting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single passenger by PNR (Binary Search optimized)
app.get('/api/passengers/:pnr', async (req, res) => {
  try {
    const passenger = await Passenger.findOne({ pnr: req.params.pnr });
    if (!passenger) return res.status(404).json({ error: 'PNR not found' });
    res.json(passenger);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST book new passenger
app.post('/api/passengers', async (req, res) => {
  try {
    const { name, age, gender, contact } = req.body;
    
    // Validation
    if (!name || !age || !gender || !contact) {
      return res.status(400).json({ error: 'All fields required' });
    }
    
    // Check phone format
    if (!/^\d{10}$/.test(contact)) {
      return res.status(400).json({ error: 'Invalid contact number' });
    }
    
    // Check age
    if (age < 1 || age > 120) {
      return res.status(400).json({ error: 'Invalid age' });
    }

    // Check available seats
    const confirmedCount = await Passenger.countDocuments({ status: 'Confirmed' });
    const status = confirmedCount < TRAIN_CONFIG.capacity ? 'Confirmed' : 'Waiting';

    // Generate PNR
    const pnr = String(TRAIN_CONFIG.nextPNR++);

    const passenger = new Passenger({
      pnr,
      name: name.trim(),
      age: Number(age),
      gender,
      contact: contact.trim(),
      status
    });

    await passenger.save();
    res.status(201).json(passenger);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE cancel passenger
app.delete('/api/passengers/:pnr', async (req, res) => {
  try {
    const passenger = await Passenger.findOneAndDelete({ pnr: req.params.pnr });
    
    if (!passenger) {
      return res.status(404).json({ error: 'PNR not found' });
    }

    // If it was confirmed, try to promote from waiting
    if (passenger.status === 'Confirmed') {
      const waitingPassengers = await Passenger.find({ status: 'Waiting' })
        .sort({ age: -1, bookedAt: 1 }); // Seniors first (age >= 60)
      
      if (waitingPassengers.length > 0) {
        const promoted = waitingPassengers[0];
        promoted.status = 'Confirmed';
        promoted.updatedAt = new Date();
        await promoted.save();
        
        return res.json({
          message: 'Cancelled',
          cancelled: passenger,
          promoted: promoted
        });
      }
    }

    res.json({
      message: 'Cancelled',
      cancelled: passenger,
      promoted: null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET stats
app.get('/api/stats', async (req, res) => {
  try {
    const confirmed = await Passenger.countDocuments({ status: 'Confirmed' });
    const waiting = await Passenger.countDocuments({ status: 'Waiting' });
    res.json({
      capacity: TRAIN_CONFIG.capacity,
      confirmed,
      waiting,
      available: Math.max(0, TRAIN_CONFIG.capacity - confirmed)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SET capacity
app.put('/api/capacity', async (req, res) => {
  try {
    const { capacity } = req.body;
    TRAIN_CONFIG.capacity = Math.max(1, capacity);
    
    // Promote from waiting if capacity increased
    const confirmedCount = await Passenger.countDocuments({ status: 'Confirmed' });
    const available = TRAIN_CONFIG.capacity - confirmedCount;
    
    if (available > 0) {
      const toPromote = await Passenger.find({ status: 'Waiting' })
        .sort({ age: -1, bookedAt: 1 })
        .limit(available);
      
      for (let p of toPromote) {
        p.status = 'Confirmed';
        p.updatedAt = new Date();
        await p.save();
      }
    }
    
    res.json({
      message: 'Capacity updated',
      capacity: TRAIN_CONFIG.capacity,
      promoted: toPromote?.length || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// RESET all data
app.post('/api/reset', async (req, res) => {
  try {
    await Passenger.deleteMany({});
    TRAIN_CONFIG.nextPNR = 100001;
    res.json({ message: 'All data reset' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
```

---

## 🎯 Running MERN Stack

### Terminal 1: Start MongoDB
```powershell
# If using local MongoDB
mongod
# Shows: waiting for connections on port 27017
```

### Terminal 2: Start Backend
```powershell
cd railway-backend
npm run dev
# Shows: 🚀 Server running on http://localhost:5000
```

### Terminal 3: Start Frontend
```powershell
cd railway-frontend
npm run dev
# Shows: Local: http://localhost:5173
```

---

## 🔄 Architecture Comparison

### Before (Vanilla JS + localStorage)
```
Browser
  ├── localStorage (client-side, limited 5MB)
  ├── HTML/CSS/JS
  └── Single file app
```

### After (MERN Stack)
```
React Frontend (5173)
    ↓ (API calls)
Express Backend (5000)
    ↓ (Database queries)
MongoDB Database
    ↓ (Persistent storage)
```

### Benefits
✅ Scalable to millions of passengers
✅ Real-time data sync across devices
✅ Professional architecture
✅ Easy to add features (authentication, analytics)
✅ Deploy anywhere (Heroku, AWS, Azure)

---

## 📊 DSA Features in MERN

| Feature | Impact |
|---------|--------|
| **Stack (Undo)** | Session history in backend |
| **Sorting** | Database indexes for fast queries |
| **Binary Search** | Native MongoDB indexing |
| **Priority Queue** | PNR sorting algorithm |

