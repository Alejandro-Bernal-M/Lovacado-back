const express = require('express');
const router = express.Router();
const { addItemToCart, removeItemFromCart, clearCart, checkProductsForCheckout, getCartItems, saveCart } = require('../controllers/cart');
const { requireSignin } = require('../common-middlewares');

router.post('/cart/checkout', checkProductsForCheckout);
router.post('/cart/add', requireSignin, addItemToCart);
router.delete('/cart/remove/:productId', requireSignin, removeItemFromCart);
router.delete('/cart/clear', requireSignin, clearCart);
router.get('/cart/items', requireSignin, getCartItems);
router.post('/cart/save', requireSignin, saveCart);

module.exports = router;