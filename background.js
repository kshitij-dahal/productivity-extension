var local_min;
var local_sec;
var local_hr;
var local_btn_text;
var interval;

// upon first install, store 00:00 for value of timer in the storage
function store_initial_timer_values(info) {
  if (info.reason == "install" || info.reason == "update") {
    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth();
    var day = today.getDate();
    chrome.storage.sync.set({
      btn_text: "START",
      timer_hr: 0,
      timer_min: 0,
      timer_sec: 0,
      curr_year: year,
      curr_month: month,
      curr_date: day
    });
    console.log("stored it");
  }
}

// once a message is received from popup.js indicating that popup.html is open,
// open a long-lived channel to popup.js and send current timer value,
// then start the timer
function establish_long_connection(request, sender) {
  if (request.msg == "popup_open") {
    var port = chrome.runtime.connect({ name: "timer_request" });
    port.postMessage({
      btn_text: local_btn_text,
      timer_min: local_min,
      timer_sec: local_sec,
      timer_hr: local_hr
    });
    port.onMessage.addListener(function(msg) {
      console.log(msg.msg);
    });
    port.onDisconnect.addListener(function() {
      console.log("disconnected");
      chrome.storage.sync.get(
        ["timer_hr", "timer_min", "timer_sec", "btn_text"],
        function(result) {
          console.log(result.timer_hr);
          console.log(result.timer_min);
          console.log(result.timer_sec);
          console.log(result.btn_text);
        }
      );
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
  if (changes.hasOwnProperty("timer_hr")) {
    local_hr = changes["timer_hr"].newValue;
  }
  if (changes.hasOwnProperty("timer_min")) {
    local_min = changes["timer_min"].newValue;
  }
  if (changes.hasOwnProperty("timer_sec")) {
    local_sec = changes["timer_sec"].newValue;
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
  if (local_min == 60) {
    local_hr++;
    local_min = 0;
  }
  console.log(local_hr, local_min, local_sec);
}

chrome.runtime.onInstalled.addListener(store_initial_timer_values);
chrome.runtime.onMessage.addListener(check_if_new_day);
chrome.storage.sync.get("timer_hr", function(result) {
  local_hr = result.timer_hr;
});
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

function check_if_new_day(request, sender) {
  var today_date = new Date();
  console.log(
    "todays date not storage, first yr" +
      today_date.getFullYear() +
      "then month" +
      today_date.getMonth() +
      "then day" +
      today_date.getDate()
  );
  chrome.storage.sync.get(["curr_year", "curr_month", "curr_date"], function(
    result
  ) {
    console.log("currr yr" + result.curr_date);
    console.log("currr mnth" + result.curr_month);
    console.log("currr mndayth" + result.curr_year);

    if (
      !(
        today_date.getDate() == result.curr_date &&
        today_date.getMonth() == result.curr_month &&
        today_date.getFullYear() == result.curr_year
      )
    ) {
      reset_timer_today(request, sender, today_date);
    } else {
      establish_long_connection(request, sender);
    }
  });
}

function reset_timer_today(request, sender, today_date) {
  console.log("got hereere");
  var storage_key =
    "yr:" +
    today_date.getFullYear() +
    "month:" +
    today_date.getMonth() +
    "date:" +
    today_date.getDate();

  var storage_time = {
    hr: local_hr,
    min: local_min,
    sec: local_sec
  };

  // they all dont match thus it is the first time being opened today
  chrome.storage.sync.set(
    {
      btn_text: "START",
      timer_hr: 0,
      timer_min: 0,
      timer_sec: 0,
      timer_db: { storage_key: storage_time },
      curr_year: today_date.getFullYear(),
      curr_month: today_date.getMonth(),
      curr_date: today_date.getDate()
    },
    function() {
      local_hr = 0;
      local_min = 0;
      local_sec = 0;
      local_btn_text = "START";
      establish_long_connection(request, sender);
    }
  );
}
