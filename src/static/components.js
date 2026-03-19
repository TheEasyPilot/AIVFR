//====================THEME CONTROL FROM BROWSER SETTINGS====================

export async function applyTheme() {
  const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; //checks if user has dark mode enabled in their OS settings
  const root = document.body; //the root element of the page, where CSS variables are stored

    const response = await fetch('/get-settings'); //fetching the settings
    const settings = await response.json();

    root.setAttribute("data-theme", settings.theme);

    if (settings.theme === "auto") { //if the theme is set to auto in the backend, use the system preference
      if (isDarkMode) {
        root.classList.add("dark-mode");
        localStorage.setItem("theme", "dark");
      } else {
        root.classList.remove("dark-mode");
        localStorage.setItem("theme", "light");
      }
    } else if (settings.theme === "dark") { //if the theme is set to dark in the backend, use dark mode regardless of system preference
      root.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else { //if the theme is set to light in the backend, use light mode regardless of system preference
      root.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  }