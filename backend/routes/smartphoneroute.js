
const express = require('express');
const router = express.Router();
const smartphoneController = require('../controllers/smartphonecontroller');

const goToLoginIfNotAuth = (req, res, next) => {
    if (req.session.loggedIn) {
        next()
    } else {
        res.redirect("/login")
    }
};

const setUserId = (req, res, next) => {
    if (req.session.loggedIn && req.session.usersession) {
        res.locals.userSession = req.session.usersession.toString(); // Convert ObjectId to string
    } else {
        res.locals.userSession = null;
    }
    console.log("req.session.loggedIn:", req.session.loggedIn);
    console.log("req.session.usersession:", req.session.usersession);
    console.log("res.locals.userSession:", res.locals.userSession);
    next();
};

router.get('/smartphone', setUserId, smartphoneController.getAllSmartphone)

router.get('/allproduct', setUserId, smartphoneController.getAllProductList)

module.exports = router