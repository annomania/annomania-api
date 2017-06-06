import expressWinston from 'express-winston';
import cors from 'cors';
import config from 'config';
import logger from './logger';
import Server from './server';
import routes from './controller';
import * as db from './data/db';

/**
 * A Server worker that can handle connections
 */

const server = new Server();

server.useMiddleware(expressWinston.logger({
  winstonInstance: logger,
  level: 'info',
}));

server.useMiddleware(cors({ origin: `${config.get('swagger.host')}:${config.get('swagger.port')}` }));

// add routes
server.useMiddleware(routes);

server.useMiddleware(expressWinston.errorLogger({
  winstonInstance: logger,
  level: 'error',
}));

server.start()
  .then(() => db.connect())
  .catch((err) => {
    logger.error(err);
  });
