const { Product } = require('../models/productmodel')

exports.getProduct = async (req, res) => {
    try {

        const { category } = req.query;
        const filter = category ? { category } : {};

        const product = await Product.find(filter);



            // const product = await Product.find(req.query.category);


        // const product = await Product.find({});

        const message = req.session.message || null;
        req.session.message = null;

        let editdata = null

        if (req.query.delete_id) {
            await Product.findByIdAndDelete(req.query.delete_id);
            return res.redirect('/product');
        }

        const productWithImages = product.map(item => {
            const { _id, productname, description, productprice, saleprice, stock, category, photo } = item;
            const images = photo.map(image => ({ title: image.title, filepath: image.filepath }));
            return { _id, productname, description, productprice, saleprice, stock, category, images };
        });


        res.render('product', { product: productWithImages, message: message, editdata: editdata || {} });
    } catch (error) {
        console.error(error);
        res.render('error');
    }
};



// const { Product } = require('../models/productmodel');

// exports.getProduct = async (req, res) => {
//     const page = parseInt(req.query.page) || 1; // Current page number, default is 1
//     const perPage = parseInt(req.query.perPage) || 10; // Number of items per page, default is 10

//     try {
//                 const { category } = req.query;
//         const filter = category ? { category } : {};

//         const totalProducts = await Product.countDocuments({});
//         const totalPages = Math.ceil(totalProducts / perPage); // Calculate total number of pages

//         const products = await Product.find({})
//             .skip((page - 1) * perPage) // Skip the specified number of documents
//             .limit(perPage); // Limit the number of documents returned

//         const message = req.session.message || null;
//         req.session.message = null;

//         let editdata = null;

//         if (req.query.delete_id) {
//             await Product.findByIdAndDelete(req.query.delete_id);
//             return res.redirect('/product');
//         }

//         const productWithImages = products.map(item => {
//             const { _id, productname, description, productprice, saleprice, stock, category, photo } = item;
//             const images = photo.map(image => ({ title: image.title, filepath: image.filepath }));
//             return { _id, productname, description, productprice, saleprice, stock, category, images };
//         });

//         res.render('product', {
//             product: productWithImages,
//             message: message,
//             editdata: editdata || {},
//             totalPages: totalPages,
//             currentPage: page,
//             hasNextPage: page < totalPages,
//             hasPrevPage: page > 1,
//             nextPage: page + 1,
//             prevPage: page - 1
//         });
//     } catch (error) {
//         console.error(error);
//         res.render('error');
//     }
// };


// const { Product } = require('../models/productmodel');

// exports.getProduct = async (req, res) => {
//     try {
//         const { category } = req.query;
//         const filter = category ? { category } : {};

//         const page = parseInt(req.query.page) || 1; // Current page number
//         const limit = parseInt(req.query.limit) || 10; // Number of documents per page

//         const count = await Product.countDocuments(filter); // Total count of documents

//         const totalPages = Math.ceil(count / limit); // Total number of pages

//         const skip = (page - 1) * limit; // Number of documents to skip

//         const products = await Product.find(filter)
//             .skip(skip)
//             .limit(limit);

//         const message = req.session.message || null;
//         req.session.message = null;

//         let editdata = null;

//         if (req.query.delete_id) {
//             await Product.findByIdAndDelete(req.query.delete_id);
//             return res.redirect('/product');
//         }

//         const productWithImages = products.map((item) => {
//             const { _id, productname, description, productprice, saleprice, stock, category, photo } = item;
//             const images = photo.map((image) => ({ title: image.title, filepath: image.filepath }));
//             return { _id, productname, description, productprice, saleprice, stock, category, images };
//         });

//         res.render('product', {
//             product: productWithImages,
//             message: message,
//             editdata: editdata || {},
//             currentPage: page,
//             totalPages: totalPages,
//         });
//     } catch (error) {
//         console.error(error);
//         res.render('error');
//     }
// };

