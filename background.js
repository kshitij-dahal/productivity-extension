var local_min;
var local_sec;
var local_btn_text;
var interval;

// upon first install, store 00:00 for value of timer in the storage
function store_initial_timer_values(info) {
  if (info.reason == "install" || info.reason == "update") {
    var today = new Date();
    chrome.storage.sync.set({
      btn_text: "START",
      timer_min: 0,
      timer_sec: 0,
      current_date: today
    });
  }
}

// once a message is received from popup.js indicating that popup.html is open,
// open a long-lived channel to popup.js and send current timer value,
// then start the timer
function establish_long_connection(request, sender) {
  //check_if_new_day();
  if (request.msg == "popup_open") {
    var port = chrome.runtime.connect({ name: "timer_request" });
    port.postMessage({
      btn_text: local_btn_text,
      timer_min: local_min,
      timer_sec: local_sec
    });
    port.onMessage.addListener(function(msg) {
      console.log(msg.msg);
    });
    port.onDisconnect.addListener(function() {
      console.log("disconnected");
      chrome.storage.sync.get("timer_min", function(result) {
        console.log(result.timer_min);
      });
      chrome.storage.sync.get("timer_sec", function(result) {
        console.log(result.timer_sec);
      });
      chrome.storage.sync.get("btn_text", function(result) {
        console.log(result.btn_text);
      });
    });
  }
}

function configure_timer(changes, namespace) {
  if (changes.hasOwnProperty("btn_text")) {
    if (changes["btn_text"].newValue == "PAUSE") {
      interval = setInterval(run_timer, 1000);
      local_btn_text = "PAUSE";
    } else if (changes["btn_text"].newValue == "CONTINUE") {
      clearInterval(interval);
      local_btn_text = "CONTINUE";
    }
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
chrome.storage.sync.get("btn_text", function(result) {
  local_btn_text = result.btn_text;
});
chrome.storage.onChanged.addListener(configure_timer);

function check_if_new_day() {
  var today_date = new Date();
  var stored_date;
  chrome.storage.sync.get("current_date", function(result) {
    stored_date = result.current_date;
  });

  if (
    !(
      today_date.getDate() == stored_date.getDate() &&
      today_date.getMonth() == stored_date.getMonth() &&
      today_date.getFullYear() == stored_date.getFullYear()
    )
  ) {
    /*
    MISSING: if decided to add storing feature, include the storage of current time into database here 
    */
    // they all dont match thus it is the first time being opened today
    local_min = 0;
    local_sec = 0;
    local_btn_text = "START";
    chrome.storage.sync.set({
      btn_text: "START",
      timer_min: 0,
      timer_sec: 0,
      current_date: today
    });
  }
}
