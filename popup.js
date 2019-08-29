// connect with background.js to receive timer information
/*var port = chrome.runtime.connect({ name: "timer_request" });
port.onMessage.addListener(function(msg) {
  var timer_min = msg.getMinutes();
  var timer_sec = msg.getSeconds();
  alert(timer_min);
  alert(timer_sec);
});
chrome.runtime.onConnect.addListener(function(port) {
    port.postMessage(new Date());
  });
  */

chrome.runtime.sendMessage({ msg: "pop" });
chrome.runtime.onConnect.addListener(function(port) {
  port.postMessage({ msg: "hello man" });
});
