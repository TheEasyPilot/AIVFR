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
    const uploadFlightButton = document.getElementById("uploadFlightButton");

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

    async function loadSession() {
        const input = document.getElementById('flightFile');

         //check if a file has been selected
        if (!input.files.length) return alert("Please select a file to upload.");

        //read the file as text
        const file = input.files[0];
        const text = await file.text();
        let flightData;
        try {
            flightData = JSON.parse(text); //parse the text as JSON
        } catch (error) { //return an error if the file is not valid JSON
            return alert("Invalid file format. Please upload a valid JSON file.");
        }

        //send the flight data to the server
        const response = await fetch('/load-flight', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(flightData)
        });
    }

    //saves the name of the uploaded file to display in the popup
    document.getElementById('flightFile').addEventListener('change', function() {
    var fileName = this.files[0] ? this.files[0].name : '';
    document.getElementById('fileName').textContent = fileName;
    });

