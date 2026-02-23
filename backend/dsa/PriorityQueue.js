class Node {
    constructor(data, priority, timestamp) {
        this.data = data;
        this.priority = priority;
        this.timestamp = timestamp;
    }
}

class PriorityQueue {
    // Default: Max-Heap (a > b)
    // For Min-Heap: pass (a, b) => a.priority < b.priority
    constructor(comparator = (a, b) => a.priority > b.priority) {
        this.heap = [];
        this.comparator = comparator;
    }

    parent(i) { return Math.floor((i - 1) / 2); }
    left(i) { return 2 * i + 1; }
    right(i) { return 2 * i + 2; }

    swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    compare(a, b) {
        // If priority is equal, use timestamp (FIFO)
        if (a.priority === b.priority) {
            return a.timestamp < b.timestamp;
        }
        return this.comparator(a, b);
    }

    enqueue(data, priority) {
        const node = new Node(data, priority, Date.now());
        this.heap.push(node);
        this.bubbleUp();
    }

    dequeue() {
        if (this.isEmpty()) return null;
        if (this.heap.length === 1) return this.heap.pop().data;

        const result = this.heap[0].data;
        this.heap[0] = this.heap.pop();
        this.heapify(0);
        return result;
    }

    bubbleUp() {
        let index = this.heap.length - 1;
        while (index > 0) {
            let pIndex = this.parent(index);
            if (this.compare(this.heap[index], this.heap[pIndex])) {
                this.swap(index, pIndex);
                index = pIndex;
            } else {
                break;
            }
        }
    }

    heapify(i) {
        let extreme = i;
        let l = this.left(i);
        let r = this.right(i);

        if (l < this.heap.length && this.compare(this.heap[l], this.heap[extreme])) {
            extreme = l;
        }
        if (r < this.heap.length && this.compare(this.heap[r], this.heap[extreme])) {
            extreme = r;
        }

        if (extreme !== i) {
            this.swap(i, extreme);
            this.heapify(extreme);
        }
    }

    isEmpty() {
        return this.heap.length === 0;
    }

    peek() {
        return this.isEmpty() ? null : this.heap[0].data;
    }

    toArray() {
        return [...this.heap].map(n => ({ data: n.data, priority: n.priority }));
    }
}

module.exports = PriorityQueue;
