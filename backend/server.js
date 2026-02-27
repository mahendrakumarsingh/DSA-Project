const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Load local DSA & Models
const trainSystem = require('./dsa/TrainSystem');
const SegmentTreeLogic = require('./dsa/SegmentTree');
const StationTrie = require('./dsa/Trie');
const Passenger = require('./models/Passenger');
const SeatMatrix = require('./models/SeatMatrix');
const Train = require('./models/Train');
const Booking = require('./models/Booking');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// WebSocket for Realtime UI Updates
io.on('connection', (socket) => {
  console.log('⚡ Client connected for real-time updates');
});

// Broadcast changes
function broadcastUpdate() {
  io.emit('system_update');
}

console.log('📊 Connecting to MongoDB...');
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB connected. Migrating to Advanced Allocation Engine...');
    await initAdvancedTrainSystem();
    initializeDSA(); // Load legacy fallback DSA as well
  })
  .catch(err => console.error('❌ MongoDB error:', err));

let TRAIN_CONFIG = {
  activeTrainId: "EXP-101",
  capacity: 20, // dynamic
  nextPNR: 100001
};

async function initAdvancedTrainSystem() {
  const existing = await Train.findOne({ trainId: "EXP-101" });
  if (!existing) {
    const train = new Train({
      trainId: "EXP-101",
      name: "IR Connect Pro Express",
      stations: ["Delhi", "Kanpur", "Prayagraj", "Varanasi", "Patna"],
      coaches: [
        { type: "Sleeper", classCode: "SL1", totalSeats: 20, pricePerStation: 100 }
      ]
    });
    await train.save();
    console.log("🚂 Created Train Configuration with 5 stations.");
  }
}

// Ensure SeatMatrix for the day
async function getOrCreateSeats() {
  const count = await SeatMatrix.countDocuments({ trainId: "EXP-101" });
  if (count < TRAIN_CONFIG.capacity) {
    for (let i = count + 1; i <= TRAIN_CONFIG.capacity; i++) {
      await SeatMatrix.create({
        trainId: "EXP-101",
        date: "2026-03-01",
        coachCode: "SL1",
        seatNumber: i,
        quotaType: "GN",
        availabilityBitmask: [true, true, true, true], // 4 segments for 5 stations
        version: 0
      });
    }
  }
}

const stationTrie = new StationTrie();

async function initializeDSA() {
  try {
    // Insert common route stations into Trie
    const stations = [
      { code: "NDLS", name: "New Delhi" },
      { code: "BCT", name: "Mumbai Central" },
      { code: "CNB", name: "Kanpur Central" },
      { code: "PRYJ", name: "Prayagraj Jn" },
      { code: "BSB", name: "Varanasi Jn" },
      { code: "PNBE", name: "Patna Jn" },
      { code: "CSMT", name: "Chhatrapati Shivaji Maharaj Terminus" },
      { code: "SBC", name: "KSR Bengaluru" },
      { code: "MAS", name: "Chennai Central" },
      { code: "HWH", name: "Howrah Jn" }
    ];
    stations.forEach(s => stationTrie.insert(s.code, s.name));

    await getOrCreateSeats();
    const passengers = await Passenger.find();
    console.log(`🔄 Loading ${passengers.length} passengers into Memory DSA structures...`);
    trainSystem.pnrBST.root = null; // reset
    while (!trainSystem.actionStack.isEmpty()) trainSystem.actionStack.pop();

    passengers.forEach(p => {
      trainSystem.pnrBST.insert(p.pnr, p.toObject());
      if (p.status === 'Waiting') {
        trainSystem.addToWaitingList('Express-101', {
          ...p.toObject(),
          priority: (p.age >= 60 ? 3 : 1) + (p.isTatkal ? 1 : 0)
        });
      }
    });
    console.log('✅ DSA Structures Initialized. Station Trie Loaded.');
  } catch (err) {
    console.error('❌ DSA Init Error:', err);
  }
}

// GET Stations Auto-suggest (Trie)
app.get('/api/stations/suggest', (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);
  const results = stationTrie.searchPrefix(q);
  res.json(results);
});

// GET Intelligent Train Search API (Proxy to RapidAPI)
app.get('/api/trains/search', async (req, res) => {
  const { from, to, date } = req.query;

  // Clean 'from' and 'to' string formats from UI e.g., 'NDLS - New Delhi' => 'NDLS'
  const fromCode = from ? from.split(' - ')[0].trim() : 'BVI';
  const toCode = to ? to.split(' - ')[0].trim() : 'NDLS';

  // UI directly passes YYYY-MM-DD which is correct for IRCTC RapidAPI
  let dateParams = '';
  if (date) {
    dateParams = `&dateOfJourney=${date}`;
  }

  try {
    const rapidApiUrl = `https://irctc1.p.rapidapi.com/api/v3/trainBetweenStations?fromStationCode=${fromCode}&toStationCode=${toCode}${dateParams}`;

    // Using native node fetch
    const response = await fetch(rapidApiUrl, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'irctc1.p.rapidapi.com',
        'x-rapidapi-key': 'ed881c804bmshf605e5458e0011fp12b9d3jsn69833d03c368'
      }
    });

    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = {};
    }

    // Check if the RapidAPI key is exhausted or blocked
    if (data.message && typeof data.message === 'string' && data.message.includes('exceeded the MONTHLY quota')) {
      return res.status(429).json({ error: 'RapidAPI KEY EXHAUSTED: You have exceeded the monthly quota for your free IRCTC api key. Please upgrade your RapidAPI plan or use a new key.' });
    }

    // Check for API native invalid arguments (like wrong dates)
    if (data.status === false && (data.error || data.message)) {
      return res.status(400).json({ error: data.message || 'Invalid API parameters.' });
    }

    const waitCount = await Passenger.countDocuments({ status: 'Waiting' });
    const prob = Math.max(10, 95 - (waitCount * 12));

    let trainsList = data?.data || [];

    // Robust Mock Fallback just in case standard Free RapidAPI empty arrays or 500s occur
    if (!Array.isArray(trainsList) || trainsList.length === 0) {
      console.log('RapidAPI returned empty or rate limited/error payload without throwing, falling back to mock dynamic data..', data);
      trainsList = [
        {
          train_number: "12952", train_name: "Fallback Rajdhani Exp", train_type: "SUPERFAST",
          from_std: "16:30", to_sta: "08:10", duration: "15H 40M",
          classes: ["1A", "2A", "3A", "SL"]
        },
        {
          train_number: "12926", train_name: "Paschim Express", train_type: "EXPRESS",
          from_std: "12:00", to_sta: "14:15", duration: "22H 15M",
          classes: ["2A", "3A", "SL"]
        }
      ];
    }

    const mappedTrains = trainsList.map((t, index) => {
      const classesList = t.classes || t.train_base_classes || t.applicable_classes || ["1A", "2A", "3A", "SL"];

      const displayClasses = classesList.map((c, idx) => {
        const typeStr = typeof c === 'string' ? c : (c.className || c.classType || "SL");
        return {
          type: typeStr,
          price: Math.floor(Math.random() * 2000) + 500, // Fare mock
          status: idx % 2 === 0 ? "Available " + (Math.floor(Math.random() * 50) + 1) : "WL " + (Math.floor(Math.random() * 50) + 1),
          prob: prob,
          color: idx % 2 === 0 ? "green" : "orange",
          hasPredictor: idx % 2 !== 0,
          recommended: idx === 1
        };
      });

      return {
        trainId: t.train_number || `T${index}`,
        name: t.train_name ? `${t.train_name} (${t.train_number})` : "Express Train",
        tag: t.train_type || "EXPRESS",
        runsDays: t.run_days ? (Array.isArray(t.run_days) ? t.run_days.join(" ") : t.run_days) : "DAILY",
        depTime: t.from_std || t.departureTime || "10:00",
        depStation: (t.from_station_code || fromCode) + " - " + (t.from_station_name || "Station"),
        duration: t.duration || "12H 00M",
        arrTime: t.to_sta || t.arrivalTime || "22:00",
        arrStation: (t.to_station_code || toCode) + " - " + (t.to_station_name || "Station"),
        classes: displayClasses
      };
    });

    res.json(mappedTrains);
  } catch (err) {
    console.error('RapidAPI API Proxy Error:', err);
    res.status(500).json({ error: 'Failed to access Real IRCTC RapidAPI. Connection aborted.' });
  }
});

// GET all passengers
app.get('/api/passengers', async (req, res) => {
  const p = await Passenger.find();
  res.json(p);
});

// GET confirmed passengers
app.get('/api/passengers/confirmed', async (req, res) => {
  const confirmed = await Passenger.find({ status: 'Confirmed' }).sort({ bookedAt: 1 });
  res.json(confirmed);
});

// GET waiting
app.get('/api/passengers/waiting', async (req, res) => {
  let waiting = await Passenger.find({ status: 'Waiting' });
  waiting = waiting.sort((a, b) => {
    let pA = 1, pB = 1;
    if (a.age >= 60) pA += 2;
    if (a.isTatkal) pA += 1;
    if (b.age >= 60) pB += 2;
    if (b.isTatkal) pB += 1;
    if (pA !== pB) return pB - pA;
    return new Date(a.bookedAt) - new Date(b.bookedAt);
  });
  res.json(waiting);
});

// POST book passenger (ADVANCED CONCURRENCY + INTERVAL logic)
app.post('/api/passengers', async (req, res) => {
  let session;
  try {
    const { name, age, gender, contact, isTatkal } = req.body;
    if (!name || !age || !gender || !contact) return res.status(400).json({ error: 'All fields required' });

    // Ensure seats exist
    await getOrCreateSeats();

    // Randomize intervals for demo if not provided
    const fromStationIndex = req.body.fromStationIndex !== undefined ? req.body.fromStationIndex : 0;
    const toStationIndex = req.body.toStationIndex !== undefined ? req.body.toStationIndex : 4;

    session = await mongoose.startSession();
    session.startTransaction();

    // 1. Find an available seat using SEGMENT LOGIC
    // We fetch all seats and find the first one that aligns with SegmentTreeLogic
    // A production system might use native Mongo logic here but we extract to show DSA
    const seats = await SeatMatrix.find({ trainId: "EXP-101", date: "2026-03-01" }).session(session);
    const confirmedCount = await Passenger.countDocuments({ status: 'Confirmed' }).session(session);
    let allocatedSeat = null;

    // RULE: Confirmed tickets must never exceed total capacity
    if (confirmedCount < seats.length) {
      for (let seat of seats) {
        if (SegmentTreeLogic.isAvailable(seat.availabilityBitmask, fromStationIndex, toStationIndex)) {
          allocatedSeat = seat;
          break;
        }
      }
    }

    let status = 'Waiting';
    let seatNumber = null;

    if (allocatedSeat) {
      status = 'Confirmed';
      seatNumber = allocatedSeat.seatNumber;
      // Mark bitmask as booked
      SegmentTreeLogic.bookSegments(allocatedSeat.availabilityBitmask, fromStationIndex, toStationIndex);
      allocatedSeat.version += 1; // Optimistic concurrency
      allocatedSeat.markModified('availabilityBitmask');
      await allocatedSeat.save({ session });
    }

    const pnr = String(TRAIN_CONFIG.nextPNR++);

    // Calculate basic probability if Waitlisted
    let probability;
    if (status === 'Waiting') {
      const waitCount = await Passenger.countDocuments({ status: 'Waiting' }) + 1;
      probability = Math.max(10, 95 - (waitCount * 12)); // Mock ML decay formula
      if (isTatkal) probability -= 20; // Tatkal cancels less
    }

    const passenger = new Passenger({
      pnr, name: name.trim(), age: Number(age), gender, contact: String(contact).trim(),
      isTatkal: !!isTatkal, status, seatNumber, trainId: "EXP-101", date: "2026-03-01",
      fromStationIndex, toStationIndex
    });

    await passenger.save({ session });
    await session.commitTransaction();

    // Update In-Memory DSA
    trainSystem.pnrBST.insert(pnr, passenger.toObject());
    if (status === 'Waiting') trainSystem.addToWaitingList('Express-101', passenger.toObject());
    trainSystem.actionStack.push({ type: 'BOOK', pnr: passenger.pnr });

    broadcastUpdate();

    res.status(201).json({
      success: true,
      passenger,
      message: status === 'Confirmed'
        ? `Seat SL1-${seatNumber} confirmed.`
        : `Waitlisted. Confirmation Probability: ${probability}%`
    });
  } catch (err) {
    if (session) await session.abortTransaction();
    res.status(500).json({ error: err.message });
  } finally {
    if (session) session.endSession();
  }
});

// POST book ticket (DEMO SIMULATION)
app.post('/api/book', async (req, res) => {
  try {
    const { trainId, journeyDate, class: travelClass, passengers } = req.body;

    if (!passengers || !passengers.length) {
      return res.status(400).json({ error: 'No passengers provided' });
    }

    const seats = await SeatMatrix.find({ trainId: trainId || "EXP-101" });
    const confirmedCount = await Passenger.countDocuments({ status: 'Confirmed' });
    const totalCapacity = seats.length || TRAIN_CONFIG.capacity;
    let availableSeats = Math.max(0, totalCapacity - confirmedCount);

    let status = 'WL';
    let seatNumber = null;

    if (availableSeats > 0) {
      status = 'CONFIRMED';
      seatNumber = `${travelClass || 'S5'}-${Math.floor(Math.random() * 50) + 1}`;
      availableSeats--;
    } else {
      status = 'WL';
      const waitlistCount = await Passenger.countDocuments({ status: 'Waiting' });
      seatNumber = `WL ${waitlistCount + 1}`;
    }

    const pnr = Math.floor(1000000000 + Math.random() * 9000000000).toString();

    const booking = new Booking({
      pnr,
      bookingSource: 'INTERNAL',
      currentStatus: status,
      trainId: trainId || "EXP-101",
      journeyDate,
      seatNumber,
      passengers
    });
    await booking.save();

    res.json({
      pnr: pnr,
      status: status,
      seatNumber: seatNumber,
      message: 'Demo booking successful'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST check PNR status (Unified INTERNAL + IRCTC logic)
app.post('/api/pnr-status', async (req, res) => {
  try {
    const { pnr } = req.body;
    if (!pnr) return res.status(400).json({ error: 'PNR is required' });

    // 1. Check if PNR exists in internal database
    const internalBooking = await Booking.findOne({ pnr });
    if (internalBooking) {
      return res.json({
        source: "INTERNAL",
        pnr: internalBooking.pnr,
        status: internalBooking.currentStatus,
        seatNumber: internalBooking.seatNumber,
        trainId: internalBooking.trainId,
        journeyDate: internalBooking.journeyDate,
        message: "Live status from demo booking system"
      });
    }

    // fallback check for advanced passenger db
    const advPassenger = await Passenger.findOne({ pnr });
    if (advPassenger) {
      return res.json({
        source: "INTERNAL",
        pnr: advPassenger.pnr,
        status: advPassenger.status,
        seatNumber: advPassenger.seatNumber ? `SL1-${advPassenger.seatNumber}` : 'WL',
        trainId: advPassenger.trainId,
        journeyDate: advPassenger.date,
        message: "Live status from advanced allocation engine"
      });
    }

    // 2. If not found -> call IRCTC API
    const rapidApiUrl = `https://irctc1.p.rapidapi.com/api/v3/getPNRStatus?pnrNumber=${pnr}`;
    const response = await fetch(rapidApiUrl, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'irctc1.p.rapidapi.com',
        'x-rapidapi-key': 'ed881c804bmshf605e5458e0011fp12b9d3jsn69833d03c368'
      }
    });

    const data = await response.json();
    if (data.status === false || data.message === "PNR Not found.") {
      return res.status(404).json({ error: "PNR Not Found" });
    }

    const info = data.data || {};
    const passInfo = Array.isArray(info.passengerInfo) ? info.passengerInfo[0] : null;

    return res.json({
      source: "IRCTC",
      pnr: pnr,
      status: passInfo?.currentStatus || info.trainStatus || "CONFIRMED",
      coach: passInfo?.currentCoach || info.boardingStation || "S3",
      trainDetails: info,
      message: "Original status from IRCTC API"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE cancel passenger (AUTO UPGRADE)
app.delete('/api/passengers/:pnr', async (req, res) => {
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const passenger = await Passenger.findOne({ pnr: req.params.pnr }).session(session);
    if (!passenger) { await session.abortTransaction(); return res.status(404).json({ error: 'PNR not found' }); }

    await Passenger.deleteOne({ _id: passenger._id }).session(session);

    let promoted = null;
    let seatNumberFreed = passenger.seatNumber;

    if (passenger.status === 'Confirmed' && seatNumberFreed) {
      // Free the exact interval segments the user occupied
      const seat = await SeatMatrix.findOne({ trainId: passenger.trainId, date: passenger.date, seatNumber: seatNumberFreed }).session(session);
      if (seat) {
        SegmentTreeLogic.freeSegments(seat.availabilityBitmask, passenger.fromStationIndex, passenger.toStationIndex);
        seat.version += 1;
        seat.markModified('availabilityBitmask');
        await seat.save({ session });

        // TRY AUTO UPGRADE - Grab from Heap Priority Queue
        // Keep popping until we find someone whose interval fits the newly freed intervals
        // Note: Real IRCTC only upgrades if the interval is continuous. We'll simply find exact matches.
        const waitingList = await Passenger.find({ status: 'Waiting' }).session(session);
        // Soft sort mimicking priority heap (Since we pop from DB, we ensure sync)
        waitingList.sort((a, b) => {
          let pA = a.age >= 60 ? 2 : 0; pA += a.isTatkal ? 1 : 0;
          let pB = b.age >= 60 ? 2 : 0; pB += b.isTatkal ? 1 : 0;
          if (pA !== pB) return pB - pA;
          return a._id.getTimestamp() - b._id.getTimestamp();
        });

        for (let w of waitingList) {
          if (SegmentTreeLogic.isAvailable(seat.availabilityBitmask, w.fromStationIndex, w.toStationIndex)) {
            // Perfect! Secure this seat for them
            SegmentTreeLogic.bookSegments(seat.availabilityBitmask, w.fromStationIndex, w.toStationIndex);
            seat.version += 1;
            seat.markModified('availabilityBitmask');
            await seat.save({ session });

            w.status = 'Confirmed';
            w.seatNumber = seat.seatNumber;
            w.updatedAt = new Date();
            await w.save({ session });
            promoted = w;

            // Pop them globally from our in-memory DSA visualization queue by finding and manually removing, 
            // or we will just let sync handle it (for purely visual syncing we can rely on DB pulls)
            // The waitlist engine visually tracks DB directly anyway.
            break;
          }
        }
      }
    }

    await session.commitTransaction();

    trainSystem.actionStack.push({ type: 'CANCEL', passenger: passenger.toObject(), promoted: promoted ? promoted.toObject() : null });
    broadcastUpdate();

    res.json({ success: true, message: 'Ticket cancelled', cancelled: passenger, promoted });
  } catch (err) {
    if (session) await session.abortTransaction();
    res.status(500).json({ error: err.message });
  } finally {
    if (session) session.endSession();
  }
});

// UNDO
app.post('/api/undo', async (req, res) => {
  try {
    if (trainSystem.actionStack.isEmpty()) return res.status(400).json({ error: 'No undo history' });
    const lastAction = trainSystem.actionStack.pop();

    if (lastAction.type === 'BOOK') {
      const p = await Passenger.findOne({ pnr: lastAction.pnr });
      if (p) {
        if (p.status === 'Confirmed' && p.seatNumber) {
          const seat = await SeatMatrix.findOne({ seatNumber: p.seatNumber });
          if (seat) {
            SegmentTreeLogic.freeSegments(seat.availabilityBitmask, p.fromStationIndex, p.toStationIndex);
            seat.markModified('availabilityBitmask');
            await seat.save();
          }
        }
        await Passenger.deleteOne({ _id: p._id });
      }
      broadcastUpdate();
      return res.json({ success: true, message: `Undo Book. Released seat for PNR ${lastAction.pnr}` });
    }

    res.json({ success: true, message: `Undo unsupported for CANCEL in advanced engine currently due to cascading upgrades.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const confirmed = await Passenger.countDocuments({ status: 'Confirmed' });
    const waiting = await Passenger.countDocuments({ status: 'Waiting' });

    const seats = await SeatMatrix.find({ trainId: "EXP-101" });
    const actualCapacity = seats.length;

    // Explicitly enforce "availableSeats = totalCapacity - confirmedTickets"
    const availableSeats = Math.max(0, actualCapacity - confirmed);

    res.json({
      capacity: actualCapacity,
      confirmed,
      waiting,
      available: availableSeats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CAPACITY
app.put('/api/capacity', async (req, res) => {
  try {
    const { capacity } = req.body;
    const newCap = Number(capacity);
    TRAIN_CONFIG.capacity = newCap;

    // Generates new seats up to capacity or reduce them
    const count = await SeatMatrix.countDocuments({ trainId: "EXP-101" });
    if (count < newCap) {
      await getOrCreateSeats();
    } else if (count > newCap) {
      // Find extra seats and delete them to reach newCap
      const allSeats = await SeatMatrix.find({ trainId: "EXP-101" }).sort({ seatNumber: -1 });
      let seatsToDelete = count - newCap;
      for (const seat of allSeats) {
        if (seatsToDelete <= 0) break;
        await SeatMatrix.deleteOne({ _id: seat._id });
        // Clean up any confirmed passengers on this deleted seat
        await Passenger.deleteMany({ seatNumber: seat.seatNumber });
        seatsToDelete--;
      }
    }

    broadcastUpdate();
    res.json({ success: true, message: `System topology adjusted to ${newCap} seats` });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// RESET
app.post('/api/reset', async (req, res) => {
  try {
    await Passenger.deleteMany({});
    await SeatMatrix.deleteMany({});
    TRAIN_CONFIG.nextPNR = 100001;
    await getOrCreateSeats();
    while (!trainSystem.actionStack.isEmpty()) trainSystem.actionStack.pop();
    broadcastUpdate();
    res.json({ success: true, message: 'Advanced System Fully Wiped & Restored' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// SEED advanced
app.post('/api/seed', async (req, res) => {
  try {
    const d = [
      { name: "Segment User 1", age: 45, gender: "Male", contact: "9876543210", isTatkal: false, from: 0, to: 2 }, // Books NDLS-PRYJ
      { name: "Segment User 2", age: 28, gender: "Female", contact: "9123456780", isTatkal: true, from: 2, to: 4 },  // Fits perfectly in same seat!
      { name: "Rahul Singh", age: 65, gender: "Male", contact: "9988776655", isTatkal: false, from: 0, to: 4 },
      { name: "Priya Sharma", age: 32, gender: "Female", contact: "9811223344", isTatkal: false, from: 1, to: 3 },
      { name: "Vikram Gupta", age: 55, gender: "Male", contact: "9877665544", isTatkal: false, from: 0, to: 1 },
      { name: "Neha Verma", age: 24, gender: "Female", contact: "9899887766", isTatkal: true, from: 3, to: 4 },
      { name: "Arjun Das", age: 40, gender: "Male", contact: "9122334455", isTatkal: false, from: 2, to: 3 },
      { name: "Siya Patel", age: 62, gender: "Female", contact: "9988554433", isTatkal: false, from: 1, to: 4 }
    ];
    let seededCount = 0;
    for (const p of d) {
      await fetch(`http://localhost:${process.env.PORT || 5000}/api/passengers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...p, fromStationIndex: p.from, toStationIndex: p.to })
      });
      seededCount++;
    }
    broadcastUpdate();
    res.json({ success: true, count: seededCount });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/dsa/search/:pnr', (req, res) => res.json({ found: false }));
app.get('/api/dsa/route', (req, res) => res.json({ found: false }));
app.get('/api/dsa/waiting-list', async (req, res) => {
  const w = await Passenger.find({ status: 'Waiting' });
  res.json({ count: w.length, heap: w.map(u => ({ pnr: u.pnr, name: u.name, priority: u.isTatkal ? 4 : (u.age > 60 ? 3 : 1) })) });
});
app.get('/api/dsa/seats', async (req, res) => {
  const seats = await SeatMatrix.find();
  res.json({ details: seats.map(s => `Seat ${s.seatNumber}: ` + s.availabilityBitmask.map(b => b ? '0' : 'X').join('-')) });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n============== PRO ALLOCATION ENGINE ==============\nPort: ${PORT} | WebSockets: Enabled | Occ: Active\n===================================================\n`);
});
module.exports = { app, Passenger };
