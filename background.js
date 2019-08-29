// establish connection with popup if it is open
chrome.runtime.onInstalled.addListener(function(info) {
  if (info.reason == "install" || info.reason == "update") {
    chrome.storage.sync.set({
      btn_text: "START",
      timer_min: 0,
      timer_sec: 0
    });
  }
});
var local_min;
chrome.storage.sync.get("timer_min", function(result) {
  local_min = result.timer_min;
});
var local_sec;
chrome.storage.sync.get("timer_sec", function(result) {
  local_sec = result.timer_sec;
});

function establish_long_connection() {
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

function run_timer() {
  if (local_sec == 59) {
    local_min++;
    local_sec = 0;
  } else {
    local_sec++;
  }
  console.log(local_min, local_sec);
}

function send_timer_info(port) {
  port.postMessage({ timer_min: local_min, timer_sec: local_sec });
}

chrome.runtime.onMessage.addListener(function(request, sender) {
  if (request.msg == "pop") {
    // alert("its open");
    establish_long_connection();
  }
});
