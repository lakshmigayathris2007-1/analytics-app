import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import User from '../models/User.js';
const r = Router();
r.use(auth, requireRole('admin'));
const isSelf = (req, res) => req.params.id === String(req.user._id) && res.status(400).json({ message: 'You cannot change your own account here' });

r.get('/', async (req, res) => res.json(await User.find().sort('-createdAt')));
r.patch('/:id/role', async (req, res) => {
  if (isSelf(req, res)) return;
  if (!['admin', 'analyst', 'viewer'].includes(req.body.role)) return res.status(400).json({ message: 'Invalid role' });
  res.json(await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }));
});
r.patch('/:id/status', async (req, res) => {
  if (isSelf(req, res)) return;
  res.json(await User.findByIdAndUpdate(req.params.id, { isActive: !!req.body.isActive }, { new: true }));
});
r.delete('/:id', async (req, res) => {
  if (isSelf(req, res)) return;
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
});
export default r;
