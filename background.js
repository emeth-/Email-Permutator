
function send_to_tab(data, tab_id) {
    chrome.tabs.sendMessage(parseInt(tab_id), data, function(response) {
        console.log("Sent to tab...", data);
    });
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if ("dns_check" in message) {
        //Gotta do this here, because it's http and linkedin is https
        $.ajax({
            url:"http://viewdns.info/reversewhois/?q="+message['dns_check'],
            type:'GET',
            current_email: message['dns_check'],
            tab_id: sender.tab.id,
            success: function(data){
                var domain_results = data.split('Reverse Whois results for')[1].split('domains that matched this search query')[0].split('There are')[1].trim();
                console.log("DNS check for", this.current_email, domain_results)
                //Note, if this api goes down, swap to http://www.whoismind.com/email/myemail@gmail.com.html
                domain_results = parseInt(domain_results);
                if (domain_results > 0) {
                    send_to_tab({found_email_dns: this.current_email}, this.tab_id);
                }
            },
            cache: false
        });
    }
    if ("my_tab_id" in message) {
        send_to_tab({"tab_id": sender.tab.id}, sender.tab.id);
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
                    tab_id = parser.search.split('tab_id=')[1].split('&')[0]

                    send_to_tab({found_email: email}, tab_id);
                }
            });
        }
    }, {
        urls: ["*://*/*"]
    }, ['responseHeaders']
);
