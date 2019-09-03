// on storage change update timer
// first ask background for timer
var interval;
var remaining_time;
var timer_goal;

var local_btn_text,
  timer_hr_local,
  timer_min_local,
  timer_sec_local,
  timer_state;

var goal = document.querySelector("#goal_input");
chrome.storage.sync.get("goal", function(result) {
  if (result.goal != -1) {
    // goal already set
    goal.value = result.goal;
    goal.setAttribute("disabled", "true");
    timer_goal = result.goal;
    remaining_time = parseFloat(timer_goal) * 60;
  } else {
    goal.addEventListener("keydown", function(event) {
      if (event.keyCode === 13) {
        event.preventDefault();
        var text = goal.value;
        goal.setAttribute("disabled", "true");
        chrome.storage.sync.set({ goal: text }, function() {
          remaining_time = parseFloat(text) * 60;
          timer_goal = text;
          update_timer_values(
            parseInt(remaining_time / 60),
            parseInt(remaining_time % 60)
          );
        });
      }
    });
  }
});

// update timer values in popup.html
function update_timer_values(hr_local, min_local) {
  var hr_element = document.querySelector("#hr_val_rem");
  var min_element = document.querySelector("#min_val_rem");
  var min_text, hr_text;

  hr_text = return_formatted_timer_text_node(hr_local);
  min_text = return_formatted_timer_text_node(min_local);

  hr_element.removeChild(hr_element.firstChild);
  hr_element.appendChild(hr_text);
  min_element.removeChild(min_element.firstChild);
  min_element.appendChild(min_text);
}

// indicate to background.js that popup.html has opened and receive current timer values
// then begin timer
function establish_connection(port) {
  console.log("here now");
  port.onMessage.addListener(function(msg) {
    console.log("time changed" + msg.timer_min + msg.timer_hr);
    console.log(msg);
    remaining_time =
      60 * parseFloat(timer_goal) -
      60 * parseInt(msg.timer_hr) -
      parseInt(msg.timer_min);

    console.log(parseInt(remaining_time / 60));

    update_timer_values(
      parseInt(parseInt(remaining_time) / 60),
      parseInt(remaining_time) % 60
    );
  });
}

chrome.runtime.sendMessage({ msg: "newtab_open" });
chrome.runtime.onConnect.addListener(establish_connection);
