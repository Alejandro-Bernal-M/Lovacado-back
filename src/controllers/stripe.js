const Product = require('../models/product');
const dotenv = require('dotenv');
dotenv.config();
const stripe = require('stripe')(process.env.STRIPE_SECRET);

exports.createSession = async (req, res) => {
  const { items } = req.body;
  console.log('items', items);
  if (!items) {
    return res.status(400).json({ message: 'Items are required' });
  }

  const line_items = await Promise.all(
    items.map(async (item) => {
      const product = await Product.findById(item._id);
      if(!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      if(product.offer > 0) {
        product.price = (product.price - (product.price * product.offer / 100)) * 100;
      }else {
        product.price = product.price * 100;
      }
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            images: [`${process.env.PUBLIC_DOMAIN}/public/${product.productImages[0].img}`],
          },
          unit_amount: product.price,
        },
        quantity: item.quantity,
      };
    }
  ));
  console.log('line_items', line_items[0].price_data.product_data);

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL
    });

    res.status(200).json({ session });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong', error });
  }
}

