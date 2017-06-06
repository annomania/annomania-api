/* eslint-env mocha */
import express from 'express';
import bodyParser from 'body-parser';
import request from 'supertest';
import httpStatus from 'http-status';
import { expect } from 'chai';
import Server from '../../src/server';
import * as db from '../../src/data/db';
import { User } from '../../src/data/model';
import { kongMiddleware } from '../../src/middleware';

describe('## middleware.kong', () => {
  let server;
  beforeEach(() => {
    const router = express.Router();
    router.get('/', (req, res) => res.send('Hello!'));
    server = new Server();
    server.useMiddleware(bodyParser.json());
    server.useMiddleware(kongMiddleware);
    server.useMiddleware(router);

    return server.start()
      .then(() => db.connect())
      .then(() => db.dropDatabase());
  });

  afterEach(() => db.disconnect()
    .then(() => server.stop()));

  it('should allow existing user by kong header', () => {
    const kongId = 'kong-consumer-id1';
    const username = 'user1';

    return User.create({ kongId, username })
      .then(() =>
        request(server.app)
          .get('/')
          .set('X-Consumer-ID', kongId)
          .set('X-Consumer-Username', username)
          .send()
          .expect(httpStatus.OK));
  });

  it('should add a new user by kong header', () => {
    const kongId = 'kong-consumer-id2';
    const username = 'user2';

    return request(server.app)
        .get('/')
        .set('X-Consumer-ID', kongId)
        .set('X-Consumer-Username', username)
        .send()
        .expect(httpStatus.OK)
      .then(() => User.findOne({ kongId }).exec())
      .then((user) => {
        expect(user).to.exist;
        expect(user.username).to.equal(username);
      });
  });

  it('should return UNAUTHORIZED if kong header is not present', () =>
    request(server.app)
      .get('/')
      .send()
      .expect(httpStatus.UNAUTHORIZED));
});
