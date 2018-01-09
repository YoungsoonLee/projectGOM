const winston = require('winston'); // 로그 모듈
//const winston = require('@jifeon/winston');

const winstonDaily = require('winston-daily-rotate-file'); //일별 로그 모듈
const moment = require('moment');
const fs = require('fs');
const logDir = 'log';

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }

function timeStampFormat() {
    return moment().format('YYYY-MM-DD HH:mm:ss.SSS ZZ')
}
 
var logger = new (winston.Logger)({
    transports: [
        new (winstonDaily)({
                name: 'info-file',
                filename: `${logDir}/app`,
                datePattern: '_yyyy-MM-dd.log',
                colorize: false,
                maxsize: 50000000,
                maxFiles: 1000,
                level: 'info', // info이상 파일 출력
                showLevel: true,
                json: false,
                timestamp: timeStampFormat
            }),
        new (winston.transports.Console)({
                name: 'debug-console',
                colorize: true,
                level: 'debug', // debug이상 콘솔 출력
                showLevel: true,
                json: false,
                timestamp: timeStampFormat
        })     
    ],
    exceptionHandlers: [ // uncaughtException 발생시 처리
        new (winstonDaily)({
                name: 'exception-file',
                filename: `${logDir}/app-exception`,
                datePattern: '_yyyy-MM-dd.log',
                colorize: false,
                maxsize: 50000000,
                maxFiles: 1000,
                level: 'error',
                showLevel: true,
                json: false,
                timestamp: timeStampFormat
        }),
        new (winston.transports.Console)({
                name: 'exception-console',
                colorize: true,
                level: 'debug',
                showLevel: true,
                json: false,
                timestamp: timeStampFormat
        })     
    ]
});

module.exports = logger;