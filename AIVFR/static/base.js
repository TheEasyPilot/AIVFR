/*

function refresh() {
        fetch('/get-flight')
        .then(response => response.json())
        .then(data => {
            updateUI(data);
        });
    }

function updateUI(flight_data) {
  for (const key in flight_data) {
    const value = flight_data[key];
    const element = document.getElementById(key);

    if (element) {
      if (typeof value === "object" && "output" in value) {
        // show the formatted output field
        element.textContent = value.output;
      } else {
        // fallback to raw value if it's just text/number
        element.textContent = value;
      }
    }
  }
}
 */ 