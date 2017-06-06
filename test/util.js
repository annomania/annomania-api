/* eslint-env mocha */

import Server from '../src/server';
import controller from '../src/controller';

/**
 * Sets up the server for testing (middlewares and config)
 * @return {Server}
 */
export function setupServer() {
  const server = new Server();

  server.useMiddleware(controller);

  return server;
}

/**
 * User to Object with Kong Consumer Header Fields
 * @return {Object}
 */
export function toKongConsumer(user) {
  return {
    'X-Consumer-ID': user.kongId,
    'X-Consumer-Username': user.username,
  };
}

/**
 * Promise that resolves after specified amount of time
 * @param {Number} millis the millis to wait
 * @return {Promise}
 */
export function timeoutPromise(millis) {
  return new Promise((resolve, _) => {
    setTimeout(resolve, millis);
  });
}
