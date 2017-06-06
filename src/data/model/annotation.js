import mongoose from 'mongoose';

/**
 * Annotation Mongoose Schema
 *
 * An annotation belongs to a text and consists of a type and the choosen option.
 * Is always references the user that created the annotation.
 */
const options = {
  timestamps: true,
};

const annotationSchema = mongoose.Schema({
  annotationTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'annotationTypeId is required'],
  },
  annotationOptionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'annotationOptionId is required'],
  },
  textId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'textId is required'],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'userId is required'],
  },
}, options);

annotationSchema.methods.toPublic = function toPublic() {
  return {
    _id: this._id,
    annotationTypeId: this.annotationTypeId,
    annotationOptionId: this.annotationOptionId,
    textId: this.textId,
    userId: this.userId,
  };
};

annotationSchema.statics.getAnnotationTypeStatus =
  function getAnnotationTypeStatus(textId, typeId) {
    return this.aggregate([
      { $match: { $and: [{ textId: new mongoose.Types.ObjectId(textId) },
         { annotationTypeId: new mongoose.Types.ObjectId(typeId) }] } },
      { $group: { _id: '$annotationOptionId', count: { $sum: 1 } } },
    ]).exec()
      .then((result) => {
        if (result === []) {
          throw new Error(`no matching Annotations were found for textId: ${textId} and annotationTypeId: ${typeId}`);
        }
        const sortByCountAsc = (a, b) => a.count - b.count;
        const majorityOption = result.sort(sortByCountAsc)[result.length - 1];
        const annotationCount = result.reduce((acc, option) => acc + option.count, 0);

        return {
          annotationTypeId: typeId,
          annotationOptionId: majorityOption._id,
          ratio: majorityOption.count / annotationCount,
          annotationCount,
        };
      });
  };

/**
 * Model for 'Annotation' MongoDB collection
 */
const Annotation = mongoose.model('Annotation', annotationSchema);

export default Annotation;
