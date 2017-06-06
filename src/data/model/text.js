import mongoose from 'mongoose';
import annotationTypeStatus from '../schema/annotation_type_status';

/**
 * Text Mongoose Schema
 *
 * A text belongs to a set. A text can be annotated.
 */
const options = {
  timestamps: true,
};

const textSchema = mongoose.Schema({
  text: {
    type: String,
    required: [true, 'text is required'],
  },
  setId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'setId is required'],
    index: true,
  },
  meta: {
    type: mongoose.Schema.Types.Mixed,
  },
  annotationTypeStatus: [annotationTypeStatus],
}, options);

textSchema.index({ text: 'text' });

textSchema.statics.publicProjection = function publicProjection() {
  return {
    _id: 1,
    text: 1,
    setId: 1,
    meta: 1,
  };
};

textSchema.statics.updateAnnotationTypeStatus =
  function updateAnnotationTypeStatus(textId, newStatus) {
    return this.findById(textId).exec()
      .then((text) => {
        if (!text) {
          throw new Error(`text with id: ${textId} was not found`);
        }
        const index = text.annotationTypeStatus.findIndex(
          status => status.annotationTypeId.equals(newStatus.annotationTypeId));

        if (index > -1) {
          text.annotationTypeStatus[index] = newStatus;
        } else {
          text.annotationTypeStatus.push(newStatus);
        }
        return text;
      })
      .then(text => text.save());
  };

textSchema.methods.mapAnnotationStatusWithOptionName =
  function mapAnnotationStatusWithOptionName(set, annotationType) {
    const text = this.toObject();
    const status = text.annotationTypeStatus
      .find(s => s.annotationTypeId.equals(annotationType._id));
    if (!status) {
      text.annotationTypeStatus = {};
    } else {
      const optionName = annotationType.getOptionNameByOptionId(status.annotationOptionId);

      text.annotationTypeStatus = {
        annotationOption: optionName,
        ratio: status.ratio,
        annotationCount: status.annotationCount,
      };
    }

    return text;
  };

/**
 * Model for 'Text' MongoDB collection
 */
const Text = mongoose.model('Text', textSchema);

export default Text;
