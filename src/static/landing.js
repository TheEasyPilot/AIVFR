      const toggle = document.getElementById("themeToggle");
      const body = document.body;

      function setTheme(theme) {
        body.setAttribute("data-theme", theme);
        localStorage.setItem("aivfr-theme", theme);
      }

      const saved = localStorage.getItem("aivfr-theme");
      if (saved) {
        setTheme(saved);
      } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setTheme("dark");
      }

      toggle.addEventListener("click", () => {
        const current = body.getAttribute("data-theme");
        setTheme(current === "dark" ? "light" : "dark");
      });