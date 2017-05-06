// Enable Time Duration?
// Change Icon???
// IconTextBackgroundColor
// Enable Tab+Screen

chrome.storage.sync.get(null, function(items) {

    if (items['email_address_results']) {
        document.getElementById('email_address_results').value = items['email_address_results'];
    } else {
        chrome.storage.sync.set({
            email_address_results: 'simonsaunders7@gmail.com'
        }, function() {
            document.getElementById('email_address_results').value = 'simonsaunders7@gmail.com';
        });
    }

    if (items['max_num_search_pages']) {
        document.getElementById('max_num_search_pages').value = items['max_num_search_pages'];
    } else {
        chrome.storage.sync.set({
            max_num_search_pages: '40'
        }, function() {
            document.getElementById('max_num_search_pages').value = '40';
        });
    }

    if (items['liextractor_api_url']) {
        document.getElementById('liextractor_api_url').value = items['liextractor_api_url'];
    } else {
        chrome.storage.sync.set({
            liextractor_api_url: 'https://li-ex1.herokuapp.com'
        }, function() {
            document.getElementById('liextractor_api_url').value = 'https://li-ex1.herokuapp.com';
        });
    }

});


document.getElementById('liextractor_api_url').onblur = function() {
    this.disabled = true;
    showSaving();
    chrome.storage.sync.set({
        liextractor_api_url: this.value
    }, function() {
        document.getElementById('liextractor_api_url').disabled = false;
        hideSaving();
    });
};


document.getElementById('max_num_search_pages').onblur = function() {
    this.disabled = true;
    showSaving();
    chrome.storage.sync.set({
        max_num_search_pages: this.value
    }, function() {
        document.getElementById('max_num_search_pages').disabled = false;
        hideSaving();
    });
};

document.getElementById('email_address_results').onblur = function() {
    this.disabled = true;
    showSaving();
    chrome.storage.sync.set({
        email_address_results: this.value
    }, function() {
        document.getElementById('email_address_results').disabled = false;
        hideSaving();
    });
};

function showSaving() {
    document.getElementById('applying-changes').style.display = 'block';
}

function hideSaving() {
    setTimeout(function() {
        document.getElementById('applying-changes').style.display = 'none';
    }, 700);
}

function getChromeVersion() {
    var raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
    return raw ? parseInt(raw[2], 10) : 52;
}
