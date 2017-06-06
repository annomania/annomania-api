/* eslint-env mocha */

import { expect } from 'chai';
import mongoose from 'mongoose';
import annotationTypeStatus from '../../../src/data/schema/annotation_type_status';

describe('## data.db.schema.annotationTypeStatus', () => {
  describe('# mongoose schema', () => {
    it('should get the schema', () => {
      expect(annotationTypeStatus).to.exist;
      expect(annotationTypeStatus).to.be.instanceof(mongoose.Schema);
    });
  });
});
