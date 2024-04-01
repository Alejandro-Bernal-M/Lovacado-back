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
