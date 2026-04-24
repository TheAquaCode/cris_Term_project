const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  topic:   { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
  author:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, trim: true },
  postedAt: { type: Date, default: Date.now }
});

// Index for fast "latest N messages per topic" queries
MessageSchema.index({ topic: 1, postedAt: -1 });

module.exports = mongoose.model('Message', MessageSchema);
