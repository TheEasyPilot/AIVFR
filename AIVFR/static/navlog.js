import { update, showAlert } from "./basePage.js";

const table = document.getElementById('navlogTableBody');

await makePLOG();

//-------------------------------NAVLOG FUNCTIONS
//Update variation
const variation = document.getElementById('variation');

//wait for a change in variation input, then update
variation.addEventListener('change', async () => {
    await update('variation', variation.value);
});

//---------------------CREATING PLOG TABLE

async function makePLOG() {
    //clear the table's HTML first (so it dissapears)
    table.innerHTML = '';

    await fetch('/get-flight')
    .then(response => response.json())
    .then(async FlightData => {
        const route_names = FlightData.route_names;
        const len = route_names.length;

        //only make the navlog if there are at least 3 points
        if (len >= 3) {
            await fetch('/makeNavlog');
            const log = FlightData.NAVLOG;

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
        };
    });
}