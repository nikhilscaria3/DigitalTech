const express = require('express');
const router = express.Router();
const messageController = require('../controllers/chatController');

const goToLoginIfNotAuth = (req, res, next) => {
    if (req.session.loggedIn) {
        next()
    } else {
        res.redirect("/login")
    }
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

// GET home page
router.get('/chat', setUserId,goToLoginIfNotAuth, messageController.getSendPage);

// GET receiver page
router.get('/receive', setUserId,goToLoginIfNotAuth, messageController.getReceiverPage);

// GET messages for a specific receiver
router.get('/api/messages/:receiver', setUserId, messageController.getMessagesForReceiver);

module.exports = router;
