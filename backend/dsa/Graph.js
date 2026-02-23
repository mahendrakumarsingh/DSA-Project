const PriorityQueue = require('./PriorityQueue');

class Graph {
    constructor() {
        this.adjacencyList = new Map();
    }

    addVertex(vertex) {
        if (!this.adjacencyList.has(vertex)) {
            this.adjacencyList.set(vertex, []);
        }
    }

    addEdge(source, destination, weight) {
        if (!this.adjacencyList.has(source)) this.addVertex(source);
        if (!this.adjacencyList.has(destination)) this.addVertex(destination);

        this.adjacencyList.get(source).push({ node: destination, weight });
        // Assuming undirected graph for train tracks (usually trains go both ways)
        this.adjacencyList.get(destination).push({ node: source, weight });
    }

    dijkstra(startNode, endNode) {
        // Min-Priority Queue: (a, b) => a.priority < b.priority (smaller distance first)
        const pq = new PriorityQueue((a, b) => a.priority < b.priority);
        const distances = {};
        const previous = {};
        const path = []; // to return at end

        // Initialize
        for (let vertex of this.adjacencyList.keys()) {
            if (vertex === startNode) {
                distances[vertex] = 0;
                pq.enqueue(vertex, 0);
            } else {
                distances[vertex] = Infinity;
                pq.enqueue(vertex, Infinity);
            }
            previous[vertex] = null;
        }

        while (!pq.isEmpty()) {
            let smallest = pq.dequeue();

            if (smallest === endNode) {
                // Done - build path
                while (previous[smallest]) {
                    path.push(smallest);
                    smallest = previous[smallest];
                }
                path.push(startNode);
                return {
                    distance: distances[endNode],
                    path: path.reverse()
                };
            }

            if (smallest || distances[smallest] !== Infinity) {
                const neighbors = this.adjacencyList.get(smallest);
                if (neighbors) {
                    for (let neighbor of neighbors) {
                        // calculate new distance to neighboring node
                        let candidate = distances[smallest] + neighbor.weight;
                        if (candidate < distances[neighbor.node]) {
                            // updating new smallest distance to neighbor
                            distances[neighbor.node] = candidate;
                            previous[neighbor.node] = smallest;
                            // enqueue with new priority
                            pq.enqueue(neighbor.node, candidate);
                        }
                    }
                }
            }
        }
        return null; // unreachable
    }

    getVertices() {
        return Array.from(this.adjacencyList.keys());
    }
}

module.exports = Graph;
