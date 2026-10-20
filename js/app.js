/* ============================================================
   app.js - Connects everything together
   - Listens to clicks, touches and the keyboard
   - Calls Calculator (maths), History (storage), Theme (colours)
   - Updates the screen
   - Registers the service worker (offline mode)
============================================================= */

// ---------- Find the HTML elements we need (once) ----------
const resultElement = document.getElementById("result");
const expressionElement = document.getElementById("expression");
const keypad = document.getElementById("keypad");
const historyPanel = document.getElementById("historyPanel");
const historyList = document.getElementById("historyList");
const backdrop = document.getElementById("backdrop");
const toastElement = document.getElementById("toast");

// ---------- Screen updating ----------

// Add commas for easier reading: "1234567.89" -> "1,234,567.89" (display only).
function formatForDisplay(text) {
  if (!/^-?\d+(\.\d*)?$/.test(text)) return text; // errors / scientific form stay as they are
  const [whole, decimals] = text.split(".");
  const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decimals === undefined ? withCommas : withCommas + "." + decimals;
}

// Read the calculator state and draw it on the screen.
function render() {
  const state = Calculator.getState();
  resultElement.textContent = formatForDisplay(state.value);
  expressionElement.textContent = state.expression;
  resultElement.classList.toggle("is-error", state.isError);
  // Smaller font for long numbers so they always fit
  const length = resultElement.textContent.length;
  resultElement.style.fontSize = length > 14 ? "2rem" : length > 10 ? "2.6rem" : "";
}

// Show a short message at the bottom (e.g. "Copied!").
let toastTimer;
function showToast(message) {
  toastElement.textContent = message;
  toastElement.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastElement.classList.remove("show"), 1500);
}

// ---------- Doing an action ----------

// One place that runs every calculator action (used by buttons AND keyboard).
function runAction(action, value) {
  switch (action) {
    case "digit":    Calculator.inputDigit(value); break;
    case "decimal":  Calculator.inputDecimal(); break;
    case "operator": Calculator.chooseOperator(value); break;
    case "sign":     Calculator.toggleSign(); break;
    case "percent":  Calculator.percent(); break;
    case "delete":   Calculator.deleteLast(); break;
    case "clear":    Calculator.clearAll(); break;
    case "equals": {
      const entry = Calculator.equals();
      if (entry) {
        History.add(entry);      // save to history (LocalStorage)
        renderHistory();
      }
      break;
    }
  }
  if (navigator.vibrate) navigator.vibrate(8); // tiny vibration on Android
  render();
}

// ---------- Touch / mouse support ----------
// ONE listener on the whole keypad (event delegation) instead of 20 listeners.
keypad.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (button) runAction(button.dataset.action, button.dataset.value);
});

// ---------- Keyboard support (desktop) ----------
const KEY_MAP = {
  "+": ["operator", "+"], "-": ["operator", "−"], "*": ["operator", "×"], "/": ["operator", "÷"],
  ".": ["decimal"], ",": ["decimal"], "%": ["percent"],
  "Enter": ["equals"], "=": ["equals"], "Backspace": ["delete"], "Escape": ["clear"]
};

document.addEventListener("keydown", (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;           // keep browser shortcuts
  if (historyPanel.classList.contains("open")) {
    if (event.key === "Escape") closeHistory();
    return;
  }
  const mapped = /^\d$/.test(event.key) ? ["digit", event.key] : KEY_MAP[event.key];
  if (!mapped) return;
  event.preventDefault();                                                // stop "/" quick-find etc.
  runAction(mapped[0], mapped[1]);
});

// ---------- Copy result ----------
document.getElementById("copyButton").addEventListener("click", async () => {
  const state = Calculator.getState();
  if (state.isError) return showToast("Nothing to copy");
  try {
    await navigator.clipboard.writeText(state.value);
  } catch (error) {
    // Fallback for older browsers: select a temporary textarea and copy it
    const box = document.createElement("textarea");
    box.value = state.value;
    document.body.appendChild(box);
    box.select();
    document.execCommand("copy");
    box.remove();
  }
  showToast("Copied!");
});

// ---------- History panel ----------

// Build the list items from the saved history. textContent is used (not innerHTML) = safe.
function renderHistory() {
  historyList.textContent = "";
  const items = History.getAll();
  if (items.length === 0) {
    const empty = document.createElement("li");
    empty.className = "sheet__empty";
    empty.textContent = "No calculations yet. Press = to save one here.";
    historyList.appendChild(empty);
    return;
  }
  items.forEach((item) => {
    const row = document.createElement("li");
    row.className = "history-item";
    const expression = document.createElement("span");
    expression.textContent = item.expression + " =";
    const result = document.createElement("strong");
    result.textContent = formatForDisplay(item.result);
    row.append(expression, result);
    historyList.appendChild(row);
  });
}

function openHistory() {
  renderHistory();
  historyPanel.classList.add("open");
  backdrop.classList.add("open");
  historyPanel.inert = false;
}

function closeHistory() {
  historyPanel.classList.remove("open");
  backdrop.classList.remove("open");
  historyPanel.inert = true;
}

document.getElementById("historyButton").addEventListener("click", openHistory);
document.getElementById("closeHistoryButton").addEventListener("click", closeHistory);
backdrop.addEventListener("click", closeHistory);
document.getElementById("clearHistoryButton").addEventListener("click", () => {
  History.clear();
  renderHistory();
});

// ---------- Theme button ----------
document.getElementById("themeButton").addEventListener("click", Theme.toggle);

// ---------- Offline support: register the service worker ----------
// It only works on https:// or localhost (GitHub Pages is https, Live Server is localhost).
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch((error) => {
      console.warn("Service worker not registered:", error);
    });
  });
}

render(); // draw the first screen
