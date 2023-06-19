const express = require('express');
const router = express.Router();
const multer = require('multer');
const editcontroller = require('../controllers/editcontroller');
const upload = multer({ dest: 'backend/uploads/' });
const goToLoginIfNotAuth1 = (req, res, next) => {
    if (req.session.adminloggedIn) {
        next()
    } else {
        res.redirect("/adminlogin")
    }
};
router.get('/productedit', goToLoginIfNotAuth1, editcontroller.getProductEdit);
router.post('/productedit', upload.array('photos', 3), editcontroller.PostProductEdit);
module.exports = router;
