/* eslint-env mocha */

import request from 'supertest';
import httpStatus from 'http-status';
import { expect } from 'chai';
import * as util from './util';

describe('## main', () => {
  const server = util.setupServer();

  beforeEach(() => server.start());
  afterEach(() => server.stop());

  describe('# GET /', () => {
    it('should return Hello Annomania', () =>
      request(server.app)
        .get('/')
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.text).to.equal('Hello Annomania!');
        }));
  });
});
