import { Factory } from 'rosie';
import mongoose from 'mongoose';
import AnnotationType from './annotation_type';

export default new Factory()
  .sequence('_id', () => mongoose.Types.ObjectId().toString())
  .sequence('name', i => `set ${i}`)
  .attrs({
    private: false,
    annotationTypes: [
      AnnotationType.build(),
    ],
    language: 'de',
    owner: mongoose.Types.ObjectId().toString(),
  });
