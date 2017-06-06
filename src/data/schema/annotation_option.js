import mongoose from 'mongoose';

/**
 * AnnotationOption Mongoose Schema
 */
const annotationOption = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'name is required'],
  },
});

export default annotationOption;
