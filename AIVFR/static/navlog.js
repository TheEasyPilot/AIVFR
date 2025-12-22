import { update, showAlert } from "./basePage.js";

const table = document.getElementById('navlogTableBody');


//On page load, check if route has changed
await fetch('/get-flight')
    .then(response => response.json())
    .then(async FlightData => {
    const route_changed = FlightData.route_changed;
    if (route_changed === "True") {
        await makePLOG(); //allows for re-cration of PLOG, with calculations etc
        update("route_changed", "False");
    } else {
        await refreshPLOG();
    }
});


//---------------------------------------------------------NAVLOG FUNCTIONS
//Update variation
const variation = document.getElementById('variation');

//wait for a change in variation input, then update
variation.addEventListener('change', async () => {
    await update('variation', variation.value);
    await fetch('recalculate-magnetic-HDG'); //recalculate magnetic headings
    await refreshPLOG();
});      

//---------------------CREATING PLOG TABLE

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

async function refreshPLOG() {
    const newtable = document.createElement('tbody');
    newtable.id = 'navlogTableBody';

    await fetch('/get-flight')
    .then(response => response.json())
    .then(async FlightData => {
        const log = FlightData.NAVLOG;
        const len = FlightData.route_names.length;

        if (len >= 3) {
            //create all rows, which will be dependent on route length
            log.rows.forEach(row => {
            const newrow = document.createElement('tr');
            newtable.appendChild(newrow);
            //iterate through each row and create the table using the fetched data, and with specific HTML
                log.headers.forEach(column => {
                    const cell = row[column];

                    //format bearings to be 3 digits
                    if (column.includes("°")) {
                        var display = formatBearing(cell.value);
                    } else {
                        var display = cell.value;
                    }

                    //format calculated cells differently to input cells
                    if (cell.calculated) {
                        newrow.innerHTML += `<td><div class="tableCalculated">${display}</div></td>`;
                    } else {
                        newrow.innerHTML += `<td><input type="text" class="tableInput" value="${display}"></td>`;
                    }
                });
                table.innerHTML = newtable.innerHTML;
            });
        }
    });
}
//--------------------FORMATTING BEARING

//formats all bearings to 3 digits for display
function formatBearing(bearing) {
    if (bearing === "") {
        return "";
    } else {
        return Math.round(bearing).toString().padStart(3, '0');
    }
}

//---------------------UPDATING PLOG TABLE

table.addEventListener('change', async (event) => {
    const target = event.target;
    if (target.classList.contains('tableInput')) {
        //get the row and column of the changed input
        const rowIndex = target.parentElement.parentElement.rowIndex - 1; //adjust for header row
        const cell = target.parentElement;
        const columnIndex = cell.cellIndex;
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

        //send the updated value to the server
        await fetch('/update-cell', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                row: rowIndex,
                column: columnName,
                value: newValue
        })
    });
    await refreshPLOG();
}});

//---------------------CLEARING PLOG TABLE

const clearNavlogButton = document.getElementById('clearNavlogButton');

clearNavlogButton.addEventListener('click', async () => {
    await fetch('/clearNavlog');
    await refreshPLOG();
});