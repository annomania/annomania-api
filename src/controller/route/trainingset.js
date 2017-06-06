import express from 'express';
import mongoose from 'mongoose';
import { Text } from '../../data/model';

const router = express.Router();

router.get('/', (req, res) => {
  function getAnnotationTypeForTrainingset() {
    if (req.query.annotationType) {
      const annotationTypeId = mongoose.Types.ObjectId(req.query.annotationType);
      return req.set.getAnnotationTypeById(annotationTypeId);
    }
    return req.set.getFirstAnnotationType();
  }

  const page = parseInt(req.query.page) || 1;
  const amount = parseInt(req.query.amount) || 200;
  const annotationType = getAnnotationTypeForTrainingset();

  Text.find({ setId: req.set._id })
    .skip((page - 1) * amount)
    .limit(amount)
    .cursor()
    .map(text => text.mapAnnotationStatusWithOptionName(req.set, annotationType))
    .on('cursor', () => { res.write('['); })
    .on('data', (() => {
      let index = 0;
      res.setHeader('Content-Type', 'application/json');
      return text => res.write((!(index++) ? '' : ',') + JSON.stringify(text));
    })())
    .on('end', () => { res.write(']\n'); res.end(); });
});

export default router;
