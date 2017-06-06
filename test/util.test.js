/* eslint-env mocha */

import { expect } from 'chai';
import mongoose from 'mongoose';
import { isNumber, isPositiveInteger, isUserSetOwner } from '../src/util';

describe('## util', () => {
  describe('# isNumber', () => {
    it('should return true', () => {
      expect(isNumber(-50)).to.be.true;
      expect(isNumber(0)).to.be.true;
      expect(isNumber(20)).to.be.true;
      expect(isNumber(3.14)).to.be.true;
      expect(isNumber(-500.678)).to.be.true;
      expect(isNumber(Number.MAX_VALUE)).to.be.true;
      expect(isNumber(Number.MIN_VALUE)).to.be.true;
    });

    it('should return false', () => {
      expect(isNumber(undefined)).to.be.false;
      expect(isNumber(null)).to.be.false;
      expect(isNumber(NaN)).to.be.false;
      expect(isNumber('string')).to.be.false;
      expect(isNumber({})).to.be.false;
      expect(isNumber('str1ing')).to.be.false;
      expect(isNumber('2abc')).to.be.false;
      expect(isNumber(false)).to.be.false;
      expect(isNumber(true)).to.be.false;
    });
  });

  describe('# isPositiveInteger', () => {
    it('should return true', () => {
      expect(isPositiveInteger(50)).to.be.true;
      expect(isPositiveInteger(0)).to.be.true;
      expect(isPositiveInteger(1000)).to.be.true;
      expect(isPositiveInteger(Number.MAX_VALUE)).to.be.true;
    });

    it('should return false', () => {
      expect(isPositiveInteger(NaN)).to.be.false;
      expect(isPositiveInteger(-1)).to.be.false;
      expect(isPositiveInteger(-4000)).to.be.false;
      expect(isPositiveInteger(Number.MIN_VALUE)).to.be.false;
      expect(isPositiveInteger(-3.141)).to.be.false;
      expect(isPositiveInteger(4.279)).to.be.false;
      expect(isPositiveInteger(2000.38674538)).to.be.false;
    });
  });

  describe('# isUserSetOwner', () => {
    it('should return true if user is set owner', () => {
      const userId = mongoose.Types.ObjectId();
      const req = {
        user: {
          _id: userId,
        },
        set: {
          owner: userId,
        },
      };

      expect(isUserSetOwner(req.user, req.set)).to.be.true;
    });

    it('should return false if user not set owner', () => {
      const req = {
        user: {
          owner: mongoose.Types.ObjectId(),
        },
        set: {
          owner: mongoose.Types.ObjectId(),
        },
      };

      expect(isUserSetOwner(req.user, req.set)).to.be.false;
    });
  });
});
