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
