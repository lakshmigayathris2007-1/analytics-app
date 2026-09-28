import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import Dataset from '../models/Dataset.js';
import { buildMatch, snapshot, options } from '../utils/analytics.js';
const r = Router();
r.use(auth);
r.get('/', async (req, res) => res.json(await snapshot(buildMatch(req.query))));
r.get('/options', async (req, res) => {
  const [o, datasets] = await Promise.all([options(), Dataset.find().sort('-createdAt').select('name')]);
  res.json({ ...o, datasets });
});
export default r;
