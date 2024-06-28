const mongoose = require('mongoose');

const OrderSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  paymentStatus: {
    type: String,
    default: 'Pending',
  },
  paymentType: {
    type: String,
    default: 'Cash on Delivery',
  },
  orderStatus: {
    type: String,
    default: 'Order Placed',
  },
  paymentInfo: {
    id: {
      type: String,
    },
    status: {
      type: String,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {timestamps: true});

module.exports = mongoose.model('Order', OrderSchema);