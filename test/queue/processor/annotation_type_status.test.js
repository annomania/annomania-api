/* eslint-env mocha */

import { expect } from 'chai';
import { Text, Annotation, Set } from '../../../src/data/model';
import * as db from '../../../src/data/db';
import * as factories from '../../factory';
import processAnnotationTypeStatus from '../../../src/queue/processor/annotation_type_status';

describe('## queue.processor.annotationTypeStatus', () => {
  beforeEach(() => db.connect()
    .then(() => db.dropDatabase()));

  afterEach(() => db.disconnect());

  describe('# processor', () => {
    const user = factories.User.build();
    const set = factories.Set.build({ owner: user._id });

    it('should create annotationTypeStatus for annotationTypeId', () => {
      const text = factories.Text.build({ setId: set._id });
      const annotation = factories.Annotation.build({
        annotationTypeId: set.annotationTypes[0]._id,
        annotationOptionId: set.annotationTypes[0].options[0]._id,
        userId: user._id,
        textId: text._id,
      });

      return Set.create(set)
        .then(() => Text.create(text))
        .then(() => Annotation.create(annotation))
        .then(() => processAnnotationTypeStatus({ data: { annotation } }))
        .then(() => Text.findById(text._id).exec())
        .then((dbText) => {
          expect(dbText.annotationTypeStatus[0]).to.exist;
          const annotationTypeStatus = dbText.annotationTypeStatus[0];
          expect(annotationTypeStatus.ratio).to.equal(1);
          expect(annotationTypeStatus.annotationTypeId.toString()).to
            .equal(annotation.annotationTypeId);
          expect(annotationTypeStatus.annotationOptionId.toString()).to
            .equal(annotation.annotationOptionId);
          expect(annotationTypeStatus.annotationCount).to.equal(1);
        });
    });

    it('should update annotationTypeStatus for annotationTypeId', () => {
      const text = factories.Text.build({ setId: set._id,
        annotationTypeStatus: {
          annotationTypeId: set.annotationTypes[0]._id,
          annotationOptionId: set.annotationTypes[0].options[0]._id,
          ratio: 1,
          annotationCount: 1,
        },
      });
      const annotation = factories.Annotation.build({
        annotationTypeId: set.annotationTypes[0]._id,
        annotationOptionId: set.annotationTypes[0].options[0]._id,
        userId: user._id,
        textId: text._id,
      });
      const annotation2 = factories.Annotation.build({
        annotationTypeId: annotation.annotationTypeId,
        annotationOptionId: annotation.annotationOptionId,
        userId: annotation.userId,
        textId: annotation.textId,
      });

      return Set.create(set)
        .then(() => Text.create(text))
        .then(() => Annotation.create(annotation))
        .then(() => Annotation.create(annotation2))
        .then(() => processAnnotationTypeStatus({ data: { annotation } }))
        .then(() => Text.findById(text._id).exec())
        .then((dbText) => {
          expect(dbText.annotationTypeStatus[0]).to.exist;
          const annotationTypeStatus = dbText.annotationTypeStatus[0];
          expect(annotationTypeStatus.ratio).to.equal(1);
          expect(annotationTypeStatus.annotationTypeId.toString()).to
            .equal(annotation.annotationTypeId);
          expect(annotationTypeStatus.annotationOptionId.toString()).to
            .equal(annotation.annotationOptionId);
          expect(annotationTypeStatus.annotationCount).to.equal(2);
        });
    });
  });
});
