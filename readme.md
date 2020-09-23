# StudentVue Mailer

 Powered by Nodemailer and Puppeteer, StudentVue Mailer is an automation program that will forward all of your StudentVue mail to your preferred personal
 inbox.

## Requirements

- Node.js
- A StudentVue Account
- A Gmail Account
- Windows OS (optional, to install as service)

## Here's How It Works

First, StudentVue Mailer will log into your account and temporarily save your session cookies. The mailer will then use these credentials to make fetch requests to the StudentVue mail service.

By referencing the date in bucket.json, StudentVue Mailer will determine if there is any new mail. If new mail is found, StudentVue Mailer will fetch the content for each one and forward them to the destination emails specified in the `config.json` file.

The forwarded email will include extra information about the email including the sender, the send time, the sender organization, and the read/sent count.

## How To Install/Run 

\*This service be *installed* on only Windows. However it can still be used just like any other Node application. 

1. Run `npm install`
2. Add credentials to the `config.template.json`, then rename it to `config.json`
3. If on Windows, Run `node install` in the root directory
3. If not, run `node index`
4. Send a StudentVue mail to yourself to see if it's working! (It may take a while, depending on your update interval)

## How To Uninstall

\*This only applies to Windows users that installed the mailer as a service

1. Run `node uninstall` in the root directory.
2. After it is finished, run `node uninstall` again for a confirmation

## `config.json`

```json
{
    "synergy-id": "SYNERGY USERNAME",
    "synergy-password": "SYNERGY PASSWORD",
    "gmail-user": "GMAIL SERVICE EMAIL",
    "gmail-app-password": "GMAIL SERVICE PASSWORD",
    "destination-emails": ["DESTINATION EMAILS"],
    "update-interval": 1800000,
    "start-on-interval": false
}
```

#### `gmail-user` + `gmail-app-password`

To obtain your `gmail-app-password`, visit (myaccount.google.com)[myaccount.google.com], navigate to the "Security" tab, and underneath the "Signing in to Google" section, click "App passwords". Then, generate an app password for "Gmail" and paste it into the `gmail-app-password` field in the `config.json` file.

*You will need to have 2FA activated on your Google account to create an app password.

#### `update-interval`

This is the interval, in milliseconds, that the mailer will check for new messages.

#### `start-on-interval` (Experimental)

If this is true, then the mailer will check on the interval defined on the hour.

For example, if the `update-interval` was set to 1800000 (30 minutes), then the mailer will check for mail at XX:00 and XX:30

*This feature has not been thoroughly tested and may break the mailer at certain intervals.

