import { Factory } from 'rosie';
import mongoose from 'mongoose';

export default new Factory()
  .sequence('_id', () => mongoose.Types.ObjectId().toString())
  .sequence('username', i => `user_${i}`)
  .attr('kongId', ['username'], username => `kongId_${username}`);
