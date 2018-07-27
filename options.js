// Saves options to chrome.storage
function save_options() {
  var api_url = document.getElementById('api-url').value;
  var api_key = document.getElementById('api-key').value;
  chrome.storage.sync.set({
    api_url: api_url,
    api_key: api_key
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    api_url: 'https://',
    api_key: ''
  }, function(items) {
    document.getElementById('api-url').value = items.api_url;
    document.getElementById('api-key').value = items.api_key;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
