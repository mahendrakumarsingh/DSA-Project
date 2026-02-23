const PriorityQueue = require('./PriorityQueue');
const BinarySearchTree = require('./BinarySearchTree');
const Graph = require('./Graph');
const SeatTree = require('./SeatTree');
const Stack = require('./Stack');

class TrainSystem {
    constructor() {
        this.pnrBST = new BinarySearchTree();
        this.routeGraph = new Graph();
        this.actionStack = new Stack(); // For Undo functionality
        // Map of TrainID -> { waitingList: PriorityQueue, seats: SeatTree }
        this.trains = new Map();

        this.initializeRoutes();
        this.initializeTrains();
    }

    initializeRoutes() {
        // Hardcoded graph for demo
        const stops = ['Delhi', 'Jaipur', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Lucknow'];

        this.routeGraph.addVertex('Delhi');
        this.routeGraph.addVertex('Jaipur');
        this.routeGraph.addVertex('Mumbai');
        this.routeGraph.addVertex('Bangalore');
        this.routeGraph.addVertex('Chennai');
        this.routeGraph.addVertex('Kolkata');
        this.routeGraph.addVertex('Lucknow');

        // Edges (City A, City B, Distance/Time)
        this.routeGraph.addEdge('Delhi', 'Jaipur', 280);
        this.routeGraph.addEdge('Delhi', 'Lucknow', 550);
        this.routeGraph.addEdge('Jaipur', 'Mumbai', 1150);
        this.routeGraph.addEdge('Mumbai', 'Bangalore', 980);
        this.routeGraph.addEdge('Bangalore', 'Chennai', 350);
        this.routeGraph.addEdge('Chennai', 'Kolkata', 1660);
        this.routeGraph.addEdge('Kolkata', 'Lucknow', 980);
        this.routeGraph.addEdge('Mumbai', 'Delhi', 1400); // Direct
    }

    initializeTrains() {
        // Create a demo train "Express-101"
        const trainId = "Express-101";
        const waitingList = new PriorityQueue(); // Max-heap for standard waiting list

        // Seat Map Tree
        const trainRoot = new SeatTree(trainId, 'Train');

        // Add Coaches (B1, B2)
        ['B1', 'B2'].forEach(coachName => {
            const coach = new SeatTree(coachName, 'Coach');
            // Add Seats (1-5)
            for (let i = 1; i <= 5; i++) {
                coach.addChild(new SeatTree(`Seat ${i}`, 'Seat'));
            }
            trainRoot.addChild(coach);
        });

        this.trains.set(trainId, {
            waitingList,
            seats: trainRoot,
            config: { capacity: 10 } // 2 coaches * 5 seats
        });
    }

    // --- PNR Operations (BST) ---
    addPassengerToBST(passenger) {
        this.pnrBST.insert(passenger.pnr, passenger);
    }

    searchPNR(pnr) {
        return this.pnrBST.search(pnr);
    }

    // --- Waiting List Operations (Priority Queue) ---
    addToWaitingList(trainId, passenger) {
        if (!this.trains.has(trainId)) return false;

        // Priority Logic:
        // Senior Citizen (60+) + Tatkal handled by higher priority number
        let priority = 1; // Base priority
        if (passenger.age >= 60) priority += 2;
        if (passenger.isTatkal) priority += 1;

        // Enqueue with calculated priority
        this.trains.get(trainId).waitingList.enqueue(passenger, priority);
        return true;
    }

    getNextFromWaitingList(trainId) {
        if (!this.trains.has(trainId)) return null;
        return this.trains.get(trainId).waitingList.dequeue();
    }

    getWaitingList(trainId) {
        if (!this.trains.has(trainId)) return [];
        return this.trains.get(trainId).waitingList.toArray();
    }

    // --- Route Operations (Graph) ---
    findShortestPath(start, end) {
        return this.routeGraph.dijkstra(start, end);
    }

    // --- Seat Operations (Tree) ---
    bookSeat(trainId, seatName) {
        if (!this.trains.has(trainId)) return false;
        return this.trains.get(trainId).seats.bookSeat(seatName);
    }

    getAvailableSeats(trainId) {
        if (!this.trains.has(trainId)) return [];
        return this.trains.get(trainId).seats.getAvailableSeats();
    }
}

// Singleton instance
const system = new TrainSystem();
module.exports = system;
