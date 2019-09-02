// on storage change update timer
// first ask background for timer

var goal = document.querySelector("#goal_input");
chrome.storage.sync.get("goal", function(result) {
  if (result.goal != -1) {
    // goal already set
    goal.value = result.goal;
    goal.setAttribute("disabled", "true");
  } else {
    goal.addEventListener("keydown", function(event) {
      if (event.keyCode === 13) {
        event.preventDefault();
        var text = goal.value;
        goal.setAttribute("disabled", "true");
        chrome.storage.sync.set({ goal: text });
      }
    });
  }
});
