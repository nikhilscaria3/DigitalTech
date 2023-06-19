
const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/categorycontroller');

const goToLoginIfNotAuth1 = (req, res, next) => {
    if (req.session.adminloggedIn) {
        next()
    } else {
        res.redirect("/adminlogin")
    }
};

router.get('/category', categoryController.getAllCategories)
router.get('/category', categoryController.deleteCategory)
module.exports = router