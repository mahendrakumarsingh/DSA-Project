class TreeNode {
    constructor(name, type, capacity = 0) {
        this.name = name; // e.g., "Train 123", "B1", "Seat 1"
        this.type = type; // "Train", "Coach", "Seat"
        this.children = [];
        this.isBooked = false; // Only for Seat
        this.capacity = capacity;
    }

    addChild(node) {
        this.children.push(node);
    }

    find(name) {
        if (this.name === name) return this;
        for (let child of this.children) {
            const found = child.find(name);
            if (found) return found;
        }
        return null;
    }

    // Get all available seats
    getAvailableSeats() {
        if (this.type === 'Seat') {
            return this.isBooked ? [] : [this];
        }
        let seats = [];
        for (let child of this.children) {
            seats = seats.concat(child.getAvailableSeats());
        }
        return seats;
    }

    bookSeat(seatName) {
        const seat = this.find(seatName);
        if (seat && seat.type === 'Seat' && !seat.isBooked) {
            seat.isBooked = true;
            return true;
        }
        return false;
    }

    // Visualize the tree
    printTree(level = 0) {
        const indent = '  '.repeat(level);
        console.log(`${indent}${this.type}: ${this.name} ${this.type === 'Seat' ? (this.isBooked ? '[X]' : '[ ]') : ''}`);
        for (let child of this.children) {
            child.printTree(level + 1);
        }
    }
}

module.exports = TreeNode;
