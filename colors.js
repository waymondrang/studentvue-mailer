var ns = {};
ns.r = "\x1b[0m";
ns.reset = "\x1b[0m";
ns.bright = "\x1b[1m";
ns.dim = "\x1b[2m";
ns.underscore = "\x1b[4m"
ns.blink = "\x1b[5m"
ns.reverse = "\x1b[7m"
ns.hidden = "\x1b[8m"

ns.black = "\x1b[30m"
ns.red = "\x1b[31m"
ns.green = "\x1b[32m"
ns.yellow = "\x1b[33m"
ns.blue = "\x1b[34m"
ns.magenta = "\x1b[35m"
ns.cyan = "\x1b[36m"
ns.white = "\x1b[37m"

ns.bgblack = "\x1b[40m"
ns.bgred = "\x1b[41m"
ns.bggreen = "\x1b[42m"
ns.bgyellow = "\x1b[43m"
ns.bgblue = "\x1b[44m"
ns.bgmagenta = "\x1b[45m"
ns.bgcyan = "\x1b[46m"
ns.bgwhite = "\x1b[47m"

for(prop in ns) {
    if(ns.hasOwnProperty(prop)){
        module.exports[prop] = ns[prop];
    }
}
