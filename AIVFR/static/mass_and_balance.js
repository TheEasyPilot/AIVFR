import { update, updateSettings, showAlert, prompt } from "./basePage.js";
await updateSettings("current_page", "/mass-and-balance");

//-------symmetric arm checkbox handling
const symmetricArmCheckbox = document.getElementById('symmetricArmCheckbox');

//Event listener for checkbox changes
symmetricArmCheckbox.addEventListener('change', async () => {
    if (symmetricArmCheckbox.checked) {
        await updateSettings('fill_symmetric_arms', true);
    } else {
        await updateSettings('fill_symmetric_arms', false);
    }
});

//functuon to round only if number has fractinal part
function roundifDecimal(num) {
    if (num % 1 !== 0) {
        return num.toFixed(2);
    } else {
        return num;
    }
}

//-----------------------TABLE NAVIGATION----------------------//

const table_left = document.getElementById('table_left');
const table_right = document.getElementById('table_right');
const moments_table1 = document.getElementById('moments_table1');
const moments_table2 = document.getElementById('moments_table2');

//Initial state (no session involvment - will always be 1 on page load)
let current_table = 1;

//Event listeners for table arrows
table_right.addEventListener('click', () => {
    if (current_table === 1) {
        moments_table2.classList.add('active');
        moments_table1.classList.remove('active');
        table_left.classList.add('active');
        table_right.classList.remove('active');
        current_table = 2;
    }
});

table_left.addEventListener('click', () => {
    if (current_table === 2) {
        moments_table1.classList.add('active');
        moments_table2.classList.remove('active');
        table_right.classList.add('active');
        table_left.classList.remove('active');
        current_table = 1;
    }
});

//-----------------------INPUT HANDLING----------------------//

//-----------BASIC INPUTS
const MTOW = document.getElementById('MTOW'); //Maximum Takeoff Weight
const MLW = document.getElementById('MLW'); //Maximum Landing Weight
const MGW = document.getElementById('MGW'); //Maximum Gross Weight
const va_MGW = document.getElementById('va_MGW'); //Manouvering Speed at Maximum Gross Weight
const Any_Weight = document.getElementById('Any_Weight'); //Any Weight
const va_any = document.getElementById('va_any'); //Manouvering Speed at Any Weight
const va_takeoff = document.getElementById('va_takeoff'); //Manouvering Speed at Takeoff Weight
const va_landing = document.getElementById('va_landing'); //Manouvering Speed at Landing Weight

//Event listeners for basic inputs
MTOW.addEventListener('input', async () => {
    await update('MTOW.value', Number(MTOW.value));
    await checkWeights();
});

MLW.addEventListener('input', async () => {
    await update('MLW.value', Number(MLW.value));
    await checkWeights();
});

MGW.addEventListener('input', async () => {
    await update('MGW.value', Number(MGW.value));
    await checkWeights();
    await calculateVa_takeoffAndLanding();
    
});

va_MGW.addEventListener('input', async () => {
    await update('va_MGW.value', Number(va_MGW.value));
    await calculateVa_takeoffAndLanding();
});

Any_Weight.addEventListener('input', async () => {
    await update('Any_Weight.value', Number(Any_Weight.value));
    await calculateVa_any();
});

//----------------WEIGHT/BALANCE INPUTS

//Arm setting check
async function checkSymmetricArms() {
    const response = await fetch('/get-settings');
    const data = await response.json();
    return data.fill_symmetric_arms;
}

//BASIC EMPTY
const weight_basic_empty = document.getElementById('weight_basic_empty');
const arm_basic_empty = document.getElementById('arm_basic_empty');
const moment_basic_empty = document.getElementById('moment_basic_empty');

//Event listeners for basic empty
weight_basic_empty.addEventListener('input', async () => {
    await update('weight_items.basic_empty.weight.value', Number(weight_basic_empty.value));
    await calculateMoment('basic_empty');
    await calculateCG();
});

arm_basic_empty.addEventListener('input', async () => {
    await update('weight_items.basic_empty.arm', Number(arm_basic_empty.value));
    await calculateMoment('basic_empty');
    await calculateCG();
});

moment_basic_empty.addEventListener('input', async () => {
    await update('weight_items.basic_empty.moment', Number(moment_basic_empty.value));
    await calculateCG();
    await calculateCG();
});

//OIL
const weight_oil = document.getElementById('weight_oil');
const arm_oil = document.getElementById('arm_oil');
const moment_oil = document.getElementById('moment_oil');

//Event listeners for oil
weight_oil.addEventListener('input', async () => {
    await update('weight_items.oil.weight.value', Number(weight_oil.value));
    await calculateMoment('oil');
    await calculateCG();

});

arm_oil.addEventListener('input', async () => {
    await update('weight_items.oil.arm', Number(arm_oil.value));
    await calculateMoment('oil');
    await calculateCG();
});

//PILOT1
const weight_pilot1 = document.getElementById('weight_pilot1');
const arm_pilot1 = document.getElementById('arm_pilot1');
const moment_pilot1 = document.getElementById('moment_pilot1');

//Event listeners for pilot 1
weight_pilot1.addEventListener('input', async () => {
    await update('weight_items.pilot1.weight.value', Number(weight_pilot1.value));
    await calculateMoment('pilot1');
    await calculateCG();
});

arm_pilot1.addEventListener('input', async () => {
    await update('weight_items.pilot1.arm', Number(arm_pilot1.value));

    if (await checkSymmetricArms()) {
        //if symmetric arms is checked, update pilot2 arm as well
        arm_pilot2.value = arm_pilot1.value;
        await update('weight_items.pilot2.arm', Number(arm_pilot2.value));
        await calculateMoment('pilot2');
        await calculateMoment('pilot1');
    } else {
        await calculateMoment('pilot1');
    }
    await calculateCG();
});

//PILOT2
const weight_pilot2 = document.getElementById('weight_pilot2');
const arm_pilot2 = document.getElementById('arm_pilot2');
const moment_pilot2 = document.getElementById('moment_pilot2');

//Event listeners for pilot 2
weight_pilot2.addEventListener('input', async () => {
    await update('weight_items.pilot2.weight.value', Number(weight_pilot2.value));
    await calculateMoment('pilot2');
    await calculateCG();
});

arm_pilot2.addEventListener('input', async () => {
    await update('weight_items.pilot2.arm', Number(arm_pilot2.value));

    if (await checkSymmetricArms()) {
        //if symmetric arms is checked, update pilot1 arm as well
        arm_pilot1.value = arm_pilot2.value;
        await update('weight_items.pilot1.arm', Number(arm_pilot1.value));
        await calculateMoment('pilot1');
        await calculateMoment('pilot2');
    } else {
        await calculateMoment('pilot2');
    }
    await calculateCG();
});

//PAX1 (PAX = Passenger)
const weight_PAX1 = document.getElementById('weight_PAX1');
const arm_PAX1 = document.getElementById('arm_PAX1');
const moment_PAX1 = document.getElementById('moment_PAX1');

//Event listeners for pax 1
weight_PAX1.addEventListener('input', async () => {
    await update('weight_items.PAX1.weight.value', Number(weight_PAX1.value));
    await calculateMoment('PAX1');
    await calculateCG();
});

arm_PAX1.addEventListener('input', async () => {
    await update('weight_items.PAX1.arm', Number(arm_PAX1.value));

    if (await checkSymmetricArms()) {
        //if symmetric arms is checked, update PAX2 arm as well
        arm_PAX2.value = arm_PAX1.value;
        await update('weight_items.PAX2.arm', Number(arm_PAX2.value));
        await calculateMoment('PAX2');
        await calculateMoment('PAX1');
    } else {
        await calculateMoment('PAX1');
    }
    await calculateCG();
});

//PAX2
const weight_PAX2 = document.getElementById('weight_PAX2');
const arm_PAX2 = document.getElementById('arm_PAX2');
const moment_PAX2 = document.getElementById('moment_PAX2');

//Event listeners for pax 2
weight_PAX2.addEventListener('input', async () => {
    await update('weight_items.PAX2.weight.value', Number(weight_PAX2.value));
    await calculateMoment('PAX2');
    await calculateCG();
});

arm_PAX2.addEventListener('input', async () => {
    await update('weight_items.PAX2.arm', Number(arm_PAX2.value));

    if (await checkSymmetricArms()) {
        //if symmetric arms is checked, update PAX1 arm as well
        arm_PAX1.value = arm_PAX2.value;
        await update('weight_items.PAX1.arm', Number(arm_PAX1.value));
        await calculateMoment('PAX1');
        await calculateMoment('PAX2');
    } else {
        await calculateMoment('PAX2');
    }
    await calculateCG();
});

//BAGGAGE1
const weight_baggage1 = document.getElementById('weight_baggage1');
const arm_baggage1 = document.getElementById('arm_baggage1');
const moment_baggage1 = document.getElementById('moment_baggage1');

//Event listeners for baggage 1
weight_baggage1.addEventListener('input', async () => {
    await update('weight_items.baggage1.weight.value', Number(weight_baggage1.value));
    await calculateCargo();
    await calculateMoment('baggage1');
    await calculateCG();
});

arm_baggage1.addEventListener('input', async () => {
    await update('weight_items.baggage1.arm', Number(arm_baggage1.value));
    await calculateMoment('baggage1');
    await calculateCG();
});

//BAGGAGE2
const weight_baggage2 = document.getElementById('weight_baggage2');
const arm_baggage2 = document.getElementById('arm_baggage2');
const moment_baggage2 = document.getElementById('moment_baggage2');

//Event listeners for baggage 2
weight_baggage2.addEventListener('input', async () => {
    await update('weight_items.baggage2.weight.value', Number(weight_baggage2.value));
    await calculateCargo();
    await calculateMoment('baggage2');
    await calculateCG();
});

arm_baggage2.addEventListener('input', async () => {
    await update('weight_items.baggage2.arm', Number(arm_baggage2.value));
    await calculateMoment('baggage2');
    await calculateCG();
});

// Utility function to create a delay

var abort = false;

//setting all fuel arms to same value (for symmetric arms)
async function setFuelArms(arm_value) {
    abort = false;
    let fuel_items = ['fuel_load1', 'fuel_load2', 'fuel_ground_burned1', 'fuel_ground_burned2', 'fuel_flight_burned1', 'fuel_flight_burned2'];
    
    //immediately display the changes on screen
    fuel_items.forEach( async (item) => {
        const arm_element = document.getElementById(`arm_${item}`);
        arm_element.value = arm_value;
        await calculateMoment(item);
    });

    //then update the session values
    for (const item of fuel_items) {
        if (abort) {
            abort = false;
            return;
        }
        await calculateMoment(item);
        await update(`weight_items.${item}.arm`, Number(arm_value));
    }
    await update('weight_items.fuel_load1.arm', Number(arm_value)); //discrepancy fix
}

//FUEL lOAD1
const weight_fuel_load1 = document.getElementById('weight_fuel_load1');
const arm_fuel_load1 = document.getElementById('arm_fuel_load1');
const moment_fuel_load1 = document.getElementById('moment_fuel_load1');

//Event listeners for fuel load 1
weight_fuel_load1.addEventListener('input', async () => {
    await update('weight_items.fuel_load1.weight.value', Number(weight_fuel_load1.value));
    await calculateMoment('fuel_load1');
    await calculateCG();
});

arm_fuel_load1.addEventListener('input', async () => {
    if (await checkSymmetricArms()) {
        //if symmetric arms is checked, update all other fuel values as well
        abort = true; //to prevent synchronous updates
        await setFuelArms(arm_fuel_load1.value);
    } else {
        await update('weight_items.fuel_load1.arm', Number(arm_fuel_load1.value));
        await calculateMoment('fuel_load1');
    }
    await calculateCG();
});

//FUEL lOAD2
const weight_fuel_load2 = document.getElementById('weight_fuel_load2');
const arm_fuel_load2 = document.getElementById('arm_fuel_load2');
const moment_fuel_load2 = document.getElementById('moment_fuel_load2');

//Event listeners for fuel load 2
weight_fuel_load2.addEventListener('input', async () => {
    await update('weight_items.fuel_load2.weight.value', Number(weight_fuel_load2.value));
    await calculateMoment('fuel_load2');
    await calculateCG();
});

arm_fuel_load2.addEventListener('input', async () => {
    if (await checkSymmetricArms()) {
        //if symmetric arms is checked, update all other fuel values as well
        abort = true; //to prevent synchronous updates
        await setFuelArms(arm_fuel_load2.value);
    } else {
        await update('weight_items.fuel_load2.arm', Number(arm_fuel_load2.value));
        await calculateMoment('fuel_load2');
    }
    await calculateCG();
});

//FUEL BURNED ON GROUND TANK 1
const weight_fuel_ground_burned1 = document.getElementById('weight_fuel_ground_burned1');
const arm_fuel_ground_burned1 = document.getElementById('arm_fuel_ground_burned1');
const moment_fuel_ground_burned1 = document.getElementById('moment_fuel_ground_burned1');

//Event listeners for fuel burned on ground1
weight_fuel_ground_burned1.addEventListener('input', async () => {
    await update('weight_items.fuel_ground_burned1.weight.value', Number(weight_fuel_ground_burned1.value));
    await calculateMoment('fuel_ground_burned1');
    await calculateCG();
});

arm_fuel_ground_burned1.addEventListener('input', async () => {
    if (await checkSymmetricArms()) {
        //if symmetric arms is checked, update all other fuel values as well
        abort = true; //to prevent synchronous updates
        await setFuelArms(arm_fuel_ground_burned1.value);
    } else {
        await update('weight_items.fuel_ground_burned1.arm', Number(arm_fuel_ground_burned1.value));
        await calculateMoment('fuel_ground_burned1');
    }
    await calculateCG();
});

//FUEL BURNED ON GROUND TANK2
const weight_fuel_ground_burned2 = document.getElementById('weight_fuel_ground_burned2');
const arm_fuel_ground_burned2 = document.getElementById('arm_fuel_ground_burned2');
const moment_fuel_ground_burned2 = document.getElementById('moment_fuel_ground_burned2');

//Event listeners for fuel burned on ground2
weight_fuel_ground_burned2.addEventListener('input', async () => {
    await update('weight_items.fuel_ground_burned2.weight.value', Number(weight_fuel_ground_burned2.value));
    await calculateMoment('fuel_ground_burned2');
    await calculateCG();
});

arm_fuel_ground_burned2.addEventListener('input', async () => {
    if (await checkSymmetricArms()) {
        //if symmetric arms is checked, update all other fuel values as well
        abort = true; //to prevent synchronous updates
        await setFuelArms(arm_fuel_ground_burned2.value);
    } else {
        await update('weight_items.fuel_ground_burned2.arm', Number(arm_fuel_ground_burned2.value));
        await calculateMoment('fuel_ground_burned2');
    }
    await calculateCG();
});

//FUEL BURNED IN FLIGHT TANK1
const weight_fuel_flight_burned1 = document.getElementById('weight_fuel_flight_burned1');
const arm_fuel_flight_burned1 = document.getElementById('arm_fuel_flight_burned1');
const moment_fuel_flight_burned1 = document.getElementById('moment_fuel_flight_burned1');

//Event listeners for fuel burned in flight1
weight_fuel_flight_burned1.addEventListener('input', async () => {
    await update('weight_items.fuel_flight_burned1.weight.value', Number(weight_fuel_flight_burned1.value));
    await calculateMoment('fuel_flight_burned1');
    await calculateCG();
});

arm_fuel_flight_burned1.addEventListener('input', async () => {
    if (await checkSymmetricArms()) {
        //if symmetric arms is checked, update all other fuel values as well
        abort = true; //to prevent synchronous updates
        await setFuelArms(arm_fuel_flight_burned1.value);
    } else {
        await update('weight_items.fuel_flight_burned1.arm', Number(arm_fuel_flight_burned1.value));
        await calculateMoment('fuel_flight_burned1');
    }
    await calculateCG();
});

//FUEL BURNED IN FLIGHT TANK2
const weight_fuel_flight_burned2 = document.getElementById('weight_fuel_flight_burned2');
const arm_fuel_flight_burned2 = document.getElementById('arm_fuel_flight_burned2');
const moment_fuel_flight_burned2 = document.getElementById('moment_fuel_flight_burned2');

//Event listeners for fuel burned in flight2
weight_fuel_flight_burned2.addEventListener('input', async () => {
    await update('weight_items.fuel_flight_burned2.weight.value', Number(weight_fuel_flight_burned2.value));
    await calculateMoment('fuel_flight_burned2');
    await calculateCG();
});

arm_fuel_flight_burned2.addEventListener('input', async () => {
    if (await checkSymmetricArms()) {
        //if symmetric arms is checked, update all other fuel values as well
        abort = true; //to prevent synchronous updates
        await setFuelArms(arm_fuel_flight_burned2.value);
    } else {
         await update('weight_items.fuel_flight_burned2.arm', Number(arm_fuel_flight_burned2.value));
        await calculateMoment('fuel_flight_burned2');
    }
    await calculateCG();
});

//--------------CG OUTPUTs

//basic condition
const basic_weight = document.getElementById('basic_weight');
const basic_moment = document.getElementById('basic_moment');
const basic_CG = document.getElementById('basic_CG');

//zero fuel condition
const zero_fuel_weight = document.getElementById('zero_fuel_weight');
const zero_fuel_moment = document.getElementById('zero_fuel_moment');
const zero_fuel_CG = document.getElementById('zero_fuel_CG'); 

//ramp condition
const ramp_weight = document.getElementById('ramp_weight');
const ramp_moment = document.getElementById('ramp_moment');
const ramp_CG = document.getElementById('ramp_CG');

//takeoff condition
const takeoff_weight = document.getElementById('takeoff_weight');
const takeoff_moment = document.getElementById('takeoff_moment');
const takeoff_CG = document.getElementById('takeoff_CG');

//landing condition
const landing_weight = document.getElementById('landing_weight');
const landing_moment = document.getElementById('landing_moment');
const landing_CG = document.getElementById('landing_CG');

//------------------------------CALCULATING MOMENTS--------------------------

async function calculateMoment(target='none') {

    if (target === 'none') {
        //no field means calculate all moments
        for (const item of ['basic_empty', 'oil', 'pilot1', 'pilot2', 'PAX1', 'PAX2', 'baggage1', 'baggage2', 'fuel_load1', 'fuel_load2', 'fuel_ground_burned1', 'fuel_ground_burned2', 'fuel_flight_burned1', 'fuel_flight_burned2']) {
            await calculateMoment(item);
        }
        return;
    }

    //target acts as the id to identify which moment cell is being calculated
    const weight = document.getElementById(`weight_${target}`); //used here as suffix
    const arm = document.getElementById(`arm_${target}`);
    const moment = document.getElementById(`moment_${target}`);

    //moment is 0 if either weight or arm is empty
    if (weight.value === '' || arm.value === '') {
        moment.textContent = '';
        await update(`weight_items.${target}.moment`, 0);
        return;
    }

    //moment = weight * arm
    const calculated_moment = roundifDecimal(Number(weight.value) * Number(arm.value));

    if (target === 'basic_empty') { //exception for basic empty as moment is an input field
    moment.value = calculated_moment;
    } else {
    moment.textContent = calculated_moment;
    }

    //updating the session with new moment
    await update(`weight_items.${target}.moment`, calculated_moment);
}

//-------------------------------CALCULATING CG-----------------------

async function calculateCG() {
    CG_table.style.opacity = 0.4; //loading feedback
    const items = [['basic_empty', 'oil', 'pilot1', 'pilot2'], //basic condition
                   ['PAX1', 'PAX2', 'baggage1', 'baggage2'], //zero fuel condition
                   ['fuel_load1', 'fuel_load2'], //ramp condition
                   ['fuel_ground_burned1', 'fuel_ground_burned2'], //takeoff condition
                   ['fuel_flight_burned1', 'fuel_flight_burned2']]; //landing condition
    const conditions_output = ["basic_", "zero_fuel_", "ramp_", "takeoff_", "landing_"];

    var total_weight = 0;
    var total_moment = 0;

    //iterating through each condition
    items.forEach( async (condition) => {
        //iterating through each item in that condition
        condition.forEach( async (item) => {
            //taken the weight and moment from that row
            const weight = document.getElementById(`weight_${item}`);
            const moment = document.getElementById(`moment_${item}`);
            

            if (item !== 'basic_empty') {
                if (weight.value !== '' && moment.textContent !== '') {
                    //for takeoff and landing we subtract the weight and moment (fuel is being burned before these conditions)
                    if (conditions_output[items.indexOf(condition)] === 'takeoff_' || conditions_output[items.indexOf(condition)] === 'landing_') {
                        total_weight -= Number(weight.value);
                        total_moment -= Number(moment.textContent);

                    //otherwise we add them (so basic, zero fuel and ramp conditions)
                    } else {
                        total_weight += Number(weight.value);
                        total_moment += Number(moment.textContent);
                        }
                    }
            } else {
                //exception for basic empty as moment is an input field
                if (weight.value !== '' && moment.value !== '') {
                    if (conditions_output[items.indexOf(condition)] === 'takeoff_' || conditions_output[items.indexOf(condition)] === 'landing_') {
                        total_weight -= Number(weight.value);
                        total_moment -= Number(moment.value);

                    } else {
                        total_weight += Number(weight.value);
                        total_moment += Number(moment.value);
                        }
                    }
                }
            })
        
        //getting the output fields for that condition
        const weight_output = document.getElementById(`${conditions_output[items.indexOf(condition)]}weight`);
        const moment_output = document.getElementById(`${conditions_output[items.indexOf(condition)]}moment`);
        const CG_output = document.getElementById(`${conditions_output[items.indexOf(condition)]}CG`);

        //updating the output fields
        weight_output.textContent = roundifDecimal(total_weight) !== 0 ? roundifDecimal(total_weight) : '';
        moment_output.textContent = roundifDecimal(total_moment) !== 0 ? roundifDecimal(total_moment) : '';
        
        //calculating CG = moment / weight
        if (total_weight === 0 || total_moment === 0) {
            CG_output.textContent = '';
        } else {
            var calculated_CG = total_moment / total_weight;
            CG_output.textContent = roundifDecimal(calculated_CG) !== 0 ? roundifDecimal(calculated_CG) : '';
        }
    });
    CG_table.style.opacity = 1; 
    //finally update session with new values in the CG table
    const response = await fetch("/update-cg-table", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({ table: {
        //send the entire table as one into backend
        basic_condition: {
            weight: {"value" : Number(basic_weight.textContent), class : 'mass'},
            moment: Number(basic_moment.textContent),
            CG: Number(basic_CG.textContent)
        },
        zero_fuel_condition: {
            weight: {"value" : Number(zero_fuel_weight.textContent), class : 'mass'},
            moment: Number(zero_fuel_moment.textContent),
            CG: Number(zero_fuel_CG.textContent)
        },
        ramp_condition: {
            weight: {"value" : Number(ramp_weight.textContent), class : 'mass'},
            moment: Number(ramp_moment.textContent),
            CG: Number(ramp_CG.textContent)
        },
        takeoff_condition: {
            weight: {"value" : Number(takeoff_weight.textContent), class : 'mass'},
            moment: Number(takeoff_moment.textContent),
            CG: Number(takeoff_CG.textContent)
        },
        landing_condition: {
            weight: {"value" : Number(landing_weight.textContent), class : 'mass'},
            moment: Number(landing_moment.textContent),
            CG: Number(landing_CG.textContent)
        }
    } }),
    });
    const data = await response.json();

    if (data.status !== 'success') {
        showAlert('An error occurred whilst saving the calculated data.');
    }
    await calculateVa_takeoffAndLanding()
    await checkWeights();
}

//---------On page load:
const CG_table = document.getElementById('CG_table');
CG_table.style.opacity = 0.4; //indicate loading
await calculateMoment(); //initial calculation of all moments
await calculateCG();

if (await checkSymmetricArms()) {
    await setFuelArms(arm_fuel_load1.value);//to ensure all fuel arms are same on load if symmetric arms is checked
}
CG_table.style.opacity = 1;

//-----------------------MANOEUVRING SPEEDS----------------//

//manoeuvering speeds for takeoff and landing
async function calculateVa_takeoffAndLanding() {
    
    //ensure no calculaton occurs if any input is missing
    if (takeoff_weight.textContent === '' || landing_weight.textContent === '' || MGW.value === '' || va_MGW.value === '') {
        va_takeoff.textContent = '';
        va_landing.textContent = '';
        return;
    }

    //manoeuvring speed = Va @ max gross weight * sqrt(weight / max gross weight)
    const Va_takeoff = Number(va_MGW.value) * Math.sqrt(Number(takeoff_weight.textContent)/Number(MGW.value))
    const Va_landing = Number(va_MGW.value) * Math.sqrt(Number(landing_weight.textContent)/Number(MGW.value))
    
    await update('va_takeoff.value', Number(Va_takeoff));
    await update('va_landing.value', Number(Va_landing));

    //fetch output string from session to display
    const resp = await fetch('get-flight')
    const data = await resp.json();
    va_takeoff.textContent = data.va_takeoff.output
    va_landing.textContent = data.va_landing.output
}


//manouvering speed for any weight
async function calculateVa_any() {
    const Va_any = va_MGW.value * Math.sqrt(Any_Weight.value/MGW.value)
    await update('va_any.value', Number(Va_any));

    //fetch output string from session to display
    const resp = await fetch('get-flight')
    const data = await resp.json();
    const va_any_output = data.va_any.output
    va_any.textContent = va_any_output
}

//-------Checking weights limits
async function checkWeights() {
    //basic, zero-fuel and ramp weights should not exceed MGW
    const ground_weights = [basic_weight, zero_fuel_weight, ramp_weight];

    ground_weights.forEach((weight) => {
        if (weight.textContent !== '' && MGW.value !== '') {
            if (Number(weight.textContent) > Number(MGW.value)) {
                weight.parentElement.classList.add('active');
            } else {
                weight.parentElement.classList.remove('active');
            }
        } else {
            weight.parentElement.classList.remove('active');
        }
    });
    //takeoff weight should not exceed MTOW
    if (takeoff_weight.textContent !== '' && MTOW.value !== '') {
        if (Number(takeoff_weight.textContent) > Number(MTOW.value)) {
            takeoff_weight.parentElement.classList.add('active');
        } else {
            takeoff_weight.parentElement.classList.remove('active');
        }
    } else {
        takeoff_weight.parentElement.classList.remove('active');
    }

    //landing weight should not exceed MLW
    if (landing_weight.textContent !== '' && MLW.value !== '') {
        if (Number(landing_weight.textContent) > Number(MLW.value)) {
            landing_weight.parentElement.classList.add('active');
        } else {
            landing_weight.parentElement.classList.remove('active');
        }
    } else {
        landing_weight.parentElement.classList.remove('active');
    }
}


//----------------Calculating cargo weight
async function calculateCargo() {
    //determining and updating cargo weight for dashboard
    let cargoWeight = 0;

    if (Number(weight_baggage1.value) != 0) {
        cargoWeight += Number(weight_baggage1.value);
    } if (Number(weight_baggage2.value) != 0) {
        cargoWeight += Number(weight_baggage2.value);
    }
    await update("cargo.value", cargoWeight);
}

//-----------------------------SUGGESTING A CHANGE----------------------------------//

//-------popup handling
const suggestionModal = document.getElementById('suggestion');
const closePopupButton = document.getElementById('closepopup');
const suggestChangeButton = document.getElementById('suggestChange');

//Event listener to close the popup
closePopupButton.addEventListener('click', () => {
    suggestionModal.style.display = 'none';
});

//Function to open the suggestion popup
suggestChangeButton.addEventListener('click', async () => {
    suggestionModal.style.display = 'block';
    await suggestChange();
});


//-------AI suggestion

const output = document.getElementById("output");

async function suggestChange() {
    output.style.color = "#737373";
    output.textContent = "Generating suggestion...";

    const response = await fetch('/get-flight');
    const flightData = await response.json();

    const promptText = `
    FLIGHT DATA:

    ROUTE:
    Departure Airport: ${flightData.departureAirport_name}
    Arrival Airport: ${flightData.destinationAirport_name}
    Alternate Airport: ${flightData.alternateAirport_name}
    Distance: ${flightData.distance.output}
    Time Enroute: ${flightData.time}
    Route: ${flightData.route_names}

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
    
    Weight and Balance Table:
    ${JSON.stringify(flightData.weight_items)}

    CG Table:
    ${JSON.stringify(flightData.CG_calculations)}
    `

    const aiResponse = await prompt("Mass_and_Balance", promptText);  
    try {
        const resp = JSON.parse(aiResponse); //parsing the response to JSON
        output.style.color = "#000000";
        output.textContent = resp.suggestion

    } catch (error) {
        console.error(error);
        output.style.color = "#FF0000";
        output.textContent = "An error occurred while generating the suggestion. Please ensure your route is complete and try again.";
    }
}