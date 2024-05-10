const express = require('express');
const router = express.Router();
const {getAllProducts, createProduct, getSpecificProducts, deleteProduct, updateProduct, addReviewToProduct} = require('../controllers/product');
const {requireSignin, requireAdmin} = require('../common-middlewares');
const multer = require('multer');
const shortid = require('shortid');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(path.dirname(__dirname), 'uploads'))
  },
  filename: function (req, file, cb) {
    cb(null, shortid.generate() + '-' + file.originalname)
  }
})

const upload = multer({ storage: storage })

router.get('/products', getAllProducts);
router.post('/product/create', requireSignin, requireAdmin, upload.array('productImages'), createProduct);
router.get('/product/:productId', getSpecificProducts);
router.delete('/product/:productId', requireSignin, requireAdmin, deleteProduct);
router.put('/product/update/:productId', requireSignin, requireAdmin, upload.array('productImages'), updateProduct);
router.put('/product/addReview/:productId', requireSignin, addReviewToProduct);

module.exports = router;
