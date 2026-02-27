class TrieNode {
    constructor() {
        this.children = new Map();
        this.isEndOfWord = false;
        this.stationData = null; // Store full station details here
    }
}

class StationTrie {
    constructor() {
        this.root = new TrieNode();
    }

    insert(stationCode, stationName) {
        // We will insert by both code and name so users can search either
        this._insertStr(stationCode.toLowerCase(), { code: stationCode, name: stationName });
        this._insertStr(stationName.toLowerCase(), { code: stationCode, name: stationName });
    }

    _insertStr(str, data) {
        let node = this.root;
        for (let char of str) {
            if (!node.children.has(char)) {
                node.children.set(char, new TrieNode());
            }
            node = node.children.get(char);
        }
        node.isEndOfWord = true;
        // If multiple stations have same prefix name ending, keep list. Here keep one for simplicity.
        node.stationData = data;
    }

    searchPrefix(prefix) {
        let node = this.root;
        for (let char of prefix.toLowerCase()) {
            if (!node.children.has(char)) return [];
            node = node.children.get(char);
        }

        // DFS to find all autocomplete suggestions
        let results = new Map(); // using Map to prevent duplicates if searched by code vs name

        const dfs = (currNode) => {
            if (currNode.isEndOfWord && currNode.stationData) {
                results.set(currNode.stationData.code, currNode.stationData);
            }
            for (let [char, childNode] of currNode.children) {
                dfs(childNode);
            }
        };

        dfs(node);
        return Array.from(results.values()).slice(0, 5); // Return top 5 suggestions
    }
}

module.exports = StationTrie;
