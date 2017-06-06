import mongoose from 'mongoose';
import annotationOption from './annotation_option';

/**
 * AnnotationType Mongoose Schema
 *
 * Defines options for annotations. E.g. positive, negative
 */
const annotationType = mongoose.Schema({
  options: [annotationOption],
});

annotationType.methods.getOptionNameByOptionId =
  function getOptionNameByOptionId(optionId) {
    const option = this.options.find(o => o._id.equals(optionId));
    if (!option) {
      throw new Error(`AnnotationOptionId {${optionId}} not found!`);
    }
    return option.name;
  };

export default annotationType;
