/* eslint-env mocha */
import httpStatus from 'http-status';
import sinon from 'sinon';
import mongoose from 'mongoose';
import { expect } from 'chai';
import { checkIsUserSetOwner, checkSetPrivacy } from '../../src/middleware/authorization';

describe('## middleware.authorization', () => {
  let res;
  let next;

  beforeEach(() => {
    next = sinon.stub();

    // Mock express response object
    res = {
      sendStatus: sinon.spy(),
    };
  });

  afterEach(() => next.reset());

  describe('# checkIsUserSetOwner', () => {
    it('should call next if user is set owner', () => {
      const userId = mongoose.Types.ObjectId();
      const req = {
        user: {
          _id: userId,
        },
        set: {
          owner: userId,
        },
      };
      checkIsUserSetOwner(req, res, next);

      expect(next.calledOnce).to.be.ok;
    });

    it('should return UNAUTHORIZED if user not set owner', () => {
      const req = {
        user: {
          _id: mongoose.Types.ObjectId(),
        },
        set: {
          owner: mongoose.Types.ObjectId(),
        },
      };
      checkIsUserSetOwner(req, res, next);

      expect(res.sendStatus.calledWith(httpStatus.UNAUTHORIZED)).to.be.ok;
    });
  });

  describe('# checkSetPrivacy', () => {
    it('should call next if user is set owner and set is private', () => {
      const userId = mongoose.Types.ObjectId();
      const req = {
        user: {
          _id: userId,
        },
        set: {
          owner: userId,
          private: true,
        },
      };
      checkSetPrivacy(req, res, next);

      expect(next.calledOnce).to.be.ok;
    });

    it('should return UNAUTHORIZED if user not set owner and set is private', () => {
      const req = {
        user: {
          _id: mongoose.Types.ObjectId(),
        },
        set: {
          owner: mongoose.Types.ObjectId(),
          private: true,
        },
      };
      checkSetPrivacy(req, res, next);

      expect(res.sendStatus.calledWith(httpStatus.UNAUTHORIZED)).to.be.ok;
    });

    it('should call next if user not set owner and set not private', () => {
      const req = {
        user: {
          _id: mongoose.Types.ObjectId(),
        },
        set: {
          owner: mongoose.Types.ObjectId(),
          private: false,
        },
      };
      checkSetPrivacy(req, res, next);

      expect(next.calledOnce).to.be.ok;
    });
  });
});
