# E-Reveal

Get it on the Chrome Webstore [HERE](https://chrome.google.com/webstore/detail/e-reveal/cfjoijpnimmgcijcofonhdipdppipppl)!

Reveal email addresses on LinkedIn Profiles based on a LIVE search on Google Apps for Business, DNS records, and Github code.

How does it work?

When you visit a LinkedIn profile, the chrome extension will:
- Pull the person's name and company from the page.
- Convert the company name into a domain
- Create a list of possible emails via combining first name + last name + domain in various ways.
- For each of the possible emails, check against Google, Github code search, and DNS domain records to see if the email address is valid.
- When a valid email address is detected, insert it into the LinkedIn profile you are viewing along with its source.

NOTE
- Your browser tab with the LinkedIn profile page must be active when you open it to kick off the search.
- Not every profile will have an email found.
- Some profiles will have multiple emails found.
- This plugin is fully open source, so you can verify the code yourself! Check it out here: https://github.com/emeth-/E-Reveal