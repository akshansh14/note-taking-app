
const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, },
  content: { type: String,},
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  transcript: { type: String },
  isFavorite: { type: Boolean, default: false },
  images: [{ type: String }], // Array of image URLs
  audio: { type: String }, // Audio file URL
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);
