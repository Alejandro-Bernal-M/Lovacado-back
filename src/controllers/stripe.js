const Product = require('../models/product');
const dotenv = require('dotenv');
dotenv.config();
const stripe = require('stripe')(process.env.STRIPE_SECRET);

exports.createSession = async (req, res) => {
  const { items } = req.body;
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

function fulfillOrder(lineItems) {
  console.log('Fulfilling order', lineItems);
}

exports.handleWebhook = async (req, res) => {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET
  console.log('endpointSecret', endpointSecret)
  const payload = req.body;
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('Checkout session completed:', session);
        // Retrieve the session. If you require line items in the response, you may include them by expanding line_items.
        const sessionWithLineItems = await stripe.checkout.sessions.retrieve(
          event.data.object.id,
          {
            expand: ['line_items'],
          }
        );
        const lineItems = sessionWithLineItems.line_items;
    
        // Fulfill the purchase...
        fulfillOrder(lineItems);

        break;
      // Add other event handlers as needed
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error.message);
    return res.status(400).json({ message: 'Webhook error', error: error.message });
  }

  // if (event.type === 'checkout.session.completed') {
  //   const session = event.data.object;
  //   console.log('session', session);
  //   // Do something with session
  // }

  // res.json({ received: true });
}


