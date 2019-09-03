// returns a formatted text node based on whether the values of timer_val is
// less than 10 in order to make it two digits
function return_formatted_timer_text_node(timer_val) {
  if (timer_val < 10) {
    return document.createTextNode("0" + timer_val);
  } else {
    return document.createTextNode(timer_val);
  }
}
