const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    pnr: { type: String, unique: true, required: true, index: true },
    bookingSource: { type: String, enum: ['INTERNAL', 'IRCTC'], required: true },
    currentStatus: { type: String, required: true },
    originalStatus: { type: String }, // For IRCTC only
    trainId: { type: String },
    journeyDate: { type: String },
    seatNumber: { type: String },
    createdAt: { type: Date, default: Date.now },
    passengers: [{
        name: String,
        age: Number,
        gender: String
    }]
});

module.exports = mongoose.model('Booking', bookingSchema);
