// establish connection with popup if it is open

function establishLongConnection() {
  var port = chrome.runtime.connect({ name: "timer_request" });
  port.onMessage.addListener(function(msg) {
    alert(msg.msg);
  });
  port.onDisconnect.addListener(function() {
    alert("disconnected");
  });
}

chrome.runtime.onMessage.addListener(function(request, sender) {
  if (request.msg == "pop") {
    // alert("its open");
    establishLongConnection();
  }
});
