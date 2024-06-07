const Cart = require('../models/cart');

exports.addItemToCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
      const product = req.body.cartItems.product;
      const item = cart.cartItems.find(item => item.product.toString() === product.toString());

      if (item) {
        item.quantity += req.body.cartItems.quantity;
        item.price += req.body.cartItems.price;
      } else {
        cart.cartItems.push(req.body.cartItems);
      }

      const updatedCart = await cart.save();
      if(updatedCart == cart){
        return res.status(200).json({ updatedCart });
      } else {
        return res.status(400).json({ message: "Error saving the cart" });
      }
    } else {
      const newCart = new Cart({
        user: req.user._id,
        cartItems: [req.body.cartItems]
      });

      const savedCart = await newCart.save();
      if(savedCart == newCart){
        return res.status(200).json({ savedCart });
      } else {
        return res.status(400).json({ message: "Error saving the cart" });
      }
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

    items.forEach(async item => {
      const product = await Product.findById(item._id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found', checkStatus: false });
      }
      const quantity = item.quantity;
      const stock = product.quantity;
      const price = product.price;
      const offer = product.offer;
      const discountedPrice = price - (price * offer / 100);

      if (stock < quantity) {
        return res.status(400).json({ message: 'Insufficient stock for ' + product.name, checkStatus: false });
      }

      total += discountedPrice * quantity;
    })

    if (total !== totalAmount) {
      return res.status(400).json({ message: 'Total amount mismatch', checkStatus: false });
    }

    return res.status(200).json({ message: 'Products are ready for checkout', checkStatus: true });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error, message: 'Error checking products for checkout' });
  }
}