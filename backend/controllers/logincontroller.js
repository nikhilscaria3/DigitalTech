
const { User } = require('../models/usermodel');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const fs = require('fs');
const path = require('path')
// Function to generate a random OTP
const generateOTP = () => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < 6; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

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

      const otp = generateOTP();
      const filePath = path.join(__dirname, '../../frontend/views/otpmessage.hbs');

      console.log(filePath);

      const htmlContent = fs.readFileSync(filePath, 'utf-8');
      const htmlEmail = htmlContent.replace('{{otp}}', otp);



      console.log("host", process.env.HOST);
      console.log("email", req.body.email);

      // Send an email to the user with the OTP
      const transporter = nodemailer.createTransport({
        host: process.env.HOST,
        service: process.env.SERVICE,
        port: Number(process.env.EMAIL_PORT),
        secure: Boolean(process.env.SECURE),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      });

      const options = {
        from: process.env.SMTP_USER,
        to: user.email, // Use the email associated with the user session
        subject: "DigitalTech Ecommerce - Email Verification OTP",
        html: htmlEmail
      };

      transporter.sendMail(options, (err, info) => {
        if (err) {
          console.log("Email not sent");
          console.error(err);
          return res.status(500).json({ message: "Error sending email" });
        } else {
          console.log("Email sent successfully");
          return res.status(200).json({ message: "Email sent" });
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

    const otp = generateOTP();
    const filePath = path.join(__dirname, '../../frontend/views/otpmessage.hbs');

    console.log(filePath);

    const htmlContent = fs.readFileSync(filePath, 'utf-8');
    const htmlEmail = htmlContent.replace('{{otp}}', otp);


    const transporter = nodemailer.createTransport({
      host: process.env.HOST,
      service: process.env.SERVICE,
      port: Number(process.env.EMAIL_PORT),
      secure: Boolean(process.env.SECURE),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    });

    const options = {
      from: process.env.SMTP_USER,
      to: user.email, // Use the email associated with the user session
      subject: "DigitalTech Ecommerce - Email Verification OTP",
      html: htmlEmail
    };


    transporter.sendMail(options, (err, info) => {
      if (err) {
        console.log("Email not sent");
        console.error(err);
        return res.status(500).json({ message: "Error sending email" });
      } else {
        console.log("Email sent successfully");
        return res.status(200).json({ message: "Email sent" });
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



exports.getEmail = async (req, res) => {
  try {
    return res.render('emailmessage');
  } catch (err) {
    console.error(err);
    return res.render('error');
  }
};

exports.postEmail = async (req, res) => {
  try {
    const { senderEmail, emailSubject, emailMessage } = req.body;

    // Create a transporter for sending emails

    console.log(process.env.HOST);
    const transporter = nodemailer.createTransport({
      host: process.env.HOST,
      service: process.env.SERVICE,
      port: Number(process.env.EMAIL_PORT),
      secure: Boolean(process.env.SECURE),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    });

    // Compose the email options
    const options = {
      from: process.env.SMTP_USER,
      to: senderEmail,
      subject: emailSubject,
      text: emailMessage,
    };

    // Send the email
    transporter.sendMail(options, (err, info) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Error sending email" });
      } else {
        console.log("Email sent successfully");
        return res.redirect('/send-email');
      }
    });
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
