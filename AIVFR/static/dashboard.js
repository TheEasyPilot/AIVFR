import { update, updateSettings, showAlert } from "./basePage.js";

await updateSettings("current_page", "/dashboard");
//------SAVE BUTTON-------

const saveButton = document.getElementById("save");

saveButton.addEventListener("click", () => {
    saveButton.classList.add("savingOrSaved");
    saveButton.textContent = "SAVING...";
    
    saveFlight();
    update("saved", "True");

    setTimeout(() => {
        saveButton.textContent = "SAVED";
    }, 2000); //2 seconds to simulate saving time

})

async function saveFlight() {
    //fetch session data.flight from flask
    const response = await fetch("/save-flight");
    const data = await response.json();

    //save the flight data.flight as a json file
    const blob = new Blob([JSON.stringify(data.flight)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    //set the file name to departure and destination airports for uniqueness
    a.download = `${data.flight.flight_data.flight.flight.departureAirport_code}-${data.flight.flight_data.flight.flight.destinationAirport_code}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}


//---Fetching flight data.flight from flask to use in dashboard
const response = await fetch("/get-all");
const data = await response.json();



//---------WEIGHT AND PERFORMANCE--------
//---aircraft input
const aircraft = document.getElementById("aircraft");

aircraft.addEventListener("change", () => {
    update("aircraft", aircraft.value);
})

//---determining and updating POB (persons on board)

let pob = 1; //assume at least the pilot is on board...

//if we have weight values for pilot2, PAX1 and PAX2, we can assume they are occupied
if (data.flight.weight_items.pilot2.weight.value != 0) {
    pob += 1;
} if (data.flight.weight_items.PAX1.weight.value != 0) {
    pob += 1;
} if (data.flight.weight_items.PAX2.weight.value != 0) {
    pob += 1;
}

const POB = document.getElementById("POB");
POB.innerHTML = `<b>POB: </b>${pob}`;

//---------ROUTE DETAILS-------
//---determining the cruise altitude
let cruiseAltitude = 0;

//iterate through the NAVLOG rows to find the highest planned altitude, which we can assume is the cruise altitude
for (const row_index in data.flight.NAVLOG.rows) {
    const altitude = data.flight.NAVLOG.rows[row_index]["ALT PLAN (FT)"].value;
    if (altitude > cruiseAltitude) {
        cruiseAltitude = altitude;
    }
}

if (data.settings.units_altitude == "metre") {
    cruiseAltitude = Math.round(cruiseAltitude * 0.3048); //convert feet to meters
}

const cruise_alt = document.getElementById("cruise_alt");

//using a tertiary when updating to put the relevant units for altitude based on the user's settings
cruise_alt.innerHTML = `<b>Cruise: </b>${cruiseAltitude} ${data.settings.units_altitude == "feet" ? 'ft' : 'm'}`;

//------------WEATHER--------
//------------------initializing grading colours and styling
const grading = document.getElementsByClassName('grading');

async function initializeGradingColors() {
    for (let i = 0; i < grading.length; i++) {
        if (grading[i].textContent == "VFR") {
            grading[i].style.color = "#40d400";
        } else if (grading[i].textContent == "MVFR") {
            grading[i].style.color = "#0091ff";
        } else if (grading[i].textContent == "IFR") {
            grading[i].style.color = "red";
        } else if (grading[i].textContent == "LIFR") {
            grading[i].style.color = "#800080";
        }
    }

}

async function getWeather(code) {
    if (code === "") {
        return undefined;
    }

    try {
        const response = await fetch("/get-weather", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ code: code.toUpperCase() }), //sends off the code to the backend
        });

        if (!response.ok) {
            throw new Error("Network response was not ok"); //for non-200 errors
        }

        const data = await response.json();
        return data; //returns the weather data

        } catch (error) {
            showAlert("Error fetching weather data");
            return null;
        }
};

//----displaying weather data for departure, destination and alternate airports

const METAR_departure = document.getElementById("departure_WX_metar");
const METAR_arrival = document.getElementById("arrival_WX_metar");
const METAR_alternate = document.getElementById("alternate_WX_metar");
const departure_WX_grading = document.getElementById("departure_WX_grading");
const arrival_WX_grading = document.getElementById("arrival_WX_grading");
const alternate_WX_grading = document.getElementById("alternate_WX_grading");

const refreshWX = document.getElementById("refresh_WX");

async function displayWeather() {
    //feedback for refresh button
    refreshWX.classList.add("refreshing");

    //fetaching the data
    if (data.flight.departureAirport_code) {
    var departureWeather = await getWeather(data.flight.departureAirport_code);
    } else {
        var departureWeather = undefined;
    } 
    
    if (data.flight.destinationAirport_code) {
    var arrivalWeather = await getWeather(data.flight.destinationAirport_code);
    } else {
        var arrivalWeather = undefined;
    } 
    
    if (data.flight.alternateAirport_code) {
    var alternateWeather = await getWeather(data.flight.alternateAirport_code);
    } else {
        var alternateWeather = undefined;
    }

    //displaying the METARs should they exist
    if (departureWeather) {
        METAR_departure.innerHTML = `<b>${departureWeather.metar.raw_text}</b>`;
        departure_WX_grading.innerHTML = `<b class='grading'>${departureWeather.metar.flight_category}</b>`;
    } else {
        METAR_departure.innerHTML = "<b>METAR not available</b>";
        departure_WX_grading.innerHTML = "<b style='color: gray;'>NIL</b>";
    }

    if (arrivalWeather) {
        METAR_arrival.innerHTML = `<b>${arrivalWeather.metar.raw_text}</b>`;
        arrival_WX_grading.innerHTML = `<b class='grading'>${arrivalWeather.metar.flight_category}</b>`;
    } else {
        METAR_arrival.innerHTML = "<b>METAR not available</b>";
        arrival_WX_grading.innerHTML = "<b style='color: gray;'>NIL</b>";
    }

    if (alternateWeather) {
        METAR_alternate.innerHTML = `<b>${alternateWeather.metar.raw_text}</b>`;
        alternate_WX_grading.innerHTML = `<b class='grading'>${alternateWeather.metar.flight_category}</b>`;
    } else {
        METAR_alternate.innerHTML = "<b>METAR not available</b>";
        alternate_WX_grading.innerHTML = "<b style='color: gray;'>NIL</b>";
    }
    await initializeGradingColors();
    //feedback for refresh button
    refreshWX.classList.remove("refreshing");
}

//refreshing the weather data

refreshWX.addEventListener("click", () => {
    displayWeather();
})

//----------------------EXPENSES---------------------------
//---------------------Adding expenses
const add_expense_button = document.getElementById("add_expense");
const add_expense_icon = document.getElementById("add_expense_icon");
const create_expense = document.getElementById("create_expense"); //container for adding expenses
const total_expense = document.getElementById("total_expense"); //total expenses display

//managing add expense (+) button and containers using class toggles
add_expense_button.addEventListener("click", () => {
    if (add_expense_button.classList.contains("adding")) {
        add_expense_button.classList.remove("adding");
        add_expense_icon.classList.remove("adding");
        create_expense.classList.add("hidden");
        total_expense.classList.remove("hidden");
    } else {
        add_expense_button.classList.add("adding");
        add_expense_icon.classList.add("adding");
        create_expense.classList.remove("hidden");
        total_expense.classList.add("hidden");
    }
})

//adding an expense
async function addExpense(name, price) {
    //updating the session
    const response = await fetch("/add-expense", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ expense : [name, price] }), //sends off the expense data to the backend
    });

    if (!response.ok) {
        showAlert("Error adding expense");
        return;
    }
}

const submit_expense = document.getElementById("submit_expense");


submit_expense.addEventListener("click", async () => {
    try {
        //feedback for add button pressing
        submit_expense.style.opacity = "0.6";
        submit_expense.textContent = "...";
        submit_expense.style.pointerEvents = "none"; //prevent multiple clicks

        const expense_name = document.getElementById("expense_name")
        const expense_cost = document.getElementById("expense_cost")
        //user cant submit empty fields
        if (expense_name.value === "" || expense_cost.value === "") {
            showAlert("Please enter both an expense name and price");
            submit_expense.style.opacity = "1";
            submit_expense.textContent = "Add";
            submit_expense.style.pointerEvents = "auto";
            return;

        } else {
        await addExpense(expense_name.value, expense_cost.value);
        await displayExpenses(); //update the expenses list and total
        //reset the input fields
        expense_name.value = "";
        expense_cost.value = "";

        //reset the button after a short delay to simulate processing time

        submit_expense.style.opacity = "1";
        submit_expense.textContent = "Add";
        submit_expense.style.pointerEvents = "auto";
        }
    } catch (error) {
        console.error(error);}

})


async function displayExpenses() {
    //---displaying expenses list
    const expenses_content = document.getElementById("expenses_content");

    //fetching the data from session as it may have been updated
    const response = await fetch("/get-flight");
    const data = await response.json();

    //iterate through the expenses and display them in list format
    let expensesHTML = `<div>`;
    for (let i = 0; i < data.expenses.length; i++) {
        expensesHTML += `<button class='expense_item Expense_item' style='margin-right: 10px;'>${data.expenses[i][0]}: <b class='Expense_item' >£${data.expenses[i][1]}</b></button>`;
    }
    expensesHTML += `</div>`;
    expenses_content.innerHTML = expensesHTML;

    //---calculating and displaying total expenses

    //iterate through the expenses price and total them
    const total_expense = document.getElementById("total_expense")
    let total = 0;
    for (let i = 0; i < data.expenses.length; i++) {
        total += parseFloat(data.expenses[i][1]);
    };
    total_expense.innerHTML = `<p>Total Flight Cost: <b>£${total.toFixed(2)}</b></p>`; //2dp for price
}

//---------------------Removing expenses
const click_to_remove = document.getElementById("click_to_remove");
document.getElementById("expenses_content").addEventListener("mouseover", async (event) => {
    if (event.target.classList.contains("Expense_item")) {
        click_to_remove.style.opacity = "1";
    }})

document.getElementById("expenses_content").addEventListener("mouseout", async (event) => {
    if (event.target.classList.contains("Expense_item")) {
        click_to_remove.style.opacity = "0";
    }})


//on click, if the target is an expense item the name is extracted
document.getElementById("expenses_content").addEventListener("click", async (event) => {
    if (event.target.classList.contains("Expense_item")) {

        //sometimes the click registers on the bold price text within the button, 
        //so we need to check for that too and extract the name from the parent element instead
        if (event.target.classList.contains("expense_item")) {
        var expense_text = event.target.textContent;
        } else {
        var expense_text = event.target.parentElement.textContent;
        }

        //get the name part of the expense (value before the colon)
        const expense_name = expense_text.split(":")[0];

        //send the name to the backend to remove the expense from session
        const response = await fetch("/remove-expense", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: expense_name }), //sends off the expense name to the backend
        });

        if (!response.ok) {
            showAlert("Error removing expense");
            return;
        }

        click_to_remove.style.opacity = "0";
        await displayExpenses(); //update the expenses list and total
    }
})

//--on page load:
await displayWeather();
await displayExpenses();

