class Node {
    constructor(pnr, data) {
        this.pnr = pnr;
        this.data = data;
        this.left = null;
        this.right = null;
    }
}

class BinarySearchTree {
    constructor() {
        this.root = null;
    }

    insert(pnr, data) {
        const newNode = new Node(pnr, data);
        if (this.root === null) {
            this.root = newNode;
        } else {
            this.insertNode(this.root, newNode);
        }
    }

    insertNode(node, newNode) {
        // PNR is numeric string, compare as numbers if possible or strings
        const pnrVal = Number(node.pnr); // assuming numeric PNRs
        const newPnrVal = Number(newNode.pnr);

        if (newPnrVal < pnrVal) {
            if (node.left === null) {
                node.left = newNode;
            } else {
                this.insertNode(node.left, newNode);
            }
        } else {
            if (node.right === null) {
                node.right = newNode;
            } else {
                this.insertNode(node.right, newNode);
            }
        }
    }

    search(pnr) {
        return this.searchNode(this.root, Number(pnr));
    }

    searchNode(node, pnr) {
        if (node === null) {
            return null;
        }

        const nodePnr = Number(node.pnr);
        if (pnr < nodePnr) {
            return this.searchNode(node.left, pnr);
        } else if (pnr > nodePnr) {
            return this.searchNode(node.right, pnr);
        } else {
            return node.data;
        }
    }

    // In-order traversal to get sorted list
    inOrderTraverse(node = this.root, callback) {
        if (node !== null) {
            this.inOrderTraverse(node.left, callback);
            callback(node.data);
            this.inOrderTraverse(node.right, callback);
        }
    }

    remove(pnr) {
        this.root = this.removeNode(this.root, Number(pnr));
    }

    removeNode(node, pnr) {
        if (node === null) {
            return null;
        }

        const nodePnr = Number(node.pnr);
        if (pnr < nodePnr) {
            node.left = this.removeNode(node.left, pnr);
            return node;
        } else if (pnr > nodePnr) {
            node.right = this.removeNode(node.right, pnr);
            return node;
        } else {
            // Node found
            // Case 1: No children
            if (node.left === null && node.right === null) {
                node = null;
                return node;
            }
            // Case 2: One child
            if (node.left === null) {
                node = node.right;
                return node;
            } else if (node.right === null) {
                node = node.left;
                return node;
            }
            // Case 3: Two children
            // Find min in right subtree
            const aux = this.findMinNode(node.right);
            node.pnr = aux.pnr;
            node.data = aux.data;
            node.right = this.removeNode(node.right, Number(aux.pnr));
            return node;
        }
    }

    findMinNode(node) {
        if (node.left === null)
            return node;
        else
            return this.findMinNode(node.left);
    }
}

module.exports = BinarySearchTree;
