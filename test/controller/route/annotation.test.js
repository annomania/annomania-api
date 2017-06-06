/* eslint-env mocha */

import request from 'supertest';
import httpStatus from 'http-status';
import sinon from 'sinon';
import mongoose from 'mongoose';
import { expect } from 'chai';
import { Text, User, Set, Annotation } from '../../../src/data/model';
import * as factories from '../../factory';
import * as util from '../../util';
import * as db from '../../../src/data/db';
import annotationTypeStatusQueue from '../../../src/queue';

describe('## controller.annotation', () => {
  const server = util.setupServer();

  beforeEach(() => server.start()
    .then(() => db.connect())
    .then(() => db.dropDatabase())
    .then(() => sinon.stub(annotationTypeStatusQueue, 'add')));

  afterEach(() => db.disconnect()
    .then(() => server.stop())
    .then(() => annotationTypeStatusQueue.add.restore()));

  describe('# POST /annotation', () => {
    const user = factories.User.build();
    const set = factories.Set.build({ owner: user._id });
    const text = factories.Text.build({ setId: set._id });

    it('should return CREATED', () => {
      const annotation = factories.Annotation.build({
        annotationTypeId: set.annotationTypes[0]._id,
        annotationOptionId: set.annotationTypes[0].options[0]._id,
      });

      return User.create(user)
        .then(() => Set.create(set))
        .then(() => Text.create(text))
        .then(() => request(server.app)
          .post(`/set/${set._id}/text/${text._id}/annotation`)
          .set('Content-Type', 'application/json')
          .set(util.toKongConsumer(user))
          .send(annotation)
          .expect(httpStatus.CREATED))
        .then(() => {
          expect(annotationTypeStatusQueue.add.calledOnce).to.equal(true);
        });
    });

    it('should return CREATED and only public properties', () => {
      const annotationObject = factories.Annotation.build({
        annotationTypeId: set.annotationTypes[0]._id,
        annotationOptionId: set.annotationTypes[0].options[0]._id,
      });
      const annotation = new Annotation(annotationObject);

      return User.create(user)
        .then(() => Set.create(set))
        .then(() => Text.create(text))
        .then(() => request(server.app)
          .post(`/set/${set._id}/text/${text._id}/annotation`)
          .set('Content-Type', 'application/json')
          .set(util.toKongConsumer(user))
          .send(annotationObject)
          .expect(httpStatus.CREATED))
        .then((res) => {
          expect(Object.keys(res.body)).to.eql(Object.keys(annotation.toPublic()));
        });
    });

    it('should return BAD REQUEST on empty annotation object', () => {
      const errorObject = {
        clientError: [
          'Annotation validation failed',
          'annotationOptionId is required',
          'annotationTypeId is required',
        ] };

      return User.create(user)
        .then(() => Set.create(set))
        .then(() => Text.create(text))
        .then(() => request(server.app)
          .post(`/set/${set._id}/text/${text._id}/annotation`)
          .set('Content-Type', 'application/json')
          .set(util.toKongConsumer(user))
          .send({})
          .expect(httpStatus.BAD_REQUEST))
        .then((res) => {
          expect(annotationTypeStatusQueue.add.notCalled).to.equal(true);
          expect(res.body).to.deep.equal(errorObject);
        });
    });

    it('should return BAD REQUEST on inexisting annotationOptionId', () => {
      const annotation = factories.Annotation.build({
        annotationTypeId: set.annotationTypes[0]._id,
        annotationOptionId: mongoose.Types.ObjectId().toString(),
      });
      const errorObject = {
        clientError: [
          'Annotation validation failed',
          'annotationOptionId is invalid',
        ] };

      return User.create(user)
        .then(() => Set.create(set))
        .then(() => Text.create(text))
        .then(() => request(server.app)
          .post(`/set/${set._id}/text/${text._id}/annotation`)
          .set('Content-Type', 'application/json')
          .set(util.toKongConsumer(user))
          .send(annotation)
          .expect(httpStatus.BAD_REQUEST))
        .then((res) => {
          expect(annotationTypeStatusQueue.add.notCalled).to.equal(true);
          expect(res.body).to.deep.equal(errorObject);
        });
    });

    it('should return BAD REQUEST on missing annotationOptionId', () => {
      const annotation = factories.Annotation.build({
        annotationTypeId: set.annotationTypes[0]._id,
      });
      const errorObject = {
        clientError: [
          'Annotation validation failed',
          'annotationOptionId is required',
        ] };

      return User.create(user)
        .then(() => Set.create(set))
        .then(() => Text.create(text))
        .then(() => request(server.app)
          .post(`/set/${set._id}/text/${text._id}/annotation`)
          .set('Content-Type', 'application/json')
          .set(util.toKongConsumer(user))
          .send(annotation)
          .expect(httpStatus.BAD_REQUEST))
        .then((res) => {
          expect(res.body).to.deep.equal(errorObject);
        });
    });

    it('should return BAD REQUEST on missing annotationTypeId', () => {
      const annotation = factories.Annotation.build({
        annotationOptionId: set.annotationTypes[0].options[0]._id,
      });
      const errorObject = {
        clientError: [
          'Annotation validation failed',
          'annotationTypeId is required',
        ] };

      return User.create(user)
        .then(() => Set.create(set))
        .then(() => Text.create(text))
        .then(() => request(server.app)
          .post(`/set/${set._id}/text/${text._id}/annotation`)
          .set('Content-Type', 'application/json')
          .set(util.toKongConsumer(user))
          .send(annotation)
          .expect(httpStatus.BAD_REQUEST))
        .then((res) => {
          expect(annotationTypeStatusQueue.add.notCalled).to.equal(true);
          expect(res.body).to.deep.equal(errorObject);
        });
    });

    it('should return BAD REQUEST on inexisting annotationTypeId', () => {
      const annotation = factories.Annotation.build({
        annotationTypeId: mongoose.Types.ObjectId().toString(),
        annotationOptionId: set.annotationTypes[0].options[0]._id,
      });
      const errorObject = {
        clientError: [
          'Annotation validation failed',
          'annotationTypeId is invalid',
        ] };

      return User.create(user)
        .then(() => Set.create(set))
        .then(() => Text.create(text))
        .then(() => request(server.app)
          .post(`/set/${set._id}/text/${text._id}/annotation`)
          .set('Content-Type', 'application/json')
          .set(util.toKongConsumer(user))
          .send(annotation)
          .expect(httpStatus.BAD_REQUEST))
        .then((res) => {
          expect(annotationTypeStatusQueue.add.notCalled).to.equal(true);
          expect(res.body).to.deep.equal(errorObject);
        });
    });
  });

  describe('# Route Params', () => {
    const user = factories.User.build();
    const set = factories.Set.build({ owner: user._id });

    it('should return NOT FOUND on inexisting textId', () => {
      const textId = mongoose.Types.ObjectId().toString();
      const annotation = factories.Annotation.build({
        annotationTypeId: set.annotationTypes[0]._id,
        annotationOptionId: set.annotationTypes[0].options[0]._id,
      });

      return User.create(user)
        .then(() => Set.create(set))
        .then(() => request(server.app)
          .post(`/set/${set._id}/text/${textId}/annotation`)
          .set('Content-Type', 'application/json')
          .set(util.toKongConsumer(user))
          .send(annotation)
          .expect(httpStatus.NOT_FOUND))
        .then(() => {
          expect(annotationTypeStatusQueue.add.notCalled).to.equal(true);
        });
    });
  });

  describe('# Set Privacy', () => {
    it('should return CREATED if set is private and user is set owner', () => {
      const user = factories.User.build();
      const set = factories.Set.build({ owner: user._id, private: true });
      const text = factories.Text.build({ setId: set._id });
      const annotation = factories.Annotation.build({
        annotationTypeId: set.annotationTypes[0]._id,
        annotationOptionId: set.annotationTypes[0].options[0]._id,
      });

      return User.create(user)
        .then(() => Set.create(set))
        .then(() => Text.create(text))
        .then(() => request(server.app)
          .post(`/set/${set._id}/text/${text._id}/annotation`)
          .set('Content-Type', 'application/json')
          .set(util.toKongConsumer(user))
          .send(annotation)
          .expect(httpStatus.CREATED));
    });

    it('should return UNAUTHORIZED if set is private and user not set owner', () => {
      const unauthorizedUser = factories.User.build();
      const user = factories.User.build();
      const set = factories.Set.build({ owner: user._id, private: true });
      const text = factories.Text.build({ setId: set._id });
      const annotation = factories.Annotation.build({
        annotationTypeId: set.annotationTypes[0]._id,
        annotationOptionId: set.annotationTypes[0].options[0]._id,
      });

      return User.create(unauthorizedUser)
        .then(() => User.create(user))
        .then(() => Set.create(set))
        .then(() => Text.create(text))
        .then(() => request(server.app)
          .post(`/set/${set._id}/text/${text._id}/annotation`)
          .set('Content-Type', 'application/json')
          .set(util.toKongConsumer(unauthorizedUser))
          .send(annotation)
          .expect(httpStatus.UNAUTHORIZED));
    });

    it('should return CREATED if set is public and user is set owner', () => {
      const user = factories.User.build();
      const set = factories.Set.build({ owner: user._id, private: false });
      const text = factories.Text.build({ setId: set._id });
      const annotation = factories.Annotation.build({
        annotationTypeId: set.annotationTypes[0]._id,
        annotationOptionId: set.annotationTypes[0].options[0]._id,
      });

      return User.create(user)
        .then(() => Set.create(set))
        .then(() => Text.create(text))
        .then(() => request(server.app)
          .post(`/set/${set._id}/text/${text._id}/annotation`)
          .set('Content-Type', 'application/json')
          .set(util.toKongConsumer(user))
          .send(annotation)
          .expect(httpStatus.CREATED));
    });

    it('should return CREATED if set is public and user not set owner', () => {
      const user = factories.User.build();
      const set = factories.Set.build({ private: false });
      const text = factories.Text.build({ setId: set._id });
      const annotation = factories.Annotation.build({
        annotationTypeId: set.annotationTypes[0]._id,
        annotationOptionId: set.annotationTypes[0].options[0]._id,
      });

      return User.create(user)
        .then(() => Set.create(set))
        .then(() => Text.create(text))
        .then(() => request(server.app)
          .post(`/set/${set._id}/text/${text._id}/annotation`)
          .set('Content-Type', 'application/json')
          .set(util.toKongConsumer(user))
          .send(annotation)
          .expect(httpStatus.CREATED));
    });
  });
});
