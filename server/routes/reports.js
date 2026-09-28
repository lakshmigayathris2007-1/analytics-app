import { Router } from 'express';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { auth, requireRole } from '../middleware/auth.js';
import Report from '../models/Report.js';
import { buildMatch, snapshot } from '../utils/analytics.js';
const r = Router();
r.use(auth);

r.get('/', async (req, res) => res.json(await Report.find().sort('-createdAt').populate('createdBy', 'name')));

r.post('/', requireRole('admin', 'analyst'), async (req, res) => {
  const { title, filters = {} } = req.body;
  if (!title) return res.status(400).json({ message: 'Title is required' });
  const report = await Report.create({ title, filters, createdBy: req.user._id, snapshot: await snapshot(buildMatch(filters)) });
  res.status(201).json(report);
});

r.get('/:id/download', async (req, res) => {
  const rep = await Report.findById(req.params.id);
  if (!rep) return res.status(404).json({ message: 'Report not found' });
  const { kpis, trend, byCategory, byRegion } = rep.snapshot;
  const safe = rep.title.replace(/[^\w-]+/g, '_');
  const money = n => Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });

  if (req.query.format === 'xlsx') {
    const wb = new ExcelJS.Workbook();
    const s = wb.addWorksheet('Summary');
    s.addRows([['Report', rep.title], ['Generated', rep.createdAt.toISOString()], [], ['KPI', 'Value'],
      ...Object.entries(kpis).map(([k, v]) => [k, Number(v.toFixed(2))])]);
    const add = (name, data) => {
      const ws = wb.addWorksheet(name);
      ws.columns = [{ header: 'Name', key: 'name', width: 22 }, { header: 'Revenue', key: 'revenue', width: 15 },
        { header: 'Profit', key: 'profit', width: 15 }, { header: 'Orders', key: 'orders', width: 10 }];
      ws.addRows(data);
      ws.getRow(1).font = { bold: true };
    };
    add('Trend', trend); add('By Category', byCategory); add('By Region', byRegion);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${safe}.xlsx"`);
    await wb.xlsx.write(res);
    return res.end();
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${safe}.pdf"`);
  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);
  doc.fontSize(22).text(rep.title);
  doc.fontSize(10).fillColor('gray').text(`Generated ${rep.createdAt.toLocaleString()}`).fillColor('black').moveDown();
  doc.fontSize(14).text('Key metrics').moveDown(0.5).fontSize(11);
  doc.text(`Revenue: ${money(kpis.revenue)}`).text(`Profit: ${money(kpis.profit)}  (margin ${kpis.margin.toFixed(1)}%)`)
    .text(`Orders: ${kpis.orders}`).text(`Units sold: ${kpis.units}`).text(`Average order value: ${money(kpis.avgOrderValue)}`).moveDown();
  const table = (t, data) => {
    doc.fontSize(14).text(t).moveDown(0.5).fontSize(10);
    data.forEach(d => doc.text(`${d.name}    revenue ${money(d.revenue)}    profit ${money(d.profit)}    orders ${d.orders}`));
    doc.moveDown();
  };
  table('Monthly trend', trend); table('By category', byCategory); table('By region', byRegion);
  doc.end();
});

r.delete('/:id', requireRole('admin', 'analyst'), async (req, res) => {
  await Report.findByIdAndDelete(req.params.id);
  res.json({ message: 'Report deleted' });
});
export default r;
