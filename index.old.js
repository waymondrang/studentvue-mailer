const fetch = require('node-fetch');
const FormData = require('form-data');
const send = require('./email');
const puppeteer = require('puppeteer');
const fs = require('fs');
const config = require('./config.json');
const colors = require('./colors');
const connectivity = require('./check-connectivity');

const express = require('express')
const app = express();
const http = require('http');
const open = require("open");
const cors = require('cors');

app.use(cors());
app.use(express.json())

const server = http.createServer(app);

app.post('/open', async (req, res) => {
    var body = req.body;
    console.log(body)
    if (body.url) {
        //await open(body.url).catch(error => console.log(error)).then(() => console.log("opened url"))
        var start = (process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open');
        require('child_process').exec(start + ' ' + `${body.url}`, { windowsHide: true, shell: true, detached: true, stdio: 'ignore' });
    }
    return
})

app.post('/openapp', async (req, res) => {
    var body = req.body;
    console.log(body)
    if (body.path) {
        //open(`\"${body.path}\"`).catch(error => console.log(error)).then(() => console.log("opened url"))
        require('child_process').exec(`\"${body.path}\"`, { windowsHide: true, shell: true, detached: true, stdio: 'ignore' });
    }
    return
})

server.listen(8080, () => console.log("server running on port 8080"));

(async () => {

    function closestInteger(a, b) {
        var c2 = (a + b) - (a % b);
        return c2;
    }

    async function synergize() {

        try {

            var tries = 0
            while (await connectivity() === false) {
                tries++;
                if (tries > 6) {
                    tries = 6;
                }
                var waittime = tries * 10;
                console.log(`[${new Date().toLocaleString()}] ${colors.red}There is no internet connection! Checking again in ${waittime} seconds.${colors.r}`)
                await new Promise(function (resolve, reject) {
                    setTimeout(function () {
                        resolve();
                    }, waittime * 1000)
                })
            }
            console.log(`[${new Date().toLocaleString()}] ${colors.green}Connected to the internet!${colors.r}`)



            console.log(`[${new Date().toLocaleString()}] ${colors.green}Process started${colors.r}`)
            console.log(`[${new Date().toLocaleString()}] ${colors.cyan}Reading bucket.json${colors.r}`)

            try {
                var rawdata = fs.readFileSync('./bucket.json');
                if (Buffer.from(rawdata).toString() === "") {
                    console.log(`[${new Date().toLocaleString()}] ${colors.yellow}bucket.json is missing the last-updated field! Setting it to current date${colors.r}`);
                    var bucket = {};
                    bucket["last-updated"] = new Date();
                } else {
                    var bucket = JSON.parse(rawdata);
                }
            } catch {
                console.log(`[${new Date().toLocaleString()}] ${colors.red}Failed to read ${colors.yellow}bucket.json${colors.red}, attempting fix${colors.r}`);
                var bucket = {};
                bucket["last-updated"] = new Date();
            }

            if (!bucket["last-updated"]) {
                console.log(`[${new Date().toLocaleString()}] ${colors.yellow}bucket.json is missing the last-updated field! Setting it to current date${colors.r}`);
                bucket["last-updated"] = new Date();
            }

            console.log(`[${new Date().toLocaleString()}] ${colors.cyan}Launching Chromium browser in the background${colors.r}`)
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto('https://ca-egusd-psv.edupoint.com/PXP2_Login_Student.aspx?regenerateSessionId=True');
            console.log(`[${new Date().toLocaleString()}] ${colors.cyan}Logging into SynergyVue${colors.r}`)
            await page.waitForSelector('#ctl00_MainContent_username')
            await page.type('#ctl00_MainContent_username', `${config["synergy-id"]}`)
            await page.type('#ctl00_MainContent_password', `${config["synergy-password"]}`)
            await page.click('#ctl00_MainContent_Submit1')

            var pagecookies = await page.cookies()
            var cookiejar = {};
            pagecookies.forEach(cookie => {
                cookiejar[cookie.name] = cookie.value
            })
            console.log(`[${new Date().toLocaleString()}] ${colors.cyan}Closing browser${colors.r}`)
            await browser.close();

            // a very extra, but dynamic way of parsing cookies
            var cookies = JSON.stringify(cookiejar).replace(/"/g, '').replace(/:/g, '=').replace(/,/g, '; ').replace(/{|}/g, '')

            console.log(`[${new Date().toLocaleString()}] ${colors.cyan}Requesting messages${colors.r}`)

            var formdata = new FormData();

            formdata.append("data", "{\"filter\":[],\"search\":\"\",\"skip\":0,\"take\":10,\"folderType\":0,\"languageCode\":\"00\",\"showDeleted\":false}");

            var response = await fetch('https://ca-egusd-psv.edupoint.com/st_api/ST.Messaging/GetMessages', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json, text/javascript, */*; q=0.01',
                    'Cookie': cookies,
                    'Host': 'ca-egusd-psv.edupoint.com',
                    'Origin': 'https://ca-egusd-psv.edupoint.com',
                    'Referer': 'https://ca-egusd-psv.edupoint.com/PXP2_Messages.aspx?AGU=0',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Safari/537.36',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: formdata,
                redirect: 'follow'
            }).then(response => response.json()).catch(error => console.log(`[${new Date().toLocaleString()}] ` + error))

            if (!response) {
                console.log(`[${new Date().toLocaleString()}] ${colors.red}Something went wrong fetching messages!${colors.r}`)
                throw "Something went wrong fetching messages!"
            }

            var newmessages = [];

            for (result of response.Result.data) {
                if (new Date(bucket["last-updated"]) < new Date(result.sendDateTime)) {
                    newmessages.push(result.messagePersonId)
                }
            }

            if (!newmessages.length) {
                console.log(`[${new Date().toLocaleString()}] ${colors.yellow}You have no new emails!${colors.r}`);
            } else {
                console.log(`[${new Date().toLocaleString()}] ${colors.yellow}${newmessages.length} new emails found!${colors.r}`)
            }

            for (id of newmessages) {
                console.log(`[${new Date().toLocaleString()}] ${colors.cyan}Getting email ${colors.yellow}${id}${colors.r}`)
                var emailformdata = new FormData();

                emailformdata.append("data", `{"id":"${id}","languageCode":"00","markAsRead":true,"isSystemMessage":false}`);

                var message = await fetch('https://ca-egusd-psv.edupoint.com/st_api/ST.Messaging/GetMessage', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json, text/javascript, */*; q=0.01',
                        'Cookie': cookies,
                        'Host': 'ca-egusd-psv.edupoint.com',
                        'Origin': 'https://ca-egusd-psv.edupoint.com',
                        'Referer': 'https://ca-egusd-psv.edupoint.com/PXP2_Messages.aspx?AGU=0',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Safari/537.36',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: emailformdata,
                }).then(response => response.json()).catch(error => console.log(`[${new Date().toLocaleString()}] ` + error))

                if (message) {
                    await send(message.Result)
                } else {
                    throw `${colors.red}Something went wrong getting email ${colors.yellow}${id}${colors.r}`
                }
            }

            console.log(`[${new Date().toLocaleString()}] ${colors.cyan}Finished sending new emails${colors.r}`)
            console.log(`[${new Date().toLocaleString()}] ${colors.cyan}Updating bucket.json${colors.r}`)

            bucket["last-updated"] = new Date()

            fs.writeFileSync('./bucket.json', JSON.stringify(bucket))
            console.log(`[${new Date().toLocaleString()}] ${colors.cyan}Updated bucket.json${colors.r}`)

            console.log(`[${new Date().toLocaleString()}] ${colors.green}Process complete${colors.r}`);

        } catch (error) {
            console.log(`[${new Date().toLocaleString()}] [${new Date().toLocaleString()}] ${colors.red}Process could not complete.`)
            console.error(`[${new Date().toLocaleString()}] ` + error)
        } finally {
            console.log(`[${new Date().toLocaleString()}] ${colors.magenta}Waiting another ${colors.yellow}${Math.round(config["update-interval"] / 1000 / 60)} minutes${colors.magenta} until next update${colors.r}`)
        }
    }

    if (config["start-on-interval"]) {
        await new Promise(function (resolve, reject) {
            var interval = Math.round(config["update-interval"] / 1000 / 60)
            var currenttime = new Date().getMinutes();
            var closesttime = closestInteger(currenttime, interval);

            console.log(closesttime)

            var waittime = (closesttime - currenttime) * 60 * 1000;
            console.log(`[${new Date().toLocaleString()}] ${colors.magenta}Start on interval option selected. Will start cycle in ${colors.yellow}${Math.round(waittime / 1000 / 60)} minutes${colors.r}.`)
            setTimeout(() => resolve(), waittime)
        })
    }

    synergize();

    setInterval(() => synergize(), config["update-interval"]);

})();