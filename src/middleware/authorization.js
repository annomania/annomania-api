import httpStatus from 'http-status';
import { isUserSetOwner } from '../util';

export function checkIsUserSetOwner(req, res, next) {
  if (isUserSetOwner(req.user, req.set)) {
    next();
  } else {
    res.sendStatus(httpStatus.UNAUTHORIZED);
  }
}

export function checkSetPrivacy(req, res, next) {
  if (req.set.private && isUserSetOwner(req.user, req.set)) {
    next();
  } else if (!req.set.private) {
    next();
  } else {
    res.sendStatus(httpStatus.UNAUTHORIZED);
  }
}
