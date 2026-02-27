const mongoose = require('mongoose');

const seatMatrixSchema = new mongoose.Schema({
    trainId: { type: String, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    coachCode: { type: String, required: true }, // e.g., SL1
    seatNumber: { type: Number, required: true },
    quotaType: { type: String, required: true }, // GN, TQ, HQ, LD

    // Boolean array tracking segment availability
    // E.g., if train goes A -> B -> C -> D, there are 3 segments (A-B, B-C, C-D)
    // [true, true, true] means available for all segments
    availabilityBitmask: [{ type: Boolean, default: true }],

    // OCC (Optimistic Concurrency Control)
    version: { type: Number, default: 0 }
});

// Important index to quickly find available seats per coach/quota
seatMatrixSchema.index({ trainId: 1, date: 1, coachCode: 1, quotaType: 1 });

module.exports = mongoose.model('SeatMatrix', seatMatrixSchema);
