/* eslint-env mocha */
import httpStatus from 'http-status';
import sinon from 'sinon';
import { expect } from 'chai';
import * as helper from '../../../src/controller/route/helper';

describe('## Route Helper', () => {
  const positive = () => true;
  const negative = () => false;
  const result = { test: 'Test' };
  let res;

  beforeEach(() => {
    // Mock express response object
    res = {
      status: sinon.stub(),
      json: sinon.spy(),
      sendStatus: sinon.spy(),
    };
    res.status.returns(res);
  });

  describe('# checkResultAndSendCreated', () => {
    it('should return status created with json result if check is true', () => {
      helper.checkResultAndSendCreated(positive, res,
        httpStatus.INTERNAL_SERVER_ERROR)(result);

      expect(res.status.calledWith(httpStatus.CREATED)).to.be.ok;
      expect(res.json.calledWith(result)).to.be.ok;
    });

    it('should return status code on false check', () => {
      helper.checkResultAndSendCreated(negative, res,
        httpStatus.INTERNAL_SERVER_ERROR)(result);

      expect(res.sendStatus.calledWith(httpStatus.INTERNAL_SERVER_ERROR)).to.be.ok;
      expect(res.json.notCalled).to.be.true;
    });
  });

  describe('# checkResultAndSendOK', () => {
    it('should return status ok and result on positiv check', () => {
      helper.checkResultAndSendOK(positive, res,
        httpStatus.INTERNAL_SERVER_ERROR)(result);

      expect(res.status.calledWith(httpStatus.OK)).to.be.ok;
      expect(res.json.calledWith(result)).to.be.ok;
    });

    it('should return status code on false check', () => {
      helper.checkResultAndSendOK(negative, res,
        httpStatus.INTERNAL_SERVER_ERROR)(result);

      expect(res.sendStatus.calledWith(httpStatus.INTERNAL_SERVER_ERROR)).to.be.ok;
      expect(res.json.notCalled).to.be.true;
    });
  });
});
