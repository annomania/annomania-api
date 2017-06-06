/* eslint-env mocha */

import { expect } from 'chai';
import { User } from '../../../src/data/model';
import * as db from '../../../src/data/db';
import * as factories from '../../factory';

describe('## data.db.model.user', () => {
  beforeEach(() => db.connect()
    .then(() => db.dropDatabase())
    .then(() => User.ensureIndexes()));

  afterEach(() => db.disconnect());

  describe('# mongoose schema', () => {
    it('should get the model', () => {
      expect(User).to.exist;
    });
  });

  describe('# constraints', () => {
    const user = factories.User.build();

    it('should reject with existing username', (done) => {
      const duplicateUser = factories.User.build({ username: user.username });

      User.create(user)
        .then(() => User.create(duplicateUser))
        .catch(() => done());
    });

    it('should reject with existing kongId', (done) => {
      const duplicateUser = factories.User.build({ kongId: user.kongId });

      User.create(user)
        .then(() => User.create(duplicateUser))
        .catch(() => done());
    });
  });

  describe('# findByKongConsumer', () => {
    const user = factories.User.build();

    it('should resolve and create new user with kong credentials', () =>
      User.findByKongConsumer({ id: user.kongId, username: user.username })
        .then(() => User.findOne({ kongId: user.kongId }).exec())
        .then((dbUser) => {
          expect(dbUser.username).to.equal(user.username);
          expect(dbUser.kongId).to.equal(user.kongId);
        }));

    it('should resolve with existing user', () =>
      User.create(user)
        .then(() => User.findByKongConsumer({ id: user.kongId, username: user.username }))
        .then((dbUser) => {
          expect(dbUser.username).to.equal(user.username);
          expect(dbUser.kongId).to.equal(user.kongId);
        }));
  });
});
