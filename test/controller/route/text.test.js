/* eslint-env mocha */

import request from 'supertest';
import httpStatus from 'http-status';
import { expect } from 'chai';
import mongoose from 'mongoose';
import { User, Text, Set } from '../../../src/data/model';
import * as factories from '../../factory';
import * as util from '../../util';
import * as db from '../../../src/data/db';

describe('## controller.text', () => {
  const server = util.setupServer();

  beforeEach(() => server.start()
    .then(() => db.connect())
    .then(() => db.dropDatabase())
    .then(() => Text.ensureIndexes()));

  afterEach(() => db.disconnect()
    .then(() => server.stop()));

  describe('# POST /text', () => {
    const user = factories.User.build();
    const set = factories.Set.build({ owner: user._id });

    it('should return CREATED text', () => {
      const text = factories.Text.build({ setId: set._id });

      return User.create(user)
        .then(() => Set.create(set))
        .then(() => request(server.app)
          .post(`/set/${set._id}/text`)
          .set('Content-Type', 'application/json')
          .set(util.toKongConsumer(user))
          .send(text)
          .expect(httpStatus.CREATED))
        .then((res) => {
          expect(res.body.text).to.equal(text.text);
        });
    });

    it('should return CREATED texts', () => {
      const texts = factories.Text.buildList(4, { setId: set._id });

      return User.create(user)
        .then(() => Set.create(set))
        .then(() => request(server.app)
          .post(`/set/${set._id}/text`)
          .set('Content-Type', 'application/json')
          .set(util.toKongConsumer(user))
          .send(texts)
          .expect(httpStatus.CREATED))
        .then((res) => {
          expect(res.body[0].text).to.equal(texts[0].text);
          expect(res.body[1].text).to.equal(texts[1].text);
          expect(res.body[2].text).to.equal(texts[2].text);
          expect(res.body[3].text).to.equal(texts[3].text);
        });
    });

    it('should return BAD REQUEST on empty text object', () => {
      const errorObject = { clientError: [
        'Text validation failed',
        'text is required',
      ] };

      return User.create(user)
        .then(() => Set.create(set))
        .then(() => request(server.app)
          .post(`/set/${set._id}/text`)
          .set('Content-Type', 'application/json')
          .set(util.toKongConsumer(user))
          .send({})
          .expect(httpStatus.BAD_REQUEST))
          .then((res) => {
            expect(res.body).to.deep.equal(errorObject);
          });
    });

    it('should return BAD REQUEST on empty text content', () => {
      const text = factories.Text.build({ text: '' });
      const errorObject = { clientError: [
        'Text validation failed',
        'text is required',
      ] };

      return User.create(user)
        .then(() => Set.create(set))
        .then(() => request(server.app)
          .post(`/set/${set._id}/text`)
          .set('Content-Type', 'application/json')
          .set(util.toKongConsumer(user))
          .send(text)
          .expect(httpStatus.BAD_REQUEST))
          .then((res) => {
            expect(res.body).to.deep.equal(errorObject);
          });
    });

    it('should return BAD REQUEST on invalid text array', () => {
      const texts = factories.Text.buildList(4, { setId: set._id });
      texts[2] = { invalidField: 1 };

      return User.create(user)
        .then(() => Set.create(set))
        .then(() => request(server.app)
          .post(`/set/${set._id}/text`)
          .set('Content-Type', 'application/json')
          .set(util.toKongConsumer(user))
          .send(texts)
          .expect(httpStatus.BAD_REQUEST));
    });

    it('should return UNAUTHORIZED if not set owner', () => {
      const unauthorizedUser = factories.User.build();
      const text = factories.Text.build({ setId: set._id });

      return User.create(user)
        .then(() => Set.create(set))
        .then(() => request(server.app)
          .post(`/set/${set._id}/text`)
          .set('Content-Type', 'application/json')
          .set(util.toKongConsumer(unauthorizedUser))
          .send(text)
          .expect(httpStatus.UNAUTHORIZED));
    });
  });

  describe('# POST /text with metadata', () => {
    const user = factories.User.build();
    const set = factories.Set.build({
      owner: user._id,
      textSchema: {
        type: 'object',
        properties: {
          tweetid: { type: 'string' },
          twitteruser: { type: 'string' },
        },
        required: ['tweetid', 'twitteruser'],
      },
    });

    it('should return CREATED text with valid metaschema', () => {
      const text = factories.Text.build({
        setId: set._id,
        meta: { tweetid: '12234', twitteruser: 'Hans' },
      });

      return User.create(user)
        .then(() => Set.create(set))
        .then(() => request(server.app)
          .post(`/set/${set._id}/text`)
          .set('Content-Type', 'application/json')
          .set(util.toKongConsumer(user))
          .send(text)
          .expect(httpStatus.CREATED))
        .then((res) => {
          expect(res.body.text).to.equal(text.text);
        });
    });

    it('should return BAD REQUEST on invalid metaschema', () => {
      const text = factories.Text.build({
        setId: set._id,
        meta: { tweetid: '12234', twitteruser: 1 },
      });

      const errorObject = { clientError: [
        'ValidationError',
        'text meta validation failed',
        'should be string',
      ] };

      return User.create(user)
        .then(() => Set.create(set))
        .then(() => request(server.app)
          .post(`/set/${set._id}/text`)
          .set('Content-Type', 'application/json')
          .set(util.toKongConsumer(user))
          .send(text)
          .expect(httpStatus.BAD_REQUEST))
        .then((res) => {
          expect(res.body).to.deep.equal(errorObject);
        });
    });

    it('should return BAD REQUEST on inexisting meta but defined on set', () => {
      const text = factories.Text.build({ setId: set._id });
      const errorObject = { clientError: [
        'ValidationError',
        'text meta validation failed',
        'should be object',
      ] };

      return User.create(user)
        .then(() => Set.create(set))
        .then(() => request(server.app)
          .post(`/set/${set._id}/text`)
          .set('Content-Type', 'application/json')
          .set(util.toKongConsumer(user))
          .send(text)
          .expect(httpStatus.BAD_REQUEST))
        .then((res) => {
          expect(res.body).to.deep.equal(errorObject);
        });
    });

    it('should return CREATED on inexisting text schema on set but existing meta', () => {
      const text = factories.Text.build({ setId: set._id,
        meta: {
          tweetid: '1234',
          twitteruser: 'twitterer',
          language: 'es',
        } });

      return User.create(user)
        .then(() => Set.create(set))
        .then(() => request(server.app)
          .post(`/set/${set._id}/text`)
          .set('Content-Type', 'application/json')
          .set(util.toKongConsumer(user))
          .send(text)
          .expect(httpStatus.CREATED));
    });
  });

  describe('# PUT /text/:id', () => {
    const user = factories.User.build();
    const set = factories.Set.build({ owner: user._id });

    it('should return OK on valid update', () => {
      const initialText = factories.Text.build({ setId: set._id });

      return User.create(user)
        .then(() => Set.create(set))
        .then(() => Text.create(initialText))
        .then(() => request(server.app)
          .put(`/set/${set._id}/text/${initialText._id}`)
          .set('Content-Type', 'application/json')
          .set(util.toKongConsumer(user))
          .send({ text: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr' })
          .expect(httpStatus.OK));
    });

    it('should return BAD REQUEST request on empty text object update', () => {
      const initalText = factories.Text.build({ setId: set._id });

      return User.create(user)
        .then(() => Set.create(set))
        .then(() => Text.create(initalText))
        .then(() => request(server.app)
          .put(`/set/${set._id}/text/${initalText._id}`)
          .set('Content-Type', 'application/json')
          .set(util.toKongConsumer(user))
          .send({})
          .expect(httpStatus.BAD_REQUEST));
    });

    it('should return BAD REQUEST on empty text content update', () => {
      const initalText = factories.Text.build({ setId: set._id });
      const errorObject = { clientError: [
        'Validation failed',
        'text is required',
      ] };

      return User.create(user)
        .then(() => Set.create(set))
        .then(() => Text.create(initalText))
        .then(() => request(server.app)
          .put(`/set/${set._id}/text/${initalText._id}`)
          .set('Content-Type', 'application/json')
          .set(util.toKongConsumer(user))
          .send({ text: '' })
          .expect(httpStatus.BAD_REQUEST))
        .then((res) => {
          expect(res.body).to.deep.equal(errorObject);
        });
    });

    it('should return NOT FOUND on put of inexisting text', () => {
      const textId = mongoose.Types.ObjectId().toString();

      return User.create(user)
        .then(() => Set.create(set))
        .then(() => request(server.app)
          .put(`/set/${set._id}/text/${textId}`)
          .set('Content-Type', 'application/json')
          .set(util.toKongConsumer(user))
          .send({ text: 'Lorem ipsum' })
          .expect(httpStatus.NOT_FOUND));
    });

    it('should return UNAUTHORIZED if not set owner', () => {
      const unauthorizedUser = factories.User.build();
      const text = factories.Text.build({ setId: set._id });

      return User.create(user)
        .then(() => Set.create(set))
        .then(() => request(server.app)
          .post(`/set/${set._id}/text`)
          .set('Content-Type', 'application/json')
          .set(util.toKongConsumer(unauthorizedUser))
          .send(text)
          .expect(httpStatus.UNAUTHORIZED));
    });
  });

  describe('# PUT /text/:id with metaschema', () => {
    const user = factories.User.build();
    const set = factories.Set.build({
      owner: user._id,
      textSchema: {
        type: 'object',
        properties: {
          tweetid: { type: 'string' },
          twitteruser: { type: 'string' },
        },
        required: ['tweetid', 'twitteruser'],
      },
    });
    const initialText = factories.Text.build({
      setId: set._id,
      meta: {
        tweetid: '12234',
        twitteruser: 'Hans',
      },
    });

    it('should return OK with valid metaschema', () =>
      User.create(user)
        .then(() => Set.create(set))
        .then(() => Text.create(initialText))
        .then(() => request(server.app)
          .put(`/set/${set._id}/text/${initialText._id}`)
          .set('Content-Type', 'application/json')
          .set(util.toKongConsumer(user))
          .send({
            text: 'Lorem ipsum dolor sit amet!!',
            meta: {
              tweetid: '4321',
              twitteruser: 'Test',
            },
          })
          .expect(httpStatus.OK)));

    it('should return BAD REQUEST on invalid metaschema', () => {
      const errorObject = { clientError: [
        'ValidationError',
        'text meta validation failed',
        'should be string',
      ] };

      return User.create(user)
        .then(() => Set.create(set))
        .then(() => Text.create(initialText))
        .then(() => request(server.app)
          .put(`/set/${set._id}/text/${initialText._id}`)
          .set('Content-Type', 'application/json')
          .set(util.toKongConsumer(user))
          .send({
            meta: {
              tweetid: '12234',
              twitteruser: 1,
            },
          })
          .expect(httpStatus.BAD_REQUEST))
        .then((res) => {
          expect(res.body).to.deep.equal(errorObject);
        });
    });

    it('should return OK on inexisting text schema on set but existing meta', () => {
      const newText = {
        meta: {
          tweetid: '12234',
          twitteruser: 'twitterer',
          language: 'es',
        },
      };

      return User.create(user)
        .then(() => Set.create(set))
        .then(() => Text.create(initialText))
        .then(() => request(server.app)
          .put(`/set/${set._id}/text/${initialText._id}`)
          .set('Content-Type', 'application/json')
          .set(util.toKongConsumer(user))
          .send(newText)
          .expect(httpStatus.OK));
    });
  });

  describe('# DELETE /text/:id', () => {
    const user = factories.User.build();
    const set = factories.Set.build({ owner: user._id });

    it('should return OK on delete text', () => {
      const text = factories.Text.build({ setId: set._id });

      return User.create(user)
        .then(() => Set.create(set))
        .then(() => Text.create(text))
        .then(() => request(server.app)
          .delete(`/set/${set._id}/text/${text._id}`)
          .set(util.toKongConsumer(user))
          .expect(httpStatus.OK))
        .then(() => Text.findById(text._id).exec())
        .then((dbText) => {
          expect(dbText).to.not.exist;
        });
    });

    it('should return NOT FOUND on delete of inexisting text ', () => {
      const textId = mongoose.Types.ObjectId().toString();

      return User.create(user)
        .then(() => Set.create(set))
        .then(() => request(server.app)
          .delete(`/set/${set._id}/text/${textId}`)
          .set(util.toKongConsumer(user))
          .expect(httpStatus.NOT_FOUND));
    });

    it('should return UNAUTHORIZED if not set owner', () => {
      const unauthorizedUser = factories.User.build();
      const text = factories.Text.build({ setId: set._id });

      return User.create(user)
        .then(() => Set.create(set))
        .then(() => Text.create(text))
        .then(() => request(server.app)
          .delete(`/set/${set._id}/text/${text._id}`)
          .set(util.toKongConsumer(unauthorizedUser))
          .expect(httpStatus.UNAUTHORIZED));
    });
  });

  describe('# GET /text/ with a strategy', () => {
    const user = factories.User.build();
    const set = factories.Set.build({ owner: user._id });

    it('should return OK and random Texts', () => {
      const text = factories.Text.build({ setId: set._id });

      return User.create(user)
        .then(() => Set.create(set))
        .then(() => Text.create(text))
        .then(() => request(server.app)
          .get(`/set/${set._id}/text/`)
          .query({ fetchStrategy: 'random', amount: 1 })
          .set(util.toKongConsumer(user))
          .expect(httpStatus.OK))
        .then((res) => {
          expect(res.body[0]._id).to.equal(text._id);
        });
    });

    it('should return OK and only public properties', () => {
      const text = factories.Text.build({
        setId: set._id,
        annotationTypeStatus: [{
          annotationTypeId: set.annotationTypes[0]._id,
          annotationOptionId: set.annotationTypes[0].options[0]._id,
          ratio: 1,
          annotationCount: 1,
        }] });

      return User.create(user)
        .then(() => Set.create(set))
        .then(() => Text.create(text))
        .then(() => request(server.app)
          .get(`/set/${set._id}/text/`)
          .query({ amount: 1 })
          .set(util.toKongConsumer(user))
          .expect(httpStatus.OK))
        .then((res) => {
          expect(Text.publicProjection()).to.include.all.keys(Object.keys(res.body[0]));
        });
    });

    it('should return OK and a Text with default strategy on unset strategy', () => {
      const text = factories.Text.build({ setId: set._id });

      return User.create(user)
        .then(() => Set.create(set))
        .then(() => Text.create(text))
        .then(() => request(server.app)
          .get(`/set/${set._id}/text/`)
          .query({ amount: 1 })
          .set(util.toKongConsumer(user))
          .expect(httpStatus.OK))
        .then((res) => {
          expect(res.body[0]._id).to.equal(text._id);
        });
    });

    it('should return OK and the least annotated Texts', () => {
      const texts = [
        factories.Text.build({
          setId: set._id,
          text: 'Text about unicorns',
          annotationTypeStatus: [{
            annotationTypeId: set.annotationTypes[0]._id,
            annotationOptionId: set.annotationTypes[0].options[0]._id,
            ratio: 0.8,
            annotationCount: 5,
          }] }),
        factories.Text.build({
          setId: set._id,
          text: 'Another interesting text about unicorns',
          annotationTypeStatus: [{
            annotationTypeId: set.annotationTypes[0]._id,
            annotationOptionId: set.annotationTypes[0].options[0]._id,
            ratio: 0.6,
            annotationCount: 2,
          }] }),
        factories.Text.build({
          setId: set._id,
          text: 'Motorcycles are another topic',
          annotationTypeStatus: [{
            annotationTypeId: set.annotationTypes[0]._id,
            annotationOptionId: set.annotationTypes[0].options[0]._id,
            ratio: 0.3,
            annotationCount: 1,
          }] }),
        factories.Text.build({
          setId: set._id,
          text: 'Annomania lets you choose any topic',
        }),
      ];

      return User.create(user)
        .then(() => Set.create(set))
        .then(() => Text.insertMany(texts))
        .then(() => request(server.app)
          .get(`/set/${set._id}/text/`)
          .query({ fetchStrategy: 'leastAnnotated', amount: 2 })
          .set(util.toKongConsumer(user))
          .expect(httpStatus.OK))
        .then((res) => {
          const textIds = res.body.map(text => text._id);
          expect(textIds).to.include(texts[2]._id);
          expect(textIds).to.include(texts[3]._id);
        });
    });

    it('should return OK and texts that match a topic with topic strategy', () => {
      const texts = [
        factories.Text.build({ setId: set._id, text: 'Text about unicorn' }),
        factories.Text.build({ setId: set._id, text: 'Another interesting text about unicorn' }),
        factories.Text.build({ setId: set._id, text: 'Motorcycles are another topic' }),
        factories.Text.build({ setId: set._id, text: 'Annomania lets you choose any topic' }),
      ];

      return User.create(user)
        .then(() => Set.create(set))
        .then(() => Text.insertMany(texts))
        .then(() => request(server.app)
          .get(`/set/${set._id}/text/`)
          .query({ fetchStrategy: 'topic', amount: 2, topic: 'Unicorn' })
          .set(util.toKongConsumer(user))
          .expect(httpStatus.OK));
    });

    it('should return OK and only Texts from queried Set', () => {
      const set2 = factories.Set.build({ owner: user._id });
      const textsSet = [
        factories.Text.build({ setId: set._id, text: 'This is a Text from Set 1' }),
        factories.Text.build({ setId: set._id, text: 'This is a another Text from Set 1' }),
      ];
      const textsSet2 = [
        factories.Text.build({ setId: set2._id, text: 'This is a Text from Set 2' }),
        factories.Text.build({ setId: set2._id, text: 'This is a another Text from Set 2' }),
      ];

      return User.create(user)
        .then(() => Set.create(set))
        .then(() => Set.create(set2))
        .then(() => Text.insertMany(textsSet))
        .then(() => Text.insertMany(textsSet2))
        .then(() => request(server.app)
          .get(`/set/${set._id}/text/`)
          .query({ amount: 2 })
          .set(util.toKongConsumer(user))
          .expect(httpStatus.OK))
        .then((res) => {
          const textIds = res.body.map(text => text._id);
          expect(textIds).to.include(textsSet[0]._id);
          expect(textIds).to.include(textsSet[1]._id);
        });
    });

    it('should return OK and Texts with default amount on unset amount', () => {
      const text = factories.Text.build({ setId: set._id });

      return User.create(user)
        .then(() => Set.create(set))
        .then(() => Text.create(text))
        .then(() => request(server.app)
          .get(`/set/${set._id}/text/`)
          .query({})
          .set(util.toKongConsumer(user))
          .expect(httpStatus.OK))
        .then((res) => {
          expect(res.body).to.exist;
        });
    });

    it('should return BAD REQUEST with negative amount', () => {
      const text = factories.Text.build({ setId: set._id });

      return User.create(user)
        .then(() => Set.create(set))
        .then(() => Text.create(text))
        .then(() => request(server.app)
          .get(`/set/${set._id}/text/`)
          .query({ amount: -2 })
          .set(util.toKongConsumer(user))
          .expect(httpStatus.BAD_REQUEST));
    });

    it('should return BAD REQUEST with non number', () => {
      const text = factories.Text.build({ setId: set._id });

      return User.create(user)
        .then(() => Set.create(set))
        .then(() => Text.create(text))
        .then(() => request(server.app)
          .get(`/set/${set._id}/text/`)
          .query({ amount: 'notanumber' })
          .set(util.toKongConsumer(user))
          .expect(httpStatus.BAD_REQUEST));
    });
  });

  describe('# Route Params', () => {
    it('should return NOT FOUND on inexisting setId', () => {
      const user = factories.User.build();
      const randomSetId = mongoose.Types.ObjectId().toString();
      const text = factories.Text.build();

      return User.create(user)
        .then(() => request(server.app)
          .post(`/set/${randomSetId}/text`)
          .set('Content-Type', 'application/json')
          .set(util.toKongConsumer(user))
          .send(text)
          .expect(httpStatus.NOT_FOUND));
    });
  });

  describe('# Set Privacy', () => {
    it('should return OK if set is private and user is set owner', () => {
      const user = factories.User.build();
      const set = factories.Set.build({ owner: user._id, private: true });

      return User.create(user)
        .then(() => Set.create(set))
        .then(() => request(server.app)
          .get(`/set/${set._id}/text`)
          .set('Content-Type', 'application/json')
          .set(util.toKongConsumer(user))
          .expect(httpStatus.OK));
    });

    it('should return UNAUTHORIZED if set is private and user not set owner', () => {
      const user = factories.User.build();
      const unauthorizedUser = factories.User.build();
      const set = factories.Set.build({ owner: user._id, private: true });

      return User.create(unauthorizedUser)
        .then(() => User.create(user))
        .then(() => Set.create(set))
        .then(() => request(server.app)
          .get(`/set/${set._id}/text`)
          .set('Content-Type', 'application/json')
          .set(util.toKongConsumer(unauthorizedUser))
          .expect(httpStatus.UNAUTHORIZED));
    });

    it('should return OK if set is public and user is set owner', () => {
      const user = factories.User.build();
      const set = factories.Set.build({ owner: user._id, private: false });

      return User.create(user)
        .then(() => Set.create(set))
        .then(() => request(server.app)
          .get(`/set/${set._id}/text`)
          .set('Content-Type', 'application/json')
          .set(util.toKongConsumer(user))
          .expect(httpStatus.OK));
    });

    it('should return OK if set is public and user not set owner', () => {
      const user = factories.User.build();
      const set = factories.Set.build({ private: false });

      return User.create(user)
        .then(() => Set.create(set))
        .then(() => request(server.app)
          .get(`/set/${set._id}/text`)
          .set('Content-Type', 'application/json')
          .set(util.toKongConsumer(user))
          .expect(httpStatus.OK));
    });
  });
});
