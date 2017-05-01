chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.trigger_extractor == "doit") {
      is_loaded();
    }
});

//todo, update badge on icon with page number being scanned.

function is_loaded() {
    var search_result_total = jQuery('.search-results__total');
    if (search_result_total.length > 0) {
        console.log("not loaded...");
        setTimeout(function(){
            is_loaded();
        }, 300);
    }
    else {
        extract_data();
    }
}

function next_page() {
    jQuery(".results-paginator").find(".next").trigger('click');
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


    console.log("final data...", li_extractor_data);
}
var li_extractor_data = [];

$( document ).ready(function() {
    console.log( "page loaded..." );
    setInterval(function(){
        console.log("*****", jQuery('.search-results__total').length);
    }, 300);
});