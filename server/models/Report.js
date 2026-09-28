import mongoose from 'mongoose';
export default mongoose.model('Report', new mongoose.Schema({
  title: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  filters: { type: Object, default: {} },
  snapshot: { type: Object, default: {} },
}, { timestamps: true }));
