const { Product, Cart, Order, Address, Wishlist } = require('../models/productmodel');
const { User } = require('../models/usermodel');

const bcrypt = require('bcrypt');
// //
// exports.getProfile = async (req, res) => {
//   try {
//     const userSession = res.locals.userSession;
//     const address = await Address.find({ user: userSession });
//     const order = await Order.find({ user: userSession }).populate({ path: 'product', model: 'Product' });
//     const users = await User.find({ _id: userSession });

//     // if (!order || order.length === 0) {
//     //   return res.status(404).render('error', { message: 'Orders not found' });
//     // }

//     let totalPrice = 0;

//     order.forEach((order) => {
//       order.product.forEach((product) => {
//         totalPrice += product.saleprice;
//       });
//     });

//     // Format the total price as currency
//     const formattedTotalPrice = totalPrice.toLocaleString('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//     });

//     const productWithImages1 = order.map((order) => {
//       const products = order.product.map((product) => {
//         const image =
//           product.photo.length > 0 ? { title: product.photo[0].title, filepath: product.photo[0].filepath } : null;
//         const { productname } = product;
//         return { _id: product._id, image, productname };
//       });
//       return { _id: order._id, products };
//     });
//     let editdata = null;

//     if (req.query.edit_id) {
//       const edit_id = req.query.edit_id;
//       const validIdRegex = /^[0-9a-fA-F]{24}$/;
//       if (!validIdRegex.test(edit_id)) {
//         // Handle the invalid ID here
//       }
//       editdata = await User.findById(edit_id);
//     }




//     let message = req.session.message || null;
//     req.session.message = null;



//     res.render('profile', { users, address, orders: productWithImages1, message: null, editdata: editdata || {} });
//   } catch (err) {
//     console.log(err);
//     res.render('error');
//   }
// };

exports.getProfile = async (req, res) => {
  try {
    const userSession = res.locals.userSession;
    const address = await Address.find({ user: userSession });
    const order = await Order.find({ user: userSession }).populate({ path: 'product', model: 'Product' });
    const usersnoloop = await User.find({ _id: userSession }).limit(1);
    const users = await User.find({ _id: userSession })

    let totalPrice = 0;

    order.forEach((order) => {
      order.product.forEach((product) => {
        totalPrice += product.saleprice;
      });
    });

    const formattedTotalPrice = totalPrice.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
    });

    const productWithImages1 = order.map((order) => {
      const products = order.product.map((product) => {
        const image =
          product.photo.length > 0 ? { title: product.photo[0].title, filepath: product.photo[0].filepath } : null;
        const { productname } = product;
        return { _id: product._id, image, productname };
      });
      return { _id: order._id, products };
    });

    let editdata = null;

    if (req.query.edit_id) {
      const edit_id = req.query.edit_id;
      const validIdRegex = /^[0-9a-fA-F]{24}$/;
      if (!validIdRegex.test(edit_id)) {
        // Handle the invalid ID here
      }
      editdata = await User.findById(edit_id);
    }

    let message = req.session.message || null;
    req.session.message = null;

    res.render('profile', {
      user: usersnoloop[0],
      users,
      address,
      orders: productWithImages1,
      message: null,
      editdata: editdata || {},
    });
  } catch (err) {
    console.log(err);
    res.render('error');
  }
};


exports.postProfile = async (req, res) => {
  try {
    const { id, email, username, gender, mobilenumber } = req.body;

    const update = await User.findByIdAndUpdate(id, {
      email,
      username,
      gender: gender,
      mobilenumber: mobilenumber
    });

    console.log(req.body.id);
    console.log(req.body.email)
    console.log(update);

    const user = await User.find({});
    if (user) {
      req.session.loggedIn = true;
      req.session.user = user;
      req.session.user = user.email;
      req.session.message = 'Successfully Registered';
      res.redirect('/profile');
    } else {
      req.session.message = 'Invalid Password or Username';
      res.render('profile', { message: req.session.message });
    }
  } catch (err) {
    console.log(err);
    res.render('error');
  }
};
