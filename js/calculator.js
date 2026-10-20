/* ============================================================
   calculator.js - The calculation brain
   This file knows NOTHING about buttons or the screen.
   It only keeps the numbers/operators and does the maths.
   app.js calls its functions and then shows the state on screen.

   We never use eval(). Instead we store the expression as a list
   (tokens), e.g. ["2", "+", "3", "×", "4"], and solve it ourselves
   following the maths rule: × and ÷ happen before + and −.
============================================================= */
const Calculator = (() => {
  const MAX_DIGITS = 12;          // longest number the user can type

  // ---------- State (the calculator's memory) ----------
  let tokens = [];                // finished parts of the expression, e.g. ["12", "+"]
  let currentInput = "0";         // the number being typed right now (kept as text)
  let awaitingNumber = false;     // true right after pressing an operator
  let justEvaluated = false;      // true right after pressing "="
  let lastExpression = "";        // text shown above the result after "="
  let errorMessage = "";          // not empty when something went wrong

  // ---------- Helpers ----------

  // Floating point fix: 0.1 + 0.2 gives 0.30000000000000004 in JavaScript.
  // Rounding to 12 significant digits removes that tiny error.
  function clean(number) {
    return parseFloat(number.toPrecision(12));
  }

  // Turn a number into text. Very big/small numbers use scientific form (1.5e+21).
  function formatNumber(number) {
    const value = clean(number);
    if (value !== 0 && (Math.abs(value) >= 1e12 || Math.abs(value) < 1e-9)) {
      return value.toExponential(6).replace(/\.?0+e/, "e");
    }
    return String(value);
  }

  // Solve a token list like ["2", "+", "3", "×", "4"] -> 14.
  function solve(list) {
    // Pass 1: do × and ÷ first, and keep the + and − for later.
    const terms = [Number(list[0])];
    const addOperators = [];
    for (let i = 1; i < list.length; i += 2) {
      const operator = list[i];
      const number = Number(list[i + 1]);
      if (operator === "×") {
        terms[terms.length - 1] *= number;
      } else if (operator === "÷") {
        if (number === 0) throw new Error("Cannot divide by zero");
        terms[terms.length - 1] /= number;
      } else {
        addOperators.push(operator);
        terms.push(number);
      }
    }
    // Pass 2: do + and − from left to right.
    let total = terms[0];
    addOperators.forEach((operator, index) => {
      total = operator === "+" ? total + terms[index + 1] : total - terms[index + 1];
    });
    if (!Number.isFinite(total)) throw new Error("Error");
    return total;
  }

  // Count only the digits (ignore "-" and ".") to enforce MAX_DIGITS.
  function digitCount() {
    return currentInput.replace(/[-.]/g, "").length;
  }

  // Start fresh after an error or after "=" when a new number is typed.
  function resetIfNeeded() {
    if (errorMessage) clearAll();
    if (justEvaluated) {
      tokens = [];
      currentInput = "0";
      lastExpression = "";
      justEvaluated = false;
    }
  }

  // ---------- Public actions (called by app.js) ----------

  function inputDigit(digit) {
    resetIfNeeded();
    if (awaitingNumber || currentInput === "0") {
      currentInput = digit;
      awaitingNumber = false;
    } else if (digitCount() < MAX_DIGITS) {
      currentInput += digit;
    }
  }

  function inputDecimal() {
    resetIfNeeded();
    if (awaitingNumber) {
      currentInput = "0.";
      awaitingNumber = false;
    } else if (!currentInput.includes(".")) {
      currentInput += ".";
    }
  }

  function chooseOperator(operator) {
    if (errorMessage) return;
    if (justEvaluated) {
      // Keep working with the previous result: "5 =" then "+" -> "5 +"
      tokens = [];
      lastExpression = "";
      justEvaluated = false;
    }
    if (awaitingNumber) {
      tokens[tokens.length - 1] = operator;   // user changed their mind: replace operator
    } else {
      tokens.push(currentInput, operator);
      awaitingNumber = true;
    }
  }

  function toggleSign() {
    if (errorMessage || awaitingNumber || currentInput === "0") return;
    currentInput = currentInput.startsWith("-") ? currentInput.slice(1) : "-" + currentInput;
  }

  function percent() {
    if (errorMessage || awaitingNumber) return;
    let value = Number(currentInput) / 100;
    // "200 + 10%" means 10% OF 200 = 20 (like phone calculators do).
    const lastOperator = tokens[tokens.length - 1];
    if ((lastOperator === "+" || lastOperator === "−") && tokens.length >= 2) {
      try {
        value = (solve(tokens.slice(0, -1)) * Number(currentInput)) / 100;
      } catch (error) {
        return;
      }
    }
    currentInput = formatNumber(value);
  }

  function deleteLast() {
    if (errorMessage) return clearAll();
    if (awaitingNumber || justEvaluated) return;
    currentInput = currentInput.slice(0, -1);
    if (currentInput === "" || currentInput === "-") currentInput = "0";
  }

  function clearAll() {
    tokens = [];
    currentInput = "0";
    awaitingNumber = false;
    justEvaluated = false;
    lastExpression = "";
    errorMessage = "";
  }

  // Calculate the answer. Returns { expression, result } for the history, or null.
  function equals() {
    if (errorMessage || justEvaluated || tokens.length === 0) return null;
    const parts = awaitingNumber ? tokens.slice(0, -1) : [...tokens, currentInput];
    if (parts.length === 1) return null;
    const expression = parts.join(" ");
    try {
      const result = formatNumber(solve(parts));
      tokens = [];
      currentInput = result;
      awaitingNumber = false;
      justEvaluated = true;
      lastExpression = expression + " =";
      return { expression, result };
    } catch (error) {
      tokens = [];
      errorMessage = error.message;
      lastExpression = expression + " =";
      return null;
    }
  }

  // Tell app.js what to show on screen.
  function getState() {
    return {
      value: errorMessage || currentInput,
      expression: lastExpression || tokens.join(" "),
      isError: Boolean(errorMessage)
    };
  }

  return { inputDigit, inputDecimal, chooseOperator, toggleSign, percent, deleteLast, clearAll, equals, getState };
})();
