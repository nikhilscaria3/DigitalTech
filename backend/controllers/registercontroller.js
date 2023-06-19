const { User } = require('../models/usermodel');
const bcrypt = require('bcrypt');
const svgCaptcha = require('svg-captcha');


exports.getRegisterPage = async (req, res) => {
  try {
    const userList = await User.find({});
    const message = req.session.message;
    req.session.message = null;
    res.render('register', { userList, message });
  } catch (error) {
    console.log(error);
    res.render('error');
  }
};


exports.getCaptcha = (req, res) => {
  const captcha = svgCaptcha.create();
  req.session.captcha = captcha.text;
  res.type('svg');
  res.status(200).send(captcha.data);
 };
 
 
exports.postRegister = async (req, res) => {
  console.log('captcha:', req.body.captcha);
  console.log('session captcha:', req.session.captcha);

  const { captcha } = req.body;
  if (captcha === req.session.captcha) {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const user = new User({
        username: req.body.username,
        password: hashedPassword,
        email: req.body.email
      });

      await user.save();

      req.session.message = 'Successfully Registered';
      return res.render('register', { message: req.session.message });
    } catch (error) {
      console.log(error);
      return res.status(500).send('Server Error');
    }
  } else {
    req.session.message = 'Incorrect captcha';
    return res.render('register', { message: req.session.message });
  }
};


// const { User } = require('../models/usermodel');
// const bcrypt = require('bcrypt');
// const svgCaptcha = require('svg-captcha');
// const nodemailer = require('nodemailer');


// exports.getRegisterPage = async (req, res) => {
//   try {
//     const userList = await User.find({});
//     const message = req.session.message;
//     req.session.message = null;
//     res.render('register', { userList, message });
//   } catch (error) {
//     console.log(error);
//     res.render('error');
//   }
// };


// exports.getCaptcha = (req, res) => {
//   const captcha = svgCaptcha.create();
//   req.session.captcha = captcha.text;
//   res.type('svg');
//   res.status(200).send(captcha.data);

// };

// exports.postRegister = async (req, res) => {
//   console.log('captcha:', req.body.captcha);
//   console.log('session captcha:', req.session.captcha);

//   const { captcha } = req.body;
//   if (captcha === req.session.captcha) {
//     try {
//       const existingUser = await User.findOne({
//         $or: [{ username: req.body.username }, { email: req.body.email }],
//       });

//       if (existingUser) {
//         req.session.message = 'Username or email already registered';
//         return res.redirect('/register'); // Redirect back to the registration page with the message
//       }

//       // Generate a random OTP
  
//         const hashedPassword = await bcrypt.hash(req.body.password, 10);
//         const user = new User({
//           username: req.body.username,
//           password: hashedPassword,
//           email: req.body.email,
//         });

//         await user.save();

//         req.session.message =
//           'Successfully Registered. Please check your email for the verification OTP.';
//           req.session.loggedIn = true;
//         req.session.userId = user._id; // Store the user ID in the session for later use
//        // Store the OTP in the session for later verification
//         return res.redirect('/verify-otp');
//       });

//     } catch (error) {
//       console.log(error);
//       return res.status(500).send('Server Error');
//     }
//   } else {
//     req.session.message = 'Incorrect captcha';
//     return res.redirect('/register'); // Redirect back to the registration page with the message
//   }
// };
