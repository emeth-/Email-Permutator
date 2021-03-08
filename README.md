# Email Permutator

Input a first name, last name, and company. Receive back a list of possible email addresses, which we then attempt to verify via a variety of methods for you.

# How to install?

To get the files, click the green CODE button in github, then download ZIP, then unzip the file. The resulting folder is what you load as an unpacked chrome extension (it's not available in the chrome webstore).

Here are some details on how to install an unpacked chrome extension (aka developer extension): https://stackoverflow.com/a/24577660/8967723


# How do we check if an email is valid?

- Gmail / google apps for businesses emails are validated with 100% accuracy via [this method](https://blog.0day.rocks/abusing-gmail-to-get-previously-unlisted-e-mail-addresses-41544b62b2)
- Office 365 emails are validated with no false positives via [this method](https://www.trustedsec.com/blog/achieving-passive-user-enumeration-with-onedrive/), but some valid ones are not detected if the user has never opened OneDrive
- We check Github's unauthenticated api for any commits made by an email
- We check HaveIBeenPwned to see if an email has been dumped in any hacks

All these checks are done straight from your browser, with the results immediately displayed to you (and never stored anywhere).

# NOTE

- Github's unauthenticated api is rate-limited to 60 emails checks an hour
