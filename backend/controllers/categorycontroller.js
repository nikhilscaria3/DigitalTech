const { Product } = require('../models/productmodel');
// assuming the collection name is "users"
const bcrypt = require('bcrypt');

// exports.getAllCategoryLap = async (req, res) => {
//     try {
//         const product = await Product.find({ category: "Smartphones" });
//         const message = req.session.message || null;
//         req.session.message = null;

//         if (!product) {
//             return res.status(404).render('error', { message: 'Product not found' });
//         }

//         if (req.query.delete_id) {
//             await Product.findByIdAndDelete(req.query.delete_id);
//             return res.redirect('/category');
//         }

//         // Extract image details from the nested structure
//         const productwithimages = product.map(product => {
//             const { _id, productname, description, productprice, saleprice, stock, category, photo } = product;
//             const { title, filepath } = photo;
//             return { _id, productname, description, productprice, saleprice, stock, category, title, filepath };
//         });


//         res.render('category', { product: productwithimages, message, editdata: {} });
//     } catch (error) {
//         console.error(error);
//         res.render('error');
//     }
// };



exports.getAllCategories = async (req, res) => {
  try {
    const products = await Product.find({});
    const categories = [...new Set(products.map(product => product.category))];



    if (!categories || categories.length === 0) {
      return res.status(404).render('error', { message: 'No categories found' });
    }

    if (req.query.delete_id) {
      await Product.findByIdAndDelete(req.query.delete_id);
      return res.redirect('/category');
    }

    res.render('category', {categories, message: null });
  } catch (error) {
    console.error(error);
    res.render('error');
  }
};



exports.deleteCategory = async (req, res) => {
  try {
    const categoryId = req.query.delete_id;
    const category = await Product.findById(categoryId);

    if (!category) {
      return res.status(404).render('error', { message: 'Category not found' });
    }

    await Product.deleteMany({ category: categoryId });
    await Product.findByIdAndDelete(categoryId);

    // You can perform any additional cleanup or operations related to the deletion of the category

    req.session.message = 'Category deleted successfully';
    res.redirect('/category');
  } catch (error) {
    console.error(error);
    res.render('error');
  }
};
