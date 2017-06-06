import httpStatus from 'http-status';
import { User } from '../data/model';
import logger from '../logger';

const ERROR_KONG_HEADER_NOT_SET = new Error('Kong Header has to be set! (X-Consumer-ID & X-Consumer-Username)');

const HEADER_CONSUMER_ID = 'X-Consumer-ID'; // The ID of the Consumer on Kong
const HEADER_CONSUMER_CUSTOM_ID = 'X-Consumer-Custom-ID'; // The custom_id of the Consumer (if set)
const HEADER_CONSUMER_USERNAME = 'X-Consumer-Username'; // The username of the Consumer (if set)
const HEADER_ANONYMOUS_CONSUMER = 'X-Anonymous-Consumer'; // Will be set to true when authentication failed, and the 'anonymous' consumer was set instead.

/**
 * Check for a valid Kong Header and load user
 */
export default function kong(req, res, next) {
  // Get kongConsumer from Request Header
  // See https://getkong.org/plugins/basic-authentication/
  req.kongConsumer = {
    id: req.header(HEADER_CONSUMER_ID),
    customId: req.header(HEADER_CONSUMER_CUSTOM_ID),
    username: req.header(HEADER_CONSUMER_USERNAME),
    anonymous: req.header(HEADER_ANONYMOUS_CONSUMER),
  };

  if (!req.kongConsumer.id && !req.kongConsumer.username) {
    logger.error(ERROR_KONG_HEADER_NOT_SET);
    res.sendStatus(httpStatus.UNAUTHORIZED);
    return;
  }

  User.findByKongConsumer(req.kongConsumer)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      next(err);
    });
}
