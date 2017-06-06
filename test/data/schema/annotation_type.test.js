/* eslint-env mocha */

import { expect } from 'chai';
import mongoose from 'mongoose';
import * as factories from '../../factory';
import annotationType from '../../../src/data/schema/annotation_type';

describe('## data.db.schema.annotationType', () => {
  describe('# mongoose schema', () => {
    it('should get the schema', () => {
      expect(annotationType).to.exist;
      expect(annotationType).to.be.instanceof(mongoose.Schema);
    });
  });

  describe('# getOptionNameByOptionId', () => {
    it('should return name of option with id', () => {
      const Type = mongoose.model('Type', annotationType);
      const type = new Type({
        options: factories.AnnotationOption.buildList(3),
      });

      expect(type.getOptionNameByOptionId(type.options[0]._id)).to.eql(type.options[0].name);
    });
  });
});
