import mongoose from 'mongoose';

const PasteSchema = new mongoose.Schema({
    _id: { type: String, required: true }, // We will use nanoid for short IDs
    content: { type: String, required: true }, // The paste text
    createdAt: { type: Number, required: true }, // Unix timestamp (ms)
    expiresAt: { type: Number, index: true }, // TTL: Absolute expiry time (ms)
    maxViews: { type: Number }, // Optional: Max views allowed
    currentViews: { type: Number, default: 0 },
});

// Create Mongoose model (prevent recompilation in dev)
export default mongoose.models.Paste || mongoose.model('Paste', PasteSchema);
