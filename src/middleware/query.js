import { isNumber, isPositiveInteger } from '../util';
import ValidationError from '../error/validation';

export function validateTextFetchAmount(req, res, next) {
  if (req.query.amount) {
    if (!isNumber(req.query.amount)) {
      next(new ValidationError(`amount: ${req.query.amount} is not a number`));
      return;
    }

    if (!isPositiveInteger(Number(req.query.amount))) {
      next(new ValidationError(`amount: ${req.query.amount} is not a positve integer`));
      return;
    }
  }

  next();
}
