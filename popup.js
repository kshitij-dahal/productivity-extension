// connect with background.js to receive timer information
/*var port = chrome.runtime.connect({ name: "timer_request" });
port.onMessage.addListener(function(msg) {
  var timer_min = msg.getMinutes();
  var timer_sec = msg.getSeconds();
  alert(timer_min);
  alert(timer_sec);
});
chrome.runtime.onConnect.addListener(function(port) {
    port.postMessage(new Date());
  });
  */

chrome.runtime.sendMessage({ msg: "pop" });
chrome.runtime.onConnect.addListener(function(port) {
  port.postMessage({ msg: "hello man" });
});

var btn_clicked = document.querySelector("button");
btn_clicked.addEventListener("click", change_btn_text, false);

function change_btn_text() {
  var btn_text = document.querySelector("#btn_text");
  if (btn_text.innerHTML == "START") {
    btn_text.innerHTML = "PAUSE";
  } else if (btn_text.innerHTML == "PAUSE") {
    btn_text.innerHTML = "CONTINUE";
  } else {
    btn_text.innerHTML = "PAUSE";
  }
}
