var running = 0;

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.trigger_extractor == "doit") {
        console.log("sb1 TRIGGERED");
        if (!running) {
            console.log("sb1.5 inner");
            running = 1;
            extract_data();
        }
        else {
            console.log("sb2 Nope...");
            running = 0;
        }
    }
});

//todo, update badge on icon with page number being scanned.

function next_page_loaded() {
    console.log("Next page loaded check!");
    if (jQuery('.search-results__total').length > 0) {
        console.log("Overall page is loaded...");
        //page is loaded
        if (jQuery('.search-is-loading.search-results-container').length) {
        console.log("aaaaa1");
            //Search results loading...
            setTimeout(function(){
                next_page_loaded();
            }, 300);
        }
        else {
        console.log("aaaaa2");
            //Search results completed loading!
            extract_data();
        }
    }
}

function next_page() {
    console.log("triggering next page...", running);
    var next_page_exists = true; //todo, if next button not found or otherwise on last page, stop.
    if (next_page_exists && running) {
        console.log("Next page triggered!");
        jQuery(".results-paginator").find(".next").trigger('click');
        setTimeout(function(){
            next_page_loaded();
        }, 1000);
    }
    else {
        //END
        alert("we done! Check console for final data.");
        console.log("**DONE", li_extractor_data);
        //todo, output excel spreadsheet here.
    }
}

function extract_data() {
    console.log("Time to extract 'dat data!");

    jQuery('.search-result__wrapper').each(function(){
        var person = {};
        person.name = jQuery(this).find('.actor-name').text().trim();
        person.image = jQuery(this).find('.search-result__image').find('img').attr('src');
        person.location = jQuery(this).find('.subline-level-2').text().trim();
        person.tagline = jQuery(this).find('.subline-level-1').text().trim();
        person.current_position = jQuery(this).find('.search-result__snippets').text().replace('Current:', '').trim();
        person.distance = jQuery(this).find('.dist-value').text().trim();
        person.title = "";
        person.company_name = "";
        if (person.current_position) {
            var comp_pieces = person.current_position.split(" at ");
            person.title = comp_pieces.shift(); //Drop title
            person.company_name = comp_pieces.join(" at ");
        }
        else {
            var comp_pieces = person.title.split(" at ");
            person.title = comp_pieces.shift(); //Drop title
            person.company_name = comp_pieces.join(" at ");
        }
        li_extractor_data.push(person);
    });

    next_page();
}
var li_extractor_data = [];

/*
$( document ).ready(function() {
    console.log( "page loaded..." );
    setInterval(function(){
        //search-results-container neptune-grid two-column search-is-loading
        console.log("*****", jQuery('.search-is-loading.search-results-container').length);
    }, 1000);
});
*/