//-----Check for theme----
const root = document.documentElement //this is the <html> element in settngs.html
fetch("http://127.0.0.1:5000/get-settings") //fetches the current session data
  .then(response => response.json()) //turns it into a .json file so it can be read
  .then(settings => {
      if (settings.theme === "dark") {
          root.classList.add("dark-mode");
      } else {
          root.classList.remove("dark-mode");
      }
});