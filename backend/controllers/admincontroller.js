const { Product, Order, Banner, } = require('../models/productmodel');
const { User } = require('../models/usermodel')
// assuming the collection name is "users"
const bcrypt = require('bcrypt');

const multer = require('multer');
const sharp = require('sharp');
const moment = require('moment')
// Set up multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

// Create multer instance
const upload = multer({ storage });

exports.getAdmin = async (req, res) => {
    try {
        // Fetch products with the category "Smartphones"
        const product = await Product.find({ category: "Smartphones" });

        const user = await User.find({})

        // Fetch all orders and populate the "product" field
        const orders = await Order.find({}).populate({ path: 'product', model: 'Product' });

        const smartphone = await Product.find({ category: "Smartphones" });
        const laptop = await Product.find({ category: "Laptops" });
        const headphone = await Product.find({ category: "Headphones" });

        const smartphonelength = smartphone.length
        const laptoplength = laptop.length
        const headphonelength = headphone.length

        // Define moment.js date ranges
        const today = moment().startOf('day');
        const tomorrow = moment(today).endOf('day');
        const startOfWeek = moment().startOf('week');
        const endOfWeek = moment(startOfWeek).endOf('week');
        const startOfYear = moment().startOf('year');
        const endOfYear = moment(startOfYear).endOf('year');

        // Aggregate daily, weekly, and yearly sales data using MongoDB
        const dailySales = await Order.aggregate([
            { $match: { date: { $gte: today.toDate(), $lt: tomorrow.toDate() } } },
        ]);

        const weeklySales = await Order.aggregate([
            { $match: { date: { $gte: startOfWeek.toDate(), $lt: endOfWeek.toDate() } } },
        ]);

        const yearlySales = await Order.aggregate([
            { $match: { date: { $gte: startOfYear.toDate(), $lt: endOfYear.toDate() } } },
        ]);

        // Handle error if orders are not found
        if (!orders) {
            return res.status(404).render('error', { message: 'Orders not found' });
        }

        // Calculate the total price of all orders
        let totalPrice = 0;

        orders.forEach((order) => {
            order.product.forEach((product) => {
                totalPrice += product.saleprice;
            });
        });

        // Format the total price as currency
        const formattedTotalPrice = totalPrice.toLocaleString('en-IN', {
            style: 'currency',
            currency: 'INR',
        });

        // Map orders to include product images
        const productWithImages1 = orders.map((order) => {
            const products = order.product.map((product) => {
                const image = product.photo.length > 0 ? { title: product.photo[0].title, filepath: product.photo[0].filepath } : null;
                const { productname } = product;
                return { _id: product._id, image, productname };
            });
            return { _id: order._id, products };
        });

        // Extract image details from the product objects
        const productwithimages = product.map((product) => {
            const { _id, productname, description, productprice, saleprice, stock, category, photo } = product;
            const { title, filepath } = photo;
            return { _id, productname, description, productprice, saleprice, stock, category, title, filepath };
        });

        // Render the admin view with the fetched data
        res.render('admin', { smartphonelength, laptoplength, headphonelength, user, dailySales, weeklySales, yearlySales, orders: productWithImages1, product: productwithimages });
    } catch (err) {
        console.error(err);
        res.render('error');
    }
};



exports.getCrop = async (req, res) => {
    try {
        const products = await Product.find({});
        const productWithImages = products.map(item => {
            const { _id, photo } = item;
            const images = photo.map(image => ({ title: image.title, filepath: image.filepath }));
            return { _id, images };
        });

        // Extract the object ID from each product
        const objectIds = productWithImages.map(product => product._id);

        // Redirect to a success page or display a success message
        res.render('crop', { product: productWithImages, objectIds });
    } catch (error) {
        console.error('Error cropping image:', error);
        res.status(500).json({ success: false, error: 'Error cropping image' });
    }
}

// exports.getCropForm = async (req, res) => {
//     try {
//       const { id } = req.params;
//       const product = await Product.findById(id);

//       if (!product) {
//         return res.status(404).json({ success: false, error: 'Product not found' });
//       }

//       const { _id, photo } = product;
//       const images = photo.map(image => ({ title: image.title, filepath: image.filepath }));

//       const objectIds = [_id]; // Wrap the ID in an array if needed

//       res.render('crop', { product: images, objectIds });
//     } catch (error) {
//       console.error('Error cropping image:', error);
//       res.status(500).json({ success: false, error: 'Error cropping image' });
//     }
//   };

// // productController.js


exports.updateImage = async (req, res) => {
    const { productId, imageIndex } = req.params;
    const imageFile = req.file;

    try {
        // Fetch the product by ID
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Update the photo at the specified index
        if (imageFile && imageIndex >= 0 && imageIndex < product.photo.length) {
            const croppedImage = {
                title: imageFile.originalname,
                filepath: imageFile.filename
            };
            product.photo[imageIndex] = croppedImage;
        }

        // Save the updated product
        await product.save();

        res.status(200).json({ success: true, message: 'Image updated successfully' });
    } catch (error) {
        console.error('Error updating image:', error);
        res.status(500).json({ success: false, error: 'Error updating image' });
    }
}



exports.getBanner = async (req, res) => {
    try {
        const currentDate = new Date();
        const activeBanners = await Banner.find({
            startDate: { $lte: currentDate },
            endDate: { $gte: currentDate },
            status: 'active'
        });
        const bannersWithImages = activeBanners.map(banner => {
            const { _id, image, targetURL } = banner;
            const filepath = image.filepath; // Assuming the filepath is stored as a property in the 'image' object
            return { _id, filepath, targetURL };
        });

        if (req.query.delete_id) {
            await Banner.findByIdAndDelete(req.query.delete_id);
            return res.redirect('/create-banner');
        }

        res.render('banner', { banners: bannersWithImages })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create banner' });
    }
};

exports.createBanner = async (req, res) => {
    try {
        const { targetURL, startDate, endDate } = req.body;
        const { title, path } = req.file;

        // Create a new banner instance
        const banner = new Banner({
            image: {
                title,
                filepath: path
            },
            targetURL,
            startDate,
            endDate
        });

        // Save the banner to the database
        await banner.save();

        // Redirect or render a success view
        res.redirect('/create-banner'); // Redirect to the banners list page or a success view
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create banner' });
    }
};

