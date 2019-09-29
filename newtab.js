// ensure document is loaded
document.addEventListener("DOMContentLoaded", function(event) {
  var local_goal_set_timer_values = -22;
  var timer_goal = -1;
  var remaining_hr;
  var remaining_min;
  var temp_pomodoro_option;
  var html_pomodoro_option_text;
  var pomodoro_on_or_off_element = document.querySelector(
    "#chosen_pomodoro_option"
  );
  var goal = document.querySelector("#goal_input");
  var total_remaining_time_element = document.querySelector("#timer_container");
  var pomodoro_interval_element = document.querySelector("#interval");
  var pomodoro_option_element = document.querySelector("#pomodoro_option");

  // if pom on or off is clicked, toggle its value and temp save the option
  document
    .querySelector("#pomodoro_option")
    .addEventListener("click", function(event) {
      pomodoro_on_or_off_element.removeChild(
        pomodoro_on_or_off_element.firstChild
      );
      temp_pomodoro_option *= -1;
      if (temp_pomodoro_option > 0) {
        pomodoro_on_or_off_element.appendChild(document.createTextNode("ON"));
        document.querySelector("#pomodoro_value").disabled = false;
      } else {
        pomodoro_on_or_off_element.appendChild(document.createTextNode("OFF"));
        document.querySelector("#pomodoro_value").disabled = true;
      }
    });

  // on opening of tab, save the temp pom value
  console.log("got to hererere");
  document
    .querySelector("#pomodoro_value")
    .appendChild(document.createTextNode(temp_pomodoro_option));

  chrome.storage.sync.get("goal_set_timer_values", function(result) {
    local_goal_set_timer_values = result.goal_set_timer_values;
  });

  console.log(html_pomodoro_option_text);

  // update whether pom is on or off
  var pomodoro_option = document.createTextNode(html_pomodoro_option_text);
  if (pomodoro_on_or_off_element.firstChild) {
    pomodoro_on_or_off_element.removeChild(
      pomodoro_on_or_off_element.firstChild
    );
  }
  pomodoro_on_or_off_element.appendChild(pomodoro_option);

  // indicate to background.js that new tab has been opened
  chrome.runtime.sendMessage({ msg: "newtab_open" });
  chrome.runtime.onConnect.addListener(establish_connection);

  // indicate to background.js that newtab.html has opened and receive current timer values
  // to calculate and then display remaining time
  function establish_connection(port) {
    console.log("here now");
    port.onMessage.addListener(function(msg) {
      if (msg.id == "newtab_opened" || msg.id == "goal_set") {
        chrome.storage.sync.get(
          ["goal", "goal_set_timer_values", "pomodoro"],
          function(result) {
            if (msg.id == "goal_set") {
              local_goal_set_timer_values =
                Math.round(timer_goal * 60 * 60) +
                msg.timer_hr * 60 * 60 +
                msg.timer_min * 60 +
                msg.timer_sec;
              chrome.storage.sync.set(
                { goal_set_timer_values: local_goal_set_timer_values },
                function() {
                  update_initial_values(msg, result);
                }
              );
            } else {
              update_initial_values(msg, result);
            }
          }
        );
      } else if (msg.id == "newtab_rem_time_change") {
        console.log(
          "timechange rem hr" + remaining_hr + "rem min" + remaining_min
        );
        if (remaining_min == 0) {
          remaining_min = 59;
          update_remaining_time(--remaining_hr, remaining_min);
        } else {
          update_remaining_time(remaining_hr, --remaining_min);
          // if goal is accomplished, show notif and flashing text
          if (remaining_hr == 0 && remaining_min == 0) {
            chrome.notifications.create({
              type: "basic",
              iconUrl: "icon.png",
              title: "Well Done",
              message: "Today's Goal Accomplished"
            });
            // check if popup open and then click button to pause
            chrome.runtime.sendMessage({ msg: "update_newtab" });
            chrome.storage.sync.set({ btn_text: "CONTINUE" }, function() {
              timer_goal = -1;
              chrome.storage.sync.set({ goal: -1 }, function() {
                goal.removeAttribute("disabled");
                goal.value = "";
                flip_visibility();
                console.log("haha" + goal.disabled);
              });
            });
          }
          console.log(
            "timer values are sent the time at which" +
              local_goal_set_timer_values
          );
          console.log(msg);
          // if statement prevents timer values from being sent multiple times
        }
      }
    });
  }

  function update_initial_values(msg, result) {
    update_timer_goal(msg.timer_hr, msg.timer_min, result);
    console.log("time changed" + msg.timer_min + msg.timer_hr);
    console.log(
      "the timervalue at which the goal is met" + local_goal_set_timer_values
    );
    console.log(msg);
    console.log("this is the goal:" + timer_goal);
    temp_pomodoro_option = result.pomodoro;
    remaining_hr =
      timer_goal == -1
        ? -1
        : parseInt(
            (local_goal_set_timer_values -
              msg.timer_hr * 60 * 60 -
              msg.timer_min * 60 -
              msg.timer_sec) /
              3600
          );
    remaining_min =
      timer_goal == -1
        ? -1
        : parseInt(
            (local_goal_set_timer_values -
              msg.timer_hr * 60 * 60 -
              msg.timer_min * 60 -
              msg.timer_sec +
              59) /
              60
          ) % 60;

    console.log("rem hr" + remaining_hr);
    console.log("rem min" + remaining_min);

    update_remaining_time(remaining_hr, remaining_min);
    update_pomodoro_value();
  }

  // check if goal is set, if not set,
  // then show remaining time
  function update_timer_goal(current_timer_hr, current_timer_min, result) {
    console.log("herer to update timer goal");
    console.log("apparently the goal is " + result.goal);
    timer_goal = result.goal;
    if (result.goal != -1) {
      // goal already set
      goal.value = result.goal;
      goal.setAttribute("disabled", "true");
      timer_goal = result.goal;
      if (total_remaining_time_element.style.visibility != "visible")
        flip_visibility();
      console.log("FLIPEED HERERE");
    } else {
      // wait for enter key being pressed
      goal.addEventListener("keydown", function(event) {
        if (event.keyCode === 13) {
          event.preventDefault();
          var text = goal.value;
          goal.setAttribute("disabled", "true");
          console.log("this is the goal" + text);
          // calculate remaining time based on current time
          chrome.storage.sync.set({ goal: text }, function() {
            timer_goal = text;
            chrome.runtime.sendMessage({ msg: "send_cur_timer_values" });
          });
        }
      });
    }
  }

  //update_timer_goal();
  // update remaining time values and colour
  function update_remaining_time(hr_local, min_local) {
    var hr_element = document.querySelector("#hr_val_rem");
    var min_element = document.querySelector("#min_val_rem");
    var min_text, hr_text;

    hr_text = return_formatted_timer_text_node(hr_local);
    min_text = return_formatted_timer_text_node(min_local);

    hr_element.removeChild(hr_element.firstChild);
    hr_element.appendChild(hr_text);
    min_element.removeChild(min_element.firstChild);
    min_element.appendChild(min_text);

    var color_value =
      (Math.round(timer_goal * 60) -
        (60 * parseInt(hr_local) + parseInt(min_local))) /
      Math.round(timer_goal * 60);

    console.log(
      "color value" +
        color_value +
        "timer_goal" +
        timer_goal +
        "hr" +
        hr_local +
        "min" +
        min_local
    );

    console.log(
      "rgb(" +
        (255 -
          2 * Math.round(color_value * 128) +
          "," +
          Math.round(color_value * 128) +
          ",0)")
    );

    total_remaining_time_element.style.color =
      "rgb(" +
      (255 -
        Math.round(color_value * 255) +
        "," +
        Math.round(color_value * 128) +
        ",0)");
  }

  function update_pomodoro_value() {
    console.log(parseInt(temp_pomodoro_option) > 0);

    // if pomodoro is off, still show positive num value as mins
    document.querySelector("#pomodoro_value").value =
      temp_pomodoro_option > 0
        ? temp_pomodoro_option
        : -1 * temp_pomodoro_option;

    // disable changing pom value if it is off
    if (parseInt(temp_pomodoro_option) > 0) {
      html_pomodoro_option_text = "ON";
      document.querySelector("#pomodoro_value").disabled = false;
    } else {
      html_pomodoro_option_text = "OFF";
      document.querySelector("#pomodoro_value").disabled = true;
    }

    function flip_visibility() {
      if (total_remaining_time_element.style.visibility == "visible") {
        total_remaining_time_element.style.visibility = "hidden";
        pomodoro_interval_element.style.visibility = "visible";
        pomodoro_option_element.style.visibility = "visible";
      } else {
        total_remaining_time_element.style.visibility = "visible";
        pomodoro_interval_element.style.visibility = "hidden";
        pomodoro_option_element.style.visibility = "hidden";
      }
    }
  }

  // only allow settings overlay to be accessed if goal is not set
  /*
  document.querySelector("button").addEventListener("click", function(event) {
    if (timer_goal == null || timer_goal == -1) {
      chrome.storage.sync.get("pomodoro", function(result) {
        temp_pomodoro_option = result.pomodoro;
        //  document.querySelector("#options_overlay").style.display = "block";
      });
    }
  });
  */

  /* // save pom info when settings is quit
  document
    .querySelector("#quit_btn")
    .addEventListener("click", function(event) {
      temp_pomodoro_option =
        temp_pomodoro_option > 0
          ? document.querySelector("#pomodoro_value").value
          : -1 * document.querySelector("#pomodoro_value").value;
      chrome.storage.sync.set({ pomodoro: temp_pomodoro_option }, function() {
        document.querySelector("#options_overlay").style.display = "none";
      });
    });
    */
});
