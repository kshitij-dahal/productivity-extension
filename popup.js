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

var timer_min;
var timer_sec;
chrome.runtime.sendMessage({ msg: "pop" });
chrome.runtime.onConnect.addListener(function(port) {
  port.postMessage({ msg: "hello man" });
  port.onMessage.addListener(function(msg) {
    timer_min = msg.timer_min;
    timer_sec = msg.timer_sec;
    console.log(timer_min + ":" + timer_sec);
    setInterval(update_timer, 1000);
  });
});

var timer_text;
function update_timer() {
  timer_text = document.querySelectorAll("span");
  var min_text, sec_text;
  if (timer_min < 10) {
    min_text = document.createTextNode("0" + timer_min);
  } else {
    min_text = document.createTextNode(timer_min);
  }
  if (timer_sec < 10) {
    sec_text = document.createTextNode("0" + timer_sec);
  } else {
    sec_text = document.createTextNode(timer_sec);
  }
  timer_text[1].removeChild(timer_text[1].firstChild);
  timer_text[3].removeChild(timer_text[3].firstChild);
  timer_text[1].appendChild(min_text);
  timer_text[3].appendChild(sec_text);
  if (timer_sec == 59) {
    timer_min++;
    timer_sec = 0;
  } else {
    timer_sec++;
  }
}

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
  chrome.storage.sync.set({ btn_text: btn_text.innerHTML });
}
