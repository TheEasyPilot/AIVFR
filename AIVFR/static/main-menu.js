//ensuring the HTML has loaded properly before runing the script
document.addEventListener("DOMContentLoaded", function() {
    //linking the buttons and disclaimer to the script
    const uploadFlight = document.getElementById("uploadFlight");
    const disclaimer = document.getElementById("disclaimer");
    const Continue = document.getElementById("continue");
    const loadFlight = document.getElementById("loadFlight");
    const newFlight = document.getElementById("newFlight");
    const disclaimerContinue = document.getElementById("disclaimerACCEPT");
    const disclaimerGoBack = document.getElementById("disclaimerEXIT");
    const uploadFlightGoBack = document.getElementById("uploadFlightEXIT");

    //display the disclaimer
    function displayDisclaimer() { 
    disclaimer.style.display = "block";
    }

    //display the upload flight modal
    function displayUploadFlight() {
    uploadFlight.style.display = "block";
    }

    Continue.addEventListener("click", function() {
        displayDisclaimer();
        ContinueFlight(); //determines what happens if the user presses continue on disclaimer
    });

    loadFlight.addEventListener("click", function() {
        displayDisclaimer();
        disclaimerContinue.onclick = function() {
            disclaimer.style.display = "none";
            displayUploadFlight();
            }
    });

    newFlight.addEventListener("click", function() {
        displayDisclaimer();
        NewFlight();
        disclaimerContinue.onclick = function() {
        clearSession();
        window.open("dashboard", '_self')
        };
    });

    //disclaimer
    disclaimerGoBack.onclick = function() {
    disclaimer.style.display = "none";
    }

    //upload flight
    uploadFlightGoBack.onclick = function() {
    uploadFlight.style.display = "none";
    }

    //---------------------------CONTINUE FLIGHT
    
    function ContinueFlight() {
        disclaimerContinue.onclick = function() {
            window.open("dashboard", '_self')
            }
        }
    });

    //---------------------------NEW FLIGHT
    function NewFlight() {
        fetch('/get-flight')
        .then(response => response.json())
        .then(data => {
        if (data.saved == "False") { //checks if current flight data is saved
            alert("Your Flight Plan has changes that have not yet been saved onto your device. By pressing 'Continue' on the disclaimer, The current flight data will be erased, which is irreversable!")
            }
        })
    };

    function clearSession() {
        fetch('/new-flight')
    }

    //---------------------------LOAD FLIGHT

    document.getElementById('flightFile').addEventListener('change', function() {
    var fileName = this.files[0] ? this.files[0].name : '';
    document.getElementById('fileName').textContent = fileName;
    });


