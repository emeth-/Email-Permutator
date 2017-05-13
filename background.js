chrome.browserAction.setIcon({
    path: 'img/circleLogo.png'
});


function send_to_tab() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {trigger_extractor: "doit"}, function(response) {
            console.log("done!");
        });
    });
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    console.log("sb1", typeof(message.badgetext), message.badgetext);
    if ("badgetext" in message) {
        chrome.browserAction.setBadgeText({text: message.badgetext});
    }
});


chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason.search(/install/g) === -1) return;
    chrome.runtime.openOptionsPage();
});


chrome.browserAction.onClicked.addListener(send_to_tab);

var requestFilter = {
    urls: [ "<all_urls>" ]
  },
  extraInfoSpec = ['requestHeaders','blocking'],
  handler = function( details ) {

    var headers = details.requestHeaders,
      blockingResponse = {};

    if (details.url.indexOf('https://mail.google.com/mail/gxlu?email=') !== -1) {
        for( var i = 0, l = headers.length; i < l; ++i ) {
          if( headers[i].name == 'Cookie' ) {
            headers[i].value = '';
            break;
          }
        }
    }

    blockingResponse.requestHeaders = headers;
    return blockingResponse;
  };

chrome.webRequest.onBeforeSendHeaders.addListener( handler, requestFilter, extraInfoSpec );










chrome.webRequest.onHeadersReceived.addListener(
    function (details) {
        if (details.url.indexOf('https://mail.google.com/mail/gxlu?email=') !== -1) {
            details.responseHeaders.forEach(function(responseHeader){
                if (responseHeader.name.toLowerCase() === "set-cookie") {

                    var parser = document.createElement('a');
                    //parser.href = "https://mail.google.com/mail/gxlu?email=bobdole@gmail.com&_=1494707114226";
                    parser.href = details.url;
                    email = parser.search.split('email=')[1].split('&')[0]

                    console.log("VICTORY", responseHeader.value)

                    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                        chrome.tabs.sendMessage(tabs[0].id, {found_email: email}, function(response) {
                            console.log("done!");
                        });
                    });
                }
            });
        }
    }, {
        urls: ["*://*/*"]
    }, ['responseHeaders']
);
