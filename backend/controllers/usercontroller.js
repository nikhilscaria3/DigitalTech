const { query } = require('express');
const { User } = require('../models/usermodel');


exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();


    const usersWithStatus = users.map(user => ({
      status: user.status
    }));

    console.log(usersWithStatus);

    res.render('user', { users, status: usersWithStatus[0].status });



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
      return res.redirect('/adminorder');

    }
  } catch (error) {
    console.error(error);
    res.render('error')
  }
};

