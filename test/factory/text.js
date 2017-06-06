import { Factory } from 'rosie';
import mongoose from 'mongoose';

export default new Factory()
  .sequence('_id', () => mongoose.Types.ObjectId().toString())
  .sequence('text', i => `Lorem ipsum dolor sit amet ${i}`)
  .attr('setId', mongoose.Types.ObjectId().toString());
