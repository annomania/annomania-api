import express from 'express';
import http from 'http';
import config from 'config';
import logger from './logger';

/**
 * Server class for managing express app and http connection
 */
class Server {
  /**
   * Create express app and http server and setup the error listener
   */
  constructor() {
    this.app = express();
    this.httpServer = http.createServer(this.app);

    this.httpServer.on('error', (err) => {
      logger.error(err);
    });
  }

  /**
   * Get listening state of server
   * @return {Boolean}
   */
  get listening() {
    return this.httpServer.listening;
  }

  /**
   * Start server if not already running
   * @return {Promise}
   */
  start() {
    if (!this.listening) {
      return new Promise((resolve, reject) => {
        const port = config.get('http.port');
        this.httpServer.listen(port, () => {
          const address = this.httpServer.address();
          logger.info(`server listening on ${address.address}:${address.port}`);
          resolve(this);
        }).once('error', err => reject(err));
      });
    }
    logger.info('server already started, skipping');
    return Promise.resolve(this);
  }

  /**
   * Stop server if not already stopped
   * @return {Promise}
   */
  stop() {
    if (this.listening) {
      return new Promise((resolve, reject) => {
        this.httpServer.close((err) => {
          if (err) reject(err);
          logger.info('server closed');
          resolve(this);
        });
      });
    }
    logger.info('server already closed, skipping');
    return Promise.resolve(this);
  }

  /**
   * Add middleware to server app
   * @param {Function} middleware the app(express) middleware to use
   */
  useMiddleware(...args) {
    this.app.use(...args);
  }
}

export default Server;
