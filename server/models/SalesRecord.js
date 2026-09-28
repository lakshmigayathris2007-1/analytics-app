import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  dataset: { type: mongoose.Schema.Types.ObjectId, ref: 'Dataset', required: true },
  date: { type: Date, required: true },
  product: String, category: String, region: String,
  quantity: { type: Number, default: 1 },
  revenue: { type: Number, required: true },
  cost: { type: Number, default: 0 },
});
schema.index({ dataset: 1, date: 1 });
schema.index({ dataset: 1, region: 1 });
export default mongoose.model('SalesRecord', schema);
