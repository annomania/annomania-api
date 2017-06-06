import Bull from 'bull';
import config from 'config';
import logger from '../logger';

class Queue extends Bull {
  constructor(name, process) {
    const redisOptions = {
      redis: {
        port: config.get('redis.port'),
        host: config.get('redis.container'),
      },
    };

    super(name, redisOptions);
    this.process(process);

    this.on('completed', (job, result) => {
      logger.info(`job ${job.jobId} completed with ${result}`);
    });

    this.on('failed', (job, err) => {
      logger.error(`job ${job.jobId} failed with ${err}`);
    });

    this.on('error', (err) => {
      logger.error(err);
    });
  }
}

export default Queue;
