$(function(){

    chrome.identity.onSignInChanged.addListener(function(account, signedIn){
        console.log("account:");
        console.log(account);
        console.log("signedIn");
        console.log(signedIn);
    });

    // chrome.identity.getAuthToken({interactive:true/* details */},
    chrome.identity.getAuthToken({/* details */}, function (access_token) {
      if (chrome.runtime.lastError) {
        callback(chrome.runtime.lastError);
        return;
      }

    const url = "https://www.googleapis.com/drive/v3/files?pageSize=10";

    $.ajax({
      url: url,
      beforeSend: function(request) {
      request.setRequestHeader("Authorization", 'Bearer ' + access_token);
      },
      success: function(data){
        console.log(data);
      }
    });
  });
});
