import { Router } from 'express';
import multer from 'multer';
import XLSX from 'xlsx';
import { auth, requireRole } from '../middleware/auth.js';
import Dataset from '../models/Dataset.js';
import SalesRecord from '../models/SalesRecord.js';
const r = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });
r.use(auth);

r.get('/datasets', async (req, res) => {
  res.json(await Dataset.find().sort('-createdAt').populate('uploadedBy', 'name'));
});

r.post('/', requireRole('admin', 'analyst'), upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Choose a CSV or Excel file' });
  const wb = XLSX.read(req.file.buffer, { type: 'buffer', cellDates: true });
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });
  const dataset = await Dataset.create({
    name: req.body.name || req.file.originalname, fileName: req.file.originalname, uploadedBy: req.user._id,
  });
  const docs = [], errors = [];
  rows.forEach((raw, i) => {
    const row = {};
    for (const k of Object.keys(raw)) row[k.toString().trim().toLowerCase()] = raw[k];
    const date = row.date instanceof Date ? row.date : new Date(row.date);
    const revenue = Number(row.revenue);
    if (isNaN(date) || row.date === '') return errors.push(`Row ${i + 2}: invalid date`);
    if (row.revenue === '' || isNaN(revenue)) return errors.push(`Row ${i + 2}: invalid revenue`);
    docs.push({
      dataset: dataset._id, date, revenue,
      product: String(row.product || 'Unknown'), category: String(row.category || 'Unknown'),
      region: String(row.region || 'Unknown'),
      quantity: row.quantity === '' ? 1 : Number(row.quantity) || 1,
      cost: Number(row.cost) || 0,
    });
  });
  if (!docs.length) {
    await dataset.deleteOne();
    return res.status(400).json({ message: 'No valid rows found. Required columns: date, revenue', errors: errors.slice(0, 10) });
  }
  await SalesRecord.insertMany(docs);
  dataset.rowCount = docs.length;
  await dataset.save();
  res.status(201).json({ dataset, inserted: docs.length, skipped: errors.length, errors: errors.slice(0, 10) });
});

r.delete('/:id', requireRole('admin', 'analyst'), async (req, res) => {
  await SalesRecord.deleteMany({ dataset: req.params.id });
  await Dataset.findByIdAndDelete(req.params.id);
  res.json({ message: 'Dataset deleted' });
});
export default r;
