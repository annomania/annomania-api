/* eslint-env mocha */

import { expect } from 'chai';
import mongoose from 'mongoose';
import annotationOption from '../../../src/data/schema/annotation_option';

describe('## data.db.schema.annotationOption', () => {
  describe('# mongoose schema', () => {
    it('should get the schema', () => {
      expect(annotationOption).to.exist;
      expect(annotationOption).to.be.instanceof(mongoose.Schema);
    });
  });
});
