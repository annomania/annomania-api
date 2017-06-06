/* eslint-env mocha */

import request from 'supertest';
import { expect } from 'chai';
import { User, Text, Set } from '../../../src/data/model';
import * as factories from '../../factory';
import * as util from '../../util';
import * as db from '../../../src/data/db';

describe('## controller.trainingset', () => {
  const server = util.setupServer();

  beforeEach(() => server.start()
    .then(() => db.connect())
    .then(() => db.dropDatabase())
    .then(() => Text.ensureIndexes()));

  afterEach(() => db.disconnect()
    .then(() => server.stop()));

  describe('# GET /trainingset', () => {
    const user = factories.User.build();
    const set = factories.Set.build({
      owner: user._id,
      annotationTypes: [
        factories.AnnotationType.build(),
        factories.AnnotationType.build({ options: [
          factories.AnnotationOption.build({ name: 'positive' }),
          factories.AnnotationOption.build({ name: 'negative' }),
        ] }),
      ] });

    beforeEach(() => User.create(user)
      .then(() => Set.create(set)));

    describe('## set contains texts', () => {
      const texts = factories.Text.buildList(20, { setId: set._id });
      texts.map((text) => {
        text.annotationTypeStatus = [{
          ratio: 0.7,
          annotationCount: 34,
          annotationTypeId: set.annotationTypes[0]._id,
          annotationOptionId: set.annotationTypes[0].options[0]._id,
        }, {
          ratio: 0.6,
          annotationCount: 14,
          annotationTypeId: set.annotationTypes[1]._id,
          annotationOptionId: set.annotationTypes[1].options[0]._id,
        }];
        return text;
      });

      beforeEach(() => Text.insertMany(texts));

      it('should return correct amount of training set', () =>
        request(server.app)
          .get(`/set/${set._id}/trainingset`)
          .set('Content-Type', 'application/json')
          .set(util.toKongConsumer(user))
          .send()
          .then((res) => {
            expect(res.body).to.exist;
          }));

      it('should return a trainingset with the choosen annotationType', () =>
        request(server.app)
          .get(`/set/${set._id}/trainingset?annotationType=${set.annotationTypes[0]._id}`)
          .set('Content-Type', 'application/json')
          .set(util.toKongConsumer(user))
          .send()
          .then((res) => {
            expect(res.body).to.have.lengthOf(20);
          }));

      it('should return the specfied page with correct amount', () =>
        request(server.app)
          .get(`/set/${set._id}/trainingset?annotationType=${set.annotationTypes[1]._id}&amount=5&page=2`)
          .set('Content-Type', 'application/json')
          .set(util.toKongConsumer(user))
          .send()
          .then((res) => {
            expect(res.body).to.have.lengthOf(5);
            expect(res.body[0].annotationTypeStatus.annotationOption)
              .to.eql(set.annotationTypes[1].options[0].name);
          }));

      it('should use the first annotationType if none specified', () =>
        request(server.app)
          .get(`/set/${set._id}/trainingset`)
          .set('Content-Type', 'application/json')
          .set(util.toKongConsumer(user))
          .send()
          .then((res) => {
            expect(res.body).to.have.lengthOf(20);
            expect(res.body[0].annotationTypeStatus.annotationOption).to
              .eql(set.annotationTypes[0].options[0].name);
          }));
    });

    describe('## no texts in set', () => {
      it('should return empty array with no texts', () =>
        request(server.app)
          .get(`/set/${set._id}/trainingset`)
          .set('Content-Type', 'application/json')
          .set(util.toKongConsumer(user))
          .send()
          .then((res) => {
            expect(res.body).to.be.an('array').that.is.empty;
          }));
    });
  });
});
