const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },

  slug: { type: String, required: true, unique: true },

  content: { type: String, required: true },

  excerpt: { type: String },

  coverImage: { type: String },

  views: { type: Number, default: 0 },

  // ✅ Link post to a user
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  seo: {
    metaTitle: String,
    metaDescription: String,
  },

  claps: { type: Number, default: 0 },

  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]

}, { timestamps: true }); // ✅ includes createdAt & updatedAt

module.exports = mongoose.model('Post', postSchema);