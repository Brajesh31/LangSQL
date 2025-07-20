class QueryAutocomplete {
  constructor() {
    this.trie = new Trie();
    this.loadFromLocalStorage(); // Load saved queries into Trie
  }

  // Load queries from localStorage and populate Trie
  loadFromLocalStorage() {
    try {
      // First try to get from queryBuffer
      let savedQueries = localStorage.getItem("queryBuffer");
      if (savedQueries) {
        let queryArray = savedQueries.split(",");
        queryArray.slice(0, 100).forEach((query) => this.insert(query.trim()));
      }

      // Then try to get from bufferData
      let bufferData = localStorage.getItem("bufferData");
      if (bufferData) {
        try {
          const queries = JSON.parse(bufferData);
          if (Array.isArray(queries)) {
            queries.forEach((query) => this.insert(query.trim()));
          }
        } catch (e) {
          console.error("Error parsing bufferData:", e);
        }
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error);
    }
  }

  // Insert query into Trie
  insert(query) {
    if (query && query.trim()) {
      this.trie.insert(query.trim());
    }
  }

  // Search autocomplete suggestions from Trie
  getSuggestions(prefix) {
    if (!prefix || !prefix.trim()) return [];
    return this.trie.getWordsWithPrefix(prefix.trim());
  }

  // Add new query to buffer (if not already present)
  addToBuffer(query) {
    if (!query || !query.trim()) return;

    let savedQueries = localStorage.getItem("queryBuffer") || "";
    let queryArray = savedQueries ? savedQueries.split(",") : [];

    if (!queryArray.includes(query)) {
      queryArray.push(query);
      localStorage.setItem("queryBuffer", queryArray.join(",")); // Save back as a comma-separated string
      this.insert(query); // Also insert into Trie
    }
  }

  // Fetch new queries when connecting a DB
  async fetchNewQueries(dbMetadata) {
    try {
      const response = await fetch("/api/generate-queries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ metadata: dbMetadata }),
      });

      if (!response.ok) throw new Error("Failed to fetch queries");

      const data = await response.json();
      if (data.queries && Array.isArray(data.queries)) {
        data.queries.forEach((query) => this.addToBuffer(query));
      }
    } catch (error) {
      console.error("Error fetching queries:", error);
    }
  }
}

// Basic Trie implementation
class TrieNode {
  constructor() {
    this.children = {};
    this.isEndOfWord = false;
    this.fullWord = null; // Store the complete word at the end node
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word) {
    let node = this.root;
    for (let char of word.toLowerCase()) {
      // Convert to lowercase for case-insensitive matching
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
    }
    node.isEndOfWord = true;
    node.fullWord = word; // Store the original word with original case
  }

  getWordsWithPrefix(prefix) {
    let node = this.root;
    prefix = prefix.toLowerCase(); // Convert to lowercase for case-insensitive matching

    for (let char of prefix) {
      if (!node.children[char]) return [];
      node = node.children[char];
    }
    return this.collectWords(node, prefix);
  }

  collectWords(node, prefix) {
    let words = [];
    if (node.isEndOfWord) {
      words.push(node.fullWord); // Use the stored full word
    }

    for (let char in node.children) {
      words = words.concat(
        this.collectWords(node.children[char], prefix + char)
      );
    }

    return words;
  }
}

// Initialize and export
const queryAutocomplete = new QueryAutocomplete();
export default queryAutocomplete;
