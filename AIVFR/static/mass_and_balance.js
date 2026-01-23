import { update, updateSettings, showAlert } from "./basePage.js";
await updateSettings("current_page", "/mass-and-balance");

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
weight_basic_empty.addEventListener('input', () => {
    update('weight_items.basic_empty.weight.value', Number(weight_basic_empty.value));
});

arm_basic_empty.addEventListener('input', () => {
    update('weight_items.basic_empty.arm', Number(arm_basic_empty.value));
});

moment_basic_empty.addEventListener('input', () => {
    update('weight_items.basic_empty.moment', Number(moment_basic_empty.value));
});

//OIL
const weight_oil = document.getElementById('weight_oil');
const arm_oil = document.getElementById('arm_oil');
const moment_oil = document.getElementById('moment_oil');

//Event listeners for oil
weight_oil.addEventListener('input', () => {
    update('weight_items.oil.weight.value', Number(weight_oil.value));
});

arm_oil.addEventListener('input', () => {
    update('weight_items.oil.arm', Number(arm_oil.value));
});

//PILOT1
const weight_pilot1 = document.getElementById('weight_pilot1');
const arm_pilot1 = document.getElementById('arm_pilot1');
const moment_pilot1 = document.getElementById('moment_pilot1');

//Event listeners for pilot 1
weight_pilot1.addEventListener('input', () => {
    update('weight_items.pilot1.weight.value', Number(weight_pilot1.value));
});

arm_pilot1.addEventListener('input', () => {
    update('weight_items.pilot1.arm', Number(arm_pilot1.value));
});

//PILOT2
const weight_pilot2 = document.getElementById('weight_pilot2');
const arm_pilot2 = document.getElementById('arm_pilot2');
const moment_pilot2 = document.getElementById('moment_pilot2');

//Event listeners for pilot 2
weight_pilot2.addEventListener('input', () => {
    update('weight_items.pilot2.weight.value', Number(weight_pilot2.value));
});

arm_pilot2.addEventListener('input', () => {
    update('weight_items.pilot2.arm', Number(arm_pilot2.value));
});

//PAX1 (PAX = Passenger)
const weight_pax1 = document.getElementById('weight_pax1');
const arm_pax1 = document.getElementById('arm_pax1');
const moment_pax1 = document.getElementById('moment_pax1');

//Event listeners for pax 1
weight_pax1.addEventListener('input', () => {
    update('weight_items.PAX1.weight.value', Number(weight_pax1.value));
});

arm_pax1.addEventListener('input', () => {
    update('weight_items.PAX1.arm', Number(arm_pax1.value));
});

//PAX2
const weight_pax2 = document.getElementById('weight_pax2');
const arm_pax2 = document.getElementById('arm_pax2');
const moment_pax2 = document.getElementById('moment_pax2');

//Event listeners for pax 2
weight_pax2.addEventListener('input', () => {
    update('weight_items.PAX2.weight.value', Number(weight_pax2.value));
});

arm_pax2.addEventListener('input', () => {
    update('weight_items.PAX2.arm', Number(arm_pax2.value));
});

//BAGGAGE1
const weight_baggage1 = document.getElementById('weight_baggage1');
const arm_baggage1 = document.getElementById('arm_baggage1');
const moment_baggage1 = document.getElementById('moment_baggage1');

//Event listeners for baggage 1
weight_baggage1.addEventListener('input', () => {
    update('weight_items.baggage1.weight.value', Number(weight_baggage1.value));
});

arm_baggage1.addEventListener('input', () => {
    update('weight_items.baggage1.arm', Number(arm_baggage1.value));
});

//BAGGAGE2
const weight_baggage2 = document.getElementById('weight_baggage2');
const arm_baggage2 = document.getElementById('arm_baggage2');
const moment_baggage2 = document.getElementById('moment_baggage2');

//Event listeners for baggage 2
weight_baggage2.addEventListener('input', () => {
    update('weight_items.baggage2.weight.value', Number(weight_baggage2.value));
});

arm_baggage2.addEventListener('input', () => {
    update('weight_items.baggage2.arm', Number(arm_baggage2.value));
});

//FUEL lOAD1
const weight_fuel_load1 = document.getElementById('weight_fuel_load1');
const arm_fuel_load1 = document.getElementById('arm_fuel_load1');
const moment_fuel_load1 = document.getElementById('moment_fuel_load1');

//Event listeners for fuel load 1
weight_fuel_load1.addEventListener('input', () => {
    update('weight_items.fuel_load1.weight.value', Number(weight_fuel_load1.value));
});

arm_fuel_load1.addEventListener('input', () => {
    update('weight_items.fuel_load1.arm', Number(arm_fuel_load1.value));
});

//FUEL lOAD2
const weight_fuel_load2 = document.getElementById('weight_fuel_load2');
const arm_fuel_load2 = document.getElementById('arm_fuel_load2');
const moment_fuel_load2 = document.getElementById('moment_fuel_load2');

//Event listeners for fuel load 2
weight_fuel_load2.addEventListener('input', () => {
    update('weight_items.fuel_load2.weight.value', Number(weight_fuel_load2.value));
});

arm_fuel_load2.addEventListener('input', () => {
    update('weight_items.fuel_load2.arm', Number(arm_fuel_load2.value));
});

//FUEL BURNED ON GROUND TANK 1
const weight_fuel_ground_burned1 = document.getElementById('weight_fuel_ground_burned1');
const arm_fuel_ground_burned1 = document.getElementById('arm_fuel_ground_burned1');
const moment_fuel_ground_burned1 = document.getElementById('moment_fuel_ground_burned1');

//Event listeners for fuel burned on ground1
weight_fuel_ground_burned1.addEventListener('input', () => {
    update('weight_items.fuel_ground_burned1.weight.value', Number(weight_fuel_ground_burned1.value));
});

arm_fuel_ground_burned1.addEventListener('input', () => {
    update('weight_items.fuel_ground_burned1.arm', Number(arm_fuel_ground_burned1.value));
});

//FUEL BURNED ON GROUND TANK2
const weight_fuel_ground_burned2 = document.getElementById('weight_fuel_ground_burned2');
const arm_fuel_ground_burned2 = document.getElementById('arm_fuel_ground_burned2');
const moment_fuel_ground_burned2 = document.getElementById('moment_fuel_ground_burned2');

//Event listeners for fuel burned on ground2
weight_fuel_ground_burned2.addEventListener('input', () => {
    update('weight_items.fuel_ground_burned2.weight.value', Number(weight_fuel_ground_burned2.value));
});

arm_fuel_ground_burned2.addEventListener('input', () => {
    update('weight_items.fuel_ground_burned2.arm', Number(arm_fuel_ground_burned2.value));
});

//FUEL BURNED IN FLIGHT TANK1
const weight_fuel_flight_burned1 = document.getElementById('weight_fuel_flight_burned1');
const arm_fuel_flight_burned1 = document.getElementById('arm_fuel_flight_burned1');
const moment_fuel_flight_burned1 = document.getElementById('moment_fuel_flight_burned1');

//Event listeners for fuel burned in flight1
weight_fuel_flight_burned1.addEventListener('input', () => {
    update('weight_items.fuel_flight_burned1.weight.value', Number(weight_fuel_flight_burned1.value));
});

arm_fuel_flight_burned1.addEventListener('input', () => {
    update('weight_items.fuel_flight_burned1.arm', Number(arm_fuel_flight_burned1.value));
});

//FUEL BURNED IN FLIGHT TANK2
const weight_fuel_flight_burned2 = document.getElementById('weight_fuel_flight_burned2');
const arm_fuel_flight_burned2 = document.getElementById('arm_fuel_flight_burned2');
const moment_fuel_flight_burned2 = document.getElementById('moment_fuel_flight_burned2');

//Event listeners for fuel burned in flight2
weight_fuel_flight_burned2.addEventListener('input', () => {
    update('weight_items.fuel_flight_burned2.weight.value', Number(weight_fuel_flight_burned2.value));
});

arm_fuel_flight_burned2.addEventListener('input', () => {
    update('weight_items.fuel_flight_burned2.arm', Number(arm_fuel_flight_burned2.value));
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