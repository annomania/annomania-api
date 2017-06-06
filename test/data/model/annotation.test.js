/* eslint-env mocha */

import { expect } from 'chai';
import mongoose from 'mongoose';
import { Annotation } from '../../../src/data/model';
import * as db from '../../../src/data/db';
import * as factories from '../../factory';

describe('## data.db.model.annotation', () => {
  beforeEach(() => db.connect()
    .then(() => db.dropDatabase())
    .then(() => Annotation.ensureIndexes()));

  afterEach(() => db.disconnect());

  describe('# mongoose schema', () => {
    it('should get the model', () => {
      expect(Annotation).to.exist;
    });
  });

  describe('# getAnnotationTypeStatus', () => {
    const annotationTypeId = mongoose.Types.ObjectId().toString();
    const textId = mongoose.Types.ObjectId().toString();

    it('should resolve with correct annotationTypeStatus', () => {
      const majorAnnotations = factories.Annotation.buildList(3, {
        userId: mongoose.Types.ObjectId().toString(),
        textId,
        annotationTypeId,
        annotationOptionId: mongoose.Types.ObjectId().toString(),
      });
      const minorAnnotations = factories.Annotation.buildList(1, {
        userId: mongoose.Types.ObjectId().toString(),
        textId,
        annotationTypeId,
        annotationOptionId: mongoose.Types.ObjectId().toString(),
      });

      return Annotation.insertMany(majorAnnotations)
        .then(() => Annotation.insertMany(minorAnnotations))
        .then(() => Annotation.getAnnotationTypeStatus(textId, annotationTypeId))
        .then((status) => {
          expect(status.annotationTypeId.toString()).to.equal(annotationTypeId);
          expect(status.annotationOptionId.toString()).to
            .equal(majorAnnotations[0].annotationOptionId);
          expect(status.ratio).to.equal(0.75);
          expect(status.annotationCount).to.equal(4);
        });
    });

    it('should calculate correct ratio and count with 3 annotationOptions', () => {
      const majorAnnotations = factories.Annotation.buildList(8, {
        userId: mongoose.Types.ObjectId().toString(),
        textId,
        annotationTypeId,
        annotationOptionId: mongoose.Types.ObjectId().toString(),
      });
      const minorAnnotations1 = factories.Annotation.buildList(1, {
        userId: mongoose.Types.ObjectId().toString(),
        textId,
        annotationTypeId,
        annotationOptionId: mongoose.Types.ObjectId().toString(),
      });
      const minorAnnotations2 = factories.Annotation.buildList(1, {
        userId: mongoose.Types.ObjectId().toString(),
        textId,
        annotationTypeId,
        annotationOptionId: mongoose.Types.ObjectId().toString(),
      });

      return Annotation.insertMany(majorAnnotations)
        .then(() => Annotation.insertMany(minorAnnotations1))
        .then(() => Annotation.insertMany(minorAnnotations2))
        .then(() => Annotation.getAnnotationTypeStatus(textId, annotationTypeId))
        .then((status) => {
          expect(status.ratio).to.equal(0.8);
          expect(status.annotationCount).to.equal(10);
        });
    });

    it('should calculate correct ratio and count with 1 annotationOption', () => {
      const majorAnnotations = factories.Annotation.buildList(3, {
        userId: mongoose.Types.ObjectId().toString(),
        textId,
        annotationTypeId,
        annotationOptionId: mongoose.Types.ObjectId().toString(),
      });

      return Annotation.insertMany(majorAnnotations)
        .then(() => Annotation.getAnnotationTypeStatus(textId, annotationTypeId))
        .then((status) => {
          expect(status.ratio).to.equal(1);
          expect(status.annotationCount).to.equal(3);
        });
    });

    it('should reject if no matching Annotations', (done) => {
      Annotation.getAnnotationTypeStatus(mongoose.Types.ObjectId().toString(),
        mongoose.Types.ObjectId().toString())
        .catch(() => done());
    });
  });
});
