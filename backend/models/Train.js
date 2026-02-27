const mongoose = require('mongoose');

const trainSchema = new mongoose.Schema({
    trainId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    stations: [{ type: String }], // Array of station names, e.g., ["Delhi", "Jaipur", "Mumbai", "Bangalore"]
    coaches: [
        {
            type: { type: String }, // AC1, AC2, Sleeper
            classCode: { type: String }, // 1A, 2A, SL
            totalSeats: { type: Number },
            pricePerStation: { type: Number }
        }
    ],
    quotas: {
        GN: { type: Number, default: 0.6 }, // 60% General
        TQ: { type: Number, default: 0.2 }, // 20% Tatkal
        LD: { type: Number, default: 0.1 }, // 10% Ladies
        HQ: { type: Number, default: 0.1 }  // 10% Senior
    }
});

module.exports = mongoose.model('Train', trainSchema);
