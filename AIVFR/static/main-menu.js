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

    //display the disclaimer
    function displayDisclaimer() { 
    disclaimer.style.display = "block";
    }

    //main menu
    Continue.onclick = displayDisclaimer
    EntryState = 'Continue' 

    loadFlight.onclick = displayDisclaimer
    EntryState = 'Load'

    newFlight.onclick = displayDisclaimer
    EntryState = 'New'

    //disclaimer
    disclaimerGoBack.onclick = function() {
    disclaimer.style.display = "none";
    }

    //continue button
    if (EntryState = 'Continue') {
        disclaimerContinue.onclick = ContinueFlight
    }

    //---------------------------Continue, load, make new flight
    
    //Continue
    function ContinueFlight() {
        window.open("{{ url_for('app.dashboard') }}", '_self')
    }
});


