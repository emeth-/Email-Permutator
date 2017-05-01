chrome.browserAction.setIcon({
    path: 'img/circleLogo.png'
});


function send_to_tab() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {trigger_extractor: "doit"}, function(response) {
            console.log(response.farewell);
        });
    });
}

chrome.browserAction.onClicked.addListener(send_to_tab);

