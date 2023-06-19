// const { Product, Review } = require('../models/productmodel');
// // assuming the collection name is "users"
// const bcrypt = require('bcrypt');

// exports.getAllProduct = async (req, res) => {
//   try {
//     // Get filter parameters from the request query
//     const { minPrice, maxPrice, sortBy } = req.query;

//     // Build the filter object based on the provided parameters
//     const filter = { category: 'Laptops' };
//     if (minPrice && maxPrice) {
//       filter.productprice = { $gte: minPrice, $lte: maxPrice };
//     }

//     // Build the sort object based on the provided sortBy parameter
//     const sort = {};
//     if (sortBy === 'priceLowToHigh') {
//       sort.productprice = 1;
//     } else if (sortBy === 'priceHighToLow') {
//       sort.productprice = -1;
//     }

//     // Fetch and apply filters and sorting to the products
//     const products = await Product.find(filter).sort(sort);

//     // Extract image details from the nested structure and fetch reviews for each product
//     const productWithImages = await Promise.all(products.map(async (product) => {
//       const { _id, productname, description, productprice, saleprice, stock, category, highlight1, highlight2, photo } = product;
//       const image = photo.length > 0 ? { title: photo[0].title, filepath: photo[0].filepath } : null;

//       // Fetch reviews for the current product
//       const reviews = await Review.find({ product: _id });
//       const rating = reviews.reduce((sum, review) => sum + review.rating, 0);
//       const reviewCount = reviews.length;

//       return {
//         _id,
//         productname,
//         description,
//         productprice,
//         saleprice,
//         stock,
//         category,
//         highlight1,
//         highlight2,
//         rating,
//         reviewCount,
//         image,
//       };
//     }));

//     res.render('laptoppage', { product: productWithImages });
//   } catch (err) {
//     console.error(err);
//     res.render('error');
//   }
// };



const { Product, Review } = require('../models/productmodel');
const bcrypt = require('bcrypt');

exports.getAllProduct = async (req, res) => {
  try {
    const { minPrice, maxPrice, sortBy } = req.query;

    const filter = { category: 'Laptops' };
    if (minPrice && maxPrice) {
      filter.productprice = { $gte: minPrice, $lte: maxPrice };
    }

    const sort = {};
    if (sortBy === 'priceLowToHigh') {
      sort.productprice = 1;
    } else if (sortBy === 'priceHighToLow') {
      sort.productprice = -1;
    }

    const products = await Product.find(filter).sort(sort);

    const productWithImages = await Promise.all(products.map(async (product) => {
      const { _id, productname, description, productprice, saleprice, stock, category, highlight1, highlight2, photo } = product;
      const image = photo.length > 0 ? { title: photo[0].title, filepath: photo[0].filepath } : null;

      const reviews = await Review.find({ product: _id });
      const reviewCount = reviews.length;
      const ratingSum = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating =Math.floor(reviewCount > 0 ? ratingSum / reviewCount : 0); 

      product.rating = averageRating; // Set the averageRating property of the product document

      await product.save(); // Save the updated product document

      return {
        _id,
        productname,
        description,
        productprice,
        saleprice,
        stock,
        category,
        highlight1,
        highlight2,
        averageRating,
        reviewCount,
        image,
      };
    }));

    res.render('laptoppage', { product: productWithImages });
  } catch (err) {
    console.error(err);
    res.render('error');
  }
};
