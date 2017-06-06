import { Factory } from 'rosie';
import mongoose from 'mongoose';

export default new Factory()
  .sequence('_id', () => mongoose.Types.ObjectId().toString())
  .attr('annotationOptionId')
  .attr('userId')
  .attr('annotationTypeId');
