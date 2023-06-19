const { Product, Address, Banner, Cart, Wishlist } = require('../models/productmodel');
// assuming the collection name is "users"
const bcrypt = require('bcrypt');

exports.getAllProduct = async (req, res) => {
  try {
    const userID = req.params.userID;
    const product = await Product.find({ category: "Smartphones" }).limit(3);
    const laptops = await Product.find({ category: "Laptops" }).limit(3);
    const headphones = await Product.find({ category: "Headphones" }).limit(3);
    const currentDate = new Date();
    const activeBanners = await Banner.find({
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
      status: 'active'
    });

    // Extract image details from the nested structure
    const productWithImages = product.map(product => {
      const { _id, productname, description, productprice, saleprice, stock, category, highlight1, highlight2, rating, photo } = product;
      const image = photo.length > 0 ? { title: photo[0].title, filepath: photo[0].filepath } : null;
      return { _id, productname, description, productprice, saleprice, stock, category, highlight1, highlight2, rating, image };
    });

    const laptopwithimages = laptops.map(product => {
      const { _id, productname, description, productprice, saleprice, stock, category, highlight1, highlight2, rating, photo } = product;
      const image = photo.length > 0 ? { title: photo[0].title, filepath: photo[0].filepath } : null;
      return { _id, productname, description, productprice, saleprice, stock, category, highlight1, highlight2, rating, image };
    });

    const headphoneswithimages = headphones.map(product => {
      const { _id, productname, description, productprice, saleprice, stock, category, highlight1, highlight2, rating, photo } = product;
      const image = photo.length > 0 ? { title: photo[0].title, filepath: photo[0].filepath } : null;
      return { _id, productname, description, productprice, saleprice, stock, category, highlight1, highlight2, rating, image };
    });


    const bannersWithImages = activeBanners.map(banner => {
      const { _id, image, targetURL } = banner;
      const filepath = image.filepath; // Assuming the filepath is stored as a property in the 'image' object
      return { _id, filepath, targetURL };
    });
    const username = req.session.username;
    const email = req.session.email;

    res.render('homepage', { product: productWithImages, laptops: laptopwithimages, headphones: headphoneswithimages, username, userID, banners: bannersWithImages });
  } catch (err) {
    console.error(err);
    res.render('error');
  }
};


// exports.getWishlist = async (req, res) => {
//   try {
//     const existingCartItems = await Wishlist.find({})
//       .populate({ path: 'product', model: 'Product' });


//     if (req.query.delete_id) {
//       await Wishlist.findByIdAndDelete(req.query.delete_id);
//       return res.redirect('/wishlist');
//     }


//     const productWithImages = existingCartItems.map(item => {
//       const { _id, product } = item;
//       if (!product) return null; // Add null check for product object
//       const { photo, productname, saleprice } = product;
//       const image = photo && photo.length > 0 ? { title: photo[0].title, filepath: photo[0].filepath } : null;
//       return { _id, image, productname, saleprice };
//     }).filter(item => item !== null); // Filter out null items

//     res.render('wishlist', { wishlist: existingCartItems, images: productWithImages });
//   } catch (err) {
//     console.error(err);
//     res.render('error');
//   }
// };




// exports.postWishlist = async (req, res) => {
//   try {
//     const productId = req.params.id;
//     const existingCartItem = await Wishlist.findOne({ product: productId });

//     if (existingCartItem) {
//       // If the product exists in the wishlist, show a warning message
//       const message = 'Product is already in the wishlist.';
//       res.render('homepage', { message });
//     } else {
//       const wishlist = new Wishlist({
//         product: productId
//       });

//       await wishlist.save();
//       res.redirect('/wishlist'); // Redirect to the wishlist page
//     }
//   } catch (err) {
//     console.error(err);
//     res.render('error');
//   }
// };


exports.getWishlist = async (req, res) => {
  try {
    const existingCartItems = await Wishlist.find({})
      .populate({ path: 'product', model: 'Product' });

    if (req.query.delete_id) {
      await Wishlist.findByIdAndDelete(req.query.delete_id);
      return res.redirect('/wishlist');
    }

    const productWithImages = existingCartItems.map(item => {
      const { _id, product } = item;
      if (!product) return null; // Add null check for product object
      const { photo, productname, saleprice } = product;
      const image = photo && photo.length > 0 ? { title: photo[0].title, filepath: photo[0].filepath } : null;
      return { _id, image, productname, saleprice };
    }).filter(item => item !== null); // Filter out null items

    res.render('wishlist', { wishlist: existingCartItems, images: productWithImages });
  } catch (err) {
    console.error(err);
    res.render('error');
  }
};


exports.postWishlist = async (req, res) => {
  try {
    const productId = req.params.id;
    const userSession = res.locals.userSession;

    const existingWishlistItem = await Wishlist.findOne({ product: productId, user: userSession });

    if (!existingWishlistItem) { // If the product doesn't exist in the wishlist
      const wishlist = new Wishlist({
        product: productId,
        user: userSession
      });

      await wishlist.save();
    }

    res.redirect('/wishlist');
  } catch (err) {
    console.error(err);
    res.render('error');
  }
};




exports.getAddress = async (req, res) => {
  try {
    const address = await Address.find({});

    const products = await Cart.find({});

    if (!products) {
      return res.status(404).render('error', { message: 'Product not found' });
    }

    let totalPrice = 0;

    let editdata = null;

    if (req.query.edit_id) {
      const edit_id = req.query.edit_id;
      const validIdRegex = /^[0-9a-fA-F]{24}$/;
      if (!validIdRegex.test(edit_id)) {
        // Handle the invalid ID here
      }
      editdata = await Address.findById(edit_id);
    }

    if (req.query.delete_id) {
      await Address.findByIdAndDelete(req.query.delete_id);
      return res.redirect('/address');
    }

    // Calculate the total price by summing up the saleprice of all products in the cart
    products.forEach((product) => {
      totalPrice += product.saleprice;
    });

    // Format the total price as currency
    const formattedTotalPrice = totalPrice.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
    });

    res.render('address', { products, address, totalPrice: formattedTotalPrice, editdata: editdata || {}, formData: address || {} });
  } catch (err) {
    console.error(err);
    res.render('error');
  }
};


exports.createAddress = async (req, res) => {
  const { id, name, address, city, zip, country, state, district, houseno } = req.body;

  try {
    if (id) {
      // Update the existing address document
      await Address.findByIdAndUpdate(
        id,
        {
          name,
          address,
          city,
          zip,
          country,
          state,
          district,
          houseno
        },
        { new: true } // Set the `new` option to true to return the updated document
      );
    } else {
      // Create a new address document
      const addressObj = new Address({
        name,
        address,
        city,
        zip,
        country,
        state,
        district,
        houseno
      });

      await addressObj.save();
    }

    // Pass the updated address as part of the rendering context when rendering the shippinginfo page
    res.redirect("/address");
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};


// // Get search suggestions
// exports.getSearchSuggestions = async (req, res) => {
//   try {
//     const searchTerm = req.body.searchTerm;
//     const suggestions = await Product.find({ name: { $regex: searchTerm, $options: 'i' } }, 'name');
//     res.json(suggestions);
//   } catch (error) {
//     console.error('Error fetching search suggestions:', error);
//     res.status(500).json({ error: 'An error occurred while fetching search suggestions' });
//   }
// };

// // Perform search
// exports.performSearch = async (req, res) => {
//   try {
//     const searchTerm = req.body.searchTerm;
//     const products = await Product.find({ name: { $regex: searchTerm, $options: 'i' } });
//     res.json(products);
//   } catch (error) {
//     console.error('Error searching for products:', error);
//     res.status(500).json({ error: 'An error occurred while searching for products' });
//   }
// };


 exports.getSearchSuggestions = async (req, res) => {
  const searchTerm = req.query.term;

  if (!searchTerm) {
    return res.status(400).json({ error: 'Search term is required.' });
  }

  const regexTerm = new RegExp(searchTerm, 'i');

  try {
    const products = await Product.find({ name: regexTerm });
    res.json(products);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};