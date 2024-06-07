const express = require('express');
const router = express.Router();
const { addItemToCart, removeItemFromCart, clearCart, checkProductsForCheckout } = require('../controllers/cart');
const { requireSignin } = require('../common-middlewares');

router.post('/cart/add', requireSignin, addItemToCart);
router.delete('/cart/remove/:productId', requireSignin, removeItemFromCart);
router.delete('/cart/clear', requireSignin, clearCart);
router.get('/cart/checkout', checkProductsForCheckout);

module.exports = router;