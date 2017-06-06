/* eslint-env mocha */

import { expect } from 'chai';
import config from 'config';
import fs from 'fs';
import path from 'path';
import logger from '../src/logger';

describe('## logger', () => {
  describe('# module', () => {
    it('should exist', () => {
      expect(logger).to.exist;
    });

    it('should have correct log level set', () => {
      expect(logger.level).to.equal(config.get('logging.level'));
    });

    it('should have log functions for basic levels', () => {
      expect(logger.debug).to.be.a('function');
      expect(logger.info).to.be.a('function');
      expect(logger.warn).to.be.a('function');
      expect(logger.error).to.be.a('function');
    });
  });

  describe('# log dir', () => {
    it('should create log dir if not exists and is in config', (done) => {
      const logDir = path.join(__dirname, '../logs');

      if (config.get('logging.file')) {
        expect(fs.existsSync(logDir)).to.equal(config.get('logging.file'));
      }
      done();
    });
  });
});
