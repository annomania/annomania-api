import httpStatus from 'http-status';

/**
 * Performs an error whitelisting for useful errors on the client.
 */
export default function errorHandler(err, req, res, next) {
  const errors = [];
  const errorWhiteList = ['SyntaxError', 'ValidationError', 'CastError'];

  if (errorWhiteList.includes(err.name)) {
    errors.push(err);

    if (err.errors) {
      if (Array.isArray(err.errors)) {
        err.errors.map(e => errors.push(e));
      } else {
        Object.keys(err.errors).forEach((key) => {
          errors.push(err.errors[key]);
        });
      }
    }

    res.status(httpStatus.BAD_REQUEST).send({ clientError: errors.map(e => e.message) });
  } else {
    res.status(httpStatus.BAD_REQUEST).send({ clientError: ['Something went wrong!'] });
  }
  next(err);
}
