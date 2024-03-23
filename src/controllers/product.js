const Product = require('../models/product');
const slugify = require('slugify');
const { v4: uuidv4 } = require('uuid');

exports.createProduct = async (req, res) => {
  const { name, price, quantity, description, category } = req.body;
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
    createdBy: req.user._id,
  });

  try {
    const savedProduct = await product.save();
    if(savedProduct == product){
      return res.status(200).json({savedProduct});
    }else {
      return res.status(400).json({message: 'something went wrong saving the product'})
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong', error });
  }
};

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
  const { name, price, quantity, description, category, reviews } = req.body;
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
  };

  try {
    const updateProduct = await Product.findOneAndUpdate({ _id: req.body.productId }, updatedFields, { new: true });

    if (!updateProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.status(200).json({ message: 'Product successfully updated', product: updateProduct });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong', error });
  }
};

exports.addReviewToProject = async (req, res) => {
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
