import Queue from './queue';
import processAnnotationTypeStatus from './processor/annotation_type_status';

const annotationTypeStatusQueue = new Queue('annotation_type_status', processAnnotationTypeStatus);

export default annotationTypeStatusQueue;
