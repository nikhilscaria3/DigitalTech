const express = require('express');
const router = express.Router();
// const loginController = require('../controllers/logincontroller');
const adminController = require('../controllers/adminlogincontroller');


// // Route for getting all birds
// router.get('/login', loginController.getUser);

// // Route for creating a new bird
// router.post('/login', loginController.postUser);

const{ getUser, postUser, resendOTP} = require('../controllers/logincontroller');


const setUserId = (req, res, next) => {
    if (!req.session.loggedIn && req.session.usersession) {
        res.locals.userSession = req.session.usersession; // Corrected property name
    } else {
        res.locals.userSession = null;
    }
    console.log("req.session.loggedIn:", req.session.loggedIn);
    console.log("req.session.usersession:", req.session.usersession);
    console.log("res.locals.userSession:", res.locals.userSession);
    next();
};


// GET route for rendering the login page
router.get('/login', getUser);

// POST route for handling user login and registration
router.post('/login', postUser);
router.post('/resend-otp', setUserId, resendOTP);

router.get('/adminlogin', adminController.getAdmin)
router.post('/adminlogin', adminController.PostAdmin)



module.exports = router;


