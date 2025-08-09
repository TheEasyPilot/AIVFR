//ensuring the HTML has loaded properly before runing the script
document.addEventListener("DOMContentLoaded", function() {
    console.log("JS LOADED") //confirming the script has now loaded

    //linking the buttons and disclaimer to the script
    var disclaimer = document.getElementById("disclaimer");
    var Continue = document.getElementById("continue");
    var loadFlight = document.getElementById("loadFlight");
    var newFlight = document.getElementById("newFlight");
    var disclaimerContinue = document.getElementById("disclaimerACCEPT");
    var disclaimerGoBack = document.getElementById("disclaimerEXIT");

    //determines what happens if the user presses continue on disclaimer
    var EntryState = 'none' 

    //main menu
    Continue.onclick = function() { 
    disclaimer.style.display = "block";
    EntryState = 'Continue' 
    }

    loadFlight.onclick = function() {
    disclaimer.style.display = "block";
    EntryState = 'Load'
    }

    newFlight.onclick = function() {
    disclaimer.style.display = "block";
    EntryState = 'New'
    }

    //disclaimer
    disclaimerGoBack.onclick = function() {
    disclaimer.style.display = "none";
    }
});


