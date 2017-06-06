import cluster from 'cluster';
import { cpus } from 'os';
import config from 'config';
import logger from './src/logger';

/**
 * Application Entry Point
 *
 * Initialize the NodeJS Cluster with worker threads.
 */

cluster.setupMaster({
  exec: './src/worker.js',
});

let workers = cpus.length;
if (config.has('cluster.workers')) {
  workers = config.get('cluster.workers');
}

for (let i = 0; i < workers; i += 1) {
  cluster.fork();
}

cluster.on('online', (worker) => {
  logger.info(`worker process ${worker.process.pid} is online`);
});

cluster.on('disconnect', (worker) => {
  logger.info(`worker process ${worker.process.pid} has disconnected`);
});

cluster.on('exit', (worker, code, signal) => {
  logger.warn(`worker process ${worker.process.pid} died with ${code || signal}`);
});

process.on('SIGTERM', () => {
  cluster.disconnect(() => {
    logger.info(`master process ${process.pid} died with SIGTERM`);
  });
});

process.on('SIGINT', () => {
  cluster.disconnect(() => {
    logger.info(`master process ${process.pid} died with SIGINT`);
  });
});

logger.info(`master process ${process.pid} running`);
