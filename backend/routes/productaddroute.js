
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productaddcontroller');
const multer = require('multer');

const path = require('path');

const storage = multer.diskStorage({
    destination: '/backend/uploads/',
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

const goToLoginIfNotAuth1 = (req, res, next) => {
    if (req.session.adminloggedIn) {
        next()
    } else {
        res.redirect("/adminlogin")
    }
};

router.get('/productadd', goToLoginIfNotAuth1, productController.getProduct);

router.post('/productadd', upload.array('images'), productController.createProduct);

module.exports = router;
