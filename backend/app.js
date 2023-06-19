require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const session = require('express-session');
const path = require('path');
const hbs = require('hbs');
const multer = require('multer');
const nocache = require('nocache');
const svgCaptcha = require('svg-captcha');
const cacheControl = require('cache-control');
const connectMongoDbSession = require('connect-mongodb-session');
const sharp = require('sharp');
const connectDatabase = require('./backend/config/database');
const dotenv = require('dotenv');
dotenv.config({path:path.join(__dirname,"backend/config/config.env")});

const app = express();
mongoose.set('debug', true);

connectDatabase();

app.listen(process.env.PORT,()=>{
    console.log(`My Server listening to the port: ${process.env.PORT} in  ${process.env.NODE_ENV} `)
})


const MongoDbStore = connectMongoDbSession(session);
const defaultDbUri = "mongodb+srv://nikhilscaria3:uzlfuyj2RfRbDdEa@global.lzwsydh.mongodb.net/?retryWrites=true&w=majority";
const store = new MongoDbStore({
  uri: process.env.DB_LOCAL_URI || defaultDbUri,
  collection: 'sessions'
});

app.use(session({
  name: 'loggedIn',
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  store: store,
  cookie: {
    secure: false, // Set it to true if using HTTPS
    maxAge: 24 * 60 * 60 * 1000, // Session expiration time
  }
}));



// app.use(session({
//   name: 'otp',
//   secret: 'your-secret-key',
//   resave: false,
//   saveUninitialized: true,
//   store: store,
//   cookie: {
//     secure: false, // Set it to true if using HTTPS
//     maxAge: 2 * 60 * 1000, // Session expiration time
//   }
// }));



app.use(session({
  name: 'adminSession',
  secret: 'your-secret-key1',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // Set it to true if using HTTPS
    maxAge: 24 * 60 * 60 * 1000, // Session expiration time
  }
}));

// Configure Handlebars


app.use(function (req, res, next) {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

app.use(cacheControl({ noCache: true }));

// Set view engine and views directory
app.set('view engine', 'hbs');
app.set('views', [path.join(__dirname, 'frontend/views'), path.join(__dirname, 'backend/routes'), path.join(__dirname, 'backend/uploads'),path.join(__dirname, 'backend/config')]);

// Configure static file serving
app.use('/uploads', express.static('backend/uploads'));
app.use(express.static(path.join(__dirname, 'frontend/public')));
app.use('/routes', express.static('backend/routes'));
app.use('/uploads1', express.static('uploads1'));
app.use(express.static(path.join(__dirname, 'frontend/views')));
app.use(express.static(path.join(__dirname, 'frontend/views/html')));

// Parse request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
// const orderhistory = require('./routes/orderhistoryroute')
const forget = require('./backend/routes/forgetpassword');
const login = require('./backend/routes/loginroute');
const register = require('./backend/routes/registerroute');
const homepage = require('./backend/routes/homepageroute');
const productadd = require('./backend/routes/productaddroute');
const admin = require('./backend/routes/adminroute');
const productedit = require('./backend/routes/producteditroute');
const Product = require('./backend/routes/productroute');
const userRoutes = require('./backend/routes/userroutes');
const categoryroutes = require('./backend/routes/categoryroute');
const laptoproutes = require('./backend/routes/laptoproute');
const smartphoneroutes = require('./backend/routes/smartphoneroute');
const productroute = require('./backend/routes/productpageroute');
const salesRoutes = require('./backend/routes/saleroute');

app.use('/', salesRoutes);
app.use('/', forget)
app.use('/', login);
app.use('/', register);
app.use('/', homepage);
app.use('/', productadd);
app.use('/', admin);
app.use('/', productedit);
app.use('/', Product);
app.use('/', userRoutes);
app.use('/', categoryroutes);
app.use('/', laptoproutes);
app.use('/', smartphoneroutes);
app.use('/', productroute);
// app.use('/auth', authRoutes);

app.get('/error', (req, res) => {
  res.render('error')
});


// Generate and serve CAPTCHA
app.get('/captcha', (req, res) => {
  const captcha = svgCaptcha.create();
  req.session.captcha = captcha.text; // Save the captcha text to session
  res.type('svg').send(captcha.data);
});

// Logout
// Logout
app.get('/logout', nocache(), (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.get('/signout', nocache(), (req, res) => {
  req.session.destroy();
  res.redirect('/adminlogin');
});


// app.get('/productpage/:id', async (req, res) => {
//   try {
//     const id = req.params.id;
//     const user = await Product.findOne({ _id: id });

//     if (!user) {
//       return res.status(404).render('product', { message: 'User not found' });
//     }

//     const summary = user.summary;
//     const filepath = user.photo.filepath; // Assuming the filepath is nested under the 'photo' property
//     console.log(filepath);
//     res.render('productpage', { name: user.name, species: user.species, summary: summary, filepath: filepath });
//   } catch (e) {
//     console.log(e);
//     res.render('error');
//   }
// });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error');
});


// const express = require('express');
const Razorpay = require('razorpay');

// const app = express();
// const port = 3000;

// Initialize Razorpay with your API keys



app.get('/create-order', async (req, res) => {
  try {
    const options = {
      amount: 50000, // Amount in paise (50000 paise = ₹500)
      currency: 'INR',
      receipt: 'order_receipt',
      payment_capture: 1, // Auto capture the payment
    };

    const order = await razorpay.orders.create(options);

    res.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).send('Error creating order');
  }
});


// Create an API endpoint to initiate payment
app.post('/create-order', async (req, res) => {
  try {
    const options = {
      amount: 50000, // Amount in paise (50000 paise = ₹500)
      currency: 'INR',
      receipt: 'order_receipt',
      payment_capture: 1, // Auto capture the payment
    };

    const order = await razorpay.orders.create(options);

    res.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).send('Error creating order');
  }
});

// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });


// app.post("/reviewSucess", (req, res) => {
//   res.render("sucess")
// })

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


app.get('/transactions', async (req, res) => {
  try {
    // Fetch transaction details from Razorpay API
    const transactions = await razorpay.payments.all();

    let totalPrice = 0;
    let formattedDate = [];

    transactions.items.forEach((item) => {
      const amount = item.amount / 100; // Divide by 100 to get the actual amount
      totalPrice += amount;

      const createdAt = new Date(item.created_at * 1000); // Multiply by 1000 to convert from seconds to milliseconds
      const formattedCreatedAt = createdAt.toLocaleDateString('en-IN');
      formattedDate.push(formattedCreatedAt);
    });

    console.log(totalPrice);

    const formattedTotalPrice = totalPrice.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
    });

    console.log(formattedTotalPrice);

    // Render the transactions data in your hbs template
    res.render('transactionhistory', { transactions: transactions.items, totalPrice: formattedTotalPrice, formattedDate });
  } catch (error) {
    console.log(error);
    res.status(500).send('An error occurred');
  }
});



app.post('/crop/:id', async (req, res) => {
  const id = req.params.id;
  const product = await Product.find(id); // Retrieve the product by ID using findById

  if (!product) {
    return res.status(404).send('Product not found');
  }

  const name = req.body.name;
  const width = parseInt(req.body.width);
  const height = parseInt(req.body.height);

  const existingImagePath = product.images[0].filepath; // Assuming the first image is being cropped

  sharp(existingImagePath)
    .resize(width, height)
    .toFile(`cropped-${name}.jpg`, async (err, info) => {
      if (err) {
        console.error('Error cropping image:', err);
        res.status(500).send('Error cropping image');
      } else {
        // Update the existing image with the cropped image
        product.images[0].filepath = `cropped-${name}.jpg`;

        try {
          await product.save(); // Save the updated product

          res.send(`Image cropped and updated successfully! Name: ${name}, Width: ${width}, Height: ${height}`);
        } catch (error) {
          console.error('Error updating product:', error);
          res.status(500).send('Error updating product');
        }
      }
    });
});



const { Product: ProductModel } = require('./backend/models/productmodel');

app.get('/search', async (req, res) => {
  const searchTerm = req.query.term;
  console.log(searchTerm);
  if (!searchTerm) {
    res.status(400).send('No search term provided');
    return; // Return early to avoid further execution
  }

  try {
    const products = await ProductModel.find({
      productname: {
        $regex: searchTerm,
        $options: 'i' // case-insensitive matching
      }
    });
    console.log(products);

    res.json(products);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).send('Error searching products');
  }
});



