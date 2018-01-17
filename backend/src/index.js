// load environment variables
require('dotenv').config();
const {
  PORT: port,
  MONGO_URI: mongoURI
} = process.env;

const Koa = require('koa');
const cors = require('koa2-cors');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const compress = require('koa-compress');

const api = require('./api');
const jwtMiddleware = require('lib/middlewares/jwt');

const { logger } = require('lib/koa2-winston-local');
const winston = require('winston'); // 로그 모듈
//const winston = require('@jifeon/winston');
const winstonDaily = require('winston-daily-rotate-file'); //일별 로그 모듈
const moment = require('moment');
const fs = require('fs');
const logDir = 'log';

//websocket
const websockify = require('koa-websocket');
const ws = require('./lib/ws');

//const app = new Koa();
const app = websockify(new Koa());

app.use(cors());
app.use(compress());
app.use(jwtMiddleware);
app.use(bodyParser());

//for logging
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

function timeStampFormat() {
  return moment().format('YYYY-MM-DD HH:mm:ss.SSS ZZ')
}

app.use(logger({
      //transports: [ new winston.transports.Console({ json: false, stringify: true, colorize: true }) ],
      transports: [ new (winstonDaily)({
        name: 'info-file',
        filename: `${logDir}/app`,
        datePattern: '_yyyy-MM-dd.log',
        colorize: false,
        maxsize: 50000000,
        maxFiles: 1000,
        level: 'info', // info이상 파일 출력
        showLevel: true,
        json: false,
        timestamp: timeStampFormat,
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
      })
      ,
      new (winston.transports.Console)({
              name: 'exception-console',
              colorize: true,
              level: 'debug',
              showLevel: true,
              json: false,
              timestamp: timeStampFormat
      })
    
  ],
  level: 'info',
  //reqKeys: ['headers','url','method', 'httpVersion','href','query','length'],
  reqKeys: ['ip', 'url','method', 'query' ,'body'],
  reqSelect: [],
  reqUnselect: ['headers.cookie', 'body.password'],
  resKeys: ['status', 'body'],
  resSelect: [],
  resUnselect: ['body.data', 'body.chargeItems', 'body.newsItem' ],
}));

//router
const router = new Router();
router.use('/api', api.routes());

app.use(router.routes());
app.use(router.allowedMethods());

app.ws.use(ws.routes()).use(ws.allowedMethods());

app.listen(port, () => {
    console.log(`backend server is listening to port ${port}`);
});