import { update, updateSettings, showAlert } from "./basePage.js";
await updateSettings("current_page", "/navlog");

const table = document.getElementById('navlogTableBody');

//On page load:
await fetch('/get-flight') //fetch the flight data
    .then(response => response.json())
    .then(async FlightData => {
    const route_changed = FlightData.route_changed;
    if (route_changed === "True") { //check if the route has changed since last generation
        //if the route has changed, clear the navlog and regenerate it to reflect the new route
        await fetch('/clearNavlog');
        await refreshPLOG();
        //below feature halted due to complications of adding rows and will be implemented in future updates
        //await makePLOG(); //allows for re-cration of PLOG, with calculations etc
        update("route_changed", "False");
    } else {
        await refreshPLOG();
    }
});


//============================================================NAVLOG FUNCTIONS
//Update variation
const variation = document.getElementById('variation');

//wait for a change in variation input, then update
variation.addEventListener('change', async () => {
    await update('variation', variation.value);
    await fetch('recalculate-magnetic-HDG'); //recalculate magnetic headings
    await refreshPLOG(); //refresh the navlog to show the updated magnetic headings
});      

//=========================CREATING PLOG TABLE=========================

//---making the navlog table (accounts for changes in the route) DEVELOPMENT HALTED---
async function makePLOG() {
    await fetch('/get-flight')
    .then(response => response.json())
    .then(async FlightData => {
        const route_names = FlightData.route_names;
        const len = route_names.length;

        //only make the navlog if there are at least 3 points
        if (len >= 3) {
            await fetch('/makeNavlog');
            await refreshPLOG();
        };
    });
}

//----------displaying the navlog on the page according to flight data
async function refreshPLOG() {
    const newtable = document.createElement('tbody'); //create a new table body to replace the old one, which will be updated with the new flight data
    newtable.id = 'navlogTableBody';

    await fetch('/get-flight') //fetch the flight data
    .then(response => response.json())
    .then(async FlightData => {
        const log = FlightData.NAVLOG; //navlog
        const len = FlightData.route_names.length; //length of the route, to determine how many rows to make
        const arrival_code = FlightData.destinationAirport_code //to compare against alternate airport code to format the alternate row differently
        const alternate_code = FlightData.alternateAirport_code; //for alternate row

        if (len >= 3) {
            //create all rows, which will be dependent on route length
            log.rows.forEach(row => {
            const newrow = document.createElement('tr'); //create a new row for each row in the navlog
            newtable.appendChild(newrow);
            //iterate through each row and create the table using the fetched data, and with specific HTML
                log.headers.forEach(column => {
                    const cell = row[column];
                    //format bearings to be 3 digits
                    if (column.includes("°")) { //containing the degree symbol means it must be a bearing
                        var display = formatBearing(cell.value);
                    } else {
                        var display = cell.value; //otherwise, just display the value as it is (eg. for time, wind speed etc)
                    }

                    //format alternate airport row differently
                    if (row["FROM/TO"].value === arrival_code + " - " + alternate_code) {
                        newrow.style.backgroundColor = "var(--alternate)";
                        newrow.classList.add('alternate')
                    }

                    //format calculated cells differently to input cells
                    if (cell.calculated) {
                        newrow.innerHTML += `<td><div class="tableCalculated">${display}</div></td>`;
                    } else {
                        newrow.innerHTML += `<td><input type="text" class="tableInput" value="${display}"></td>`;
                    }
                });
                //finally, replace the old table body with the new one, which will update the navlog with the new flight data
                table.innerHTML = newtable.innerHTML;
            });
        }
    });
}
//=========================FORMATTING BEARING=========================

//formats all bearings to 3 digits for display
function formatBearing(bearing) {
    if (bearing === "") { //for empty cells, just return an empty string instead of padding
        return "";
    } else if (bearing == 'ERROR') { //for error cells, error should still be displayed as well
        return 'ERROR'
    } else { //otherwise, format the bearing to be 3 digits with leading zeros if necessary
        return Math.round(bearing).toString().padStart(3, '0');
    }
}

//=========================UPDATING PLOG TABLE=========================

table.addEventListener('input', async (event) => {
    const target = event.target; //check if the input is from a TABLE CELL (to avoid triggering when typing in other inputs eg variation)
    if (target.classList.contains('tableInput')) {
        //get the row and column of the changed input
        const rowIndex = target.parentElement.parentElement.rowIndex - 1; //adjust for header row
        const cell = target.parentElement; //the cell that contains the input
        const columnIndex = cell.cellIndex; //the column index of the cell that contains the input
        const columnName = table.parentElement.querySelector('thead').rows[0].cells[columnIndex].innerText; //this returns the column name

        //validating inputs
        if (target.value < 0) {
            target.value = 0; //all inputs cannot be negative
        } if (columnName == "Wind DIR (°)" && target.value == 360) {
            target.value = 0; //360 = 0 degrees
        } else if (columnName == "Wind DIR (°)" && target.value > 360) {
            target.value = 359; //max 359 degrees
        }
        const newValue = target.value;

        //sending the updated value to the server
         const response = await fetch('/update-cell', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            //send the row index, column name, and new value to the server so it can update the flight data and recalculate any relevant cells
            body: JSON.stringify({row: rowIndex, column: columnName, value: newValue}) //
        });
        const data = await response.json(); //response

        if (data.data == 'none') { //none would suggest no values were present to begin with
            return
        }

        //update the specific row with returned values
        const tableRow = table.rows[rowIndex];
        for (let i = 6; i < tableRow.cells.length; i++) {
            const columnName = table.parentElement.querySelector('thead').rows[0].cells[i].innerText;
            //iterate through each column and replace the relevant cells with the fetched data
            if (columnName == "HDG (°T)") { //if the column is true heading, update the cell with the new true heading value
                tableRow.cells[7].querySelector('div').innerText = formatBearing(data.hdgT)
            } else if (columnName == "HDG (°M)") { //if the column is magnetic heading, update the cell with the new magnetic heading value
                tableRow.cells[8].querySelector('div').innerText = formatBearing(data.hdgM)
            } else if (columnName == "GS (KT)") { //if the column is groundspeed, update the cell with the new groundspeed value
                tableRow.cells[9].querySelector('div').innerText = data.gs
            } else if (columnName == "TIME (Min)") { //if the column is time, update the cell with the new time value
                tableRow.cells[11].querySelector('div').innerText = data.time
            }
        };
        await fetch('/calc_flight_time') //calculate the total flight time with the update cell values
        await calculateAvgGS(); //calculate the average groundspeed with the updated cell values
    }
});


//=========================CALCULATING AVERAGE GROUND SPEED=========================
async function calculateAvgGS() {

const response = await fetch('/get-flight') //getting the flight data
const data = await response.json();

let totalGS = 0; //sum of items
let countGS = 0; //number of items

//taking the groundspeed values from each row and calculating average
for (const row_index in data.NAVLOG.rows) {
    const gs = data.NAVLOG.rows[row_index]["GS (KT)"].value;
    if (gs != 0) { //only include non-zero ground speeds in the average
        totalGS += gs;
        countGS += 1;
    }
}
const avgGS = Math.round(totalGS / countGS); //average GS
await update("average_groundspeed.value", avgGS); //update the database with the new value
}

//=========================CLEARING PLOG TABLE=========================

const clearNavlogButton = document.getElementById('clearNavlogButton');

clearNavlogButton.addEventListener('click', async () => {
    await fetch('/clearNavlog'); //this clears the database of all navlog data
    await refreshPLOG(); //then refresh the navlog on the page, which will show an empty navlog table
});

//=========================DOWNLOADING PLOG=========================
const download = document.getElementById('downloadNavlogButton')

download.addEventListener('click', async () => {
    await downloadPDF(); //upon clicking the download button trigger the downloadPDF function
    download.style.pointerEvents = 'all' //re-enabling the download button after generation
    download.style.opacity = 1
});


async function downloadPDF() {
await fetch('/get-flight') //fetching the flight data
.then(response => response.json())
.then(async FlightData => {
    //get the departure and arrival names to put in the file name
    const departure_code = FlightData.departureAirport_code
    const arrival_code = FlightData.destinationAirport_code

    download.style.pointerEvents = 'none' //disabling button to prevent multiple clicks while generating
    download.style.opacity = 0.4
    await refreshPLOG(); //refresh the navlog to make sure all the latest data is included in the downloaded PDF
    //getting the table
    const navlog = document.getElementById('navlogTable');
    
    //getting the template
    const template_container = document.getElementById('navlogPDF_template');
    const navlog_content = document.getElementById('navlog_pdf_content');
    const dateAndTime = document.getElementById('navlog_pdf_dateAndTime');

    //inserting the data into the templete
    navlog_content.innerHTML = navlog.outerHTML;
    dateAndTime.innerHTML = `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`
    //using html2pdf to convert the html table into a image, then save to PDF
    const options = {
            margin: 0.2,
            filename: `Navlog ${departure_code}-${arrival_code}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            logging: false,
            jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape'}
        };
    
    //triggering the download of the PDF
    html2pdf().set(options).from(template_container.innerHTML).save();
    })
}