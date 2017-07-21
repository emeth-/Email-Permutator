var running = 0;
var start_time = new Date().getTime();
var li_extractor_data = [];
var current_name;
var current_company;
var my_tab_id;

function get_domain(name, company_name) {
    console.log("get_domain", name, company_name);
    var original_company_name = company_name;
    company_name = company_name.replace(" Inc.", "");
    company_name = company_name.replace(" Inc", "");
    company_name = company_name.replace("LLC", "");
    company_name = $.trim(company_name);
    $.ajax({
        type: 'GET',
        url: "https://autocomplete.clearbit.com/v1/companies/suggest?query="+company_name,
        success: function(output, status, xhr) {

            console.log("sb3", output);
            //Attempt to get domain for exact match first
            for(var i=0; i<output.length; i++) {
                if (output[i]['name'] == original_company_name) {
                    return scan_for_emails(name, output[i]['domain']);
                }
            }

            //Attempt to get domain for near match
            for(var i=0; i<output.length; i++) {
                if (output[i]['name'] == company_name) {
                    return scan_for_emails(name, output[i]['domain']);
                }
            }

            //Screw it, let's just get the first result.
            for(var i=0; i<output.length; i++) {
                return scan_for_emails(name, output[i]['domain']);
            }
        },
        cache: false
    });
}

function scan_for_emails(name, domain) {
    var n = {
        "first_name": "",
        "first_initial": "",
        "last_name": "",
        "last_initial": "",
    };
    var possibilities = [
        "{fn}{ln}",
        "{fn}.{ln}",
        "{fi}{ln}",
        "{fn}",
        "{fn}{li}",
    ];

    var name_pieces = name.split(" ");
    n['first_name'] = name_pieces[0]
    n['first_initial'] = name_pieces[0][0]

    if (name_pieces.length > 1) {
        n['last_name'] = name_pieces[name_pieces.length-1].replace(".", "")
        n['last_initial'] = name_pieces[name_pieces.length-1][0]
    }

    var emails = [];
    for (var i=0; i<possibilities.length; i++) {
        var new_e = possibilities[i];
        new_e = new_e.replace("{fn}", n['first_name']);
        new_e = new_e.replace("{ln}", n['last_name']);
        new_e = new_e.replace("{fi}", n['first_initial']);
        new_e = new_e.replace("{li}", n['last_initial']);
        new_e = new_e + "@"+domain;
        emails.push(new_e.toLowerCase());
    }
    console.log("attempted emails...", emails);
    var ms_delay = 0;
    for(var i=0; i<emails.length; i++) {
        $.ajax({
            type: 'GET',
            url: "https://mail.google.com/mail/gxlu?email="+emails[i]+"&tab_id="+my_tab_id,
            success: function(output, status, xhr) {
                //results checked in background.js
            },
            cache: false
        });

        $.ajax({
            type: 'GET',
            url: "https://api.github.com/search/commits?q=committer-email:"+emails[i],
            beforeSend: function(xhr){
                xhr.setRequestHeader('Accept', 'application/vnd.github.cloak-preview');
            },
            current_email: emails[i],
            success: function(output, status, xhr) {
                if (output['total_count'] && output['total_count'] > 0) {
                    found_email(this.current_email, "github");
                }
            },
            cache: false
        });

        chrome.runtime.sendMessage({"dns_check": emails[i]});

        ajax_after_milliseconds({
            url:"https://haveibeenpwned.com/api/v2/breachedaccount/"+emails[i],
            type:'GET',
            current_email: emails[i],
            success: function(data){
                found_email(this.current_email, "HAVEIBEENPWNED");
            },
            cache: false
        }, ms_delay);
        ms_delay += 1800;

    }

}

function ajax_after_milliseconds(ajaxconfig, timeperiod) {
    setTimeout(function(){
        $.ajax(ajaxconfig);
    }, timeperiod);
}

function scan_for_profile() {
    var name;
    var company_name;

    if ($('.pv-top-card-section__name').length > 0 && $('.pv-top-card-section__company').length > 0) {
        //normal account logged in linkedin profile
        name = $.trim($('.pv-top-card-section__name').text());
        company_name = $.trim($('.pv-top-card-section__company').text());
    }
    else if ($('.profile-info').find('.member-name').length > 0 && $('.profile-info').find('.title').length > 0) {
        //Sales navigator linkedin profile
        name = $.trim($('.profile-info').find('.member-name').text());
        company_name = $('.profile-info').find('.title').text().split(' at ');
        if (company_name.length > 1) {
            company_name = $.trim(company_name[1])
        }
        else {
            company_name = "";
        }
    }
    else if ($('.profile-overview-content').find('#name').length > 0 && $('.profile-overview-content').find('.title').length > 0) {
        //logged out linkedin profile
        name = $.trim($('.profile-overview-content').find('#name').text());
        company_name = $('.profile-overview-content').find('.title').text().split(' at ');
        if (company_name.length > 1) {
            company_name = $.trim(company_name[1])
        }
        else {
            company_name = "";
        }
    }

    if (name && company_name) {
        //We are on a profile page
        if (name != current_name || company_name != current_company) {
            //The profile is different than the last one we loaded
            current_name = name;
            current_company = company_name;
            $('.liext-emaildata').remove();
            console.log("get_profile_info", name, company_name);
            get_domain(name, company_name);
        }
    }

    setTimeout(function(){
        //LI will swap profiles without reloading the page, poll for changes.
        scan_for_profile();
    }, 700);
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log("message received...........", request);
    if (request.found_email) {
        found_email(request.found_email, "gmail");
    }
    else if (request.found_email_dns) {
        found_email(request.found_email_dns, "DNS");
    }
    else if (request.tab_id) {
        my_tab_id = request.tab_id;
        scan_for_profile();
    }
});

function found_email(email, source) {
    console.log("****Found Email", email, source);

    var source_text = source;
    if (source == 'github') {
        source_text = "<a target='_blank' href='https://api.github.com/search/commits?q=committer-email:"+email+"'>github</a>";
    }
    if (source == 'HAVEIBEENPWNED') {
        source_text = "<a target='_blank' href='https://haveibeenpwned.com/api/v2/breachedaccount/"+email+"'>HIBP</a>";
    }
    if (source == 'DNS') {
        source_text = "<a target='_blank' href='http://viewdns.info/reversewhois/?q="+email+"'>DNS</a>";
    }

    if ($('.pv-top-card-section__headline').length > 0) {
        $('.pv-top-card-section__headline').after('<h2 class="liext-emaildata Sans-19px-black-85%" title="Source: '+source+'">'+email+' ['+source_text+']</h2>');
    }
    else if ($('.profile-overview-content').find('.title').length > 0) {
        $('.profile-overview-content').find('.title').after('<p class="liext-emaildata headline email" data-section="headline" title="Source: '+source+'">'+email+' ['+source_text+']</p>');
    }
    else if ($('.liext-emails').length > 0) {
        var htmlz = '';
        htmlz += '<ul class="liext-emaildata liext-emails"><li>'+email+' ['+source_text+']</li></ul>';
        $('.liext-emails').append(htmlz);
    }
    else if ($('.profile-info').find('.title').length > 0) {
        var htmlz = '<h4 class="sub-headline liext-emaildata">Emails</h4>';
        htmlz += '<ul class="liext-emaildata liext-emails"><li>'+email+' ['+source_text+']</li></ul>';
        $('.profile-info').find('.title').parent().after(htmlz);
    }

}

$( document ).ready(function() {
    chrome.runtime.sendMessage({"my_tab_id": "what is it?"});
});
