import mongoose from 'mongoose';
import config from 'config';
import logger from '../logger';

const uri = `mongodb://${config.get('db.container')}:${config.get('db.port')}/${config.get('db.name')}`;

mongoose.Promise = Promise;

const options = {
  promiseLibrary: Promise,
};

mongoose.connection.on('error', (err) => {
  logger.error(`db connection error: ${err}`);
});

/**
 * mongoose Conenction states
 * @return {mongoose.STATES}
 */
export const STATES = mongoose.STATES;

/**
 * Get current db connection(mongoose) state
 * 0 = disconnected
 * 1 = connected
 * 2 = connecting
 * 3 = disconnecting
 * @return {Number}
 */
export function readyState() {
  return mongoose.connection.readyState;
}

/**
 * Connect to database(mongoose) if not already connected
 * @return {Promise}
 */
export function connect() {
  if (readyState() === STATES.disconnected) {
    return new Promise((resolve, reject) => {
      mongoose.connection.once('open', () => {
        logger.info(`db connected to: ${uri}`);
        resolve(mongoose.connection);
      });

      mongoose.connect(uri, options)
        .catch(reject);
    });
  }
  logger.info('db connection already open, skipping');
  return Promise.resolve(mongoose.connection);
}

/**
 * Disconnect from database(mongoose) if not already disconnected
 * @return {Promise}
 */
export function disconnect() {
  if (readyState() === STATES.connected) {
    return new Promise((resolve, reject) => {
      mongoose.connection.once('close', () => {
        logger.info(`db disconnected from: ${uri}`);
        resolve(mongoose.connection);
      });

      mongoose.disconnect()
        .catch(reject);
    });
  }
  logger.info('db connection already closed, skipping');
  return Promise.resolve(mongoose.connection);
}

/**
 * Drop Database
 * @return {Promise}
 */
export function dropDatabase() {
  return mongoose.connection.dropDatabase();
}
