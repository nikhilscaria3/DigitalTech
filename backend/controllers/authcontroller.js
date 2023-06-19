const { User } = require('../models/usermodel');
// assuming the collection name is "users"
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

exports.getVerifyOtp = async (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/')
  }
  try {
    const user = await User.find({});
    let message = req.session.message || null;
    req.session.message = null;
    res.render('verifyotp', { user, message: null });
  } catch (err) {
    console.log(err);
    res.render('error');
  }
};

exports.postVerifyOtp = async (req, res) => {
  const otp = req.body.otp;

  try {
    if (otp === req.session.otp.toString()) {
      // if(otp===otp){
      console.log('OTP:', req.session.otp);

      req.session.loggedIn = true;
      const userID = req.session.usersession; // Access the usersession from the session
      console.log("verify", userID);
      res.redirect(`/`);
    } else {
      req.session.message = 'Invalid';
      res.redirect('/login');
    }
  } catch (err) {
    console.log(err);
    res.status(500).send('Server Error');
  }
};

