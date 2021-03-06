const colors = require('./colors');
var Service = require('node-windows').Service;

var svc = new Service({
  name: 'StudentVue Mailer Beta',
  description: 'The StudentVue Mailer will check for new Synergy emails at a set interval, and them forward them to other email addresses.',
  script: `${__dirname}\\index.js`
});

svc.on('install', function () {
  svc.start();
  console.log(`[${new Date().toLocaleString()}] ${colors.green}StudentVue Mailer is now running as a Windows Service. It will run in the background until it is manually terminated.${colors.r}`)
});

svc.on('alreadyinstalled', function () {
  console.log(`[${new Date().toLocaleString()}] ${colors.green}StudentVue Mailer is already installed.${colors.r}`)
})

svc.on('invalidinstallation', function () {
  console.log(`[${new Date().toLocaleString()}] ${colors.green}StudentVue Mailer was installed incorrectly. Please retry installation.${colors.r}`)
})

svc.install();