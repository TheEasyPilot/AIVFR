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

//-----------Choosing units--------------------
const airspeed = document.getElementById("airspeed")
const airspeed_options = document.getElementById("airspeed_options")

const altitude = document.getElementById("altitude")
const mass = document.getElementById("mass")
const fuel = document.getElementById("fuel")

//airspeed
airspeed.addEventListener("click", () => {
    //close all other open options (should just be one column), then:
    airspeed_options.style.display = "block";
    airspeed.onclick = function() {
        airspeed_options.style.display = "none";
    }
});

