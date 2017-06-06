import httpStatus from 'http-status';

export function checkResultAndSendCreated(checkResult, res, errorCode) {
  return (result) => {
    if (checkResult(result)) {
      res.status(httpStatus.CREATED).json(result);
    } else {
      res.sendStatus(errorCode);
    }
  };
}

export function checkResultAndSendOK(checkResult, res, errorCode) {
  return (result) => {
    if (checkResult(result)) {
      res.status(httpStatus.OK).json(result);
    } else {
      res.sendStatus(errorCode);
    }
  };
}
