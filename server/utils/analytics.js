import mongoose from 'mongoose';
import SalesRecord from '../models/SalesRecord.js';

export function buildMatch(q = {}) {
  const m = {};
  if (q.dataset) m.dataset = new mongoose.Types.ObjectId(q.dataset);
  if (q.from || q.to) {
    m.date = {};
    if (q.from) m.date.$gte = new Date(q.from);
    if (q.to) { const d = new Date(q.to); d.setHours(23, 59, 59, 999); m.date.$lte = d; }
  }
  if (q.region) m.region = q.region;
  if (q.category) m.category = q.category;
  return m;
}

export async function kpis(match) {
  const [r] = await SalesRecord.aggregate([
    { $match: match },
    { $group: { _id: null, revenue: { $sum: '$revenue' }, cost: { $sum: '$cost' }, orders: { $sum: 1 }, units: { $sum: '$quantity' } } },
  ]);
  const x = r || { revenue: 0, cost: 0, orders: 0, units: 0 };
  const profit = x.revenue - x.cost;
  return {
    revenue: x.revenue, profit, orders: x.orders, units: x.units,
    avgOrderValue: x.orders ? x.revenue / x.orders : 0,
    margin: x.revenue ? (profit / x.revenue) * 100 : 0,
  };
}

const groupBy = (match, id) => SalesRecord.aggregate([
  { $match: match },
  { $group: { _id: id, revenue: { $sum: '$revenue' }, profit: { $sum: { $subtract: ['$revenue', '$cost'] } }, orders: { $sum: 1 } } },
  { $sort: { _id: 1 } },
  { $project: { _id: 0, name: '$_id', revenue: 1, profit: 1, orders: 1 } },
]);

export async function snapshot(match) {
  const [k, trend, byCategory, byRegion] = await Promise.all([
    kpis(match),
    groupBy(match, { $dateToString: { format: '%Y-%m', date: '$date' } }),
    groupBy(match, '$category'),
    groupBy(match, '$region'),
  ]);
  return { kpis: k, trend, byCategory, byRegion };
}

export async function options() {
  const [regions, categories] = await Promise.all([SalesRecord.distinct('region'), SalesRecord.distinct('category')]);
  return { regions: regions.filter(Boolean).sort(), categories: categories.filter(Boolean).sort() };
}
