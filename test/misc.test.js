/* eslint-env mocha */

import request from 'supertest';
import httpStatus from 'http-status';
import { expect } from 'chai';
import * as util from './util';

describe('## misc', () => {
  const server = util.setupServer();

  beforeEach(() => server.start());
  afterEach(() => server.stop());

  describe('# GET /health-check', () => {
    it('should return OK', () =>
      request(server.app)
        .get('/health-check')
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.text).to.equal('OK');
        }));
  });

  describe('# GET /api-docs', () => {
    it('should return OK', () =>
      request(server.app)
        .get('/api-docs/swagger.yaml')
        .expect(httpStatus.OK));

    it('should return NOT FOUND on invalid file type', () =>
      request(server.app)
        .get('/api-docs/swagger.txt')
        .expect(httpStatus.NOT_FOUND));
  });
});
