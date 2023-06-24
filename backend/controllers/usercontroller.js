const { query } = require('express');
const { User } = require('../models/usermodel');
const nodemailer = require('nodemailer');

const fs = require('fs');
const path = require('path')
// Function to generate a random OTP


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
    const { edit_id, status, email } = req.query;
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
    const id = req.params.id
    const status = req.params.status
    if (!id) {
      return res.status(400).json({ message: "Missing edit_id parameter" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { senderEmail, emailSubject, emailMessage } = req.body;

    let filePath;

    if (status === "blocked") {
      filePath = path.join(__dirname, '../../frontend/views/blockedMessage.hbs');
    } else {
      filePath = path.join(__dirname, '../../frontend/views/unblockedMessage.hbs');
    }

    const username = user.username;

    const htmlContent = fs.readFileSync(filePath, 'utf-8');
    const htmlEmail = htmlContent.replace('{{username}}', username);

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
      to: senderEmail,
      subject: emailSubject,
      html: htmlEmail,
    };

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
