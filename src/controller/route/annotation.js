import express from 'express';
import httpStatus from 'http-status';
import { Annotation } from '../../data/model';
import annotationTypeStatusQueue from '../../queue';
import { checkSetPrivacy } from '../../middleware/authorization';

const router = express.Router();

/**
 * Globally check for Set privacy
 */
router.use(checkSetPrivacy);

router.route('/')
  /**
   * Post an Annotation and schedule a Queue Job to Update the annotation type status on the text
   */
  .post((req, res, next) => {
    const newAnnotation = new Annotation(req.body);
    newAnnotation.textId = req.text._id;
    newAnnotation.userId = req.user._id;

    newAnnotation.validate()
      .then(() => req.set.validateAnnotationTypeId(newAnnotation.annotationTypeId))
      .then(annotationType => req.set.validateAnnotationOptionIdOfType(annotationType,
         newAnnotation.annotationOptionId))
      .then(() => newAnnotation.save())
      .then(annotation => res.status(httpStatus.CREATED).json(annotation.toPublic()))
      .then(() => annotationTypeStatusQueue.add({ annotation: newAnnotation }))
      .catch(err => next(err));
  });

export default router;
