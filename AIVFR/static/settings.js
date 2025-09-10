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

//-----------Choosing units----------------------------------
const airspeed = document.getElementById("airspeed")
const airspeed_options = document.getElementById("airspeed_options")

const altitude = document.getElementById("altitude")
const altitude_options = document.getElementById("altitude_options")

const mass = document.getElementById("mass")
const mass_options = document.getElementById("mass_options")

const fuel = document.getElementById("fuel")
const fuel_options = document.getElementById("fuel_options")

const distance = document.getElementById("distance")
const distance_options = document.getElementById("distance_options")

//airspeed
airspeed.addEventListener("click", () => {
    //close all other open options (should just be one column), then:
    airspeed_options.style.display = airspeed_options.style.display === "none" ? "block" : "none"; //toggles between the styles none and block
});

//altitude
altitude.addEventListener("click", () => {
    //close all other open options (should just be one column), then:
    altitude_options.style.display = altitude_options.style.display === "none" ? "block" : "none"; //toggles between the styles none and block
});

//mass
mass.addEventListener("click", () => {
    //close all other open options (should just be one column), then:
    mass_options.style.display = mass_options.style.display === "none" ? "block" : "none"; //toggles between the styles none and block
});

//fuel
fuel.addEventListener("click", () => {
    //close all other open options (should just be one column), then:
    fuel_options.style.display = fuel_options.style.display === "none" ? "block" : "none"; //toggles between the styles none and block
});

//fuel
distance.addEventListener("click", () => {
    //close all other open options (should just be one column), then:
    distance_options.style.display = distance_options.style.display === "none" ? "block" : "none"; //toggles between the styles none and block
});

