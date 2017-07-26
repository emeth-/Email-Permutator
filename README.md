# E-Reveal: Reveal email addresses on LinkedIn Profiles!

Get it on the Chrome Webstore [HERE](https://chrome.google.com/webstore/detail/e-reveal/cfjoijpnimmgcijcofonhdipdppipppl)!

# How does it work?

![](https://raw.githubusercontent.com/emeth-/E-Reveal/master/howitworks/E-Reveal.png)

When you visit a LinkedIn profile, the chrome extension will:

- Pull the person's name and company from the page.
- Convert the company name into a domain via Clearbit's [free autocomplete api](https://clearbit.com/docs#autocomplete-api)
- Create a list of possible emails via permutating combinations of  first name + last name + domain
- For each of the possible emails, check each one and see if any are valid (validity check outlined in next section).
- When a valid email address is detected, insert it into the LinkedIn profile you are viewing along with its source.

# How do we check if an email is valid?

- Gmail / google apps for businesses emails are validated with 100% accuracy via [this method](https://blog.0day.rocks/abusing-gmail-to-get-previously-unlisted-e-mail-addresses-41544b62b2)
- We check DNS records with a reverse DNS lookup to detect if any domains have been registered with an email
- We check Github's unauthenticated api for any commits made by an email
- We check HaveIBeenPwned to see if an email has been dumped in any hacks

All these checks are done straight from your browser, with the results immediately displayed on the LinkedIn profile (and never stored anywhere).

# NOTE

- Not every profile will have an email found.
- Github and HIBP are rate-limited, so if you load too many profiles in rapid succession only the DNS lookup and GMAIL checks will run. This automatically resolves itself over time.
- Some profiles will have multiple emails found.
- This plugin is fully open source, so you can verify the code yourself! Check it out here: https://github.com/emeth-/E-Reveal
