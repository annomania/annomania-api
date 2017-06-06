/* eslint-env mocha */

import { expect } from 'chai';
import mongoose from 'mongoose';
import { Set } from '../../../src/data/model';
import * as db from '../../../src/data/db';
import * as factories from '../../factory';

describe('## data.db.model.set', () => {
  beforeEach(() => db.connect()
    .then(() => db.dropDatabase())
    .then(() => Set.ensureIndexes()));

  afterEach(() => db.disconnect());

  describe('# mongoose schema', () => {
    it('should get the model', () => {
      expect(Set).to.exist;
    });
  });

  describe('# constraints', () => {
    it('should allow non unique name for different owner', () => {
      const userSet = factories.Set.build({
        name: 'set',
        owner: mongoose.Types.ObjectId().toString(),
      });
      const duplicateSet = factories.Set.build({
        name: 'set',
        owner: mongoose.Types.ObjectId().toString(),
      });

      return Set.create(userSet)
        .then(() => Set.create(duplicateSet));
    });

    it('should reject non unique name per owner', (done) => {
      const ownerId = mongoose.Types.ObjectId().toString();
      const userSet = factories.Set.build({
        name: 'set',
        owner: ownerId,
      });
      const duplicateSet = factories.Set.build({
        name: 'set',
        owner: ownerId,
      });

      Set.create(userSet)
        .then(() => Set.create(duplicateSet))
        .catch(() => done());
    });
  });

  describe('# validateTextMeta', () => {
    it('should resolve if no textSchema on Set', () => {
      const set = new Set(factories.Set.build({ textSchema: undefined }));

      return set.validateTextMeta({ someProperty: true, unicorns: 3 });
    });

    it('should resolve if valid textMeta and textSchema on Set', () => {
      const set = new Set(factories.Set.build({
        textSchema: {
          type: 'object',
          properties: {
            tweetid: { type: 'string' },
            twitteruser: { type: 'string' },
          },
          required: ['tweetid', 'twitteruser'],
        },
      }));

      return set.validateTextMeta({ tweetid: '12234', twitteruser: 'Hans' });
    });

    it('should reject if invalid textMeta and textSchema on Set', (done) => {
      const set = new Set(factories.Set.build({
        textSchema: {
          type: 'object',
          properties: {
            tweetid: { type: 'string' },
            twitteruser: { type: 'string' },
          },
          required: ['tweetid', 'twitteruser'],
        },
      }));

      set.validateTextMeta({ someProperty: false, unicorns: 1 })
        .catch(() => done());
    });

    it('should reject if inexisting textMeta and textSchema on Set', (done) => {
      const set = new Set(factories.Set.build({
        textSchema: {
          type: 'object',
          properties: {
            tweetid: { type: 'string' },
            twitteruser: { type: 'string' },
          },
          required: ['tweetid', 'twitteruser'],
        },
      }));

      set.validateTextMeta(undefined)
        .catch(() => done());
    });
  });

  describe('# toPublic', () => {
    it('should get the public object', () => {
      const set = new Set(factories.Set.build());

      expect(set.toPublic()).to.exist;
      expect(set.toPublic()).to.eql({
        _id: set._id,
        name: set.name,
        language: set.language,
        annotationTypes: set.annotationTypes,
      });
    });
  });

  describe('# validateAnnotationTypeId', () => {
    it('should resolve if existing annotationTypeId', () => {
      const annotationTypeId = mongoose.Types.ObjectId().toString();
      const set = new Set(factories.Set.build({
        annotationTypes: [
          {
            _id: annotationTypeId,
            options: [
              {
                name: 'option',
              },
            ],
          },
        ],
      }));

      return set.validateAnnotationTypeId(annotationTypeId);
    });

    it('should reject if inexisting annotationTypeId', (done) => {
      const set = new Set(factories.Set.build());

      set.validateAnnotationTypeId(mongoose.Types.ObjectId().toString())
        .catch(() => done());
    });
  });

  describe('# validateAnnotationOptionIdOfType', () => {
    it('should resolve if existing annotationOptionId', () => {
      const annotationTypeId = mongoose.Types.ObjectId().toString();
      const annotationOptionId = mongoose.Types.ObjectId().toString();

      const set = new Set(factories.Set.build({
        annotationTypes: [
          {
            _id: annotationTypeId,
            options: [
              {
                _id: annotationOptionId,
                name: 'option',
              },
            ],
          },
        ],
      }));

      return set.validateAnnotationOptionIdOfType(set.annotationTypes.id(annotationTypeId),
         annotationOptionId);
    });

    it('should reject if inexisting validateAnnotationOptionIdOfType', (done) => {
      const annotationTypeId = mongoose.Types.ObjectId().toString();
      const set = new Set(factories.Set.build({
        annotationTypes: [
          {
            _id: annotationTypeId,
            options: [],
          },
        ],
      }));

      set.validateAnnotationOptionIdOfType(annotationTypeId, mongoose.Types.ObjectId().toString())
        .catch(() => done());
    });
  });

  describe('# getAnnotationTypeById', () => {
    it('should return annotationType by id', () => {
      const set = new Set(factories.Set.build());
      expect(set.getAnnotationTypeById(set.annotationTypes[0]._id))
        .to.eql(set.annotationTypes[0]);
    });

    it('should throw error if no annotationType with the id is found', () => {
      const set = new Set(factories.Set.build());
      expect(() => set.getAnnotationTypeById('000000000000000000000000'))
        .to.throw(Error, /No annotationType/);
    });
  });

  describe('# getFirstAnnotationType', () => {
    it('should return first annotationType in set', () => {
      const set = new Set(factories.Set.build());
      expect(set.getFirstAnnotationType()).to.eql(set.annotationTypes[0]);
    });

    it('should throw an error if set has no annotationType', () => {
      const set = new Set(factories.Set.build({ annotationTypes: [] }));
      expect(() => set.getFirstAnnotationType()).to.throw(Error, /no annotationTypes/);
    });
  });
});
