const Category = require('../models/category');
const slugify = require('slugify');

// Recursive function to create nested category list
function createCategories(categories, parentId = null) {
  let categoryList = [];
  let category;

  // If parentId is null, filter top-level categories
  if (parentId === null) {
    category = categories.filter(cat => cat.parentId == undefined);
  } else {
    // Otherwise, filter categories with matching parentId
    category = categories.filter(cat => cat.parentId == parentId);
  }

  // Iterate over filtered categories
  category.forEach(cat => {
    // Push category details along with nested children categories recursively
    categoryList.push({
      _id: cat._id,
      name: cat.name,
      slug: cat.slug,
      children: createCategories(categories, cat._id) // Recursively call createCategories for children
    });
  });

  return categoryList;
}

// Controller function to create a new category
exports.createCategory = async (req, res) => {
  const categoryObj = {
    name: req.body.name,
    slug: slugify(req.body.name)
  };

  // If request contains a file, add its path to category object
  if (req.file) {
    categoryObj.categoryImage = process.env.API + '/public/' + req.file.filename;
  }

  // If parentId is provided in request body, add it to category object
  if (req.body.parentId) {
    categoryObj.parentId = req.body.parentId;
  }

  const newCategory = new Category(categoryObj);

  try {
    const savedCategory = await newCategory.save();
    if (savedCategory === newCategory) {
      res.status(200).json({ savedCategory });
    } else {
      res.status(400).json({ message: 'Error saving category' });
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Something went wrong', error: error });
  }
};

// Controller function to fetch all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    if (categories) {
      // Call createCategories function to create nested category list
      let categoryList = createCategories(categories);
      res.json({ categoryList });
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error fetching categories', error: error });
  }
};
