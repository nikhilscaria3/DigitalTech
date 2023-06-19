const express = require('express');
const router = express.Router();
const userController = require('../controllers/usercontroller');
const exphbs = require('express-handlebars');
const path = require('path');


const goToLoginIfNotAuth1 = (req, res, next) => {
    if (req.session.adminloggedIn) {
        next()
    } else {
        res.redirect("/adminlogin")
    }
};

// Set up Handlebars as the view engine

// Set up Handlebars as the view engine
// router.engine(
//     'hbs',
//     exphbs({
//       extname: '.hbs',
//       defaultLayout: 'user',
//       helpers: {
//         eq: function (a, b) {
//           return a === b;
//         }
//       }
//     })
//   );
//   router.set('view engine', 'hbs');





// // GET block/unblock a user
// router.get('/block', userController.blockUser);

// module.exports = router;


// Get all users route
router.get('/users', goToLoginIfNotAuth1, userController.getAllUsers);


// // Block a user route
// router.post('/:id/block', userController.blockUser);

// Delete a user route


module.exports = router;
