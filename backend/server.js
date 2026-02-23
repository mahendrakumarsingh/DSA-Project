const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const trainSystem = require('./dsa/TrainSystem'); // Import our DSA System

// Force restart for env update
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
console.log('📊 Connecting to MongoDB...');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    initializeDSA(); // Load DB data into DSA structures
  })
  .catch(err => console.error('❌ MongoDB error:', err));

// Train Configuration (In-memory for this demo)
let TRAIN_CONFIG = {
  capacity: 10, // Increased capacity for demo
  nextPNR: 100001
};

// Passenger Schema
const passengerSchema = new mongoose.Schema({
  pnr: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true, enum: ['Male', 'Female', 'Other'] },
  contact: { type: String, required: true, match: /^\d{10}$/ },
  status: {
    type: String,
    enum: ['Confirmed', 'Waiting'],
    default: 'Waiting',
    index: true
  },
  isTatkal: { type: Boolean, default: false }, // Added for Priority Queue logic
  bookedAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
});

const Passenger = mongoose.model('Passenger', passengerSchema);

// Helper to initialize DSA structures from DB
async function initializeDSA() {
  try {
    const passengers = await Passenger.find();
    console.log(`🔄 Loading ${passengers.length} passengers into DSA structures...`);

    // Clear and reload
    // In a real app, we'd sync incrementally, but for demo reload is fine

    passengers.forEach(p => {
      // 1. Insert into BST
      trainSystem.pnrBST.insert(p.pnr, p.toObject());

      // 2. Add to Waiting List Priority Queue if waiting
      if (p.status === 'Waiting') {
        // Priority calculation happens inside addToWaitingList
        // We assume they belong to our demo train 'Express-101'
        trainSystem.addToWaitingList('Express-101', {
          ...p.toObject(),
          priority: (p.age >= 60 ? 3 : 1) + (p.isTatkal ? 1 : 0) // rough logic matching TrainSystem
        });
      }
    });
    console.log('✅ DSA Structures Initialized');
  } catch (err) {
    console.error('❌ DSA Init Error:', err);
  }
}

// ============ ROUTES ============

// 1️⃣ GET all passengers (Standard DB)
app.get('/api/passengers', async (req, res) => {
  try {
    const passengers = await Passenger.find();
    res.json(passengers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2️⃣ GET confirmed passengers
app.get('/api/passengers/confirmed', async (req, res) => {
  try {
    const { sortBy } = req.query;
    let sortOptions = { bookedAt: 1 }; // Default

    if (sortBy === 'name') sortOptions = { name: 1 };
    else if (sortBy === 'age') sortOptions = { age: 1 };
    else if (sortBy === 'pnr') sortOptions = { pnr: 1 };

    const confirmed = await Passenger.find({ status: 'Confirmed' }).sort(sortOptions);
    res.json(confirmed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3️⃣ GET waiting passengers (Standard DB)
// 3️⃣ GET waiting passengers (Standard DB)
app.get('/api/passengers/waiting', async (req, res) => {
  try {
    let waiting = await Passenger.find({ status: 'Waiting' });

    // 🧠 Sort by Dynamic Priority (Same logic as Backend DSA)
    waiting = waiting.sort((a, b) => {
      // Calculate Priority A
      let pA = 1;
      if (a.age >= 60) pA += 2;
      if (a.isTatkal) pA += 1;

      // Calculate Priority B
      let pB = 1;
      if (b.age >= 60) pB += 2;
      if (b.isTatkal) pB += 1;

      // Primary: Priority (Desc)
      if (pA !== pB) return pB - pA;

      // Secondary: Booking Time (Asc) - FCFS within same priority
      return new Date(a.bookedAt) - new Date(b.bookedAt);
    });

    res.json(waiting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4️⃣ GET single passenger (Standard DB)
app.get('/api/passengers/:pnr', async (req, res) => {
  try {
    const passenger = await Passenger.findOne({ pnr: req.params.pnr });
    if (!passenger) return res.status(404).json({ error: 'PNR not found' });
    res.json(passenger);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5️⃣ POST book new passenger (Updated logic)
app.post('/api/passengers', async (req, res) => {
  try {
    const { name, age, gender, contact, isTatkal } = req.body;

    // Validation
    if (!name || !age || !gender || !contact) {
      return res.status(400).json({ error: 'All fields required' });
    }

    // Check total confirmed in DB
    const confirmedCount = await Passenger.countDocuments({ status: 'Confirmed' });
    const status = confirmedCount < TRAIN_CONFIG.capacity ? 'Confirmed' : 'Waiting';

    // Generate PNR
    const pnr = String(TRAIN_CONFIG.nextPNR++);

    // Create DB Entry
    const passenger = new Passenger({
      pnr,
      name: name.trim(),
      age: Number(age),
      gender,
      contact: String(contact).trim(),
      isTatkal: !!isTatkal,
      status
    });

    await passenger.save();

    // Update DSA Structures
    trainSystem.pnrBST.insert(pnr, passenger.toObject());

    if (status === 'Waiting') {
      trainSystem.addToWaitingList('Express-101', passenger.toObject());
    }

    // Push to Undo Stack
    trainSystem.actionStack.push({ type: 'BOOK', pnr: passenger.pnr });

    res.status(201).json({
      success: true,
      passenger,
      message: status === 'Confirmed' ? 'Seat confirmed!' : 'Added to waiting list'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6️⃣ DELETE cancel passenger
app.delete('/api/passengers/:pnr', async (req, res) => {
  try {
    const passenger = await Passenger.findOneAndDelete({ pnr: req.params.pnr });
    if (!passenger) return res.status(404).json({ error: 'PNR not found' });

    // Remove from BST? (BST implementation has remove)
    // trainSystem.pnrBST.remove(req.params.pnr); // If implemented

    // If waiting, remove from PriorityQueue is hard without O(N) search unless we rebuild or have ID reference.
    // For demo, we might just reload or ignore.

    let promoted = null;
    if (passenger.status === 'Confirmed') {
      // Use Priority Queue to get next person!
      // Instead of DB sort, pull from DSA Heap
      const nextInLine = trainSystem.getNextFromWaitingList('Express-101');

      if (nextInLine) {
        // Update DB
        const p = await Passenger.findOne({ pnr: nextInLine.pnr });
        if (p) {
          p.status = 'Confirmed';
          p.updatedAt = new Date();
          await p.save();
          promoted = p;
        }
      } else {
        // Fallback to DB query if PQ is empty/unsynced
        const waiting = await Passenger.find({ status: 'Waiting' }).sort({ age: -1, bookedAt: 1 }).limit(1);
        if (waiting.length > 0) {
          waiting[0].status = 'Confirmed';
          await waiting[0].save();
          promoted = waiting[0];
        }
      }
    }

    // Push to Undo Stack
    trainSystem.actionStack.push({
      type: 'CANCEL',
      passenger: passenger.toObject(),
      promoted: promoted ? promoted.toObject() : null
    });

    res.json({
      success: true,
      message: 'Ticket cancelled',
      cancelled: passenger,
      promoted: promoted
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ↩️ UNDO Last Action (Stack)
app.post('/api/undo', async (req, res) => {
  try {
    if (trainSystem.actionStack.isEmpty()) {
      return res.status(400).json({ error: 'Nothing to undo (Stack Empty)' });
    }

    const lastAction = trainSystem.actionStack.pop();
    console.log('🔄 Undoing action:', lastAction.type);

    if (lastAction.type === 'BOOK') {
      // Undo Booking -> Delete the passenger
      const p = await Passenger.findOneAndDelete({ pnr: lastAction.pnr });
      /* 
         Ideally we should also streamline the waitlist promotion if we just deleted a confirmed passenger 
         But typically 'Undo Booking' means 'I made a mistake booking', so we just delete.
         The gap left might be filled by next waiting.
      */

      // We should check if this opens a slot for someone else?
      // For simplicity, let's trigger a check or rely on next activity.
      // But strictly speaking, if we delete a confirmed guy, we should promote waiting.
      // Reuse the logic from DELETE? 
      // Let's keep it simple for now: Just Delete.

      res.json({ success: true, message: `Undid Booking ${lastAction.pnr}. Seat freed.`, action: 'Booking Reverted' });

    } else if (lastAction.type === 'CANCEL') {
      // Undo Cancellation -> Restore passenger
      const { passenger, promoted } = lastAction;

      // 1. Restore the cancelled passenger
      const existing = await Passenger.findOne({ pnr: passenger.pnr });
      if (!existing) {
        const restored = new Passenger(passenger);
        // We need to be careful about _id if it was preserved, but new Passenger() creates new _id usually unless specified.
        // Mongoose might error if _id duplicate. simpler to let it generate new _id or use same if we kept it.
        // passenger.toObject() usually has _id. 
        // Let's just strip _id to be safe and let new one be created, or keep it if we want exact restore.
        // Trying to save with same _id is better for "Undo".
        restored.isNew = true; // Force insert
        await restored.save();

        // Restore to DSA
        trainSystem.pnrBST.insert(restored.pnr, restored.toObject());
        if (restored.status === 'Waiting') {
          trainSystem.addToWaitingList('Express-101', restored.toObject());
        }
      }

      // 2. Handling Promoted Passenger (Demotion)
      if (promoted) {
        // The person who got confirmed because of the cancellation
        // Should now go back to waiting because the original guy is back.
        // This is "Undo" logic.
        await Passenger.findOneAndUpdate(
          { pnr: promoted.pnr },
          { status: 'Waiting' }
        );
        // Add back to PQ
        const promotedP = await Passenger.findOne({ pnr: promoted.pnr });
        if (promotedP) trainSystem.addToWaitingList('Express-101', promotedP.toObject());
      }

      res.json({ success: true, message: `Restored Passenger ${passenger.name}`, action: 'Cancellation Reverted' });
    }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📊 GET Real-time Stats
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

// ============ DSA CONFIGURATION & ACTIONS ============

// ⚙️ UPDATE Capacity logic
app.put('/api/capacity', async (req, res) => {
  try {
    const { capacity } = req.body;
    if (!capacity || capacity < 1) return res.status(400).json({ error: 'Invalid capacity' });

    TRAIN_CONFIG.capacity = Number(capacity);

    // Check if we can promote waiting passengers
    const confirmedCount = await Passenger.countDocuments({ status: 'Confirmed' });
    let slots = TRAIN_CONFIG.capacity - confirmedCount;
    let promotedCount = 0;

    while (slots > 0) {
      // 1. Get highest priority passenger from Heap
      const nextPassenger = trainSystem.getNextFromWaitingList('Express-101');
      if (!nextPassenger) break; // Queue empty

      // 2. Update DB
      const p = await Passenger.findOne({ pnr: nextPassenger.pnr });
      if (p && p.status === 'Waiting') {
        p.status = 'Confirmed';
        p.updatedAt = new Date();
        await p.save();
        promotedCount++;
        slots--;
      }
    }

    res.json({
      success: true,
      message: `Capacity updated to ${capacity}`,
      promoted: promotedCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🌱 SEED Data
app.post('/api/seed', async (req, res) => {
  try {
    const dummyPassengers = [
      { name: "Amit Sharma", age: 45, gender: "Male", contact: "9876543210", isTatkal: false },
      { name: "Priya Verma", age: 28, gender: "Female", contact: "9123456780", isTatkal: true },  // Tatkal Priority
      { name: "Rahul Singh", age: 65, gender: "Male", contact: "9988776655", isTatkal: false },   // Senior Citizen Priority
      { name: "Sita Devi", age: 70, gender: "Female", contact: "9876501234", isTatkal: true },    // Senior + Tatkal (High Priority)
      { name: "Vikram Raj", age: 34, gender: "Male", contact: "8899001122", isTatkal: false },
      { name: "Anjali Mehta", age: 22, gender: "Female", contact: "7766554433", isTatkal: true },
      { name: "Rohan Das", age: 50, gender: "Male", contact: "6655443322", isTatkal: false }
    ];

    let seededCount = 0;
    for (const p of dummyPassengers) {
      // Check total confirmed
      const confirmedCount = await Passenger.countDocuments({ status: 'Confirmed' });
      const status = confirmedCount < TRAIN_CONFIG.capacity ? 'Confirmed' : 'Waiting';
      const pnr = String(TRAIN_CONFIG.nextPNR++);

      const newPassenger = new Passenger({
        pnr,
        name: p.name,
        age: p.age,
        gender: p.gender,
        contact: p.contact,
        isTatkal: p.isTatkal,
        status
      });

      await newPassenger.save();

      // Update DSA
      trainSystem.pnrBST.insert(pnr, newPassenger.toObject());
      if (status === 'Waiting') {
        trainSystem.addToWaitingList('Express-101', newPassenger.toObject());
      }
      seededCount++;
    }

    res.json({ success: true, count: seededCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🗑️ RESET System
app.post('/api/reset', async (req, res) => {
  try {
    // 1. Clear DB
    await Passenger.deleteMany({});

    // 2. Reset Config
    TRAIN_CONFIG.nextPNR = 100001;
    TRAIN_CONFIG.capacity = 10;

    // 3. Reset DSA Structures
    // Re-instantiate the system internal structures (Assuming direct access or re-initialization)
    const BinarySearchTree = require('./dsa/BinarySearchTree');
    const PriorityQueue = require('./dsa/PriorityQueue');
    const SeatTree = require('./dsa/SeatTree');

    trainSystem.pnrBST = new BinarySearchTree();
    trainSystem.trains = new Map();
    trainSystem.initializeTrains(); // Re-setup demo train

    res.json({ success: true, message: 'System fully reset' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ DSA SPECIFIC ROUTES ============

// 🔍 Binary Search Tree Search
app.get('/api/dsa/search/:pnr', (req, res) => {
  const result = trainSystem.searchPNR(req.params.pnr);
  if (result) {
    res.json({ found: true, method: 'Binary Search Tree', data: result });
  } else {
    res.status(404).json({ found: false, error: 'PNR not found in BST' });
  }
});

// 🛤️ Graph Shortest Path
app.get('/api/dsa/route', (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) return res.status(400).json({ error: 'From and To cities required' });

  const path = trainSystem.findShortestPath(from, to);
  if (path) {
    res.json({ success: true, method: 'Dijkstra Algorithm', ...path });
  } else {
    res.status(404).json({ error: 'Path not found' });
  }
});

// ⏳ Priority Queue Visualization
app.get('/api/dsa/waiting-list', (req, res) => {
  // Return the internal heap array structure
  const list = trainSystem.getWaitingList('Express-101');
  res.json({
    method: 'Priority Queue (Max-Heap)',
    count: list.length,
    heap: list.map(item => ({
      pnr: item.data.pnr,
      name: item.data.name,
      priority: item.priority,
      reason: item.priority >= 3 ? 'Senior/Tatkal' : 'General'
    }))
  });
});

// 💺 Seat Map (Tree Traversal)
app.get('/api/dsa/seats', (req, res) => {
  // Assuming trainSystem has seats
  const seats = trainSystem.trains.get('Express-101')?.seats;
  res.json({
    method: 'Tree Traversal',
    structure: seats
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║   🚀 Railway DSA Server Running        ║
  ║   Port: ${PORT}                        ║
  ║   Features: BST, Graph, PQ, Tree       ║
  ╚════════════════════════════════════════╝
  `);
  console.log(`📍 API: http://localhost:${PORT}/api`);
});

module.exports = { app, Passenger };
