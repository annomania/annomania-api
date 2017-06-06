/* eslint-env mocha */
import sinon from 'sinon';
import { expect } from 'chai';
import { validateTextFetchAmount } from '../../src/middleware/query';

describe('## middleware.query', () => {
  let next;

  beforeEach(() => {
    next = sinon.stub();
  });

  afterEach(() => next.reset());

  describe('# validateTextFetchAmount', () => {
    it('should call next if amount is number and positive integer', () => {
      const req = {
        query: {
          amount: 2,
        },
      };

      validateTextFetchAmount(req, {}, next);

      expect(next.calledOnce).to.be.ok;
    });

    it('should call next if amount is undefined', () => {
      const req = {
        query: {},
      };

      validateTextFetchAmount(req, {}, next);

      expect(next.calledOnce).to.be.ok;
    });

    it('should call next if amount not number', () => {
      const req = {
        query: {
          amount: 'notanumber',
        },
      };

      validateTextFetchAmount(req, {}, next);

      expect(next.args.length).to.equal(1);
    });

    it('should call next if amount not positive integer', () => {
      const req = {
        query: {
          amount: -42,
        },
      };

      validateTextFetchAmount(req, {}, next);

      expect(next.args.length).to.equal(1);
    });
  });
});
