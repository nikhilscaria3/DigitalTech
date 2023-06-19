const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admincontroller');
const productController = require('../controllers/productcontroller');
const multer = require('multer');
const { route } = require('./productpageroute');

const upload = multer({ dest: 'backend/uploads/' });
const goToLoginIfNotAuth1 = (req, res, next) => {
    if (req.session.adminloggedIn) {
        next()
    } else {
        res.redirect("/adminlogin")
    }
};
router.get('/admin', goToLoginIfNotAuth1, adminController.getAdmin);
router.get('/adminorder', goToLoginIfNotAuth1, productController.getAdminOrder)
router.get('/adminorderdetails/:id', goToLoginIfNotAuth1, productController.getOrderInfoAdmin)
router.get('/crop', goToLoginIfNotAuth1, adminController.getCrop)

router.post('/crop/:productId/:imageIndex', upload.single('image'), adminController.updateImage);

router.get('/create-banner', goToLoginIfNotAuth1, adminController.getBanner)
router.post('/banner', upload.single('image'), goToLoginIfNotAuth1, adminController.createBanner)

module.exports = router;
