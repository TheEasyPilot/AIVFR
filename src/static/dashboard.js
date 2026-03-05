import { update, updateSettings, showAlert, prompt } from "./basePage.js";

await updateSettings("current_page", "/dashboard");


//==========================SAVING THE FLIGHT PLAN==========================

//----downloading as JSON
const save_json = document.getElementById("save_json"); ///button for saving as JSON

save_json.addEventListener("click", () => { //listen for clicks on the button
    save_json.classList.add("savingOrSaved"); //add class to change styling for feedback
    save_json.innerHTML = "..."; //change text to show saving is in progress
    
    saveFlight_json(); //call the function to save the flight as JSON
    update("saved_json", "True");

    setTimeout(() => { //simulate saving time with a timeout, then change the button text to show it has been saved (real time may be too short)
        save_json.innerHTML = `<div><svg id="save_json_icon" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22,16 L22,20 C22,21.1045695 21.1045695,22 20,22 L4,22 C2.8954305,22 2,21.1045695 2,20 L2,16 L4,16 L4,20 L20,20 L20,16 L22,16 Z M13,12.5857864 L16.2928932,9.29289322 L17.7071068,10.7071068 L12,16.4142136 L6.29289322,10.7071068 L7.70710678,9.29289322 L11,12.5857864 L11,2 L13,2 L13,12.5857864 Z" fill-rule="evenodd"/></svg><b>JSON</b></div>`;
    }, 2000);

})

async function saveFlight_json() {
    //fetch session data.flight from flask
    const response = await fetch("/save-flight");
    const data = await response.json();

    //save the flight data.flight as a json file
    //creatubg it ass a blob allows it to be treated as though it is a file
    const blob = new Blob([JSON.stringify(data.flight)/*turns data into raw data string*/], { type: "application/json" });
    const url = URL.createObjectURL(blob); //creates a URL for the blob to be used in the download link
    const a = document.createElement("a"); //creating an anchor element in html...
    a.href = url;//...and placing the URL in the href attribute

    //set the file name to departure and destination airports for uniqueness
    a.download = `${data.flight.departureAirport_code}-${data.flight.destinationAirport_code}.json`;
    document.body.appendChild(a); //temporarily attatching the anchor to the page
    a.click(); //triggering a click without user interaction (to start the download)
    document.body.removeChild(a); //once the download is complete, remove the element
    URL.revokeObjectURL(url); //freeing the memory as the URL is no longer needed
}

//-------downloading as PDF

const save_pdf = document.getElementById("save_pdf");

save_pdf.addEventListener("click", () => {
    save_pdf.classList.add("savingOrSaved"); //button feedback for saving
    save_pdf.innerHTML = "...";

    saveFlight_pdf(); //call the function to save the flight as PDF
    update("saved_pdf", "True");


    //simulate saving time with a timeout, then change the button text to show it has been saved (real time may be too short)
    setTimeout(() => {
        save_pdf.innerHTML = `<div><svg id="save_pdf_icon" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22,16 L22,20 C22,21.1045695 21.1045695,22 20,22 L4,22 C2.8954305,22 2,21.1045695 2,20 L2,16 L4,16 L4,20 L20,20 L20,16 L22,16 Z M13,12.5857864 L16.2928932,9.29289322 L17.7071068,10.7071068 L12,16.4142136 L6.29289322,10.7071068 L7.70710678,9.29289322 L11,12.5857864 L11,2 L13,2 L13,12.5857864 Z" fill-rule="evenodd"/></svg><b>PDF</b></div>`;
    }, 2000);
});

async function saveFlight_pdf() {
    await fetch('/get-flight') //fetching the flight data from the backend to use in the PDF file name and content
    .then(response => response.json())
    .then(async FlightData => {
        //get the departure and arrival names to put in the file name
        const departure_code = FlightData.departureAirport_code /*departure airport code*/;
        const arrival_code = FlightData.destinationAirport_code /*arrival airport code*/;
        
        //getting the template from base.html to convert into pdf
        const template_container = document.getElementById('BasePDF_template');
        //getting the date and time element within the template 
        const dateAndTime = document.getElementById('base_pdf_dateAndTime');

        //updating the date and time to when the PDF is generated
        dateAndTime.innerHTML = `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`
        //using html2pdf to convert the html table into a image, then save to PDF
        const options = { //options for html2pdf
                margin: 10,
                filename: `${departure_code}-${arrival_code}.pdf`, //file name set to 'departure-arrival.pdf' for uniqueness
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {scale: 2, useCORS: true, scrollX: 0, scrollY: 0},
                logging: false,
                jsPDF: { unit: 'mm', format: 'letter', orientation: 'portrait'},
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] } //to prevent unwanted page breaks in the PDF
            };

        //triggering the download of the PDF
        html2pdf().set(options).from(template_container.innerHTML).save();
        })
}


//---Fetching flight data.flight from flask to use in dashboard
const response = await fetch("/get-all");
const data = await response.json();



//==========================WEIGHT AND PERFORMANCE==========================
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

//update the POB display on the dashboard
const POB = document.getElementById("POB");
POB.innerHTML = `<b>POB: </b>${pob}`;

//==========================ROUTE DETAILS==========================
//---determining the cruise altitude
let cruiseAltitude = 0;

//iterate through the NAVLOG rows to find the highest planned altitude, which we can assume is the cruise altitude
for (const row_index in data.flight.NAVLOG.rows) {
    const altitude = data.flight.NAVLOG.rows[row_index]["ALT PLAN (FT)"].value;
    if (altitude > cruiseAltitude) {
        cruiseAltitude = altitude;
    }
}

//if the user has selected to use metres for altitude, convert the cruise altitude from feet to meters
if (data.settings.units_altitude == "metre") {
    cruiseAltitude = Math.round(cruiseAltitude * 0.3048);
}

const cruise_alt = document.getElementById("cruise_alt");
//using a ternary when updating to put the relevant units for altitude based on the user's settings
cruise_alt.innerHTML = `<b>Cruise: </b>${cruiseAltitude} ${data.settings.units_altitude == "feet" ? 'ft' : 'm'}`;

//==========================WEATHER==========================
//------------------initializing grading colours and styling
const grading = document.getElementsByClassName('grading');

async function initializeGradingColors() {
    for (let i = 0; i < grading.length; i++) { //iterate through all the elements with the grading class
        if (grading[i].textContent == "VFR") {
            grading[i].style.color = "#40d400"; //green for VFR
        } else if (grading[i].textContent == "MVFR") {
            grading[i].style.color = "#0091ff"; //blue for Marginal VFR
        } else if (grading[i].textContent == "IFR") {
            grading[i].style.color = "red"; //red for IFR
        } else if (grading[i].textContent == "LIFR") {
            grading[i].style.color = "#800080"; //purple for Low IFR
        }
    }

}

//--------------getching METAR data from the backend and displaying it on the dashboard
async function getWeather(code) {
    if (code === "") { //if there is no code, return undefined so that the dashboard can display 'METAR not available'
    //(instead of trying to fetch data and throwing an error)
        return undefined;
    }

    try {
        //fetch request to the backend with the airport code to get the METAR data for that airport
        const response = await fetch("/get-weather", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ code: code.toUpperCase() }), //sends off the code to the backend
        });

        if (!response.ok) {
            throw new Error("Network response was not ok"); //for non-200 errors (invalid code, API error, etc.)
        }

        const data = await response.json();
        return data; //returns the weather data

        } catch (error) {
            //if there is an error alert the user and return null for correct display on the dashboard
            console.error(error);
            showAlert("Error fetching weather data");
            return null;
        }
};

//----displaying weather data for departure, destination and alternate airports

//getting the elements for displaying the METARs and gradings for each airport

//departure airport weather elements
const METAR_departure = document.getElementById("departure_WX_metar");
const departure_WX_grading = document.getElementById("departure_WX_grading");
//arrival airport weather elements
const METAR_arrival = document.getElementById("arrival_WX_metar");
const arrival_WX_grading = document.getElementById("arrival_WX_grading");
//alternate airport weather elements
const METAR_alternate = document.getElementById("alternate_WX_metar");
const alternate_WX_grading = document.getElementById("alternate_WX_grading");

//refresh button for weather report
const refreshWX = document.getElementById("refresh_WX");

//---------fetching and displaying weather data on the dashboard
async function displayWeather() {
    //feedback for refresh button
    refreshWX.classList.add("refreshing");

    //fetching the data
    if (data.flight.departureAirport_code) {
    var departureWeather = await getWeather(data.flight.departureAirport_code);
    } else { //a failed getch will return null
        var departureWeather = undefined;
    } 
    
    if (data.flight.destinationAirport_code) {
    var arrivalWeather = await getWeather(data.flight.destinationAirport_code);
    } else { //a failed getch will return null
        var arrivalWeather = undefined;
    } 
    
    if (data.flight.alternateAirport_code) {
    var alternateWeather = await getWeather(data.flight.alternateAirport_code);
    } else { //a failed getch will return null
        var alternateWeather = undefined;
    }

    //displaying the METARs should they exist
    if (departureWeather) {
        //if the weather data exists, display the METAR and the flight category grading
        METAR_departure.innerHTML = `<b>${departureWeather.metar.raw_text}</b>`; // raw METAR text
        departure_WX_grading.innerHTML = `<b class='grading'>${departureWeather.metar.flight_category}</b>`; //grading
    } else {
        //if there is no weather data, dislay the relevant message and a NIL grading
        METAR_departure.innerHTML = "<b>METAR not available</b>";
        departure_WX_grading.innerHTML = "<b style='color: gray;'>NIL</b>";
    }

    if (arrivalWeather) {
        //if the weather data exists, display the METAR and the flight category grading
        METAR_arrival.innerHTML = `<b>${arrivalWeather.metar.raw_text}</b>`;
        arrival_WX_grading.innerHTML = `<b class='grading'>${arrivalWeather.metar.flight_category}</b>`;
    } else {
        //if there is no weather data, dislay the relevant message and a NIL grading
        METAR_arrival.innerHTML = "<b>METAR not available</b>";
        arrival_WX_grading.innerHTML = "<b style='color: gray;'>NIL</b>";
    }

    if (alternateWeather) {
        //if the weather data exists, display the METAR and the flight category grading
        METAR_alternate.innerHTML = `<b>${alternateWeather.metar.raw_text}</b>`;
        alternate_WX_grading.innerHTML = `<b class='grading'>${alternateWeather.metar.flight_category}</b>`;
    } else {
        //if there is no weather data, dislay the relevant message and a NIL grading
        METAR_alternate.innerHTML = "<b>METAR not available</b>";
        alternate_WX_grading.innerHTML = "<b style='color: gray;'>NIL</b>";
    }
    await initializeGradingColors(); //set the grading colours based on the flight category
    //feedback for refresh button
    refreshWX.classList.remove("refreshing");

    //update the weather in the database in case it is used elsewhere (e.g. AI briefing)
    await update("METAR_departure", departureWeather ? departureWeather.metar.raw_text : null);
    await update("METAR_arrival", arrivalWeather ? arrivalWeather.metar.raw_text : null);
    await update("METAR_alternate", alternateWeather ? alternateWeather.metar.raw_text : null);
}

//refreshing the weather data

refreshWX.addEventListener("click", () => {
    displayWeather();
})

//==========================EXPENSES==========================
//---------------------Adding expenses
const add_expense_button = document.getElementById("add_expense"); //button to show the add expense container
const add_expense_icon = document.getElementById("add_expense_icon"); //plus icon in button
const create_expense = document.getElementById("create_expense"); //container for adding expenses
const total_expense = document.getElementById("total_expense"); //total expenses display

//managing add expense (+) button and containers using class toggles
add_expense_button.addEventListener("click", () => {
    //if the add expense container is currently shown, hide it and show the total expenses again
    if (add_expense_button.classList.contains("adding")) { 
        add_expense_button.classList.remove("adding");
        add_expense_icon.classList.remove("adding");
        create_expense.classList.add("hidden");
        total_expense.classList.remove("hidden");
    } else {
        //if the add expense container is currently hidden, show it and hide the total expenses
        add_expense_button.classList.add("adding");
        add_expense_icon.classList.add("adding");
        create_expense.classList.remove("hidden");
        total_expense.classList.add("hidden");
    }
})

//-----------------adding an expense
async function addExpense(name, price) {
    //updating the session
    const response = await fetch("/add-expense", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ expense : [name, price] }), //sends off the expense data to the backend
    });

    if (!response.ok) { //if there is an error with the fetch, alert the user
        showAlert("Error adding expense");
        return;
    }
}

//-----user feedback for adding and expense
const submit_expense = document.getElementById("submit_expense");
submit_expense.addEventListener("click", async () => {
    try {
        //feedback for add button pressing
        submit_expense.style.opacity = "0.6";
        submit_expense.textContent = "...";
        submit_expense.style.pointerEvents = "none"; //prevent multiple clicks

        //getting the values from the input fields
        const expense_name = document.getElementById("expense_name")
        const expense_cost = document.getElementById("expense_cost")
        //user cant submit empty fields
        if (expense_name.value === "" || expense_cost.value === "") {
            showAlert("Please enter both an expense name and price");
            //reset the buttonn styling
            submit_expense.style.opacity = "1";
            submit_expense.textContent = "Add";
            submit_expense.style.pointerEvents = "auto";
            return;

        } else {
        //add the expense and update the display
        await addExpense(expense_name.value, expense_cost.value);
        await displayExpenses(); //update the expenses list and total
        //reset the input fields
        expense_name.value = "";
        expense_cost.value = "";

        //reset the button styling
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

    //message for no expenses
    if (data.expenses.length == 0) {
        expenses_content.innerHTML = "<p>No Expenses. Click the + button to add one.</p>";
    }
    total_expense.innerHTML = `<p>Total Flight Cost: <b>£${total.toFixed(2)}</b></p>`; //2dp for price
}

//---------------------Removing expenses
const click_to_remove = document.getElementById("click_to_remove");

//feedback for hovering over an expense item to show that it can be clicked to remove
document.getElementById("expenses_content").addEventListener("mouseover", async (event) => {
    if (event.target.classList.contains("Expense_item")) {
        click_to_remove.style.opacity = "1"; //show the 'click to remove' message when hovering over an expense item
    }})

document.getElementById("expenses_content").addEventListener("mouseout", async (event) => {
    if (event.target.classList.contains("Expense_item")) {
        click_to_remove.style.opacity = "0"; //hide the 'click to remove' message when not hovering over an expense item
    }})


//on click, if the target is an expense item the name is extracted
document.getElementById("expenses_content").addEventListener("click", async (event) => {
    if (event.target.classList.contains("Expense_item")) {

        //sometimes the click registers on the bold price text within the button, 
        //so we need to check for that too and extract the name from the parent element instead
        if (event.target.classList.contains("expense_item")) {
        var expense_text = event.target.textContent;
        event.target.style.opacity = "0.6"; //feedback for clicking the expense
        event.target.style.cursor = "not-allowed"; //prevent multiple clicks on the same item
        } else {
        var expense_text = event.target.parentElement.textContent;
        event.target.parentElement.style.opacity = "0.6"; //feedback for clicking the expense
        event.target.parentElement.style.cursor = "not-allowed"; //prevent multiple clicks on the same item
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

        if (!response.ok) { //if an arror occurs with the fetch, alert the user
            showAlert("Error removing expense");
            return;
        }

        click_to_remove.style.opacity = "0";
        await displayExpenses(); //update the expenses list and total
    }
})

//==========================AI BREIF==========================

//getting the elements for the brief and refresh button
const refresh_brief= document.getElementById("refresh_brief");
const AI_brief_output = document.getElementById("AI_brief_output");

//----creating the prompt and fetching the response from the backend, then displaying it on the dashboard
refresh_brief.addEventListener("click", async () => {
    refresh_brief.style.opacity = "0.6";
    refresh_brief.style.pointerEvents = "none"; //prevent multiple clicks while generating

    const response = await fetch('/get-flight'); //fetching the flight data from the backend
    const flightData = await response.json();

    //relevant flight data used in secondary prompt
    const promptText = `
    FLIGHT DATA:

    ROUTE:
    Departure Airport: ${flightData.departureAirport_name}
    Arrival Airport: ${flightData.destinationAirport_name}
    Alternate Airport: ${flightData.alternateAirport_name}
    Distance: ${flightData.distance.output}
    Time Enroute: ${flightData.time}
    Route: ${flightData.route_names}

    WEATHER:
    Departure Airport METAR: ${METAR_departure.textContent} (${departure_WX_grading.textContent})
    Arrival Airport METAR: ${METAR_arrival.textContent} (${arrival_WX_grading.textContent})
    Alternate Airport METAR: ${METAR_alternate.textContent} (${alternate_WX_grading.textContent})
    Departure Airport TAF: ${flightData.TAF_departure}
    Arrival Airport TAF: ${flightData.TAF_arrival}
    Alternate Airport TAF: ${flightData.TAF_alternate}

    FUEL POLICIES:
    Trip: ${flightData.fuelPolicy_trip}
    Contingency: ${flightData.fuelPolicy_contingency}
    Alternate: ${flightData.fuelPolicy_alternate}
    Final Reserve: ${flightData.fuelPolicy_finalReserve}
    Additional: ${flightData.fuelPolicy_additional}

    FUEL VALUES:
    Taxi Fuel: ${flightData.fuel_taxi.output}
    Trip Fuel: ${flightData.fuel_trip.output}
    Contingency Fuel: ${flightData.fuel_contingency.output}
    Alternate Fuel: ${flightData.fuel_alternate.output}
    Final Reserve Fuel: ${flightData.fuel_finalReserve.output}
    Additional Fuel: ${flightData.fuel_additional.output}
    Extra Fuel: ${flightData.fuel_extra.output}
    Total Fuel: ${flightData.fuel_total.output}
    Fuel Burn: ${flightData.fuel_burn.output}
    Fuel Endurance: ${flightData.fuel_endurance.output}

    MASS AND BALANCE:
    MTOW: ${flightData.MTOW.output}
    MLW: ${flightData.MLW.output}
    MGW: ${flightData.MGW.output}

    Navigation log:
    ${JSON.stringify(flightData.NAVLOG)}
    
    Weight and Balance Table:
    ${JSON.stringify(flightData.weight_items)}

    CG Table:
    ${JSON.stringify(flightData.CG_calculations)}
    `;

    //displaying feedback while generating the brief
    AI_brief_output.innerHTML = "<p style='color: #737373;'>Generating brief...</p>";

    const aiResponse = await prompt("Brief", promptText);  
    try {
        const resp = JSON.parse(aiResponse); //parsing the response to JSON
        AI_brief_output.style.color = "#000000"; //resetting the colour to the default to be seen clearly
        AI_brief_output.innerHTML = `<p>${resp.briefing}</p>`; //displaying the briefing in the dashboard
        update("brief", resp.briefing); //updating the briefing in the backend

    } catch (error) {
        //if there is an error with parsing or the response, log the error and alert the user in the briefing section
        console.error(error);
        AI_brief_output.style.color = "#FF0000"; //setting the colour to red
        AI_brief_output.innerHTML = "<p> An error occurred while generating the brief. Please ensure your route is complete and try again.</p>";
    }
    //resetting the refresh button styling
    refresh_brief.style.opacity = "1";
    refresh_brief.style.pointerEvents = "auto";
})


//==========================on page load:

//user cannot generate a brief, nor save their flight if their route is not yet initialized
if (!data.flight.destinationAirport_code) {
    refresh_brief.style.opacity = "0.4";
    refresh_brief.style.pointerEvents = "none";

    save_json.style.opacity = "0.4";
    save_json.style.pointerEvents = "none";

    save_pdf.style.opacity = "0.4";
    save_pdf.style.pointerEvents = "none";
}

//display the weather and expenses on page load
await displayWeather();
await displayExpenses();