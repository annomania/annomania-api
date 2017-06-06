/* eslint-env mocha */

import { expect } from 'chai';
import config from 'config';

describe('## config', () => {
  describe('# properties', () => {
    it('should have required http properties', () => {
      expect(config.has('http.port')).to.equal(true);
    });

    it('should have required db properties', () => {
      expect(config.has('db.name')).to.equal(true);
      expect(config.has('db.port')).to.equal(true);
      expect(config.has('db.container')).to.equal(true);
    });

    it('should have required logging properties', () => {
      expect(config.has('logging.level')).to.equal(true);
      expect(config.has('logging.file')).to.equal(true);
      expect(config.has('logging.console')).to.equal(true);
      expect(config.has('logging.filenameError')).to.equal(true);
      expect(config.has('logging.filenameApp')).to.equal(true);
    });

    it('should have required redis properties', () => {
      expect(config.has('redis.port')).to.equal(true);
      expect(config.has('redis.container')).to.equal(true);
    });

    it('should have required swagger properties', () => {
      expect(config.has('swagger.host')).to.equal(true);
      expect(config.has('swagger.port')).to.equal(true);
    });
  });
});
