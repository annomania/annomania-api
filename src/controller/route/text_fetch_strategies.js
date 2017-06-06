import { Text } from '../../data/model';

/**
 * A fetch strategy for text is a function that gets a request and
 * returns a valid query for a mongodb aggregation
 */
const strategies = {
  random: (req, limit) => [
    { $match: { setId: req.set._id } },
    { $sample: { size: limit } },
  ],
  topic: (req, _) => [
    { $match: { $text: { $search: req.query.topic.replace(/\W+/g, '') } } },
    { $match: { setId: req.set._id } },
  ],
  leastAnnotated: (req, _) => [
    { $match: { setId: req.set._id } },
    { $unwind: { path: '$annotationTypeStatus', preserveNullAndEmptyArrays: true } },
    { $sort: { 'annotationTypeStatus.annotationCount': 1 } },
  ],
};

export default function getAggregateForStrategy(fetchStrategy, req, amount) {
  let aggregateFunction = strategies[fetchStrategy](req, amount);

  aggregateFunction = [
    ...aggregateFunction,
    { $project: Text.publicProjection() },
    { $limit: amount },
  ];

  return aggregateFunction;
}
