import express from 'express';
import httpStatus from 'http-status';
import { Text } from '../../data/model';
import logger from '../../logger';
import annotation from './annotation';
import getAggregateForStrategy from './text_fetch_strategies';
import { checkResultAndSendCreated, checkResultAndSendOK } from './helper';
import { checkIsUserSetOwner, checkSetPrivacy } from '../../middleware/authorization';
import { validateTextFetchAmount } from '../../middleware/query';

const router = express.Router();

/**
 * API param trigger for validating the textId
 */
router.param('textid', (req, res, next, id) => {
  Text.findById(id).exec()
    .then((text) => {
      if (text) {
        req.text = text;
        next();
      } else {
        logger.warn('textId not found');
        res.sendStatus(httpStatus.NOT_FOUND);
      }
    })
    .catch(err => next(err));
});

/**
 * Globally check for Set privacy
 */
router.use(checkSetPrivacy);

/**
 * API Route mount point for annotation
 */
router.use('/:textid/annotation', annotation);

router.route('/')
  .get(validateTextFetchAmount, (req, res, next) => {
    const fetchAmount = Number(req.query.amount) || 5;
    const fetchStrategy = req.query.fetchStrategy || 'leastAnnotated';

    Text.aggregate(getAggregateForStrategy(fetchStrategy, req, fetchAmount)).exec()
      .then(checkResultAndSendOK(result => result, res, httpStatus.NOT_FOUND))
      .catch(err => next(err));
  })
  /**
   * Route for Posting an array of texts
   */
  .post(checkIsUserSetOwner, (req, res, next) => {
    if (!Array.isArray(req.body)) {
      next(); // Next route for single text
      return;
    }

    Promise.all(req.body.map(text => req.set.validateTextMeta(text.meta)))
      .then(() => Text.insertMany(req.body.map(text => ({ setId: req.set._id, ...text }))))
      .then(checkResultAndSendCreated(result => result.length === req.body.length,
        res, httpStatus.NOT_EXTENDED))
      .catch(err => next(err));
  })
  /**
   * Route for POST a single Text
   */
  .post(checkIsUserSetOwner, (req, res, next) => {
    req.set.validateTextMeta(req.body.meta)
      .then(() => new Text({ setId: req.set._id, ...req.body }).save())
      .then(text => res.status(httpStatus.CREATED).json(text))
      .catch(err => next(err));
  });

router.route('/:textid')
  .put(checkIsUserSetOwner, (req, res, next) => {
    let validTextMeta = Promise.resolve();
    if (req.body.meta) {
      validTextMeta = req.set.validateTextMeta(req.body.meta);
    }

    validTextMeta
      .then(() => req.text.update(req.body, { runValidators: true }).exec())
      .then((result) => {
        if (result.n === 1 && result.ok === 1 && result.nModified === 1) {
          res.sendStatus(httpStatus.OK);
        } else {
          res.sendStatus(httpStatus.BAD_REQUEST);
        }
      })
      .catch(err => next(err));
  })
  .delete(checkIsUserSetOwner, (req, res, next) => {
    req.text.remove()
      .then((text) => {
        if (text) {
          res.sendStatus(httpStatus.OK);
        } else {
          res.sendStatus(httpStatus.NOT_FOUND);
        }
      })
      .catch(err => next(err));
  });

export default router;
