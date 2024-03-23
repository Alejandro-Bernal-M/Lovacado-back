const Product = require('../models/product');
const slugify = require('slugify');

exports.createProduct = async(req, res) => {
  const {name, price, quantity, description, category} = req.body

  let productImages = [];

  if (req.files.length > 0) {
    productImages = req.files.map((file) => ({img: file.filename}))
  }

  const product = new Product({
    name,
    slug: slugify(name),
    price,
    quantity,
    description,
    category,
    productImages,
    createdBy: req.user._id
  })

  try {
    const savedProduct = await product.save();
    if(savedProduct == product){
      res.status(200).json({savedProduct});
    }else {
      res.status(400).json({message: 'something went wrong saving the product'})
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({message: 'something went wrong', error: error})
  }
}
