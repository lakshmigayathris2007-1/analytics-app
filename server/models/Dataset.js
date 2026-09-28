import mongoose from 'mongoose';
export default mongoose.model('Dataset', new mongoose.Schema({
  name: { type: String, required: true },
  fileName: String,
  rowCount: Number,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true }));
