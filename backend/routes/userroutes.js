const express = require('express');
const router = express.Router();
const userController = require('../controllers/usercontroller');



const goToLoginIfNotAuth1 = (req, res, next) => {
    if (req.session.adminloggedIn) {
        next()
    } else {
        res.redirect("/adminlogin")
    }
};

router.get('/users', goToLoginIfNotAuth1, userController.getAllUsers);
router.get('/send', userController.GetstatusMail);
router.post('/send/:id/:status', userController.PoststatusMail);

module.exports = router;
