//-----------light/dark toggle----------------
const root = document.documentElement //this is the <html> element in settngs.html
const lightMode = document.getElementById("lightToggle")
const darkMode = document.getElementById("darkToggle")

darkMode.addEventListener("click", () => {
    root.classList.add("dark-mode");
});//adding the class of the darkmode colours to the html page, so it applies those rules instead

lightMode.addEventListener("click", () => {
    root.classList.remove("dark-mode");
});//reversing it so that it just applies whatever is in the :root