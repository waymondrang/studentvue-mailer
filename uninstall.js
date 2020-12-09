const colors = require('./colors');
var Service = require('node-windows').Service;

var svc = new Service({
    name: 'StudentVue Mailer',
    description: 'The StudentVue Mailer will check for new Synergy emails at a set interval, and them forward them to other email addresses.',
    script: `${__dirname}\\index.js`
});

svc.on('uninstall', function () {
    svc.start();
    console.log(`[${new Date().toLocaleString()}] ${colors.green}StudentVue Mailer has been uninstalled. You will no longer be forwarded StudentVue mail!${colors.r}`)
});

svc.on('alreadyuninstalled', function () {
    console.log(`[${new Date().toLocaleString()}] ${colors.green}StudentVue Mailer is already uninstalled.${colors.r}`)
})

svc.uninstall();