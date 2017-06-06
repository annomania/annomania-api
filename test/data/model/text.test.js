/* eslint-env mocha */

import { expect } from 'chai';
import mongoose from 'mongoose';
import { Text } from '../../../src/data/model';
import * as db from '../../../src/data/db';
import * as factories from '../../factory';
import * as util from '../../util';

describe('## data.db.model.text', () => {
  beforeEach(() => db.connect()
    .then(() => db.dropDatabase())
    .then(() => Text.ensureIndexes()));

  afterEach(() => db.disconnect());

  describe('# mongoose schema', () => {
    it('should get the model', () => {
      expect(Text).to.exist;
    });
  });

  describe('# constraints', () => {
    it('should have text index', () =>
      Text.create(factories.Text.build())
        .then(() => util.timeoutPromise(300))
        .then(() => Text.collection.getIndexes())
        .then((indices) => {
          expect(indices).to.include.keys('text_text');
        }));
  });

  describe('# updateAnnotationTypeStatus', () => {
    it('should resolve and create annotationTypeStatus', () => {
      const text = new Text(factories.Text.build());
      const annotationTypeStatus = {
        annotationTypeId: mongoose.Types.ObjectId().toString(),
        annotationOptionId: mongoose.Types.ObjectId().toString(),
        annotationCount: 2,
        ratio: 0.5,
      };

      return Text.create(text)
        .then(() => Text.updateAnnotationTypeStatus(text._id, annotationTypeStatus))
        .then((dbText) => {
          expect(dbText.annotationTypeStatus[0].ratio).to
            .equal(annotationTypeStatus.ratio);
          expect(dbText.annotationTypeStatus[0].annotationCount).to
            .equal(annotationTypeStatus.annotationCount);
          expect(dbText.annotationTypeStatus[0].annotationTypeId.toString()).to
            .equal(annotationTypeStatus.annotationTypeId);
          expect(dbText.annotationTypeStatus[0].annotationOptionId.toString()).to
            .equal(annotationTypeStatus.annotationOptionId);
        });
    });

    it('should resolve and update annotationTypeStatus', () => {
      const annotationTypeId = mongoose.Types.ObjectId().toString();
      const annotationOptionId = mongoose.Types.ObjectId().toString();
      const text = new Text(factories.Text.build({
        annotationTypeStatus: [
          {
            annotationTypeId,
            annotationOptionId,
            annotationCount: 4,
            ratio: 0.5,
          },
        ],
      }));
      const annotationTypeStatus = {
        annotationTypeId,
        annotationOptionId,
        annotationCount: 8,
        ratio: 0.9,
      };

      return Text.create(text)
        .then(() => Text.updateAnnotationTypeStatus(text._id, annotationTypeStatus))
        .then((dbText) => {
          expect(dbText.annotationTypeStatus[0].ratio).to
            .equal(annotationTypeStatus.ratio);
          expect(dbText.annotationTypeStatus[0].annotationCount).to
            .equal(annotationTypeStatus.annotationCount);
          expect(dbText.annotationTypeStatus[0].annotationTypeId.toString()).to
            .equal(annotationTypeStatus.annotationTypeId);
          expect(dbText.annotationTypeStatus[0].annotationOptionId.toString()).to
            .equal(annotationTypeStatus.annotationOptionId);
        });
    });

    it('should reject on inexisting textId', (done) => {
      const annotationTypeStatus = {
        annotationTypeId: mongoose.Types.ObjectId().toString(),
        annotationOptionId: mongoose.Types.ObjectId().toString(),
        annotationCount: 2,
        ratio: 0.5,
      };

      Text.updateAnnotationTypeStatus(mongoose.Types.ObjectId().toString(),
        annotationTypeStatus)
        .catch(() => done());
    });
  });
});
