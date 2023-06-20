// const { User } = require('../models/usermodel');
// // assuming the collection name is "users"
// const bcrypt = require('bcrypt');

// exports.getUser = async (req, res) => {
//     if (req.session.loggedIn) {
//         res.redirect('/homepage')
//     }
//     try {
//         const user = await User.find({});
//         let message = req.session.message || null;
//         req.session.message = null;
//         res.render('login', { user, message: null });
//     } catch (err) {
//         console.log(err);
//         res.render('error');
//     }
// };


// exports.postUser = async (req, res) => {
//     const { username, password, email } = req.body;
//     const user = new User({
//         username,
//         password,
//         email
//     });

//     try {
//         const existingEmail = await User.findOne({ email });
//         const existingUser = await User.findOne({ username });

//         const otp = Math.floor(Math.random() * 1000000);

//         // Send an email to the user with the OTP
//         const mailOptions = {
//           from: 'rosalyn.stehr@ethereal.email',
//           to: req.body.email,
//           subject: 'Email verification OTP',
//           text: `Your OTP is ${otp}`,
//         };

//         const transporter = nodemailer.createTransport({
//           host: 'smtp.ethereal.email',
//           port: 587,
//           auth: {
//               user: 'rosalyn.stehr@ethereal.email',
//               pass: 'm8Sq31SRTQ1TmBYCxn'
//           }
//       });
//         transporter.sendMail(mailOptions, async (err, info) => {
//           if (err) {
//             console.log(err);
//             return res.status(500).send('Error sending email');
//           }
//         })

//         if (existingEmail && existingUser && (await bcrypt.compare(password, existingUser.password))) {
//             req.session.regularUser = true;
//             req.session.user = { name: username };
//             await user.save();
//             res.redirect('/homepage');
//         } else {
//             req.session.message = 'Invalid Password or Username';
//             res.redirect('/login');
//         }
//     } catch (err) {
//         console.log(err);
//         res.status(500).send('Server Error');
//     }
// };


const { User } = require('../models/usermodel');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');



// const destroyOTPAfterTwoMinutes = (req) => {
//   setTimeout(() => {
//     delete req.session.otp;
//     console.log('OTP destroyed after 2 minutes');
//     // You can customize the message or render a different view if needed
//   }, 2 * 60 * 1000);
// };


// Rest of the code in the login controller file


exports.getUser = async (req, res) => {
  if (req.session.loggedIn) {
    return res.redirect('/homepage');
  }

  try {
    const users = await User.find({});
    const message = req.session.message || null;
    req.session.message = null;
    return res.render('login', { users, message });
  } catch (err) {
    console.error(err);
    return res.render('error');
  }
};

exports.postUser = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user) {
      if (user.status === 'blocked') {
        req.session.message = 'Your account is blocked. Please contact the administrator.';
        return res.redirect('/login');
      }

      const otp = Math.floor(Math.random() * 1000000);

      // Send an email to the user with the OTP
      const mailOptions = {
        from: 'nikhilscaria3@gmail.com',
        to: req.body.email,
        subject: 'Email verification OTP',
        text: `Your OTP is ${otp}`,
      };

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Error sending email');
        }
      });

      req.session.loggedIn = false; // Set loggedIn to false initially
      req.session.otp = otp;
      req.session.username = user.username;
      req.session.email = user.email;
      req.session.usersession = user._id; // Store the email from the User model in the session
      const userID = user._id; // Store the id of the User in the session
      console.log(userID);
      console.log(otp);
      return res.redirect(`/verify-otp`);
    } else {
      req.session.message = 'Invalid Password or Username';
      return res.redirect('/login');
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send('Server Error');
  }
};


exports.resendOTP = async (req, res) => {
  try {
    const userSession = res.locals.userSession;
    console.log(userSession);
    const user = await User.findById(userSession); // Use User.findById() instead of User.find()

    if (!user) {
      return res.status(404).send('User not found');
    }

    // Generate a new OTP
    const otp = Math.floor(Math.random() * 1000000);

    // Update the user's OTP in the database


    // Send an email to the user with the new OTP
    const mailOptions = {
      from: 'nikhilscaria3@gmail.com',
      // to: user.email,
      to: req.body.email,
      subject: 'Email verification OTP',
      text: `Your new OTP is ${otp}`,
    };

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error sending email');
      }
    });

    req.session.otp = otp;
    console.log(otp);
    return res.render('verifyotp', { otp }); // Render the verify-otp page with the new OTP
  } catch (err) {
    console.error(err);
    return res.status(500).send('Server Error');
  }
};


exports.getUpdate = (req, res) => {
  const message = req.session.message || null;
  req.session.message = null;

  res.render('updatepassword', { message });
};

exports.postUpdate = async (req, res) => {
  const { email, newpassword, confirmpassword } = req.body;
  let errors = [];

  // Perform input validation
  if (!email || !newpassword || !confirmpassword) {
    errors.push({ msg: 'Please fill in all fields' });
  }

  if (newpassword !== confirmpassword) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (newpassword.length() < 6) {
    errors.push({ msg: 'Password should be at least 6 characters long' });
  }

  if (errors.length > 0) {
    return res.render('updatepassword', {
      errors,
      email,
      newpassword,
      confirmpassword
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      errors.push({ msg: 'User not found' });
      return res.render('updatepassword', {
        errors,
        email,
        newpassword,
        confirmpassword
      });
    }

    const hashedPassword = await bcrypt.hash(newpassword, 10);
    user.password = hashedPassword;
    await user.save();

    req.session.message = 'Password updated successfully';
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.redirect('/forgot');
  }
};
