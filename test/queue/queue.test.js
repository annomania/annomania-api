/* eslint-env mocha */

import { expect } from 'chai';
import Queue from '../../src/queue/queue';

describe('## queue', () => {
  it('should create queue', () => {
    const queue = new Queue('queue_1', _ => Promise.resolve());
    expect(queue).to.exist;
    expect(queue.add).to.exist;
  });

  it('should process job', (done) => {
    const queue = new Queue('queue_2', _ => Promise.resolve());
    queue.once('completed', () => queue.close().then(done()));
    queue.add({ test: 'test' });
  });

  it('should fail job', (done) => {
    const queue = new Queue('queue_3', _ => Promise.reject(new Error('error')));
    queue.once('failed', () => queue.close().then(done()));
    queue.add({ test: 'test' });
  });
});
