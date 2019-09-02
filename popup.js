var timer_hr_local;
var timer_min_local;
var timer_sec_local;
var timer_state;
var timer_run_interval;

// indicate to background.js that popup.html has opened and receive current timer values
// then begin timer
function establish_connection(port) {
  port.postMessage({ msg: "hello man" });
  port.onMessage.addListener(function(msg) {
    timer_hr_local = msg.timer_hr;
    timer_min_local = msg.timer_min;
    timer_sec_local = msg.timer_sec;
    timer_state = msg.btn_text;

    console.log(
      "GOTTEEEE" +
        timer_state +
        "Eeee" +
        timer_min_local +
        ":" +
        timer_sec_local
    );
    update_timer_values(); // update the timer values showin in popup.html according to local values
    set_initial_btn_text(); // update the text in the button in popup.html and run/stop timer if required
  });
}

// Based on the local timer state value, set the html button text and configure the
// displayed timer accordingly
function set_initial_btn_text() {
  if (timer_state != "START") {
    if (timer_state == "PAUSE") {
      timer_state = "CONTINUE";
      change_btn_text();
    }
  }
  var btn_node = document.querySelector("#btn_text");
  btn_node.removeChild(btn_node.firstChild);
  btn_node.appendChild(document.createTextNode(timer_state));
}

// update timer and then show current timer values on popup.html
function run_timer() {
  if (timer_sec_local == 59) {
    timer_min_local++;
    timer_sec_local = 0;
  } else {
    timer_sec_local++;
  }
  if (timer_min_local == 60) {
    timer_hr_local++;
    timer_min_local = 0;
  }
  update_timer_values();
}

// run timer if timer state is pause or if it is continue, then stop the timer
function configure_timer() {
  if (timer_state == "PAUSE") {
    timer_run_interval = setInterval(run_timer, 1000);
  } else if (timer_state == "CONTINUE") {
    clearInterval(timer_run_interval);
  }
}

// update the text on button in popup.html
function change_btn_text() {
  var btn_text = document.querySelector("#btn_text");
  var new_text_node;
  if (btn_text.firstChild.textContent == "START") {
    new_text_node = document.createTextNode("PAUSE");
    timer_state = "PAUSE";
  } else if (btn_text.firstChild.textContent == "PAUSE") {
    new_text_node = document.createTextNode("CONTINUE");
    timer_state = "CONTINUE";
  } else {
    new_text_node = document.createTextNode("PAUSE");
    timer_state = "PAUSE";
  }
  configure_timer();
  btn_text.removeChild(btn_text.firstChild);
  btn_text.appendChild(new_text_node);
  chrome.storage.sync.set({
    btn_text: btn_text.firstChild.textContent,
    timer_hr: timer_hr_local,
    timer_min: timer_min_local,
    timer_sec: timer_sec_local
  });
}

chrome.runtime.sendMessage({ msg: "popup_open" });
chrome.runtime.onConnect.addListener(establish_connection);

var btn_clicked = document.querySelector("#start_timer_btn");
btn_clicked.addEventListener("click", change_btn_text, false);
