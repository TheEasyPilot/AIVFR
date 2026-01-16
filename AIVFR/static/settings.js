//-------Alert Box--------------
const alertBox = document.getElementById("alertBox");

export function showAlert(message) {
    alertBox.textContent = message;
    alertBox.style.display = "inline";
    setTimeout(() => {
        alertBox.style.display = "none";
        alertBox.textContent = "";
    }, 3000);
}

//-----------LIGHT/DARK TOGGLE----------------
const root = document.body
const lightMode = document.getElementById("lightToggle")
const darkMode = document.getElementById("darkToggle")

const response = await fetch('/get-settings');
const settings = await response.json();

function updateSettings(key, value) {
        return fetch("/update-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value})
    });
}


//--DARK MODE---
darkMode.addEventListener("click", () => {
    root.classList.add("dark-mode");
    localStorage.setItem("theme", "dark");
    updateSettings("theme", "dark");
});

//--LIGHT MODE---
lightMode.addEventListener("click", () => {
    root.classList.remove("dark-mode");
    localStorage.setItem("theme", "light");
    updateSettings("theme", "light"); }
);

//-----------MAP STYLE TOGGLE----------------
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

//-----------CHOOSING UNITS----------------------------------
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

//-----------------BASE UNITS TOGGLE-----------------
const imperial = document.getElementById("imperial")
const metric = document.getElementById("metric")
const customDropdown = document.getElementById("customDropdown");
const unitsSection = document.getElementById("UnitsButtons");

//toggle custom settings (user can choose each unit individually)
customDropdown.addEventListener("click", () => {
    if (unitsSection.style.display === "none" || unitsSection.style.display === "") {
        updateSettings("base_units", "custom"); //for identification in fuel tab
        imperial.classList.remove('active');
        metric.classList.remove('active');
        unitsSection.style.display = "flex";
        customDropdown.style.transform = "rotate(180deg)"; //dropdown arrow points up
    } else {
        unitsSection.style.display = "none";
        customDropdown.style.transform = "rotate(0deg)"; //dropdown arrow points down
    }
});

//imperial units
async function setImperial() {
    imperial.classList.add('active');
    metric.classList.remove('active');
    await updateSettings("base_units", "imperial");
    await massToPounds();
    await fuelToGallons();
    await altitudeToFeet();
    await airspeedToKnots();
    await distanceToNauticalMiles();
};

//metric units
async function setMetric() {
    metric.classList.add('active');
    imperial.classList.remove('active');
    await updateSettings("base_units", "metric");
    await massToKilograms();
    await fuelToLitres();
    await altitudeToMetres();
    await airspeedToKnots(); //airspeed remains the same due to standard units
    await distanceToNauticalMiles(); //distance remains the same due to standad units
};

imperial.addEventListener("click", () => {
    setImperial();
});

metric.addEventListener("click", () => {
    setMetric();
});

//-----------------DROPDOWN BUTTON BEHAVIOUR-----------------

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
async function selected (button, key, value) { //to update session value and color
    await updateSettings(key, value);
    button.classList.add('active'); //when it is active its color changes to primary
};

//---------------AIRSPEED------------
const knots = document.getElementById('knots');
const mph = document.getElementById('mph');
const kmph = document.getElementById('kmph');

//Knots
async function airspeedToKnots() {
    mph.classList.remove('active')
    kmph.classList.remove('active') //active removed so returns to normal color
    await selected(knots, "units_airspeed", "knot")
};
knots.addEventListener("click", () => {
    airspeedToKnots();
});

//Mph
async function airspeedToMph() {
    knots.classList.remove('active')
    kmph.classList.remove('active')
    await selected(mph, "units_airspeed", "mile_per_hour")
};
mph.addEventListener("click", () => {
    airspeedToMph();
});

//Kmph
async function airspeedToKmph() {
    knots.classList.remove('active')
    mph.classList.remove('active')
    await selected(kmph, "units_airspeed", "kilometer_per_hour")
};
kmph.addEventListener("click", () => {
    airspeedToKmph();
});

//-------------------ALTITUDE--------------
const feet = document.getElementById('feet')
const metres = document.getElementById('metres')

//Feet
async function altitudeToFeet() {
    metres.classList.remove('active')
    await selected(feet, "units_altitude", "feet")
};
feet.addEventListener("click", () => {
    altitudeToFeet();
});

//Metres
async function altitudeToMetres() {
    feet.classList.remove('active')
    await selected(metres, "units_altitude", "metre")
};
metres.addEventListener("click", () => {
    altitudeToMetres();
});

//---------------MASS-----------------------
const kilograms = document.getElementById('kg')
const pounds = document.getElementById('pounds')

//kilograms
async function massToKilograms() {
    pounds.classList.remove('active')
    await selected(kilograms, "units_mass", "kilogram")
};

kilograms.addEventListener("click", () => {
    massToKilograms();
});

//pounds
async function massToPounds() {
    kilograms.classList.remove('active')
    await selected(pounds, "units_mass", "pound")
};
pounds.addEventListener("click", () => {
    massToPounds();
});

//----------------FUEL-----------------------------
const litres = document.getElementById('litres')
const gallons = document.getElementById('gallons')

//litres
async function fuelToLitres() {
    gallons.classList.remove('active')
    await selected(litres, "units_fuel", "litre")
};
litres.addEventListener("click", () => {
    fuelToLitres();
});

//gallons
async function fuelToGallons() {
    litres.classList.remove('active')
    await selected(gallons, "units_fuel", "US_liquid_gallon")
};
gallons.addEventListener("click", () => {
    fuelToGallons();
});

//----------------DISTANCE-------------------------
const NM = document.getElementById('nautical_miles')
const kilometres = document.getElementById('kilometres')
const statute_miles = document.getElementById('statute_miles')

//Nautical Miles
async function distanceToNauticalMiles() {
    kilometres.classList.remove('active')
    statute_miles.classList.remove('active')
    await selected(NM, "units_distance", "nautical_mile")
};
NM.addEventListener("click", () => {
    distanceToNauticalMiles();
});

//Kilometres
async function distanceToKilometres() {
    NM.classList.remove('active')
    statute_miles.classList.remove('active')
    await selected(kilometres, "units_distance", "kilometer")
};
kilometres.addEventListener("click", () => {
    distanceToKilometres();
});

//Statute Miles
async function distanceToStatuteMiles() {
    NM.classList.remove('active')
    kilometres.classList.remove('active')
    await selected(statute_miles, "units_distance", "us_statute_mile")
};
statute_miles.addEventListener("click", () => {
    distanceToStatuteMiles();
});