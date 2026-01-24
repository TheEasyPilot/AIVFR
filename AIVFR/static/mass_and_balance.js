import { update, updateSettings, showAlert } from "./basePage.js";
await updateSettings("current_page", "/mass-and-balance");

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
MTOW.addEventListener('input', () => {
    update('MTOW.value', Number(MTOW.value));
});

MLW.addEventListener('input', () => {
    update('MLW.value', Number(MLW.value));
});

MGW.addEventListener('input', () => {
    update('MGW.value', Number(MGW.value));
});

va_MGW.addEventListener('input', () => {
    update('va_MGW.value', Number(va_MGW.value));
});

Any_Weight.addEventListener('input', () => {
    update('Any_Weight.value', Number(Any_Weight.value));
});

//----------------WEIGHT/BALANCE INPUTS

//BASIC EMPTY
const weight_basic_empty = document.getElementById('weight_basic_empty');
const arm_basic_empty = document.getElementById('arm_basic_empty');
const moment_basic_empty = document.getElementById('moment_basic_empty');

//Event listeners for basic empty
weight_basic_empty.addEventListener('input', async () => {
    await update('weight_items.basic_empty.weight.value', Number(weight_basic_empty.value));
    await calculateMoment('basic_empty');
});

arm_basic_empty.addEventListener('input', async () => {
    await update('weight_items.basic_empty.arm', Number(arm_basic_empty.value));
    await calculateMoment('basic_empty');
});

moment_basic_empty.addEventListener('input', async () => {
    await update('weight_items.basic_empty.moment', Number(moment_basic_empty.value));
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

});

arm_oil.addEventListener('input', async () => {
    await update('weight_items.oil.arm', Number(arm_oil.value));
    await calculateMoment('oil');
});

//PILOT1
const weight_pilot1 = document.getElementById('weight_pilot1');
const arm_pilot1 = document.getElementById('arm_pilot1');
const moment_pilot1 = document.getElementById('moment_pilot1');

//Event listeners for pilot 1
weight_pilot1.addEventListener('input', async () => {
    await update('weight_items.pilot1.weight.value', Number(weight_pilot1.value));
    await calculateMoment('pilot1');
});

arm_pilot1.addEventListener('input', async () => {
    await update('weight_items.pilot1.arm', Number(arm_pilot1.value));
    await calculateMoment('pilot1');
});

//PILOT2
const weight_pilot2 = document.getElementById('weight_pilot2');
const arm_pilot2 = document.getElementById('arm_pilot2');
const moment_pilot2 = document.getElementById('moment_pilot2');

//Event listeners for pilot 2
weight_pilot2.addEventListener('input', async () => {
    await update('weight_items.pilot2.weight.value', Number(weight_pilot2.value));
    await calculateMoment('pilot2');
});

arm_pilot2.addEventListener('input', async () => {
    await update('weight_items.pilot2.arm', Number(arm_pilot2.value));
    await calculateMoment('pilot2');
});

//PAX1 (PAX = Passenger)
const weight_PAX1 = document.getElementById('weight_PAX1');
const arm_PAX1 = document.getElementById('arm_PAX1');
const moment_PAX1 = document.getElementById('moment_PAX1');

//Event listeners for pax 1
weight_PAX1.addEventListener('input', async () => {
    await update('weight_items.PAX1.weight.value', Number(weight_PAX1.value));
    await calculateMoment('PAX1');
});

arm_PAX1.addEventListener('input', async () => {
    await update('weight_items.PAX1.arm', Number(arm_PAX1.value));
    await calculateMoment('PAX1');
});

//PAX2
const weight_PAX2 = document.getElementById('weight_PAX2');
const arm_PAX2 = document.getElementById('arm_PAX2');
const moment_PAX2 = document.getElementById('moment_PAX2');

//Event listeners for pax 2
weight_PAX2.addEventListener('input', async () => {
    await update('weight_items.PAX2.weight.value', Number(weight_PAX2.value));
    await calculateMoment('PAX2');
});

arm_PAX2.addEventListener('input', async () => {
    await update('weight_items.PAX2.arm', Number(arm_PAX2.value));
    await calculateMoment('PAX2');
});

//BAGGAGE1
const weight_baggage1 = document.getElementById('weight_baggage1');
const arm_baggage1 = document.getElementById('arm_baggage1');
const moment_baggage1 = document.getElementById('moment_baggage1');

//Event listeners for baggage 1
weight_baggage1.addEventListener('input', async () => {
    await update('weight_items.baggage1.weight.value', Number(weight_baggage1.value));
    await calculateMoment('baggage1');
});

arm_baggage1.addEventListener('input', async () => {
    await update('weight_items.baggage1.arm', Number(arm_baggage1.value));
    await calculateMoment('baggage1');
});

//BAGGAGE2
const weight_baggage2 = document.getElementById('weight_baggage2');
const arm_baggage2 = document.getElementById('arm_baggage2');
const moment_baggage2 = document.getElementById('moment_baggage2');

//Event listeners for baggage 2
weight_baggage2.addEventListener('input', async () => {
    await update('weight_items.baggage2.weight.value', Number(weight_baggage2.value));
    await calculateMoment('baggage2');
});

arm_baggage2.addEventListener('input', async () => {
    await update('weight_items.baggage2.arm', Number(arm_baggage2.value));
    await calculateMoment('baggage2');
});

//FUEL lOAD1
const weight_fuel_load1 = document.getElementById('weight_fuel_load1');
const arm_fuel_load1 = document.getElementById('arm_fuel_load1');
const moment_fuel_load1 = document.getElementById('moment_fuel_load1');

//Event listeners for fuel load 1
weight_fuel_load1.addEventListener('input', async () => {
    await update('weight_items.fuel_load1.weight.value', Number(weight_fuel_load1.value));
    await calculateMoment('fuel_load1');
});

arm_fuel_load1.addEventListener('input', async () => {
    await update('weight_items.fuel_load1.arm', Number(arm_fuel_load1.value));
    await calculateMoment('fuel_load1');
});

//FUEL lOAD2
const weight_fuel_load2 = document.getElementById('weight_fuel_load2');
const arm_fuel_load2 = document.getElementById('arm_fuel_load2');
const moment_fuel_load2 = document.getElementById('moment_fuel_load2');

//Event listeners for fuel load 2
weight_fuel_load2.addEventListener('input', async () => {
    await update('weight_items.fuel_load2.weight.value', Number(weight_fuel_load2.value));
    await calculateMoment('fuel_load2');
});

arm_fuel_load2.addEventListener('input', async () => {
    await update('weight_items.fuel_load2.arm', Number(arm_fuel_load2.value));
    await calculateMoment('fuel_load2');
});

//FUEL BURNED ON GROUND TANK 1
const weight_fuel_ground_burned1 = document.getElementById('weight_fuel_ground_burned1');
const arm_fuel_ground_burned1 = document.getElementById('arm_fuel_ground_burned1');
const moment_fuel_ground_burned1 = document.getElementById('moment_fuel_ground_burned1');

//Event listeners for fuel burned on ground1
weight_fuel_ground_burned1.addEventListener('input', async () => {
    await update('weight_items.fuel_ground_burned1.weight.value', Number(weight_fuel_ground_burned1.value));
    await calculateMoment('fuel_ground_burned1');
});

arm_fuel_ground_burned1.addEventListener('input', async () => {
    await update('weight_items.fuel_ground_burned1.arm', Number(arm_fuel_ground_burned1.value));
    await calculateMoment('fuel_ground_burned1');
});

//FUEL BURNED ON GROUND TANK2
const weight_fuel_ground_burned2 = document.getElementById('weight_fuel_ground_burned2');
const arm_fuel_ground_burned2 = document.getElementById('arm_fuel_ground_burned2');
const moment_fuel_ground_burned2 = document.getElementById('moment_fuel_ground_burned2');

//Event listeners for fuel burned on ground2
weight_fuel_ground_burned2.addEventListener('input', async () => {
    await update('weight_items.fuel_ground_burned2.weight.value', Number(weight_fuel_ground_burned2.value));
    await calculateMoment('fuel_ground_burned2');
});

arm_fuel_ground_burned2.addEventListener('input', async () => {
    await update('weight_items.fuel_ground_burned2.arm', Number(arm_fuel_ground_burned2.value));
    await calculateMoment('fuel_ground_burned2');
});

//FUEL BURNED IN FLIGHT TANK1
const weight_fuel_flight_burned1 = document.getElementById('weight_fuel_flight_burned1');
const arm_fuel_flight_burned1 = document.getElementById('arm_fuel_flight_burned1');
const moment_fuel_flight_burned1 = document.getElementById('moment_fuel_flight_burned1');

//Event listeners for fuel burned in flight1
weight_fuel_flight_burned1.addEventListener('input', async () => {
    await update('weight_items.fuel_flight_burned1.weight.value', Number(weight_fuel_flight_burned1.value));
    await calculateMoment('fuel_flight_burned1');
});

arm_fuel_flight_burned1.addEventListener('input', async () => {
    await update('weight_items.fuel_flight_burned1.arm', Number(arm_fuel_flight_burned1.value));
    await calculateMoment('fuel_flight_burned1');
});

//FUEL BURNED IN FLIGHT TANK2
const weight_fuel_flight_burned2 = document.getElementById('weight_fuel_flight_burned2');
const arm_fuel_flight_burned2 = document.getElementById('arm_fuel_flight_burned2');
const moment_fuel_flight_burned2 = document.getElementById('moment_fuel_flight_burned2');

//Event listeners for fuel burned in flight2
weight_fuel_flight_burned2.addEventListener('input', async () => {
    await update('weight_items.fuel_flight_burned2.weight.value', Number(weight_fuel_flight_burned2.value));
    await calculateMoment('fuel_flight_burned2');
});

arm_fuel_flight_burned2.addEventListener('input', async () => {
    await update('weight_items.fuel_flight_burned2.arm', Number(arm_fuel_flight_burned2.value));
    await calculateMoment('fuel_flight_burned2');
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

async function calculateMoment(target) {
    //target acts as the id to identify which moment cell is being calculated
    const weight = document.getElementById(`weight_${target}`); //used here as suffix
    const arm = document.getElementById(`arm_${target}`);
    const moment = document.getElementById(`moment_${target}`);

    //moment is 0 if either weight or arm is empty
    if (weight.value === '' || arm.value === '') {
        moment.textContent = '';
        await update(`weight_items.${target}.moment`, 0);
        await calculateCG();
        return;
    }

    //moment = weight * arm
    const calculated_moment = (Number(weight.value) * Number(arm.value));

    if (target === 'basic_empty') { //exception for basic empty as moment is an input field
    moment.value = calculated_moment;
    } else {
    moment.textContent = calculated_moment;
    }

    //updating the session with new moment
    await update(`weight_items.${target}.moment`, calculated_moment);
    await calculateCG();
}

//-------------------------------CALCULATING CG-----------------------

async function calculateCG() {
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
        weight_output.textContent = total_weight !== 0 ? total_weight : '';
        moment_output.textContent = total_moment !== 0 ? total_moment : '';
        
        //calculating CG = moment / weight
        if (total_weight === 0 || total_moment === 0) {
            CG_output.textContent = '';
        } else {
            var calculated_CG = total_moment / total_weight;
            CG_output.textContent = calculated_CG !== 0 ? roundifDecimal(calculated_CG) : '';
        }
    });
    //finally update session with new values in the CG table
    await update('CG_calculations.basic_condition.weight.value', Number(basic_weight.textContent));
    await update('CG_calculations.basic_condition.moment', Number(basic_moment.textContent));
    await update('CG_calculations.basic_condition.CG', Number(basic_CG.textContent));

    await update('CG_calculations.zero_fuel_condition.weight.value', Number(zero_fuel_weight.textContent));
    await update('CG_calculations.zero_fuel_condition.moment', Number(zero_fuel_moment.textContent));
    await update('CG_calculations.zero_fuel_condition.CG', Number(zero_fuel_CG.textContent));

    await update('CG_calculations.ramp_condition.weight.value', Number(ramp_weight.textContent));
    await update('CG_calculations.ramp_condition.moment', Number(ramp_moment.textContent));
    await update('CG_calculations.ramp_condition.CG', Number(ramp_CG.textContent));

    await update('CG_calculations.takeoff_condition.weight.value', Number(takeoff_weight.textContent));
    await update('CG_calculations.takeoff_condition.moment', Number(takeoff_moment.textContent));
    await update('CG_calculations.takeoff_condition.CG', Number(takeoff_CG.textContent));

    await update('CG_calculations.landing_condition.weight.value', Number(landing_weight.textContent));
    await update('CG_calculations.landing_condition.moment', Number(landing_moment.textContent));
    await update('CG_calculations.landing_condition.CG', Number(landing_CG.textContent));

    }