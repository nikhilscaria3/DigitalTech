const express = require('express');
const router = express.Router();
const loginController = require('../controllers/logincontroller');
const adminController = require('../controllers/adminlogincontroller');
const nocache = require('nocache');


router.get('/forgot', loginController.getUpdate)
router.post('/forgot', loginController.postUpdate)


router.get('/forgot_admin', adminController.getUpdate)
router.post('/forgot_admin', adminController.postUpdate)

module.exports = router;
