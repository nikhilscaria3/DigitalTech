const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homecontroller');
const productController = require('../controllers/productcontroller');
const nocache = require('nocache');
const { getProfile, postProfile } = require('../controllers/profilecontroller');

const goToLoginIfNotAuth = (req, res, next) => {
  if (req.session.loggedIn) {
    next()
  } else {
    res.redirect("/login")
  }
};

const setUserName = (req, res, next) => {
  if (req.session.loggedIn && req.session.username) {
    res.locals.userName = req.session.username; // Corrected property name
  } else {
    res.locals.userName = null;
  }
  next();
};

const setUserEmail = (req, res, next) => {
  if (req.session.loggedIn && req.session.email) {
    res.locals.userEmail = req.session.email; // Corrected property name
  } else {
    res.locals.userEmail = null;
  }
  next();
};


const setUserId = (req, res, next) => {
  if (req.session.loggedIn && req.session.usersession) {
    res.locals.userSession = req.session.usersession; // Store the ObjectId as reference
  } else {
    res.locals.userSession = null;
  }
  console.log("req.session.loggedIn:", req.session.loggedIn);
  console.log("req.session.usersession:", req.session.usersession);
  console.log("res.locals.userSession:", res.locals.userSession);
  next();
};



router.get('/', setUserName, setUserId, setUserEmail, homeController.getAllProduct);


// router.get('/homepage/:id', goToLoginIfNotAuth, homeController.postWishlist)
router.get('/wishlist', setUserId, goToLoginIfNotAuth, homeController.getWishlist)
router.post('/wishlist/:id', setUserId, goToLoginIfNotAuth, homeController.postWishlist)

router.get('/address', goToLoginIfNotAuth, setUserId, productController.getAddressHome)
router.post('/address', setUserId, homeController.createAddress)

router.get('/profile', goToLoginIfNotAuth, setUserName, setUserId, setUserEmail, getProfile)
router.post('/profile', goToLoginIfNotAuth, setUserName, setUserId, setUserEmail, postProfile)

// router.get('/search', goToLoginIfNotAuth, setUserName, setUserId, setUserEmail, homeController.getSearchSuggestions)


module.exports = router;
