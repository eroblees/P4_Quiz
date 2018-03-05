const figlet = require ('figlet');
const chalk = require ('chalk');

// Coloreo el mensaje
const colorize = (msg, color) => {
    if(typeof color !=="undefined"){
        msg = chalk[color].bold(msg);
    }
    return msg;
};

// Para ahorrarme el console.log
const log = (msg, color) => {
    console.log(colorize(msg, color));
};

// Coloreo + letras grandes
const biglog = (msg, color) =>{
    log(figlet.textSync(msg, {horizontalLayout: 'full'}), color);
};

const errorlog = (emsg) => {
    log(`${colorize("Error", "red")}: ${colorize(colorize(emsg, "red"), "bgYellowBright")}`);
};

exports = module.exports = {
    colorize,
    log,
    biglog,
    errorlog
};