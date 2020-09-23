# StudentVue Mailer

Checking StudentVue Mail is a tiresome process. Receiving StudentVue Mail is also not always clear, either. The mobile app doesn't always send notifications when there is new mail. So, with these inconviences, I created the StudentVue Mailer, a tool powered by Puppeteer and AWS SES to foward Synergy mail to your personal inbox.

## Here's How It Works

First, Puppeteer is used to log users into their StudentVue account. The cookies are saved and then used to make fetch requests to the StudentVue mail service. 

Then, using node-fetch, requests are made to fetch the list of messages. By referencing the date in bucket.json, StudentVue Mailer will determine if there is any new mail. If new mail is found, StudentVue Mailer will fetch the content for each new email and forward them to the addresses specified in the config.json file.

The forwarded email will include extra information about the email including the sender, the send time, the sender organization, and the read/sent count.

