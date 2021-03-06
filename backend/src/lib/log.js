const chalk = require('chalk');
const Moment = require('moment');
const winlog = require('./winston');

function getTime() {
  const now = new Moment();
  const time = chalk.dim(`[${now.format('YYYY-MM-DD HH:mm:ss')}]`);
  return time;
}

function log(...message) {
  const time = getTime();
  const type = chalk.bold(' [LOG]');
  console.log(`${time}${type}`, ...message);
}

log.info = (...message) => {
  const time = getTime();
  const type = chalk.bold(chalk.cyan(' [INFO]'));
  //console.info(`${time}${type}`, ...message);
  winlog.info(...message);
};

log.error = (...message) => {
  const time = getTime();
  const type = chalk.bold(chalk.red(' [ERROR]'));
  //console.error(`${time}${type}`, ...message);
  winlog.error(...message);
};

module.exports = log;