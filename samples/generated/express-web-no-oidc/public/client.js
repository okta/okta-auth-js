
var url = new URL(window.location.href);

// Load config from the URL and update the form
var config = {};


['issuer', 'username'].forEach(updateForm);

// Update UI
['error', 'status', 'sessionToken', 'error'].forEach(updateUI);


function updateForm(key) {
  var value = url.searchParams.get(key);
  config[key] = value;
  document.getElementById(key).value = value;
}

function updateUI(key) {
  var value = url.searchParams.get(key);
  document.getElementById(key).innerText = value;
}
