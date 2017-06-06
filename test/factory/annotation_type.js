import { Factory } from 'rosie';
import mongoose from 'mongoose';
import AnnotationOption from './annotation_option';

export default new Factory()
  .sequence('_id', () => mongoose.Types.ObjectId().toString())
  .attrs({
    options: AnnotationOption.buildList(3),
  });
