var timer_min;
var timer_sec;

// indicate to background.js that popup.html has opened and receive current timer values
function establish_connection(port) {
  port.postMessage({ msg: "hello man" });
  port.onMessage.addListener(function(msg) {
    timer_min = msg.timer_min;
    timer_sec = msg.timer_sec;
    console.log(timer_min + ":" + timer_sec);
    setInterval(update_timer, 1000);
  });
}

// show current timer values on popup.html and then update it
function update_timer() {
  var timer_text = document.querySelectorAll("span");
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

// update the text on button in popup.html
function change_btn_text() {
  var btn_text = document.querySelector("#btn_text");
  var new_text_node;
  if (btn_text.firstChild.textContent == "START") {
    new_text_node = document.createTextNode("PAUSE");
  } else if (btn_text.firstChild.textContent == "PAUSE") {
    new_text_node = document.createTextNode("CONTINUE");
  } else {
    new_text_node = document.createTextNode("PAUSE");
  }
  btn_text.removeChild(btn_text.firstChild);
  btn_text.appendChild(new_text_node);
  chrome.storage.sync.set({ btn_text: btn_text.firstChild.textContent });
}

chrome.runtime.sendMessage({ msg: "pop" });
chrome.runtime.onConnect.addListener(establish_connection);

var btn_clicked = document.querySelector("button");
btn_clicked.addEventListener("click", change_btn_text, false);
