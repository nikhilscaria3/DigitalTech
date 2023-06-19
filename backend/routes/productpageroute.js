
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productcontroller');
const paymentController = require('../controllers/paymentController');
const couponController = require('../controllers/couponController');
const goToLoginIfNotAuth = (req, res, next) => {
    if (req.session.loggedIn) {
        next()
    } else {
        res.redirect("/login")
    }
};

const multer = require('multer');

const path = require('path');

const storage = multer.diskStorage({
    destination: 'backend/uploads/',
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

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


router.get('/productpage/:id', setUserId, productController.getProduct);
// router.post('/productpage/:id', productController.getReviews);

router.get('/cart', goToLoginIfNotAuth, setUserId, productController.getCart)
router.post('/cart', goToLoginIfNotAuth, productController.Cartpost)
router.post('/cart/:id', setUserId, goToLoginIfNotAuth, productController.createCart)
router.post('/cart2/updateQuantity', productController.updateQuantity);
router.get('/shippinginfo', setUserId, goToLoginIfNotAuth, productController.getAddress)
router.post('/shippinginfo', setUserId, productController.createAddress)

router.get('/productshipping/:id', setUserId, goToLoginIfNotAuth, productController.getproductShipping)

router.post('/productshipping/:id', setUserId, goToLoginIfNotAuth, productController.postProductShipping)


router.get('/payment/:id1/:id2', setUserId, goToLoginIfNotAuth, productController.getProductPayment)
router.post('/payment/:id1/:id2', setUserId, productController.createProductPayment)


router.get('/payment/:id', setUserId, goToLoginIfNotAuth, productController.getPayment)
router.post('/payment/:id', setUserId, productController.createOrder)
router.get('/order/:id', setUserId, goToLoginIfNotAuth, productController.getOrder)
router.get('/orderhistory', goToLoginIfNotAuth, setUserId, productController.getOrderHistory)
router.get('/orderinfo/:id', goToLoginIfNotAuth, setUserId, productController.getOrderInfo)
router.post('/reviewSuccess/:id', goToLoginIfNotAuth, setUserId, productController.postreviews)
router.get('/paymentcard', goToLoginIfNotAuth, setUserId, productController.getCards)
router.post('/paymentcard', goToLoginIfNotAuth, setUserId, productController.postCards)

router.get('/', goToLoginIfNotAuth, setUserId, paymentController.renderProductPage)
router.post('/createPayment', goToLoginIfNotAuth, setUserId, paymentController.createOrderPayment)

router.post('/payment/:id/order-success ', productController.getOrderSuccess)

router.get('/coupon', goToLoginIfNotAuth, setUserId, couponController.getCoupon)
router.post('/coupon/:id', goToLoginIfNotAuth, setUserId, couponController.postCoupon)
router.get('/couponadmin', goToLoginIfNotAuth, setUserId, couponController.getCouponAdmin)
router.post('/couponadd', upload.single('image'), goToLoginIfNotAuth, setUserId, couponController.saveCoupon)



module.exports = router