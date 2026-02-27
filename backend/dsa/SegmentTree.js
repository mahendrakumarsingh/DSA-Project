/**
 * Emulates Segment Tree interval checking for seat allocation logic.
 * Real IRCTC checks seat availability between Station A and B.
 * 
 * If a train goes 4 stations: NDLS -> CNB -> PRYJ -> DDU
 * The segments are: 0 (NDLS-CNB), 1 (CNB-PRYJ), 2 (PRYJ-DDU)
 */

class SegmentTreeLogic {
    /**
     * Checks if a seat is completely free between two stations.
     * @param {Array<Boolean>} bitmask - Seat availability per segment
     * @param {Number} startIdx - Boarding station index
     * @param {Number} destIdx - Destination station index
     * @returns {Boolean}
     */
    static isAvailable(bitmask, startIdx, destIdx) {
        for (let i = startIdx; i < destIdx; i++) {
            if (bitmask[i] === false) return false; // Segment already booked
        }
        return true;
    }

    /**
     * Marks a seat as booked for the given interval.
     */
    static bookSegments(bitmask, startIdx, destIdx) {
        for (let i = startIdx; i < destIdx; i++) {
            bitmask[i] = false; // Block it
        }
    }

    /**
     * Marks a seat as freed for the given interval (Undo/Cancel).
     */
    static freeSegments(bitmask, startIdx, destIdx) {
        for (let i = startIdx; i < destIdx; i++) {
            bitmask[i] = true; // Free it
        }
    }
}

module.exports = SegmentTreeLogic;
