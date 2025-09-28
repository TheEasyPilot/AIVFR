function update (key, value) {
    var r = new XMLHttpRequest(); //allows sending HTTP requests (eg POST)
    r.open("POST", "http://127.0.0.1:5000/update-flight", true);
    r.setRequestHeader("Content-Type", "application/json");
    r.onreadystatechange = function () {
        if (r.readyState !=4 || r.status != 200) return;
    };
   r.send(JSON.stringify({ "key": key, "value": value }));
   r.send(JSON.stringify({ "key" : "saved", "value" : "False"}))
} 