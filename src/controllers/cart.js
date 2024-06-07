const Cart = require('../models/cart');
const Product = require('../models/product');

exports.addItemToCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
      const item = req.body.cartItem;
      const product = await Product.findById(item._id);

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const quantity = item.quantity;
      const stock = product.quantity;
      const price = product.price;
      const offer = product.offer;
      let discountedPrice;
      if(offer ){
        discountedPrice = price - (price * offer / 100);
      }else {
        discountedPrice = price;
      }

      if (stock < quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      const itemIndex = cart.cartItems.findIndex(cartItem => cartItem.product.toString() === item._id.toString());

      if (itemIndex !== -1) {
        cart.cartItems[itemIndex].quantity += quantity;
        cart.cartItems[itemIndex].price = discountedPrice;
        cart.cartItems[itemIndex].offer = offer;
      } else {
        cart.cartItems.push({
          product: item._id,
          price: discountedPrice,
          quantity: quantity,
          offer: offer
        });
      }

      const updatedCart = await cart.save();
      if(updatedCart == cart){
        return res.status(200).json({ updatedCart });
      } else {
        return res.status(400).json({ message: "Error saving the cart" });
      }
    } else {
      const item = req.body.cartItem;
      const product = await Product.findById(item._id);

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const quantity = item.quantity;
      const stock = product.quantity;
      const price = product.price;
      const offer = product.offer;
      let discountedPrice;
      if(offer ){
        discountedPrice = price - (price * offer / 100);
      }else {
        discountedPrice = price;
      }

      if (stock < quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      const newCart = new Cart({
        user: req.user._id,
        cartItems: [{
          product: item._id,
          price: discountedPrice,
          quantity: quantity,
          offer: offer
        }]
      });

      const savedCart = await newCart.save();
      return res.status(200).json({ savedCart });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error, message: 'Error saving the item' });
  }
};

exports.removeItemFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const productToRemove = req.params.productId;
    const itemIndex = cart.cartItems.findIndex(item => item.product.toString() === productToRemove.toString());

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    cart.cartItems.splice(itemIndex, 1);

    const updatedCart = await cart.save();
    return res.status(200).json({ updatedCart });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error, message: 'Error removing item from cart' });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.cartItems = [];

    const updatedCart = await cart.save();
    return res.status(200).json({ updatedCart });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error, message: 'Error clearing cart' });
  }
}

exports.checkProductsForCheckout = async (req, res) => {
  try {
    const items = req.body.cartItems;
    const totalAmount = req.body.totalAmount;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in cart', checkStatus: false });
    }

    let total = 0;
    for (const item of items) {
      const product = await Product.findById(item._id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found', checkStatus: false });
      }
      const quantity = item.quantity;
      const stock = product.quantity;
      const price = product.price;
      const offer = product.offer;
      let discountedPrice;
      if(offer ){
        discountedPrice = price - (price * offer / 100);
      }else {
        discountedPrice = price;
      }
        
      if (stock < quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}`, checkStatus: false });
      }
        
      total += discountedPrice * quantity;
    }

    if (total !== totalAmount) {
      return res.status(400).json({ message: 'Total amount mismatch', checkStatus: false, totalAmount: total, itemsAmount: totalAmount});
    }

    return res.status(200).json({ message: 'Products are ready for checkout', checkStatus: true });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error, message: 'Error checking products for checkout' });
  }
}

exports.getCartItems = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('cartItems.product', 'name price productImages');

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    return res.status(200).json({ cartItems: cart.cartItems });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error, message: 'Error getting cart items' });
  }
}

exports.saveCart = async (req, res) => {
  try {
    const cart = await Cart.findOrCreate({ user: req.user._id });
    cart.cartItems = req.body.cartItems;

    const updatedCart = await cart.save();
    return res.status(200).json({ updatedCart });
  }
  catch (error) {
    console.error(error);
    return res.status(500).json({ error: error, message: 'Error saving cart' });
  }
}