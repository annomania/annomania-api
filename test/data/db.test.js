/* eslint-env mocha */

import { expect } from 'chai';
import * as db from '../../src/data/db';

describe('## data.db', () => {
  beforeEach(() => db.disconnect());

  describe('# connection', () => {
    it('connects to db', () =>
      db.connect()
        .then(() => {
          expect(db.readyState()).to.equal(db.STATES.connected);
        }));

    it('uses existing connection if already connected to db', () =>
      db.connect()
        .then(() => db.connect())
        .then(() => {
          expect(db.readyState()).to.equal(db.STATES.connected);
        }));

    it('reject if still connecting (promise direct return -> no wait)', () =>
      db.connect()
        .then(db.connect()
          .catch((err) => {
            expect(err).to.exist;
          })));

    it('disconnects from db', () =>
      db.connect()
        .then(() => db.disconnect())
        .then(() => {
          expect(db.readyState()).to.equal(db.STATES.disconnected);
        }));

    it('noop if already disconnected from db', () =>
      db.disconnect()
        .then(() => {
          expect(db.readyState()).to.equal(db.STATES.disconnected);
        }));

    it('reject if still disconnecting (promise direct return -> no wait)', () =>
      db.connect()
        .then(() => db.disconnect())
        .then(db.disconnect()
          .catch((err) => {
            expect(err).to.exist;
          })));
  });

  describe('# dropping', () => {
    it('drops the database', () =>
      db.connect()
        .then(() => db.dropDatabase()));
  });
});
