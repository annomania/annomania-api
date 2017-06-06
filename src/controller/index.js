import express from 'express';
import path from 'path';
import httpStatus from 'http-status';
import bodyParser from 'body-parser';
import { set } from './route';
import { errorHandlerMiddleware, kongMiddleware } from '../middleware';

const router = express.Router();

// basic middlewares
router.use(bodyParser.json());

/**
 * API Routes exposed to global Router
 */
router.use('/set', kongMiddleware);
router.use('/set', set);

/**
 * Root API route
 *
 * GET /
 */
router.get('/', (req, res) => {
  res.send('Hello Annomania!');
});

/**
 * Swagger API-Docs Specification
 * Only accepts file requests with valid swagger spec extension (yaml, yml, json)
 *
 * GET /api-docs/(*.(yaml|yml|json)
 */
router.get('/api-docs/(*.(yaml|yml|json))', (req, res) => {
  const options = {
    root: path.join(__dirname, '../../api-docs/'),
    dotfiles: 'deny',
    acceptRanges: false,
  };

  const fileName = `${req.params[0]}.${req.params[1]}`;
  res.sendFile(fileName, options, (err) => {
    if (err) res.sendStatus(httpStatus.NOT_FOUND);
  });
});

/**
 * Health Check API route
 *
 * GET /health-check
 */
router.get('/health-check', (req, res) => {
  res.send('OK');
});

router.use(errorHandlerMiddleware);

export default router;
