/* ============================================================
   history.js - Calculation history
   Stores the last calculations in LocalStorage.
   LocalStorage can only store text, so we convert our list to text
   with JSON.stringify() and back with JSON.parse().
============================================================= */
const History = (() => {
  const STORAGE_KEY = "calculator-history";
  const MAX_ITEMS = 30; // keep only the newest 30 calculations

  // The list lives in this variable while the app is open.
  let items = load();

  // Read the saved list from LocalStorage (returns [] if empty or broken).
  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(saved) ? saved : [];
    } catch (error) {
      return [];
    }
  }

  // Write the list to LocalStorage.
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      /* ignore: history just won't be remembered */
    }
  }

  // Add a new entry like { expression: "2 + 3", result: "5" } at the top.
  function add(entry) {
    items.unshift(entry);
    items = items.slice(0, MAX_ITEMS);
    save();
  }

  // Remove everything.
  function clear() {
    items = [];
    save();
  }

  // Give the list to other files (they cannot touch "items" directly).
  function getAll() {
    return items;
  }

  return { add, clear, getAll };
})();
