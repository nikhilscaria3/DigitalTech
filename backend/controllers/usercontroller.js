const { query } = require('express');
const { User } = require('../models/usermodel');
const nodemailer = require('nodemailer');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();


    const usersWithStatus = users.map(user => ({
      status: user.status
    }));

    console.log(usersWithStatus);

    res.render('user', { users, status: usersWithStatus[0].status });
  } catch (error) {
    console.error(error);
    res.render('error')
  }
};


exports.GetstatusMail = async (req, res) => {
  try {
    const { edit_id, status ,email} = req.query;
    console.log(edit_id);
    console.log(status);

    const user = await User.findOne({ "email": email });
    console.log(user);

    if (req.query.edit_id && req.query.status) {
      const user = await User.findById(req.query.edit_id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const { status } = req.query;

      if (user.status === 'blocked' && status === 'blocked') {

      } else if (user.status === 'unblocked' && status === 'unblocked') {

      }

      user.status = status;
      await user.save();

    }
    return res.render('blockandunblock', { user, status });
  } catch (err) {
    console.error(err);
    return res.render('error');
  }
};


exports.PoststatusMail = async (req, res) => {
  try {
    const { senderEmail, emailSubject, emailMessage, } = req.body;

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
        return res.redirect('/users');
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send('Server Error');
  }
};