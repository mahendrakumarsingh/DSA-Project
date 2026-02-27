const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema({
    pnr: { type: String, unique: true, required: true, index: true },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true, enum: ['Male', 'Female', 'Other'] },
    contact: { type: String, match: /^\d{10}$/ },

    // Advanced architecture additions
    trainId: { type: String, required: true },
    date: { type: String, required: true }, // Journey Date YYYY-MM-DD
    fromStationIndex: { type: Number, required: true },
    toStationIndex: { type: Number, required: true },
    quotaType: { type: String, enum: ['GN', 'TQ', 'LD', 'HQ'], default: 'GN' },
    status: { type: String, enum: ['Confirmed', 'Waiting', 'Cancelled'], default: 'Waiting', index: true },

    // Seat details (if confirmed)
    coachCode: { type: String }, // e.g. SL1
    seatNumber: { type: Number },

    bookedAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Passenger', passengerSchema);
