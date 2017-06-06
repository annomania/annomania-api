import mongoose from 'mongoose';
import logger from '../../logger';

/**
 * User Mongoose Schema
 */
const options = {
  timestamps: true,
};

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: [true, 'username is required'],
    unique: true,
  },
  kongId: {
    type: String,
    required: [true, 'kongId is required'],
    unique: true,
  },
}, options);

/**
 * Find user by Kong Consumer
 *
 * Find a user or create a new user based on Kong Consumer
 * @return User
 */
userSchema.statics.findByKongConsumer = function findByKongConsumer(kongConsumer) {
  return this.findOne({ kongId: kongConsumer.id })
    .then((user) => {
      if (user) {
        // user already in db
        return Promise.resolve(user);
      }

      // create a new user with provided kong credentials
      return this.create({
        kongId: kongConsumer.id,
        username: kongConsumer.username,
      });
    })
    .catch((err) => {
      logger.error(err);
      return Promise.reject(err);
    });
};

/**
 * Model for 'User' MongoDB collection
 */
const User = mongoose.model('User', userSchema);

export default User;
