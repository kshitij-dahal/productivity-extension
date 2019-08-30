var local_min;
var local_sec;

// upon first install, store 00:00 for value of timer in the storage
function store_initial_timer_values(info) {
  if (info.reason == "install" || info.reason == "update") {
    chrome.storage.sync.set({
      btn_text: "START",
      timer_min: 0,
      timer_sec: 0
    });
  }
}

// once a message is received from popup.js indicating that popup.html is open,
// open a long-lived channel to popup.js and send current timer value,
// then start the timer
function establish_long_connection(request, sender) {
  if (request.msg == "pop") {
    var port = chrome.runtime.connect({ name: "timer_request" });
    port.postMessage({ timer_min: local_min, timer_sec: local_sec });
    port.onMessage.addListener(function(msg) {
      alert(msg.msg);
      var interval = setInterval(run_timer, 1000);
    });
    port.onDisconnect.addListener(function() {
      alert("disconnected");
    });
  }
}

// update local timer values
function run_timer() {
  if (local_sec == 59) {
    local_min++;
    local_sec = 0;
  } else {
    local_sec++;
  }
  console.log(local_min, local_sec);
}

chrome.runtime.onInstalled.addListener(store_initial_timer_values);
chrome.runtime.onMessage.addListener(establish_long_connection);
chrome.storage.sync.get("timer_min", function(result) {
  local_min = result.timer_min;
});
chrome.storage.sync.get("timer_sec", function(result) {
  local_sec = result.timer_sec;
});
