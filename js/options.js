
var my_tab_id;
$( document ).ready(function() {
    chrome.runtime.sendMessage({"my_tab_id": "what is it?"});
    $('#submit').click(function(){
        build_potential_emails();
    })
    $('#add').click(function(){
        add_custom_potential_email();
    })
    $('#trigger_scan').click(function(){
        trigger_scan();
    })
    $('#dontknowdomain').click(function(){
        dont_know_domain();
    })
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log("message received...........", request);
    if (request.found_email) {
        $('[data-emailrow="'+request.found_email+'"]').find('.r_googleapps').html('FOUND');
        //found_email(request.found_email, "gmail");
    }
    if (request.found_email_ms) {
        $('[data-emailrow="'+request.found_email_ms+'"]').find('.r_office365').html('FOUND');
        //found_email(request.found_email, "gmail");
    }
    else if (request.found_email_dns) {
        //found_email(request.found_email_dns, "DNS");
    }
    else if (request.tab_id) {
        my_tab_id = request.tab_id;
        //scan_for_profile();
    }
});

function get_row_html(email){
    var append_htmlz = `
    <tr class="r_row" data-emailrow="`+email+`">
        <td>`+email+`</td>
        <td style='text-align:center' class='r_googleapps'></td>
        <td style='text-align:center' class='r_office365'></td>
        <td style='text-align:center' class='r_github'></td>
        <td style='text-align:center' class='r_hibp'><a href="https://haveibeenpwned.com/account/`+email+`" target=_blank>Check</a></td>
    </tr>
        `;
    return append_htmlz;
}

function dont_know_domain() {
    var company_name = prompt("Enter Company Name, and we can try to find the domain: ", "");
    if (company_name) {
        var original_company_name = company_name;
        company_name = company_name.replace(" Inc.", "");
        company_name = company_name.replace(" Inc", "");
        company_name = company_name.replace("LLC", "");
        company_name = $.trim(company_name);
        $.ajax({
            type: 'GET',
            url: "https://autocomplete.clearbit.com/v1/companies/suggest?query="+company_name,
            success: function(output, status, xhr) {

                //Attempt to get domain for exact match first
                for(var i=0; i<output.length; i++) {
                    if (output[i]['name'] == original_company_name) {
                        $('#domain').val(output[i]['domain']);
                        return;
                    }
                }

                //Attempt to get domain for near match
                for(var i=0; i<output.length; i++) {
                    if (output[i]['name'] == company_name) {
                        $('#domain').val(output[i]['domain']);
                        return;
                    }
                }

                //Screw it, let's just get the first result.
                for(var i=0; i<output.length; i++) {
                    $('#domain').val(output[i]['domain']);
                    return;
                }
            },
            cache: false
        });
    }
}

function add_custom_potential_email() {
    var pemail = prompt("Enter potential email you'd like to add to the list:", "");
    if (pemail) {
        var append_htmlz = get_row_html(pemail);
        $('#results_tbody').append(append_htmlz);
    }
}

function build_potential_emails() {

    var first_name = $('#first_name').val();
    var last_name = $('#last_name').val();
    var domain = $('#domain').val();

    var n = {
        "first_name": first_name.toLowerCase(),
        "first_initial": first_name[0].toLowerCase(),
        "last_name": last_name.toLowerCase(),
        "last_initial": last_name[0].toLowerCase(),
    };
    var possibilities = [
        "{fn}{ln}",
        "{fn}.{ln}",
        "{fi}{ln}",
        "{fn}",
        "{fn}{li}",
    ];

    var emails = [];
    for (var i=0; i<possibilities.length; i++) {
        var new_e = possibilities[i];
        new_e = new_e.replace("{fn}", n['first_name']);
        new_e = new_e.replace("{ln}", n['last_name']);
        new_e = new_e.replace("{fi}", n['first_initial']);
        new_e = new_e.replace("{li}", n['last_initial']);
        new_e = new_e + "@"+domain;
        var final_new_email = new_e.toLowerCase();

        var append_htmlz = get_row_html(final_new_email);
        $('#results_tbody').append(append_htmlz);
    }
}

function check_gmail() {
    var emails = [];
    $('.r_row').each(function(){
        emails.push($(this).attr('data-emailrow'));
    });
    for(var i=0; i<emails.length; i++) {

        /*
            From https://blog.0day.rocks/abusing-gmail-to-get-previously-unlisted-e-mail-addresses-41544b62b2
            - Detects existence of a set-cookie header on an endpoint (if there, is a valid email)
            - Passive (no notification to user, no invalid login attempts)
            - No false positives
            - 100% detection
        */
        $.ajax({
            type: 'GET',
            url: "https://mail.google.com/mail/gxlu?email="+emails[i]+"&tab_id="+my_tab_id,
            success: function(output, status, xhr) {
                //results checked in background.js
            },
            cache: false
        });
    }
}

function check_o365() {
    var emails = [];
    $('.r_row').each(function(){
        emails.push($(this).attr('data-emailrow'));
    });
    for(var i=0; i<emails.length; i++) {
        /*
            From https://www.trustedsec.com/blog/achieving-passive-user-enumeration-with-onedrive/
            - HTTP status code returned from a specific url detects if account is valid.
            - Passive (no notification to user, no invalid login attempts)
            - No false positives
            - Caveat: user must have logged into Onedrive once (at least) to be able to detect them.
        */
        var o365username = emails[i].replace(/\./g, "_").replace('@', '_');
        var o365username_domain = emails[i].split("@")[1].split('.');
        o365username_domain.pop(); //remove tld
        o365username_domain.join('_');

        $.ajax({
            type: 'GET',
            email: emails[i],
            url: "https://"+o365username_domain+"-my.sharepoint.com/personal/"+o365username+"/_layouts/15/onedrive.aspx",
            success: function(data, textStatus, xhr) {
                //Valid email
                $('[data-emailrow="'+this.email+'"]').find('.r_office365').html('FOUND1');
            },
            complete: function(xhr, textStatus) {
                console.log("***", this.email, xhr.status, xhr, textStatus)
                if(xhr.status == 404) {
                    //Correct tenant ID, but invalid email OR person never opened onedrive [404]
                    $('[data-emailrow="'+this.email+'"]').find('.r_office365').html('-');
                    return;
                }
                if(!xhr.status) {
                    //invalid domain, or possibly just different tenant id from domain... make no assumptions
                    $('[data-emailrow="'+this.email+'"]').find('.r_office365').html('');
                    return;
                }

                //valid email
                $('[data-emailrow="'+this.email+'"]').find('.r_office365').html('FOUND');

            },
            cache: false
        });

        /*
            From: https://github.com/Raikia/UhOh365
            - Uses Microsoft's built-in Autodiscover API... but Microsoft nerfed this method.
            - Passive (no notification to user, no invalid login attempts)
            - Accurately identifies SOME invalid emails...
            - But unfortunately tons of false positives, too many to use this method.
        */
        /*
        $.ajax({
            type: 'GET',
            url: "https://outlook.office365.com/autodiscover/autodiscover.json/v1.0/"+emails[i]+"?Protocol=rest&tab_id="+my_tab_id,
            success: function(output, status, xhr) {
                //results checked in background.js
            },
            cache: false
        });
        */


        /*
            From: https://grimhacker.com/2017/07/24/office365-activesync-username-enumeration/ (updated here: https://github.com/0xZDH/o365spray/blob/e235abdcebad61dbd2cde80974aca21ddb188704/core/handlers/enumerator.py#L130-L132)
            - Uses basic auth to 0365 with a fake password to detect if account is valid.
            - No longer appears to work
        */
    }
}

function check_github() {
    var emails = [];
    $('.r_row').each(function(){
        emails.push($(this).attr('data-emailrow'));
    });
    for(var i=0; i<emails.length; i++) {
        $.ajax({
            type: 'GET',
            url: "https://api.github.com/search/commits?q=committer-email:"+emails[i],
            beforeSend: function(xhr){
                xhr.setRequestHeader('Accept', 'application/vnd.github.cloak-preview');
            },
            current_email: emails[i],
            success: function(output, status, xhr) {
                if (output['total_count'] && output['total_count'] > 0) {
                    $('[data-emailrow="'+this.current_email+'"]').find('.r_github').html('FOUND');
                }
            },
            cache: false
        });
    }

}

function check_hibp() {

    var emails = [];
    $('.r_row').each(function(){
        emails.push($(this).attr('data-emailrow'));
    });
    for(var i=0; i<emails.length; i++) {
        /*
            Delay seems to have no affect.
            The first two you access via deeplink work. The next all error out with temporary ban message, no matter how much of a delay you put between them (I tried up to 10 seconds between each).
        */
        //setTimeout(hibp_rate_limiting.bind(null, emails[i]), 1300*i);
        hibp_rate_limiting(email);
    }
}

function hibp_rate_limiting(email){
    $.ajax({
        type: 'GET',
        url: "https://haveibeenpwned.com/account/"+email,
        current_email: email,
        success: function(output, status, xhr) {
            var hibpresponse = output.split('<p id="pwnCount">')[1].split('<')[0].trim()
            if (hibpresponse.indexOf('Pwned in') > -1) {
                $('[data-emailrow="'+this.current_email+'"]').find('.r_hibp').html('<a href="https://haveibeenpwned.com/account/'+this.current_email+'" target=_blank>Found</a>');
            }
            else if (hibpresponse.indexOf('Not pwned in any') > -1) {
                $('[data-emailrow="'+this.current_email+'"]').find('.r_hibp').html('<a href="https://haveibeenpwned.com/account/'+this.current_email+'" target=_blank>-</a>');
            }
            else {
                $('[data-emailrow="'+this.current_email+'"]').find('.r_hibp').html('<a href="https://haveibeenpwned.com/account/'+this.current_email+'" target=_blank>?</a>');
            }
        },
        error: function() {
            $('[data-emailrow="'+this.current_email+'"]').find('.r_hibp').html('<a href="https://haveibeenpwned.com/account/'+this.current_email+'" target=_blank>Error</a>');
        },
        cache: false
    });
}

function trigger_scan() {
    var emails = [];
    $('.r_row').each(function(){
        emails.push($(this).attr('data-emailrow'));
    });
    console.log("attempted emails...", emails);
    var ms_delay = 0;
    for(var i=0; i<emails.length; i++) {

        check_gmail();
        check_o365();
        check_github();

        /*
            ***HIBP automatic check no longer works.***
            - v3 of their api costs money, and is limited (even if I paid for it, I couldn't put my api key here in this free app.)
            - I also tried a scraping via deeplink. It works for the first 2 emails you try, but then fails (regardless of how long a delay you put between each check).
            - So... we'll just leave it as a manual check for now.
        */
        //check_hibp();
    }

}