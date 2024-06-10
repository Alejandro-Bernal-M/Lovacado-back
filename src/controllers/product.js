const User = require('../models/user');
const Product = require('../models/product');
const slugify = require('slugify');
const { v4: uuidv4 } = require('uuid');

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}).populate({
      path: 'createdBy',
      select: 'firstName lastName fullName' // Include the virtual fullName
    }).populate({
      path: 'category',
      select: 'name _id'
    });
    
    if(!products) {
      return res.status(404).json({message: 'Error getting the products.'})
    }
    
    res.status(200).json({products})
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong', error });
  }
}

exports.createProduct = async (req, res) => {
  console.log('body', req.body)
  if (req.body === null || req.body === undefined || req.body.size === 0) {
    return res.status(400).json({ message: 'Please fill all required fields' });
  }
  const { name, price, quantity, description, category, offer } = req.body;
  let productImages = [];

  if (req.files && req.files.length > 0) {
    productImages = req.files.map((file) => ({ img: file.filename }));
  }

  const product = new Product({
    name,
    slug: slugify(name),
    price,
    quantity,
    description,
    category,
    productImages,
    offer,
    createdBy: req.user._id,
  });

  try {
    const savedProduct = await product.save();
    const savedProductWithUser = await savedProduct.populate({
      path: 'createdBy',
      select: 'firstName lastName fullName' // Include the virtual fullName
    });

    if(savedProduct == product){
      return res.status(200).json({savedProduct: savedProductWithUser});
    }else {
      return res.status(400).json({ message: 'something went wrong saving the product' })
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong', error });
  }
};

exports.getSpecificProducts = async (req, res) => {
  try {
    const product = await Product.findOne({_id: req.params.productId}).populate({
      path: 'createdBy',
      select: 'firstName lastName fullName' // Include the virtual fullName
    });
    if(!product) {
      return res.status(404).json({ message: 'Error getting the product.' })
    }

    res.status(200).json({product})
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong', error });
  }
}

exports.deleteProduct = async (req, res) => {
  const { productId } = req.body;

  try {
    const product = await Product.findOneAndDelete({ _id: productId });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.status(200).json({ message: 'Product successfully deleted', product });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong', error });
  }
};

exports.updateProduct = async (req, res) => {
  const { name, price, quantity, description, category, reviews, offer } = req.body;
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
    reviews,
    offer,
  };

  try {
    const product = await Product.findOne({ _id: req.body.productId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if(productImages.length === 0){
      updatedFields.productImages = product.productImages;
    }

    const updateProduct = await Product.findOneAndUpdate({ _id: req.body.productId }, updatedFields, { new: true }).populate({
      path: 'createdBy',
      select: 'firstName lastName fullName' // Include the virtual fullName
      });

    if (!updateProduct) {
      return res.status(400).json({ message: 'Error updating product' });
    }

    return res.status(200).json({ message: 'Product successfully updated', product: updateProduct });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong', error });
  }
};

exports.addReviewToProduct = async (req, res) => {
  const { review, projectId } = req.body;
  const reviewId = uuidv4();

  review.id = reviewId;

  try {
    const project = await Project.findOne({ id: projectId });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    project.reviews.push(review);
    const savedProject = await project.save();

    if (!savedProject) {
      return res.status(400).json({ message: 'Error adding review' });
    }
    return res.status(200).json({ message: 'Review successfully added', project: savedProject });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong', error });
  }
};
