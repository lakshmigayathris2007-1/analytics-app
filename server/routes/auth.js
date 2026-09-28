import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';
const r = Router();
const sign = u => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
const pub = u => ({ id: u._id, name: u.name, email: u.email, role: u.role });

r.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
  const first = (await User.countDocuments()) === 0; // first user becomes admin
  const user = await User.create({ name, email, password, role: first ? 'admin' : 'viewer' });
  res.status(201).json({ token: sign(user), user: pub(user) });
});

r.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() }).select('+password');
  if (!user || !(await user.matches(password || ''))) return res.status(401).json({ message: 'Invalid email or password' });
  if (!user.isActive) return res.status(403).json({ message: 'Account is disabled' });
  res.json({ token: sign(user), user: pub(user) });
});

r.get('/me', auth, (req, res) => res.json({ user: pub(req.user) }));
export default r;
