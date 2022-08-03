const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;
require('winston-daily-rotate-file');
const fs = require("fs");

const logDir = '../src/assets/logs/';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const myTimeStamp = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const milliseconds = date.getMilliseconds();

  return year + "-" + ('0' + month).slice(-2) + "-" + ('0' + day).slice(-2) + " " + date.toLocaleTimeString('it-IT', { hour12: false }) + "." + ('00' + milliseconds).slice(-3);
}

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

var logger = new createLogger({
  format: combine(
    label({ label: 'VideoMaker' }),
    timestamp({ format: myTimeStamp }),
    myFormat
  ),
  transports: [
    new (transports.DailyRotateFile)({
      name: 'debug-file',
      level: 'debug',
      filename: logDir + 'debug_%DATE%.log',
      json: false,
      datePattern: 'yyyy-MM-DD',
      zippedArchive: true,
      maxFiles: 15
    }),
    new (transports.DailyRotateFile)({
      name: 'error-file',
      level: 'error',
      filename: logDir + 'error_%DATE%.log',
      json: false,
      datePattern: 'yyyy-MM-DD',
      zippedArchive: true,
      maxFiles: 15
    })
  ]
});

logger.info('Winston logger is starting......');
logger.error('Winston logger is starting......');

console.log = function () { logger.info(Array.from(arguments).join()) };
console.debug = function () { logger.debug(Array.from(arguments).join()) };
console.info = function () { logger.info(Array.from(arguments).join()) };
console.warn = function () { logger.warn(Array.from(arguments).join()) };
console.error = function () { logger.error(Array.from(arguments).join()) };
