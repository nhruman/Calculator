/* ============================================================
   theme.js - Dark / Light theme
   - Saves the user's choice in LocalStorage.
   - LocalStorage is a small storage inside the browser. It keeps
     text (key -> value) even after you close the app.
   - CSS reads the <html data-theme="..."> attribute to pick colours.
============================================================= */
const Theme = (() => {
  const STORAGE_KEY = "calculator-theme"; // the "name" of our saved value
  const THEME_COLORS = { dark: "#0B1020", light: "#F8FAFC" }; // browser bar colours

  // Read the saved theme. If nothing is saved (or storage is blocked) use "dark".
  function getSavedTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark";
    } catch (error) {
      return "dark";
    }
  }

  // Apply a theme: change the data-theme attribute and the browser bar colour.
  function apply(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", THEME_COLORS[theme]);
  }

  // Switch between dark and light, then save the new choice.
  function toggle() {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    apply(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (error) {
      /* storage not available - the theme still changes, just isn't remembered */
    }
  }

  apply(getSavedTheme()); // runs immediately when this file loads
  return { toggle };
})();
