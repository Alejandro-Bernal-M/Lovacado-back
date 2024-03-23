const mongoose = require('mongoose');

const ProductSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  offer: Number,
  category: {
    type: mongoose.Types.ObjectId, ref: 'Category',
    required: true
  },
  createdBy: {
    type: mongoose.Types.ObjectId, ref: 'User',
    required: true
  },
  updatedAt: Date
}, {timestamps: true});

module.exports = mongoose.model('Product', ProductSchema);