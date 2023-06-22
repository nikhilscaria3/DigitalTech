const { Coupon, Cart, User } = require("../models/productmodel")

exports.getCoupon = async (req, res) => {
    const id = req.params
    const userSession = res.locals.userSession;
    try {

        const coupons = await Coupon.find({});

        console.log(coupons);
        res.render('coupon', { coupon: coupons, userSession });
    } catch (err) {
        console.log(err);
        res.render('error');
    }
};



exports.postCoupon = async (req, res) => {
    try {
      const userId = req.params.id; // Extract the userId value
      const userSession = res.locals.userSession;
      const cart = await Cart.findOne({ user: userSession });
  
  
      const { offerPercentage } = req.body;
  
      // Calculate the coupon discount and round the value
      const discount = Math.round((offerPercentage / 100) * cart.totalPrice);
  
      // Reduce the total price by the discount
      cart.lastprice -= discount;
      cart.couponprice -= discount;
      cart.coupon = userId; // Assign userId to cart.coupon
  
      // Save the updated cart
      await cart.save();
  
      res.redirect('/shippinginfo');
    } catch (err) {
      console.log(err);
      res.render('error');
    }
  };
  





exports.getCouponAdmin = async (req, res) => {
    try {
        const coupons = await Coupon.find({});

        let editdata = null;
        if (req.query.edit_id) {
            const edit_id = req.query.edit_id;
            const validIdRegex = /^[0-9a-fA-F]{24}$/;
            if (!validIdRegex.test(edit_id)) {
                // Handle the invalid ID here
            }
            editdata = await Coupon.findById(edit_id);
        }
        console.log(req.query.edit_id);
        console.log("data", editdata);

        if (req.query.delete_id) {
            await Coupon.findByIdAndDelete(req.query.delete_id);
            return res.redirect('/couponadmin');
        }

        res.render('couponadd', { coupon: coupons, editdata: editdata || {} });
    } catch (err) {
        console.log(err);
        res.render('error', { message: 'Server error' });
    }
};



exports.saveCoupon = async (req, res) => {
    const { id, description, details, expires, terms, percentage } = req.body;
    let updateData = {
        description,
        details,
        expires,
        terms,
        percentage
    };

    if (req.file) {
        const { title, path } = req.file;
        updateData.image = {
            title: title,
            filepath: path
        };
    }

    try {
        if (id) {
            // Update the existing coupon document
            await Coupon.findByIdAndUpdate(
                id,
                updateData,
                { new: true } // Set the `new` option to true to return the updated document
            );
        } else {
            // Create a new coupon document
            const coupon = new Coupon(updateData);
            await coupon.save();
        }

        res.redirect('/couponadmin');
    } catch (error) {
        console.log(error);
        res.render('error');
    }
};
