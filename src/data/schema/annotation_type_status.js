import mongoose from 'mongoose';

/**
 * AnnotationTypeStatus gives status information about a text
 */
const annotationTypeStatus = mongoose.Schema({
  annotationTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'annotationTypeId is required'],
  },
  annotationOptionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'annotationOptionId is required'],
  },
  ratio: {
    type: Number,
    required: [true, 'ratio is required'],
  },
  annotationCount: {
    type: Number,
    required: [true, 'annotationCount is required'],
  },
});

export default annotationTypeStatus;
