// ensure document is loaded
document.addEventListener("DOMContentLoaded", function(event) {
  // first ask background for timer
  var interval;
  var remaining_time;
  var timer_goal;
  var temp_pomodoro_option;
  var html_pomodoro_option_text;
  var pomodoro_on_or_off_element = document.querySelector(
    "#chosen_pomodoro_option"
  );
  var goal = document.querySelector("#goal_input");
  var total_remaining_time_element = document.querySelector("#timer_container");

  // check if goal is set, if not set it
  // then show remaining time
  function update_timer_goal() {
    chrome.storage.sync.get("goal", function(result) {
      timer_goal = result.goal;
      if (result.goal != -1) {
        // goal already set
        goal.value = result.goal;
        goal.setAttribute("disabled", "true");
        timer_goal = result.goal;
        remaining_time = parseFloat(timer_goal) * 60;
        total_remaining_time_element.style.visibility = "visible";
      } else {
        // wait for enter key being pressed
        goal.addEventListener("keydown", function(event) {
          if (event.keyCode === 13) {
            event.preventDefault();
            var text = goal.value;
            goal.setAttribute("disabled", "true");
            chrome.storage.sync.set({ goal: text }, function() {
              remaining_time = Math.round(parseFloat(text) * 60);
              console.log(
                "remaining_time is hhere " +
                  remaining_time +
                  "and hr" +
                  parseInt(remaining_time / 60) +
                  "and min" +
                  (remaining_time % 60)
              );
              timer_goal = text;
              update_remaining_time(
                parseInt(parseInt(remaining_time / 60)),
                parseInt(remaining_time % 60)
              );
              total_remaining_time_element.style.visibility = "visible";
            });
          }
        });
      }
    });
  }

  update_timer_goal();
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

    255 * (parseFloat(remaining_time) / (parseFloat(timer_goal) * 60)); // goes from 1 to 0
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

  var goal_accomplished_interval;
  var number_of_flashes = 0;

  // indicate to background.js that newtab.html has opened and receive current timer values
  // to calculate and then display remaining time
  function establish_connection(port) {
    console.log("here now");
    port.onMessage.addListener(function(msg) {
      if (msg.id == "bg") {
        chrome.storage.sync.get("pomodoro", function(result) {
          console.log("time changed" + msg.timer_min + msg.timer_hr);
          console.log(msg);
          temp_pomodoro_option = result.pomodoro;

          var remaining_hr = parseInt(
            (Math.round(timer_goal * 60) - msg.timer_hr * 60 - msg.timer_min) /
              60
          );
          var remaining_min =
            (Math.round(timer_goal * 60) - msg.timer_hr * 60 - msg.timer_min) %
            60;

          console.log("rem hr" + remaining_hr);
          console.log("rem min" + remaining_min);

          update_remaining_time(remaining_hr, remaining_min);
          update_pomodoro_value();

          // if goal is accomplished, show notif and flashing text
          if (remaining_hr == 0 && remaining_min == 0) {
            chrome.notifications.create({
              type: "basic",
              iconUrl: "icon.png",
              title: "Well Done",
              message: "Today's Goal Accomplished"
            });
            if (number_of_flashes == 0) {
              timer_goal = -1;
              chrome.storage.sync.set({ goal: -1 }, function() {
                for (var x = 0; x < 11; x++) window.setTimeout(flash, 1000 * x);
                number_of_flashes++;
              });
              goal.removeAttribute("disabled");
              goal.value = "";
              console.log("haha" + goal.disabled);
            }
          }
        });
      }
    });
  }

  // switch the visibility of the remaining time display
  function flash() {
    console.log(number_of_flashes + "<-num of flashes");
    if (number_of_flashes == 6) clearInterval(goal_accomplished_interval);
    if (total_remaining_time_element.style.visibility == "visible") {
      total_remaining_time_element.style.visibility = "hidden";
    } else {
      total_remaining_time_element.style.visibility = "visible";
    }
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

    console.log(html_pomodoro_option_text);

    // update whether pom is on or off
    var pomodoro_option = document.createTextNode(html_pomodoro_option_text);
    if (pomodoro_on_or_off_element.firstChild) {
      pomodoro_on_or_off_element.removeChild(
        pomodoro_on_or_off_element.firstChild
      );
    }
    pomodoro_on_or_off_element.appendChild(pomodoro_option);
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
  document
    .querySelector("#pomodoro_value")
    .appendChild(document.createTextNode(temp_pomodoro_option));

  // indicate to background.js that new tab has been opened
  chrome.runtime.sendMessage({ msg: "newtab_open" });
  chrome.runtime.onConnect.addListener(establish_connection);
});
