const root = document.documentElement
const lightMode = document.getElementById("lightToggle")
const darkMode = document.getElementById("darkToggle")

darkMode.addEventListener("click", () => {
    root.classList.add("dark-mode");
});

lightMode.addEventListener("click", () => {
    root.classList.remove("dark-mode");
});