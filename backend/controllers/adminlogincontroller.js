const { Admin } = require('../models/usermodel');
// assuming the collection name is "users"
const bcrypt = require('bcrypt');

exports.getAdmin = async (req, res) => {
    if (req.session.adminloggedIn) {
        res.redirect('/admin')
    }
    try {
        const user = await Admin.find({});
        let message = req.session.message || null;
        req.session.message = null;
        res.render('adminlogin', { user, message: null });
    } catch (err) {
        console.log(err);
        res.render('error');
    }
};

exports.PostAdmin = async (req, res) => {
    const { password, email } = req.body;
    const user = new Admin({
      
        password,
        email
    });

    try {
        const existingEmail = await Admin.findOne({ email });
        if (existingEmail  && (await bcrypt.compare(password, existingEmail.password))) {
            req.session.adminloggedIn = true;
            await user.save();
            res.redirect('/admin');
        } else {
            req.session.message = 'Invalid Password or Username';
            res.redirect('/adminlogin');
        }
    } catch (err) {
        console.log(err);
        res.status(500).send('Server Error');
    }
};


exports.getUpdate = (req, res) => {
    const message = req.session.message || null;
    req.session.message = null;
  
    res.render('updatepassword2', { message });
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
  
    // if (newpassword.length() < 6) {
    //   errors.push({ msg: 'Password should be at least 6 characters long' });
    // }
  
    if (errors.length > 0) {
      return res.render('updatepassword2', {
        errors,
        email,
        newpassword,
        confirmpassword
      });
    }
  
    try {
      const user = await Admin.findOne({ email });
  
      if (!user) {
        errors.push({ msg: 'User not found' });
        return res.render('updatepassword2', {
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
      res.redirect('/adminlogin');
    } catch (err) {
      console.error(err);
      res.redirect('/forgot_admin');
    }
  };
  