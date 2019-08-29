var GoogleAuth; // Google Auth object.
function initClient() {
  gapi.client
    .init({
      apiKey: "YOUR_API_KEY",
      clientId: "YOUR_CLIENT_ID",
      scope: "https://www.googleapis.com/auth/youtube.force-ssl",
      discoveryDocs: [
        "https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"
      ]
    })
    .then(function() {
      GoogleAuth = gapi.auth2.getAuthInstance();

      // Listen for sign-in state changes.
      GoogleAuth.isSignedIn.listen(updateSigninStatus);
    });
}
