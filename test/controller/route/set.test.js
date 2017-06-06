/* eslint-env mocha */

import request from 'supertest';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import { expect } from 'chai';
import { Set, User } from '../../../src/data/model';
import * as factories from '../../factory';
import * as util from '../../util';
import * as db from '../../../src/data/db';

describe('## controller.set', () => {
  const server = util.setupServer();

  beforeEach(() => server.start()
    .then(() => db.connect())
    .then(() => db.dropDatabase()));

  afterEach(() => db.disconnect()
    .then(() => server.stop()));

  describe('# GET /set', () => {
    const user = factories.User.build();

    it('should return OK and all non private sets', () => {
      const publicSets = factories.Set.buildList(3, { owner: user._id });
      const privateSets = factories.Set.buildList(2, { owner: user._id, private: true });

      const sets = publicSets.concat(privateSets);

      return User.create(user)
        .then(() => Set.insertMany(sets))
        .then(() => request(server.app)
          .get('/set')
          .set(util.toKongConsumer(user))
          .expect(httpStatus.OK))
        .then((res) => {
          expect(res.body.length).to.equal(3);
        });
    });

    it('should return OK and only public properties', () => {
      const setObject = factories.Set.build({ owner: user._id });
      const set = new Set(setObject);

      return User.create(user)
        .then(() => set.save())
        .then(() => request(server.app)
          .get('/set')
          .set(util.toKongConsumer(user))
          .expect(httpStatus.OK))
        .then((res) => {
          expect(Object.keys(res.body[0])).to.eql(Object.keys(set.toPublic()));
        });
    });
  });

  describe('# GET /set/:setid', () => {
    it('should return OK and set you own', () => {
      const user = factories.User.build();
      const setObject = factories.Set.build({ owner: user._id });
      const set = new Set(setObject);

      return User.create(user)
        .then(() => set.save())
        .then(() => request(server.app)
          .get(`/set/${set._id}`)
          .set(util.toKongConsumer(user))
          .expect(httpStatus.OK))
        .then((res) => {
          expect(res.body._id).to.equal(setObject._id);
        });
    });

    it('should return OK and set you do not own with only public properties', () => {
      const user1 = factories.User.build();
      const user2 = factories.User.build();
      const setObject = factories.Set.build({ owner: user1._id });
      const set = new Set(setObject);

      return User.create(user1)
        .then(() => User.create(user2))
        .then(() => set.save())
        .then(() => request(server.app)
          .get(`/set/${set._id}`)
          .set(util.toKongConsumer(user2))
          .expect(httpStatus.OK))
        .then((res) => {
          expect(Object.keys(res.body)).to.eql(Object.keys(set.toPublic()));
        });
    });

    it('should return OK on access private set you own', () => {
      const user = factories.User.build();
      const setObject = factories.Set.build({ owner: user._id, private: true });
      const set = new Set(setObject);

      return User.create(user)
        .then(() => set.save())
        .then(() => request(server.app)
          .get(`/set/${set._id}`)
          .set(util.toKongConsumer(user))
          .expect(httpStatus.OK));
    });

    it('should return UNAUTHORIZED on access private set you do not own', () => {
      const user = factories.User.build();
      const unathorizedUser = factories.User.build();
      const set = factories.Set.build({ owner: user._id, private: true });

      return User.create(user)
        .then(() => User.create(unathorizedUser))
        .then(() => Set.create(set))
        .then(() => request(server.app)
          .get(`/set/${set._id}`)
          .set(util.toKongConsumer(unathorizedUser))
          .expect(httpStatus.UNAUTHORIZED));
    });
  });

  describe('# PUT /set', () => {
    it('should return OK and update properties', () => {
      const user = factories.User.build();
      const initialSet = factories.Set.build({
        owner: user._id,
        name: 'initial',
        private: true,
        language: 'es',
      });
      const updateSet = {
        name: 'updated',
        private: false,
        language: 'en',
      };

      return User.create(user)
        .then(() => Set.create(initialSet))
        .then(() => request(server.app)
          .put(`/set/${initialSet._id}`)
          .set(util.toKongConsumer(user))
          .send(updateSet)
          .expect(httpStatus.OK))
        .then(() => Set.findById(initialSet._id).exec())
        .then((set) => {
          expect(set.name).to.equal(updateSet.name);
          expect(set.language).to.equal(updateSet.language);
          expect(set.private).to.equal(updateSet.private);
        });
    });

    it('should return OK and noop on empty annotationType update', () => {
      const user = factories.User.build();
      const initialSet = factories.Set.build({
        owner: user._id,
        name: 'initial',
        private: true,
        language: 'es',
      });
      const updateSet = {
        name: 'updated',
        annotationTypes: [],
      };

      return User.create(user)
        .then(() => Set.create(initialSet))
        .then(() => request(server.app)
          .put(`/set/${initialSet._id}`)
          .set(util.toKongConsumer(user))
          .send(updateSet)
          .expect(httpStatus.OK))
        .then(() => Set.findById(initialSet._id).exec())
        .then((set) => {
          expect(set.name).to.equal(updateSet.name);
          expect(set.annotationTypes.length).to.equal(initialSet.annotationTypes.length);
          expect(set.annotationTypes.id(initialSet.annotationTypes[0]._id)).to.exist;
        });
    });

    it('should return OK and push annotationTypes', () => {
      const user = factories.User.build();
      const initialSet = factories.Set.build({
        owner: user._id,
      });
      const updateSet = {
        annotationTypes: [factories.AnnotationType.build()],
      };

      return User.create(user)
        .then(() => Set.create(initialSet))
        .then(() => request(server.app)
          .put(`/set/${initialSet._id}`)
          .set(util.toKongConsumer(user))
          .send(updateSet)
          .expect(httpStatus.OK))
        .then(() => Set.findById(initialSet._id).exec())
        .then((set) => {
          expect(set.annotationTypes.length).to.equal(2);
          expect(set.annotationTypes.id(updateSet.annotationTypes[0]._id)).to.exist;
        });
    });
  });

  describe('# POST /set', () => {
    it('should return CREATED', () => {
      const user = factories.User.build();
      const set = factories.Set.build({
        owner: user._id,
        meta: { usertype: 'twitter' },
      });

      return User.create(user)
        .then(() => request(server.app)
          .post('/set')
          .set(util.toKongConsumer(user))
          .send(set)
          .expect(httpStatus.CREATED))
        .then((res) => {
          const setObject = JSON.parse(JSON.stringify(set));
          expect(res.body.name).to.equal(setObject.name);
          expect(res.body.owner).to.exist;
          expect(res.body.annotationTypes).to.eql(setObject.annotationTypes);
          expect(res.body.language).to.equal(setObject.language);
          expect(res.body.meta).to.eql(setObject.meta);
        });
    });

    it('should return CREATED for set without meta', () => {
      const user = factories.User.build();
      const set = factories.Set.build({
        owner: user._id,
      });

      return User.create(user)
        .then(() => request(server.app)
          .post('/set')
          .set('Content-Type', 'application/json')
          .set(util.toKongConsumer(user))
          .send(set)
          .expect(httpStatus.CREATED))
        .then((res) => {
          const setObject = JSON.parse(JSON.stringify(set));
          expect(res.body.name).to.equal(setObject.name);
          expect(res.body.owner).to.exist;
          expect(res.body.annotationTypes).to.eql(setObject.annotationTypes);
          expect(res.body.language).to.equal(setObject.language);
        });
    });

    it('should return BAD REQUEST for set with no name', () => {
      const user = factories.User.build();
      const set = factories.Set.build({ name: null });
      const errorObject = { clientError: [
        'Set validation failed',
        'name is required',
      ] };

      return User.create(user)
        .then(() => request(server.app)
          .post('/set')
          .set('Content-Type', 'application/json')
          .set(util.toKongConsumer(user))
          .send(set)
          .expect(httpStatus.BAD_REQUEST))
        .then((res) => {
          expect(res.body).to.deep.equal(errorObject);
        });
    });
  });

  describe('# DELETE /set/:id', () => {
    it('should return OK on delete set', () => {
      const user = factories.User.build();
      const set = factories.Set.build({ owner: user._id });

      return User.create(user)
        .then(() => Set.create(set))
        .then(() => request(server.app)
          .delete(`/set/${set._id}`)
          .set(util.toKongConsumer(user))
          .expect(httpStatus.OK))
        .then(() => Set.findById(set._id).exec())
        .then((dbSet) => {
          expect(dbSet).to.not.exist;
        });
    });

    it('should return UNAUTHORIZED on delete of set you do not own', () => {
      const user1 = factories.User.build();
      const user2 = factories.User.build();
      const set = factories.Set.build({ owner: user1._id });

      return User.create(user1)
        .then(() => User.create(user2))
        .then(() => Set.create(set))
        .then(() => request(server.app)
          .delete(`/set/${set._id}`)
          .set(util.toKongConsumer(user2))
          .expect(httpStatus.UNAUTHORIZED));
    });

    it('should return NOT FOUND on delete of inexisting set ', () => {
      const user = factories.User.build();
      const setId = mongoose.Types.ObjectId().toString();

      return User.create(user)
        .then(() => request(server.app)
          .delete(`/set/${setId}`)
          .set(util.toKongConsumer(user))
          .expect(httpStatus.NOT_FOUND));
    });
  });
});
