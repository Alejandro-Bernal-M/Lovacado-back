const Product = require('../models/product');
const slugify = require('slugify');

exports.createProduct = async(req, res) => {
  const {name, price, quantity, description, category} = req.body

  let productImages = [];

  if (req.files && req.files.length > 0) {
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
    res.status(500).json({message: 'Something went wrong', error})
  }
}

exports.deleteProduct = async (req, res) => {
  const { productId } = req.body;

  try {
    const product = await Product.findOneAndDelete({ _id: productId }); // Find and delete the product

    if (product) {
      res.status(200).json({ message: 'Product successfully deleted', product });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong', error});
  }
};

exports.updateProduct = async(req, res) => {
  const {name, price, quantity, description, category, reviews} = req.body

  let productImages = [];

  if (req.files && req.files.length > 0) {
    productImages = req.files.map((file) => ({ img: file.filename }));
  }

  const updatedFields = {
    name,
    price,
    quantity,
    description,
    category,
    productImages,
    updatedAt: Date.now(),
    reviews
  };

  try {
    const updateProduct = await Product.findOneAndUpdate({ _id: req.body.productId }, updatedFields, { new: true });
    
    if(updateProduct){
      res.status(200).json({message: 'Product successfully updated', product: updateProduct})
    } else {
      res.status(404).json({message: 'Product not found'})
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({message: 'Something went wrong', error})
  }
}