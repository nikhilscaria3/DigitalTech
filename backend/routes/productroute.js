
const express = require('express');
const router = express.Router();
const productpagecontroller = require('../controllers/productpagecontroller');

const goToLoginIfNotAuth1 = (req, res, next) => {
    if (req.session.adminloggedIn) {
        next()
    } else {
        res.redirect("/adminlogin")
    }
};

router.get('/product',goToLoginIfNotAuth1, productpagecontroller.getProduct)

module.exports = router