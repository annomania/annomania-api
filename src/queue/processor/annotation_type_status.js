import { Annotation, Text } from '../../data/model';
import logger from '../../logger';

/**
 * Processor of a Job to update the annotation type status on a text
 */
export default (job) => {
  const textId = job.data.annotation.textId;
  const annotationTypeId = job.data.annotation.annotationTypeId;

  return Annotation.getAnnotationTypeStatus(textId, annotationTypeId)
    .then(status => Text.updateAnnotationTypeStatus(textId, status))
    .catch(err => logger.error(err));
};
