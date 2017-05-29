chrome.browserAction.setIcon({
    path: 'img/circleLogo.png'
});


function send_to_tab_extension_clicked() {
    send_to_tab({trigger_extractor: "doit"});
}

function send_to_tab(data) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, data, function(response) {
            console.log("Sent to tab...", data);
        });
    });
}

chrome.browserAction.onClicked.addListener(send_to_tab_extension_clicked);

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if ("badgetext" in message) {
        chrome.browserAction.setBadgeText({text: message.badgetext});
    }
    else if ("dns_check" in message) {
        //Gotta do this here, because it's http and linkedin is https
        $.ajax({
            url:"http://viewdns.info/reversewhois/?q="+message['dns_check'],
            type:'GET',
            current_email: message['dns_check'],
            success: function(data){
                var domain_results = data.split('Reverse Whois results for')[1].split('domains that matched this search query')[0].split('There are')[1].trim();
                console.log("DNS check for", this.current_email, domain_results)
                //Note, if this api goes down, swap to http://www.whoismind.com/email/myemail@gmail.com.html
                domain_results = parseInt(domain_results);
                if (domain_results > 0) {
                    send_to_tab({found_email_dns: this.current_email});
                }
            },
            cache: false
        });
    }
});

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
            //Blank out user's logged in session for this request, as check doesn't work if they are already logged in.
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
                    //Method from here: https://blog.0day.rocks/abusing-gmail-to-get-previously-unlisted-e-mail-addresses-41544b62b2
                    //Gmail classified it as not a bug.

                    var parser = document.createElement('a');
                    //parser.href = "https://mail.google.com/mail/gxlu?email=bobdole@gmail.com&_=1494707114226";
                    parser.href = details.url;
                    email = parser.search.split('email=')[1].split('&')[0]

                    send_to_tab({found_email: email});
                }
            });
        }
    }, {
        urls: ["*://*/*"]
    }, ['responseHeaders']
);
