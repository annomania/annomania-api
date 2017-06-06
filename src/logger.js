import winston from 'winston';
import config from 'config';
import path from 'path';
import fs from 'fs';

const transports = [];

/**
 * Configuration of the application wide logger
 */

if (config.get('logging.file')) {
  const logDir = path.join(__dirname, '../logs');

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }

  const app = new (winston.transports.File)({
    name: 'app',
    json: true,
    filename: path.join(logDir, config.get('logging.filenameApp')),
    level: 'info',
  });

  const error = new (winston.transports.File)({
    name: 'error',
    json: true,
    filename: path.join(logDir, config.get('logging.filenameError')),
    level: 'error',
  });

  transports.push(error, app);
}

if (config.get('logging.console')) {
  transports.push(new (winston.transports.Console)({
    json: true,
  }));
}

const logger = new (winston.Logger)({
  level: config.get('logging.level'),
  json: true,
  transports,
});

export default logger;
