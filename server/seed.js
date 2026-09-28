import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import Dataset from './models/Dataset.js';
import SalesRecord from './models/SalesRecord.js';
import Report from './models/Report.js';

await mongoose.connect(process.env.MONGO_URI);
await Promise.all([User.deleteMany(), Dataset.deleteMany(), SalesRecord.deleteMany(), Report.deleteMany()]);
const admin = await User.create({ name: 'Admin', email: 'admin@example.com', password: 'Admin@123', role: 'admin' });
await User.create({ name: 'Anita Analyst', email: 'analyst@example.com', password: 'Analyst@123', role: 'analyst' });
await User.create({ name: 'Vikram Viewer', email: 'viewer@example.com', password: 'Viewer@123', role: 'viewer' });

const ds = await Dataset.create({ name: 'Demo sales data', fileName: 'seed', uploadedBy: admin._id });
const catalog = {
  Electronics: [['Laptop', 900, 0.75], ['Phone', 600, 0.7], ['Headphones', 120, 0.55]],
  Furniture: [['Desk', 300, 0.65], ['Chair', 150, 0.6]],
  Clothing: [['Jacket', 80, 0.5], ['Sneakers', 95, 0.55], ['T-shirt', 25, 0.4]],
  Grocery: [['Coffee', 15, 0.7], ['Snacks', 8, 0.65]],
};
const regions = ['North', 'South', 'East', 'West'];
const pick = a => a[Math.floor(Math.random() * a.length)];
const docs = [];
const now = new Date();
for (let i = 0; i < 2000; i++) {
  const cat = pick(Object.keys(catalog));
  const [product, price, costRatio] = pick(catalog[cat]);
  const date = new Date(now.getFullYear(), now.getMonth() - Math.floor(Math.random() * 12), 1 + Math.floor(Math.random() * 28));
  const quantity = 1 + Math.floor(Math.random() * 5);
  const revenue = +(price * quantity * (0.9 + Math.random() * 0.2)).toFixed(2);
  docs.push({ dataset: ds._id, date, product, category: cat, region: pick(regions), quantity, revenue, cost: +(revenue * costRatio).toFixed(2) });
}
await SalesRecord.insertMany(docs);
ds.rowCount = docs.length; await ds.save();
console.log('Seeded. Logins: admin@example.com / Admin@123, analyst@example.com / Analyst@123, viewer@example.com / Viewer@123');
await mongoose.disconnect();
