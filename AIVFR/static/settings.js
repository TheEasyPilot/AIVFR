//-----------light/dark toggle----------------
const root = document.body
const lightMode = document.getElementById("lightToggle")
const darkMode = document.getElementById("darkToggle")

 
    
function updateSettings(key, value) {
        fetch("/update-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value})
    });
    }


//--DARK MODE---
darkMode.addEventListener("click", () => {
    root.classList.add("dark-mode");
    updateSettings("theme", "dark");
});

//--LIGHT MODE---
lightMode.addEventListener("click", () => {
    root.classList.remove("dark-mode");
    updateSettings("theme", "light"); }
);

//-----------Map style toggle----------------
const normalMap = document.getElementById("Normal")
const satelliteMap = document.getElementById("Satellite")

//--SATELLITE---
satelliteMap.addEventListener("click", () => {
    satelliteMap.classList.add('active');
    normalMap.classList.remove('active');
    updateSettings("map_style", "satellite");
});

//--NORMAL---
normalMap.addEventListener("click", () => {
    normalMap.classList.add('active');
    satelliteMap.classList.remove('active');    
    updateSettings("map_style", "normal");
});

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


//changing the color of the button to primary unless another button is clicked
const dropdown = document.querySelectorAll(".dropdown") //all elements in this class stored in array
dropdown.forEach((btn, index) => { //iterates through the array and gives each button its on event listener
    btn.addEventListener("click", () => {
        const isActive = btn.classList.contains("active"); //checks if button is selected already

        dropdown.forEach(drp => drp.classList.remove("active")); //reset anything else that's active first

        if(!isActive) {
            btn.classList.add("active"); //if not active already then make it active
        }
    });
});

//airspeed
airspeed.addEventListener("click", () => {
    altitude_options.style.display = "none";
    mass_options.style.display = "none";
    fuel_options.style.display = "none";
    distance_options.style.display = "none";
    airspeed_options.style.display = airspeed_options.style.display === "none" ? "block" : "none"; //toggles between the styles none and block
});

//altitude
altitude.addEventListener("click", () => {
    airspeed_options.style.display = "none";
    mass_options.style.display = "none";
    fuel_options.style.display = "none";
    distance_options.style.display = "none";
    altitude_options.style.display = altitude_options.style.display === "none" ? "block" : "none"; //toggles between the styles none and block
});

//mass
mass.addEventListener("click", () => {
    altitude_options.style.display = "none";
    airspeed_options.style.display = "none";
    fuel_options.style.display = "none";
    distance_options.style.display = "none";
    mass_options.style.display = mass_options.style.display === "none" ? "block" : "none"; //toggles between the styles none and block
});

//fuel
fuel.addEventListener("click", () => {
    altitude_options.style.display = "none";
    mass_options.style.display = "none";
    airspeed_options.style.display = "none";
    distance_options.style.display = "none";
    fuel_options.style.display = fuel_options.style.display === "none" ? "block" : "none"; //toggles between the styles none and block
});

//distance
distance.addEventListener("click", () => {
    altitude_options.style.display = "none";
    mass_options.style.display = "none";
    fuel_options.style.display = "none";
    airspeed_options.style.display = "none";
    distance_options.style.display = distance_options.style.display === "none" ? "block" : "none"; //toggles between the styles none and block
});

//---------------------UNIT SELECTION-----------------------------
function selected (button, key, value) { //to update session value and color
    updateSettings(key, value);
    button.classList.add('active'); //when it is active its color changes to primary
};


//---------------AIRSPEED------------
const knots = document.getElementById('knots');
const mph = document.getElementById('mph');
const kmph = document.getElementById('kmph');

knots.addEventListener("click", () => {
    mph.classList.remove('active')
    kmph.classList.remove('active') //active removed so returns to normal color
    knots.addEventListener("click", selected(knots, "units_airspeed", "knot"))
});

mph.addEventListener("click", () => {
    knots.classList.remove('active')
    kmph.classList.remove('active')
    mph.addEventListener("click", selected(mph, "units_airspeed", "mile_per_hour"))
});

kmph.addEventListener("click", () => {
    knots.classList.remove('active')
    mph.classList.remove('active')
    kmph.addEventListener("click", selected(kmph, "units_airspeed", "kilometer_per_hour"))
});

//-------------------ALTITUDE--------------
const feet = document.getElementById('feet')
const metres = document.getElementById('metres')

feet.addEventListener("click", () => {
    metres.classList.remove('active')
    feet.addEventListener("click", selected(feet, "units_altitude", "feet"))
});

metres.addEventListener("click", () => {
    feet.classList.remove('active')
    metres.addEventListener("click", selected(metres, "units_altitude", "metre"))
});

//---------------MASS-----------------------
const kilograms = document.getElementById('kg')
const pounds = document.getElementById('pounds')

kilograms.addEventListener("click", () => {
    pounds.classList.remove('active')
    kilograms.addEventListener("click", selected(kilograms, "units_mass", "kilogram"))
});

pounds.addEventListener("click", () => {
    kilograms.classList.remove('active')
    pounds.addEventListener("click", selected(pounds, "units_mass", "pound"))
});

//----------------FUEL-----------------------------
const litres = document.getElementById('litres')
const gallons = document.getElementById('gallons')

litres.addEventListener("click", () => {
    gallons.classList.remove('active')
    litres.addEventListener("click", selected(litres, "units_fuel", "litre"))
});

gallons.addEventListener("click", () => {
    litres.classList.remove('active')
    gallons.addEventListener("click", selected(gallons, "units_fuel", "US_liquid_gallon"))
});

//----------------DISTANCE-------------------------
const NM = document.getElementById('nautical_miles')
const kilometres = document.getElementById('kilometres')
const statute_miles = document.getElementById('statute_miles')

NM.addEventListener("click", () => {
    kilometres.classList.remove('active')
    statute_miles.classList.remove('active')
    NM.addEventListener("click", selected(NM, "units_distance", "nautical_mile"))
});

kilometres.addEventListener("click", () => {
    NM.classList.remove('active')
    statute_miles.classList.remove('active')
    kilometres.addEventListener("click", selected(kilometres, "units_distance", "kilometer"))
});

statute_miles.addEventListener("click", () => {
    NM.classList.remove('active')
    kilometres.classList.remove('active')
    statute_miles.addEventListener("click", selected(statute_miles, "units_distance", "us_statute_mile"))
});