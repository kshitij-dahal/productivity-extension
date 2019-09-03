// returns a formatted text node based on whether the values of timer_val is
// less than 10 in order to make it two digits
function return_formatted_timer_text_node(timer_val) {
  if (timer_val < 10) {
    return document.createTextNode("0" + timer_val);
  } else {
    return document.createTextNode(timer_val);
  }
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
  update_timer_values(timer_hr_local, timer_min_local, timer_sec_local);
}
