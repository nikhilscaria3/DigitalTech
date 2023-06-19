const { Product, Review } = require('../models/productmodel');

exports.getAllSmartphone = async (req, res) => {
  try {
    // Get filter parameters from the request query
    const { minPrice, maxPrice, sortBy, brandFilter, color } = req.query;

    // Build the filter object based on the provided parameters
    const filter = { category: 'Smartphones' };
    if (minPrice && maxPrice) {
      filter.saleprice = { $gte: minPrice, $lte: maxPrice };
    }

    if (brandFilter) {
      filter.productname = {
        $regex: brandFilter,
        $options: 'i' // case-insensitive matching
      };
    }

    // Build the sort object based on the provided sortBy parameter
    const sort = {};
    if (sortBy === 'priceLowToHigh') {
      sort.saleprice = 1;
    } else if (sortBy === 'priceHighToLow') {
      sort.saleprice = -1;
    }

    // Fetch and apply filters and sorting to the products
    const smartphones = await Product.find(filter).sort(sort);

    // Extract image details from the nested structure
    const productWithImages = await Promise.all(smartphones.map(async product => {
      const { _id, productname, description, productprice, saleprice, stock, category, highlight1, highlight2, photo } = product;
      const image = photo.length > 0 ? { title: photo[0].title, filepath: photo[0].filepath } : null;

      const reviews = await Review.find({ product: _id });
      const reviewCount = reviews.length;
      const ratingSum = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = Math.floor(reviewCount > 0 ? ratingSum / reviewCount : 0);

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

    // Separate averageRatings from the productWithImages array
    const averageRatings = productWithImages.map(product => product.averageRating);

    console.log("averageRatings", averageRatings);

    res.render('smartphonepage', { smartphone: productWithImages, averageRatings });
  } catch (err) {
    console.error(err);
    res.render('error');
  }
};




// exports.getAllProductList = async (req, res) => {
//   try {
//       // Get filter parameters from the request query
//       const { minPrice, maxPrice, sortBy,brand,color } = req.query;

//       // Build the filter object based on the provided parameters
//       const filter = { category: 'Smartphones' };
//       if (minPrice && maxPrice) {
//         filter.productprice = { $gte: minPrice, $lte: maxPrice };
//       }
//       if (brand) {
//         filter.brand = brand;
//       }
//       if (color) {
//         filter.color = color;
//       }
//       // Build the sort object based on the provided sortBy parameter
//       const sort = {};
//       if (sortBy === 'priceLowToHigh') {
//           sort.productprice = 1;
//       } else if (sortBy === 'priceHighToLow') {
//           sort.productprice = -1;
//       }

//       // Fetch and apply filters and sorting to the products
//       const smartphone = await Product.find(filter).sort(sort);

//       const allproduct = await Product.find({})

//       // Extract image details from the nested structure
//       const productWithImages = allproduct.map(product => {
//           const { _id, productname, description, productprice, saleprice, stock, category, highlight1, highlight2, rating, photo } = product;
//           const image = photo.length > 0 ? { title: photo[0].title, filepath: photo[0].filepath } : null;
//           return { _id, productname, description, productprice, saleprice, stock, category, highlight1, highlight2, rating, image };
//       });


//       res.render('allproduct', { smartphone: productWithImages });
//   } catch (err) {
//       console.error(err);
//       res.render('error');
//   }
// };




exports.getAllProductList = async (req, res) => {
  const { minPrice, maxPrice, sortBy, categoryFilter, brandFilter } = req.query;
  try {
    // Build the filter object based on the provided parameters
    const filter = {};

    if (minPrice && maxPrice) {
      filter.saleprice = { $gte: minPrice, $lte: maxPrice };
    }

    if (categoryFilter) {
      filter.category = categoryFilter;
    }

    if (brandFilter) {
      filter.productname = {
        $regex: brandFilter,
        $options: 'i' // case-insensitive matching
      };
    }

    // Build the sort object based on the provided sortBy parameter
    const sort = {};

    if (sortBy === 'priceLowToHigh') {
      sort.saleprice = 1;
    } else if (sortBy === 'priceHighToLow') {
      sort.saleprice = -1;
    }

    const allproduct = await Product.find(filter).sort(sort);

    // Iterate over each product to add average rating and image details
    const productWithImages = await Promise.all(
      allproduct.map(async (product) => {
        const { _id, productname, description, productprice, saleprice, stock, category, highlight1, highlight2, photo } = product;
        const image = photo.length > 0 ? { title: photo[0].title, filepath: photo[0].filepath } : null;

        const reviews = await Review.find({ product: _id });
        const reviewCount = reviews.length;
        const ratingSum = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = Math.floor(reviewCount > 0 ? ratingSum / reviewCount : 0);

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
      })
    );

    res.render('allproduct', { smartphone: productWithImages });
  } catch (err) {
    console.error(err);
    res.render('error');
  }
};




