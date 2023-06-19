const express = require('express');
const router = express.Router();
const registerController = require('../controllers/registercontroller');
const multer = require('multer');
const svgCaptcha = require('svg-captcha');
const getotpcontroller = require('../controllers/authcontroller');
const postotpcontroller = require('../controllers/authcontroller');

const cacheControl = require('cache-control');

const goToLoginIfNotAuth = (req, res, next) => {
    if (req.session.loggedIn) {
        next()
    } else {
        res.redirect("/login")
    }
};





const setUserId = (req, res, next) => {
    if (req.session.loggedIn && req.session.usersession) {
        res.locals.userSession = req.session.usersession; // Corrected property name
    } else {
        res.locals.userSession = null;
    }
    console.log("req.session.loggedIn:", req.session.loggedIn);
    console.log("req.session.usersession:", req.session.usersession);
    console.log("res.locals.userSession:", res.locals.userSession);
    next();
};


router.get('/register', registerController.getRegisterPage);
// Route for getting all birds
router.post('/register', registerController.postRegister);

router.get('/captcha', registerController.getCaptcha);


// // Route for verifying OTP
router.get('/verify-otp', setUserId, cacheControl({ noCache: true }), getotpcontroller.getVerifyOtp);
router.post('/verify-otp', postotpcontroller.postVerifyOtp);



module.exports = router;


module.exports = router;
