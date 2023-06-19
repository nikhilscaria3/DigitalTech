
const express = require('express');
const router = express.Router();
const laptopController = require('../controllers/laptopcontroller');

const goToLoginIfNotAuth = (req, res, next) => {
    if (req.session.loggedIn) {
      next()
    } else {
      res.redirect("/login")
    }
  };

router.get('/laptop', laptopController.getAllProduct)

module.exports = router