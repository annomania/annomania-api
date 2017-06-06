/* eslint-env mocha */

import { expect } from 'chai';
import * as util from './util';

describe('## server', () => {
  const server = util.setupServer();

  beforeEach(() => server.stop());

  describe('# setup', () => {
    it('should setup the server', () => {
      expect(server).to.exist;
      expect(server.app).to.exist;
      expect(server.httpServer).to.exist;
      expect(server.listening).to.equal(false);
    });
  });

  describe('# start/stop', () => {
    it('should start the server', () =>
      server.start()
        .then(() => {
          expect(server.listening).to.equal(true);
        }));

    it('should stop the server', () =>
      server.start()
        .then(() => server.stop())
        .then(() => {
          expect(server.listening).to.equal(false);
        }));

    it('should remain stopped if already stopped', () =>
      server.stop()
        .then(() => {
          expect(server.listening).to.equal(false);
        }));

    it('should remain started if already started', () =>
      server.start()
        .then(() => server.start())
        .then(() => {
          expect(server.listening).to.equal(true);
        }));
  });
});
