const { assign } = require('nodemailer/lib/shared');
const { Product, Cart, Order, Card, Address, Review,  } = require('../models/productmodel');

const razorpay = require('razorpay');

const razorpayInstance = new razorpay({
  key_id: 'rzp_test_c6JWs9bblKyxcL',
  key_secret: '7NNfuYJz48DiFCf0lnL3TC8M'
});
exports.getProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const userSession = res.locals.userSession; // Access the userSession from res.locals

    const product = await Product.findById(productId);
    const review = await Review.find({ product: productId });
    const orders = await Order.find({ product: productId }); // Retrieve all orders with the current product ID

    const message = req.session.message || null;
    req.session.message = null;

    let ratingCount4 = 0;
    let ratingCount5 = 0;
    let ratingCount3 = 0;
    let ratingCount2 = 0;
    let ratingCount1 = 0;

    for (const reviewItem of review) {
      const rating = reviewItem.rating;
      if (rating === 4) {
        ratingCount4++;
      } else if (rating === 5) {
        ratingCount5++;
      } else if (rating === 3) {
        ratingCount3++;
      } else if (rating === 2) {
        ratingCount2++;
      } else if (rating === 1) {
        ratingCount1++;
      }
    }

    console.log("Rating Count 4:", ratingCount4);
    console.log("Rating Count 5:", ratingCount5);
    console.log("Rating Count 3:", ratingCount3);
    console.log("Rating Count 2:", ratingCount2);
    console.log("Rating Count 1:", ratingCount1);

    if (!product) {
      return res.status(404).render('error', { message: 'Product not found' });
    }

    const productWithImages = {
      photos: product.photo.map(item => ({ title: item.title, filepath: item.filepath }))
    };

    const rating = review.map(item => item.rating);
    console.log(rating); // Output: [4]

    let orderIdsLength = 0;
    if (orders) {
      orderIdsLength = orders.length;
    }
    const remainingStock = product.stock - orderIdsLength;

    console.log("Order IDs Length:", orderIdsLength);
    console.log("Remaining Stock:", remainingStock);

    res.render('productpage', {
      product,
      review,
      rating,
      highlight1: product.highlight1,
      highlight2: product.highlight2,
      productWithImages,
      message,
      ratingCount4,
      ratingCount5,
      ratingCount3,
      ratingCount2,
      ratingCount1,
      editdata: {},
      orderIdsLength,
      remainingStock
    });

  } catch (error) {
    console.error(error);
    res.render('error');
  }
};



exports.getCart = async (req, res) => {
  try {

    const userSession = res.locals.userSession;
    const products = await Cart.find({ user: userSession })
      .populate({ path: 'product', model: 'Product' });


    if (!products) {
      return res.status(404).render('error', { message: 'Product not found' });
    }

    if (req.query.delete_id) {
      await Cart.findByIdAndDelete(req.query.delete_id);
      return res.redirect('/cart');
    }

    if (req.query.edit_id && req.query.quantity) {
      await Cart.findByIdAndUpdate(req.query.edit_id, { quantity: req.query.quantity });
      return res.redirect('/cart');
    }

    let totalPrice = 0;

    // Calculate the total price by summing up the saleprice of all products in the cart
    products.forEach((product) => {
      totalPrice += product.totalPrice;
    });

    // Format the total price as currency
    const formattedTotalPrice = totalPrice.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
    });

    const numericValue = parseFloat(formattedTotalPrice.replace(/[^0-9.-]+/g, ""));
    console.log(numericValue);
    const productQuantities = products.map((product) => product.quantity);


    res.render('cart', { products, userSession, totalPrice: numericValue, productQuantities });
  } catch (err) {
    console.error(err);
    res.render('error');
  }
};

exports.createCart = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    const { productname, description, productprice, saleprice, stock, category, photo } = product;
    const userSession = res.locals.userSession;
    const existingCartItem = await Cart.findOne({ productid: productId, user: userSession });


    if (existingCartItem) {
      res.redirect('/cart');
    } else {
      const quantity = req.body.quantity; // Retrieve the quantity from the request body
      console.log('Quantity:', quantity); // Add this console.log statement
      if (isNaN(quantity)) {
        throw new Error('Invalid quantity value');
      }

      const totalPrice = parseFloat(saleprice) * quantity; // Calculate the total price
      const cartItem = new Cart({
        product: productId,
        user: userSession,
        productname,
        description,
        productprice: parseFloat(productprice),
        saleprice: parseFloat(saleprice),
        stock: parseInt(stock),
        category,
        quantity: quantity,
        image: photo.length > 0 ? { title: photo[0].title, filepath: photo[0].filepath } : null,
        totalPrice,
        lastprice: totalPrice,
        // Include any other relevant data for the cart item
      });

      await cartItem.save();
      res.redirect('/cart');
    }
  } catch (err) {
    console.error(err);
    res.render('error');
  }
};

exports.Cartpost = async (req, res) => {
  console.log(req.body.quantity);

  const { cartId, totalPrice, quantity } = req.body;
  console.log("hei", quantity);
  const quantityint = parseInt(quantity)
  console.log(quantityint);
  try {
    await Cart.updateMany({ _id: cartId }, { lastprice: totalPrice, totalPrice, quantity: quantity });
    res.send({ isOk: true, message: 'Cart has been successfully updated' });
  } catch (err) {
    console.log(err);
    res.send({ isOk: false, message: 'Failed to update cart' });
  }
};



exports.updateQuantity = async (req, res) => {
  try {
    const { id, quantity, increment, decrement } = req.body;

    let updatedQuantity = parseInt(quantity, 10);

    if (increment) {
      updatedQuantity += 1;
    } else if (decrement) {
      updatedQuantity -= 1;
    }

    // Update the quantity of the product in the cart
    await Cart.updateOne({ _id: productId }, { quantity: updatedQuantity });

    // Redirect back to the cart page
    res.redirect('/cart');
  } catch (err) {
    console.error(err);
    res.render('error');
  }
};


exports.getAddress = async (req, res) => {
  try {
    const userSession = res.locals.userSession;
    const id = req.params.id
    const address = await Address.find({ user: userSession });

    const products = await Cart.find({ user: userSession })
      .populate({ path: 'coupon', model: 'Coupon' })
    let totalPrice = 0;

    // Calculate the total price by summing up the saleprice of all products in the cart
    products.forEach((product) => {
      totalPrice += product.totalPrice;
    });

    const formattedTotalPrice = totalPrice.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
    });

    if (req.query.delete_id) {
      await Cart.findByIdAndUpdate(
        req.query.delete_id,
        {
          $set: { lastprice: totalPrice },
          $unset: { coupon: 1, couponprice: 1 }
        },
        { new: true }
      );
      return res.redirect('/shippinginfo');
    }


    let editdata = null;
    if (req.query.edit_id) {
      const edit_id = req.query.edit_id;
      const validIdRegex = /^[0-9a-fA-F]{24}$/;
      if (!validIdRegex.test(edit_id)) {
        // Handle the invalid ID here
      }
      editdata = await Address.findById(edit_id);
    }

    res.render('shippinginfo', {
      products,
      address,
      totalPrice: formattedTotalPrice,
      editdata: editdata || {},
      formData: address || {},
    });
  } catch (err) {
    console.error(err);
    res.render('error');
  }
};

exports.getproductShipping = async (req, res) => {
  try {
    const userSession = res.locals.userSession;
    const id = req.params.id;
    const address = await Address.find({ user: userSession });

    const product = await Cart.findById(id)
      .populate({ path: 'coupon', model: 'Coupon' });

    const formattedTotalPrice = product.totalPrice.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
    });

    if (req.query.delete_id) {
      await Cart.findByIdAndUpdate(
        req.query.delete_id,
        {
          $set: { lastprice: product.totalPrice },
          $unset: { coupon: 1, couponprice: 1 }
        },
        { new: true }
      );
      return res.redirect('/productshipping');
    }

    let editdata = null;
    if (req.query.edit_id) {
      const edit_id = req.query.edit_id;
      const validIdRegex = /^[0-9a-fA-F]{24}$/;
      if (!validIdRegex.test(edit_id)) {
        // Handle the invalid ID here
      }
      editdata = await Address.findById(edit_id);
    }

    res.render('productpageshipping', {
      product,
      address,
      totalPrice: formattedTotalPrice,
      editdata: editdata || {},
      formData: address || {},
    });
  } catch (err) {
    console.error(err);
    res.render('error');
  }
};




exports.postProductShipping = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) {
      throw new Error('Product not found');
    }

    const { productname, description, productprice, saleprice, stock, category, photo } = product;
    const userSession = res.locals.userSession;

    const cartItem = new Cart({
      product: productId,
      user: userSession,
      productname,
      description,
      productprice: parseFloat(productprice),
      saleprice: parseFloat(saleprice),
      stock: parseInt(stock),
      category,
      quantity: 1,
      image: photo.length > 0 ? { title: photo[0].title, filepath: photo[0].filepath } : null,
      totalPrice: parseFloat(saleprice),
      lastprice: parseFloat(saleprice),
      // Include any other relevant data for the cart item
    });

    await cartItem.save();
    res.redirect(`/productshipping/${cartItem._id}`);
  } catch (err) {
    console.error(err);
    res.render('error');
  }
};



exports.getAddressHome = async (req, res) => {
  try {
    const userSession = res.locals.userSession;
    const address = await Address.find({ user: userSession });
    const products = await Cart.find({ user: userSession });

    let totalPrice = 0;
    products.forEach((product) => {
      totalPrice += product.totalPrice;
    });

    const formattedTotalPrice = totalPrice.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
    });

    const numericValue = parseFloat(formattedTotalPrice.replace(/[^0-9.-]+/g, ""));
    console.log(numericValue);


    let editdata = null;
    if (req.query.edit_id) {
      const edit_id = req.query.edit_id;
      const validIdRegex = /^[0-9a-fA-F]{24}$/;
      if (!validIdRegex.test(edit_id)) {
        // Handle the invalid ID here
      }
      editdata = await Address.findById(edit_id);
    }

    res.render('address', {
      products,
      address,
      totalPrice: numericValue,
      editdata: editdata || {},
      formData: address || {},
    });
  } catch (err) {
    console.error(err);
    res.render('error');
  }
};



exports.createAddress = async (req, res) => {
  const { id, name, address, city, zip, country, state, district, houseno } = req.body;
  const usersession = req.params.usersession;
  const userSession = res.locals.userSession;
  const couponid = req.params
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
        houseno,
        user: userSession
      });

      await addressObj.save();
    }

    // Pass the updated or newly created address as part of the rendering context when rendering the shippinginfo page
    res.redirect("/shippinginfo");
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};



exports.getPayment = async (req, res) => {
  try {

    const userSession = res.locals.userSession;


    const id = req.params.id;

    const cards = await Card.find({ user: userSession })

    const address = await Address.findOne({ _id: id });

    const products = await Cart.find({ user: userSession });

    let totalPrice = 0;
    let lastprice = 0;

    // Calculate the total price by summing up the saleprice of all products in the cart
    products.forEach((product) => {
      totalPrice += product.totalPrice;
      lastprice += product.lastprice;
    });

    const formattedTotalPrice = totalPrice.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
    });


    const formattedLastPrice = lastprice.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
    });



    if (!products) {
      return res.status(404).render('error', { message: 'Product not found' });
    }

    if (!address) {
      return res.status(404).render('error', { message: 'Address not found' });
    }

    const productWithImages = products.map((product) => {
      const { _id, photo } = product;
      const image = photo && photo.length > 0 ? { title: photo[0].title, filepath: photo[0].filepath } : null;

      return { _id, image };
    });

    res.render('payment', { products, images: productWithImages, cards, address, lastprice: formattedLastPrice, totalPrice: formattedTotalPrice, formData: address || {} });
  } catch (err) {
    console.error(err);
    res.render('error');
  }
};

// exports.createOrder = async (req, res) => {
//   try {
//     const { paymentmode } = req.body;
//     const addressId = req.params.id;
//     const userSession = res.locals.userSession;
//     const address = await Address.findOne({ _id: addressId });
//     const products = await Cart.find({ user: userSession });

//     const productIds = products.map((product) => product.productid);

//     let totalPrice = 0;

//     // Calculate the total price by summing up the saleprice of all products in the cart
//     products.forEach((product) => {
//       totalPrice += product.totalPrice;
//     });

//     const formattedTotalPrice = totalPrice.toLocaleString('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//     });

//     const status = "Order Placed";

//     const order = new Order({
//       date: new Date(), // Add the date property with the current date and time
//       address: {
//         name: address.name,
//         address: address.address,
//         city: address.city,
//         zip: address.zip,
//         country: address.country,
//         state: address.state,
//         district: address.district,
//         houseno: address.houseno,
//       },
//       product: productIds,
//       paymentmode: paymentmode,
//       totalPrice: formattedTotalPrice,
//       status: status,
//       quantity: products.quantity,
//       user: userSession
//     });

//     await order.save();

//     res.redirect(`/order/${order._id}`);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Server error');
//   }
// };


// exports.getOrder = async (req, res) => {
//   try {
//     const id = req.params.id;
//     const order = await Order.findById(id)
//       .populate({ path: 'address', model: 'Address' })
//       .populate({ path: 'product', model: 'Product' });

//     if (!order) {
//       return res.status(404).render('error', { message: 'Order not found' });
//     }

//     const formattedTotalPrice = order.totalPrice;
//     const quantity = order.quantity;


//     const productWithImages = order.product.map((product) => {
//       const { _id, photo } = product;
//       const image = photo.length > 0 ? { title: photo[0].title, filepath: photo[0].filepath } : null;
//       return { _id, image };
//     });

//     res.render('order', { order, image: productWithImages, quantitynumber: quantity, totalPrice: formattedTotalPrice });
//   } catch (err) {
//     console.error(err);
//     res.render('error');
//   }
// };




exports.createOrder = async (req, res) => {
  try {
    const { paymentmode } = req.body;
    const addressId = req.params.id;
    const userSession = res.locals.userSession;
    const address = await Address.findOne({ _id: addressId });
    const products = await Cart.find({ user: userSession });

    const productIds = products.map((product) => product.product);

    console.log("id", productIds);
    const cartIds = products.map((product) => product._id);
    let totalPrice = 0;
    let lastprice = 0;
    // Calculate the total price by summing up the saleprice of all products in the cart
    products.forEach((product) => {
      totalPrice += product.totalPrice;
      lastprice += product.lastprice;

    });

    const formattedTotalPrice = totalPrice.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
    });


    const formattedLastPrice = lastprice.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
    });

    const status = "Order Placed";

    const order = new Order({
      date: new Date(),
      cart: cartIds,
      address: {
        name: address.name,
        address: address.address,
        city: address.city,
        zip: address.zip,
        country: address.country,
        state: address.state,
        district: address.district,
        houseno: address.houseno,
      },
      product: productIds,
      paymentmode: paymentmode,
      totalPrice: formattedTotalPrice,
      lastprice: formattedLastPrice,
      status: status,
      quantity: products.length, // Use products.length instead of products.quantity
      user: userSession,
    });

    await order.save();

    // Generate the order ID for Razorpay
    const orderId = `${order._id}`; // Implement your own function to generate a unique order ID

    // Update the order with the generated order ID
    order.orderId = orderId;
    await order.save();

    // Delete the cart items that have been ordered
    await Cart.deleteMany({ _id: { $in: cartIds } });

    if (paymentmode === "cod") {
      res.redirect(`/order/${order._id}`);
    } else {
      res.json({ orderId: order._id });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

///////////////////////////////////////////////////////////////////////////

exports.getProductPayment = async (req, res) => {
  try {
    const userSession = res.locals.userSession;
    const id1 = req.params.id1;
    const id2 = req.params.id2;

    const product = await Cart.findById(id2);
    const address = await Address.findOne({ _id: id1 });

    if (!product) {
      return res.status(404).render('error', { message: 'Product not found' });
    }

    if (!address) {
      return res.status(404).render('error', { message: 'Address not found' });
    }

    res.render('productpayment', { product, address, formData: address });
  } catch (err) {
    console.error(err);
    res.render('error');
  }
};

exports.createProductPayment = async (req, res) => {
  try {
    const { paymentmode } = req.body;
    const addressId = req.params.id1;
    const productId = req.params.id2;
    const userSession = res.locals.userSession;
    const address = await Address.findOne({ _id: addressId });
    const products = await Cart.find({ _id: productId });

    const productIds = products.map((product) => product.product);
    const cartIds = products.map((product) => product._id);

    const status = "Order Placed";

    let totalPrice = 0;
    let lastprice = 0;

    products.forEach((product) => {
      totalPrice += product.saleprice;
      lastprice += product.saleprice;
    });

    const order = new Order({
      date: new Date(),
      cart: cartIds,
      address: {
        name: address.name,
        address: address.address,
        city: address.city,
        zip: address.zip,
        country: address.country,
        state: address.state,
        district: address.district,
        houseno: address.houseno,
      },
      product: productIds,
      paymentmode: paymentmode,
      totalPrice: totalPrice,
      lastprice: lastprice,
      status: status,
      quantity: products.length,
      user: userSession,
    });

    await order.save();

    // Generate the order ID for Razorpay
    const orderId = `${order._id}`; // Implement your own function to generate a unique order ID

    // Update the order with the generated order ID
    order.orderId = orderId;
    await order.save();

    // Delete the cart items that have been ordered
    await Cart.deleteMany({ _id: { $in: cartIds } });

    if (paymentmode === "cod") {
      res.redirect(`/order/${order._id}`);
    } else {
      res.json({ orderId: order._id });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};



/////////////////////////////////////////////////////////////////////////////////

exports.getOrder = async (req, res) => {
  try {
    const id = req.params.id;
    const order = await Order.findById(id)
      .populate({ path: 'address', model: 'Address' })
      .populate({ path: 'product', model: 'Product' });

    if (!order) {
      return res.status(404).render('error', { message: 'Order not found' });
    }

    const formattedTotalPrice = order.totalPrice;
    const quantity = order.quantity;

    const productWithImages = order.product.map((product) => {
      const { _id, photo } = product;
      const image = photo.length > 0 ? { title: photo[0].title, filepath: photo[0].filepath } : null;
      return { _id, image };
    });

    res.render('order', { order, image: productWithImages, quantitynumber: quantity, totalPrice: formattedTotalPrice });
  } catch (err) {
    console.error(err);
    res.render('error');
  }
};


exports.getOrderSuccess = async (req, res) => {
  res.render("order-success")
}

// exports.getOrder = async (req, res) => {
//   try {
//     const userSession = res.locals.userSession;

//     const order = await Order.find({ user: userSession })
//       .populate({ path: 'address', model: 'Address' })
//       .populate({ path: 'product', model: 'Product' });

//     if (!order) {
//       return res.status(404).render('error', { message: 'Order not found' });
//     }

//     let totalPrice = 0;

//     order.product.forEach((product) => {
//       totalPrice += product.totalPrice;
//     });

//     const formattedTotalPrice = totalPrice.toLocaleString('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//     });

//     const productWithImages = order.product.map((product) => {
//       const { _id, photo } = product;
//       const image = photo.length > 0 ? { title: photo[0].title, filepath: photo[0].filepath } : null;
//       return { _id, image };
//     });

//     res.render('order', { order, image: productWithImages, totalPrice: formattedTotalPrice });
//   } catch (err) {
//     console.error(err);
//     res.render('error');
//   }
// };

exports.getOrderHistory = async (req, res) => {
  try {
    const userSession = res.locals.userSession;
    const orders = await Order.find({ user: userSession })
      .populate({ path: 'address', model: 'Address' })
      .populate({ path: 'product', model: 'Product' });

    if (!orders) {
      return res.status(404).render('error', { message: 'Orders not found' });
    }

    let totalPrice = 0;

    orders.forEach((order) => {
      order.product.forEach((product) => {
        totalPrice += product.totalPrice;
      });
    });

    // Format the total price as currency
    const formattedTotalPrice = totalPrice.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
    });

    const productWithImages = orders.map((order) => {
      const products = order.product.map((product) => {
        const image = product.photo.length > 0 ? { title: product.photo[0].title, filepath: product.photo[0].filepath } : null;
        const { productname, saleprice } = product;
        return { _id: product._id, image, productname, saleprice };
      });

      const { status, totalPrice, quantity } = order;
      return { _id: order._id, status, totalPrice, quantity, products };
    });

    const reversedOrders = orders.slice().reverse();

    res.render('orderhistory', {
      orders: productWithImages,
      totalPrice: formattedTotalPrice,
      reversedOrders: reversedOrders
    });
  } catch (err) {
    console.error(err);
    res.render('error');
  }
};


exports.getOrderInfo = async (req, res) => {
  try {
    const id = req.params.id;

    const order = await Order.findById(id).populate({ path: 'product', model: 'Product' });

    if (!order) {
      return res.status(404).render('error', { message: 'Order not found' });
    }

    if (req.query.edit_id && req.query.status) {
      await Order.findByIdAndUpdate(req.query.edit_id, { status: req.query.status });
      return res.redirect(`/orderinfo/${order._id}`);
    }

    let totalPrice = "";

    // Calculate the total price by summing up the sale price of all products in the order
    order.product.forEach((product) => {
      totalPrice += order.totalPrice;
    });

    let productid = "";

    // Get the IDs of all products in the order
    order.product.forEach((product) => {
      productid += product._id;
    });

    const orderDate = order.date;
    const orderShippedDate = order.orderShipped;
    const orderOnrouteDate = order.orderOnRoute;
    const orderDeliveredDate = order.orderDelivered;

    // Format the total price as currency
    const formattedTotalPrice = totalPrice.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
    });

    const productWithImages = order.product.map((product) => {
      const { _id, photo } = product;
      const image = photo.length > 0 ? { title: photo[0].title, filepath: photo[0].filepath } : null;
      return { _id, image };
    });

    let formattedDate = null;
    let formatteShippedDate = null;
    let formatteOnRouteDate = null;
    let formattedDeliveredDate = null;
    if (order.status === "Order Placed") {
      formattedDate = orderDate.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      });
    } else if (order.status === "Order Shipped") {
      formattedDate = orderDate.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      });
      formatteShippedDate = orderShippedDate.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      });
    } else if (order.status === "Order On-Route") {
      formattedDate = orderDate.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      });
      formatteShippedDate = orderShippedDate.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      });
      formatteOnRouteDate = orderOnrouteDate.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      });
    } else if (order.status === "Order Delivered") {
      formattedDate = orderDate.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      });
      formatteShippedDate = orderShippedDate.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      });
      formatteOnRouteDate = orderOnrouteDate.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      });
      formattedDeliveredDate = orderDeliveredDate.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      });
    }


    res.render('orderinfo', {
      order,
      productid,
      formattedDate,
      formatteShippedDate,
      formatteOnRouteDate,
      formattedDeliveredDate,
      image: productWithImages,
      totalPrice: formattedTotalPrice,
    });
  } catch (err) {
    console.error(err);
    res.render('error');
  }
};


exports.postreviews = async (req, res) => {
  try {
    const id = req.params.id;
    const order = await Order.findOne({ product: id });

    const { name, review, rating } = req.body;

    const newReview = new Review({
      product: id,
      name,
      review,
      rating: parseInt(rating), // Use the rating value from the request body
    });

    await newReview.save();

    res.redirect(`/orderinfo/${order._id}`); // Redirect to the orderinfo page with the correct order ID
  } catch (error) {
    console.log(error);
  }
};




exports.getAdminOrder = async (req, res) => {
  try {


    const { category } = req.query; // Retrieve the category from the query parameters

    let ordersQuery = Order.find({});
    if (category) {
      ordersQuery = ordersQuery.populate({
        path: 'product',
        model: 'Product',
        match: { category: category }, // Filter products by category
      });
    } else {
      ordersQuery = ordersQuery.populate({ path: 'product', model: 'Product' });
    }

    const orders = await ordersQuery
      .populate({ path: 'address', model: 'Address' })
      .exec();

    const order12 = await Order.find({})
      .populate({ path: 'address', model: 'Address' })
      .populate({ path: 'product', model: 'Product' });

    if (!orders) {
      return res.status(404).render('error', { message: 'Orders not found' });
    }

    if (req.query.delete_id) {
      await Order.findByIdAndDelete(req.query.delete_id);
      return res.redirect('/adminorder');
    }


    if (req.query.edit_id && req.query.status) {
      const order = await Order.findById(req.query.edit_id);
      const { status } = req.query;

      if (order.status === 'Order Placed' && status === 'Order Shipped') {
        order.orderShipped = new Date();
      } else if (order.status === 'Order Shipped' && status === 'Order On-Route') {
        order.orderOnRoute = new Date();
      } else if (order.status === 'Order On-Route' && status === 'Order Delivered') {
        order.orderDelivered = new Date();
      }

      order.status = status;
      await order.save();
      return res.redirect('/adminorder');
    }

    const productWithImages = orders.map((order) => {
      let totalPrice = 0;

      const products = order.product.map((product) => {
        totalPrice += product.saleprice;

        const image =
          product.photo.length > 0
            ? { title: product.photo[0].title, filepath: product.photo[0].filepath }
            : null;
        const { productname, category } = product;
        const { paymentmode } = order;
        return { _id: product._id, image, paymentmode, category, productname };
      });

      // Format the total price as currency for the current order
      const formattedTotalPrice = totalPrice.toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR',
      });

      return { _id: order._id, products, status: order.status, totalPrice: formattedTotalPrice };
    });

    const statuses = order12.map((order) => order.status);

    res.render('adminorder', {
      orders: productWithImages,
      statuss: statuses,
    });
  } catch (err) {
    console.error(err);
    res.render('error');
  }
};


exports.getCards = async (req, res) => {
  try {
    const cards = await Card.find({});

    if (req.query.delete_id) {
      await Card.findByIdAndDelete(req.query.delete_id);
      return res.redirect('/paymentcard');
    }

    const cardnumber = cards.map((card) => card.cardnumber);

    res.render("cards", { cards, cardnumber })
  } catch (error) {
    console.log(error);
    res.render("error")
  }
}



exports.postCards = async (req, res) => {
  try {
    const userSession = res.locals.userSession;
    const { cardname, cardnumber, expirymonth, expiryyear } = req.body;

    const cards = await Card.find({});



    const payment = new Card({
      user: userSession,
      cardname,
      cardnumber,
      expirymonth,
      expiryyear,

    });

    await payment.save();
    res.redirect('/paymentcard');
  } catch (error) {
    console.log(error);
    res.render("error");
  }
};

// exports.createOrder = async (req, res) => {
//   try {
//     const { amount, currency } = req.body;

//     const razorpayOrder = await razorpay.orders.create({
//       amount: amount * 100,
//       currency: currency,
//       receipt: 'order_receipt',
//     });

//     const order = new Payment({
//       orderId: razorpayOrder.id,
//       amount: amount,
//       currency: currency,
//       status: 'created',
//     });

//     await order.save();

//     res.json({
//       orderId: razorpayOrder.id,
//       amount: razorpayOrder.amount,
//       currency: razorpayOrder.currency,
//       receipt: razorpayOrder.receipt,
//     });
//   } catch (err) {
//     console.error('Error creating order:', err);
//     res.status(500).json({ error: 'Error creating order' });
//   }
// };


exports.createPayment = async (req, res) => {
  try {
    const amount = req.body.amount * 100; // Multiply by 100 to convert from rupees to paise
    const options = {
      amount: amount,
      currency: 'INR',
      receipt: 'razorUser@gmail.com'
    };


    razorpayInstance.orders.create(options,
      (err, order) => {
        if (!err) {
          res.status(200).send({
            success: true,
            msg: 'Order Created',
            order_id: order.id,
            amount: amount,
            key_id: "rzp_test_c6JWs9bblKyxcL",
            product_name: req.body.name,
            description: req.body.description,
            contact: "7561849356",
            name: "Nikhil Scaria",
            email: "nikhilscaria3@gmail.com"
          });
        }
        else {
          res.status(400).send({ success: false, msg: 'Something went wrong!' });
        }
      }
    );

  } catch (error) {
    console.log(error.message);
  }
}




exports.getOrderInfoAdmin = async (req, res) => {
  try {
    const id = req.params.id;

    const order = await Order.findById(id).populate({ path: 'product', model: 'Product' });

    if (!order) {
      return res.status(404).render('error', { message: 'Order not found' });
    }

    if (req.query.edit_id && req.query.status) {
      await Order.findByIdAndUpdate(req.query.edit_id, { status: req.query.status });
      return res.redirect(`/orderinfo/${order._id}`);
    }

    let totalPrice = 0;

    // Calculate the total price by summing up the sale price of all products in the order
    order.product.forEach((product) => {
      totalPrice += product.saleprice;
    });

    let productid = "";

    // Get the IDs of all products in the order
    order.product.forEach((product) => {
      productid += product._id;
    });

    const orderDate = order.date;
    const orderShippedDate = order.orderShipped;
    const orderOnrouteDate = order.orderOnRoute;
    const orderDeliveredDate = order.orderDelivered;

    // Format the total price as currency
    const formattedTotalPrice = totalPrice.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
    });

    const productWithImages = order.product.map((product) => {
      const { _id, photo } = product;
      const image = photo.length > 0 ? { title: photo[0].title, filepath: photo[0].filepath } : null;
      return { _id, image };
    });

    let formattedDate = null;
    let formatteShippedDate = null;
    let formatteOnRouteDate = null;
    let formattedDeliveredDate = null;
    if (order.status === "Order Placed") {
      formattedDate = orderDate.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      });
    } else if (order.status === "Order Shipped") {
      formattedDate = orderDate.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      });
      formatteShippedDate = orderShippedDate.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      });
    } else if (order.status === "Order On-Route") {
      formattedDate = orderDate.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      });
      formatteShippedDate = orderShippedDate.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      });
      formatteOnRouteDate = orderOnrouteDate.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      });
    } else if (order.status === "Order Delivered") {
      formattedDate = orderDate.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      });
      formatteShippedDate = orderShippedDate.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      });
      formatteOnRouteDate = orderOnrouteDate.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      });
      formattedDeliveredDate = orderDeliveredDate.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      });
    }


    res.render('orderinfoadmin', {
      order,
      productid,
      formattedDate,
      formatteShippedDate,
      formatteOnRouteDate,
      formattedDeliveredDate,
      image: productWithImages,
      totalPrice: formattedTotalPrice,
    });
  } catch (err) {
    console.error(err);
    res.render('error');
  }
};
