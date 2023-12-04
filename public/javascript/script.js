function addInitialDB() {
  var req = new XMLHttpRequest();
  req.open("POST", "/api/db", false);
  req.send(null);
  alert("Request ended with status:" + req.status + ". " + req.responseText);
}

function deleteData() {
  var req = new XMLHttpRequest();
  req.open("DELETE", "/api/db", false);
  req.send(null);
  alert("Request ended with status:" + req.status + ". " + req.responseText);
}
