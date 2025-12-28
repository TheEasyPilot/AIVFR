import { update, updateSettings } from "./basePage.js";
updateSettings("current_page", "/performance");

const todr = document.getElementById('TODR')
const ldr = document.getElementById('LDR')
const toda = document.getElementById('TODA')
const lda = document.getElementById('LDA')

//each input gets an event listener, and updates
//with the element's value when a change is detected

todr.addEventListener('change', async () => {
    update("TODR", todr.value)
})

ldr.addEventListener('change', async () => {
    update("LDR", ldr.value)
})

toda.addEventListener('change', async () => {
    update("TODA", toda.value)
})

lda.addEventListener('change', async () => {
    update("LDA", lda.value)
})