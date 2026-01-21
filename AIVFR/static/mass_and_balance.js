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