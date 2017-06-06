import express from 'express';
import httpStatus from 'http-status';
import { Set } from '../../data/model';
import text from './text';
import trainingset from './trainingset';
import logger from '../../logger';
import { isUserSetOwner } from '../../util';
import { checkIsUserSetOwner } from '../../middleware/authorization';

const router = express.Router();

/**
 * API param trigger for validating the textId
 */
router.param('setid', (req, res, next, id) => {
  Set.findById(id).exec()
    .then((set) => {
      if (set) {
        req.set = set;
        next();
      } else {
        logger.warn('setId not found');
        res.sendStatus(httpStatus.NOT_FOUND);
      }
    })
    .catch(err => next(err));
});

/**
 * API Route mount point for text
 */
router.use('/:setid/text', text);

/**
 * API Route mount point for trainingset
 */
router.use('/:setid/trainingset', checkIsUserSetOwner, trainingset);

router.route('/')
  .get((req, res, next) => {
    Set.find({ private: false }).exec()
      .then((sets) => {
        const publicSets = sets.map(set => set.toPublic());
        res.status(httpStatus.OK).json(publicSets);
      })
      .catch(err => next(err));
  })
  .post((req, res, next) => {
    const newSet = req.body;
    newSet.owner = req.user._id;

    Set.create(newSet)
      .then(set => res.status(httpStatus.CREATED).json(set))
      .catch(err => next(err));
  });

router.route('/:setid')
  .get((req, res, _) => {
    if (isUserSetOwner(req.user, req.set)) {
      res.status(httpStatus.OK).json(req.set);
    } else if (req.set.private) {
      res.sendStatus(httpStatus.UNAUTHORIZED);
    } else {
      res.status(httpStatus.OK).json(req.set.toPublic());
    }
  })
  .put(checkIsUserSetOwner, (req, res, next) => {
    const update = {};
    if (req.body.annotationTypes) {
      update.$push = { annotationTypes: { $each: req.body.annotationTypes } };
      delete req.body.annotationTypes;
    }

    update.$set = req.body;
    req.set.update(update).exec()
      .then((result) => {
        if (result.n === 1 && result.ok === 1 && result.nModified === 1) {
          res.sendStatus(httpStatus.OK);
        } else {
          res.sendStatus(httpStatus.NOT_FOUND);
        }
      })
      .catch(err => next(err));
  })
  .delete(checkIsUserSetOwner, (req, res, next) => {
    req.set.remove()
      .then((set) => {
        if (set) {
          res.sendStatus(httpStatus.OK);
        } else {
          res.sendStatus(httpStatus.NOT_FOUND);
        }
      })
      .catch(err => next(err));
  });

export default router;
