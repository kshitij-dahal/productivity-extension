// returns a formatted text node based on whether the values of timer_val is
// less than 10 in order to make it two digits
function return_formatted_timer_text_node(timer_val) {
  if (timer_val < 10) {
    return document.createTextNode("0" + timer_val);
  } else {
    return document.createTextNode(timer_val);
  }
}

// update timer values in popup.html
function update_timer_values() {
  var hr_element = document.querySelector("#hr_val");
  var min_element = document.querySelector("#min_val");
  var sec_element = document.querySelector("#sec_val");
  var min_text, sec_text, hr_text;

  hr_text = return_formatted_timer_text_node(timer_hr_local);
  min_text = return_formatted_timer_text_node(timer_min_local);
  sec_text = return_formatted_timer_text_node(timer_sec_local);

  hr_element.removeChild(hr_element.firstChild);
  hr_element.appendChild(hr_text);
  min_element.removeChild(min_element.firstChild);
  min_element.appendChild(min_text);
  sec_element.removeChild(sec_element.firstChild);
  sec_element.appendChild(sec_text);
}
