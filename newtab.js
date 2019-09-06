// on storage change update timer

document.addEventListener("DOMContentLoaded", function(event) {
  // first ask background for timer
  var interval;
  var remaining_time;
  var timer_goal;

  var local_btn_text, timer_hr_local, timer_min_local, timer_state;

  var goal = document.querySelector("#goal_input");
  chrome.storage.sync.get("goal", function(result) {
    if (result.goal != -1) {
      // goal already set
      goal.value = result.goal;
      goal.setAttribute("disabled", "true");
      timer_goal = result.goal;
      remaining_time = parseFloat(timer_goal) * 60;
      document.querySelector("#timer_container").style.visibility = "visible";
    } else {
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
            update_timer_values(
              parseInt(parseInt(remaining_time / 60)),
              parseInt(remaining_time % 60)
            );
            document.querySelector("#timer_container").style.visibility =
              "visible";
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

    document.querySelector("#timer_container").style.color =
      "rgb(" +
      (255 -
        Math.round(color_value * 255) +
        "," +
        Math.round(color_value * 128) +
        ",0)");
  }

  // indicate to background.js that popup.html has opened and receive current timer values
  // then begin timer
  function establish_connection(port) {
    console.log("here now");
    port.onMessage.addListener(function(msg) {
      if (msg.id == "bg") {
        console.log("time changed" + msg.timer_min + msg.timer_hr);
        console.log(msg);

        // hr
        // min
        // timer_goal

        var remaining_hr = parseInt(timer_goal) - msg.timer_hr;
        var remaining_min = (Math.round(timer_goal * 60) % 60) - msg.timer_min;

        console.log("rem hr" + remaining_hr);
        console.log("rem min" + remaining_min);

        if (remaining_hr == 0 && remaining_min == 0) {
          chrome.notifications.create({
            type: "basic",
            iconUrl: "icon.png",
            title: "Well Done",
            message: "Today's Goal Accomplished"
          });
          update_timer_values(remaining_hr, remaining_min);
        } else {
          if (remaining_min == 00 && remaining_hr != 0) {
            update_timer_values(--remaining_hr, 59);
          } else {
            update_timer_values(remaining_hr, remaining_min);
          }

          console.log(parseInt(remaining_time / 60));
        }
      }
    });
  }
  document.querySelector("button").addEventListener("click", function(event) {
    document.querySelector("#options_overlay").style.display = "block";
  });
  var temp_pomodoro_option;

  document
    .querySelector("#quit_btn")
    .addEventListener("click", function(event) {
      chrome.storage.sync.set({ pomodoro: temp_pomodoro_option }, function() {
        document.querySelector("#options_overlay").style.display = "none";
      });
    });

  chrome.storage.sync.get("pomodoro", function(result) {
    var pomodoro_value;
    var html_pomodoro_option_text;

    pomodoro_value = result.pomodoro;
    console.log(parseInt(pomodoro_value) > 0);

    temp_pomodoro_option = pomodoro_value;

    if (parseInt(pomodoro_value) > 0) {
      html_pomodoro_option_text = "ON";
      document.querySelector("#pomodoro_value").disabled = false;
    } else {
      html_pomodoro_option_text = "OFF";
      document.querySelector("#pomodoro_value").disabled = true;
    }

    console.log(html_pomodoro_option_text);

    var pomodoro_on_or_off = document.querySelector("#chosen_pomodoro_option");

    var pomodoro_option = document.createTextNode(html_pomodoro_option_text);
    if (pomodoro_on_or_off.firstChild) {
      pomodoro_on_or_off.removeChild(pomodoro_on_or_off.firstChild);
    }
    pomodoro_on_or_off.appendChild(pomodoro_option);

    document
      .querySelector("#pomodoro_option")
      .addEventListener("click", function(event) {
        pomodoro_on_or_off.removeChild(pomodoro_on_or_off.firstChild);
        temp_pomodoro_option *= -1;
        if (temp_pomodoro_option > 0) {
          pomodoro_on_or_off.appendChild(document.createTextNode("ON"));
          document.querySelector("#pomodoro_value").disabled = false;
        } else {
          pomodoro_on_or_off.appendChild(document.createTextNode("OFF"));
          document.querySelector("#pomodoro_value").disabled = true;
        }
      });

    document
      .querySelector("#pomodoro_value")
      .appendChild(document.createTextNode(pomodoro_value));
  });

  chrome.runtime.sendMessage({ msg: "newtab_open" });
  chrome.runtime.onConnect.addListener(establish_connection);
});
