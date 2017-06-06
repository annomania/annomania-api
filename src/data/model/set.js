import mongoose from 'mongoose';
import Ajv from 'ajv';
import ValidationError from '../../error/validation';
import annotationType from '../schema/annotation_type';

/**
 * Set Mongoose Schema
 *
 * A set specifies a set of texts with additional information
 */
const options = {
  timestamps: true,
};

const setSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'name is required'],
  },
  private: {
    type: Boolean,
    default: false,
  },
  annotationTypes: [annotationType],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'owner is required'],
  },
  language: {
    type: String,
    lowercase: true,
    trim: true,
  },
  textSchema: {
    type: mongoose.Schema.Types.Mixed,
  },
  meta: {
    type: mongoose.Schema.Types.Mixed,
  },
}, options);

setSchema.index({ name: 1, owner: 1 }, { unique: true });

setSchema.methods.toPublic = function toPublic() {
  return {
    _id: this._id,
    name: this.name,
    language: this.language,
    annotationTypes: this.annotationTypes,
  };
};

const ajv = new Ajv();

setSchema.methods.validateTextMeta = function validateTextMeta(textMeta) {
  return new Promise((resolve, reject) => {
    if (!this.textSchema) {
      resolve();
    }
    const validate = ajv.compile(this.textSchema);

    if (validate(textMeta)) {
      resolve();
    } else {
      const err = new ValidationError('ValidationError', [
        new ValidationError('text meta validation failed'),
        ...validate.errors,
      ]);
      reject(err);
    }
  });
};

setSchema.methods.validateAnnotationTypeId =
  function validateAnnotationTypeId(typeId) {
    return new Promise((resolve, reject) => {
      const setAnnotationType = this.annotationTypes.id(typeId);

      if (setAnnotationType) {
        resolve(setAnnotationType);
      } else {
        const err = new ValidationError('Annotation validation failed', [
          new ValidationError('annotationTypeId is invalid'),
        ]);
        reject(err);
      }
    });
  };

setSchema.methods.validateAnnotationOptionIdOfType =
  function validateAnnotationOptionIdOfType(type, optionId) {
    return new Promise((resolve, reject) => {
      const typeAnnotationOption = type.options.id(optionId);
      if (typeAnnotationOption) {
        resolve(typeAnnotationOption);
      } else {
        const err = new ValidationError('Annotation validation failed', [
          new ValidationError('annotationOptionId is invalid'),
        ]);
        reject(err);
      }
    });
  };

setSchema.methods.getAnnotationTypeById =
  function getAnnotationTypeById(annotationTypeId) {
    const type = this.annotationTypes.find(t => t._id.equals(annotationTypeId));
    if (!type) {
      throw new Error(`No annotationType ${annotationTypeId} in set!`);
    }
    return type;
  };

setSchema.methods.getFirstAnnotationType =
  function getFirstAnnotationType() {
    if (this.annotationTypes.length <= 0) {
      throw new Error('Set has no annotationTypes');
    }

    return this.annotationTypes[0];
  };

/**
 * Model for 'Set' MongoDB collection
 */
const Set = mongoose.model('Set', setSchema);

export default Set;
