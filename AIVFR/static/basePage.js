//-----Date and time-------------

function updateClock() { //function allows just the time to update smoothly
    const now = new Date(); //gets current date and time

    //local
    const timeLOC = now.toLocaleString([], { hour: '2-digit', minute: '2-digit' }); //displays as hh:mm
    document.getElementById('timeLOC').textContent = timeLOC; //content of this (empty) element set to timeLoc

    //utc
    const timeUTC = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
    document.getElementById('timeUTC').textContent = timeUTC;
}

updateClock() //when page loads for first time, run it immediately...
setInterval(updateClock, 1000); //...then update every second.

