import { update, showAlert } from "./basePage.js";

const table = document.getElementById('navlogTableBody');

await refreshPLOG();
if (table.innerHTML === '') { //if no navlog exists, create one
    await makePLOG();
}

//-------------------------------NAVLOG FUNCTIONS
//Update variation
const variation = document.getElementById('variation');

//wait for a change in variation input, then update
variation.addEventListener('change', async () => {
    await update('variation', variation.value);
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
    //clear the cells
    table.innerHTML = '';

    await fetch('/get-flight')
    .then(response => response.json())
    .then(async FlightData => {
        const log = FlightData.NAVLOG;
        const len = FlightData.route_names.length;

        if (len >= 3) {
            //create all rows, which will be dependent on route length
            log.rows.forEach(row => {
            const newrow = table.insertRow();
            //iterate through each row and create the table using the fetched data, and with specific HTML
                log.headers.forEach(column => {
                    const cell = row[column];
                    if (cell.calculated) {
                        newrow.innerHTML += `<td><div class="tableCalculated">${cell.value}</div></td>`;
                    } else {
                        newrow.innerHTML += `<td><input type="number" class="tableInput" value="${cell.value}"></td>`;
                    }
                });
            });
        }
    });
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
}});

