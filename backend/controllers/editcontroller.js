const { Product } = require('../models/productmodel')

exports.getProductEdit = async (req, res) => {
    try {
        const product = await Product.find({});

        const message = req.session.message || null;
        req.session.message = null;

        let editdata = null;

        if (req.query.edit_id) {
            const edit_id = req.query.edit_id;
            const validIdRegex = /^[0-9a-fA-F]{24}$/;
            if (!validIdRegex.test(edit_id)) {
                // Handle the invalid ID here
            }
            editdata = await Product.findById(edit_id);
        }

        if (req.query.delete_id) {
            await Product.findByIdAndDelete(req.query.delete_id);
            return res.redirect('/productedit');
        }

        const productWithImages = product.map(item => {
            const { _id, productname, description, productprice, saleprice, stock, category, photo } = item;
            const images = photo.map(image => ({ title: image.title, filepath: image.filepath }));
            return { _id, productname, description, productprice, saleprice, stock, category, images };
        });

        res.render('productedit', { product: productWithImages, message: message, editdata: editdata || {} });
    } catch (error) {
        console.error(error);
        res.render('error');
    }
};
exports.PostProductEdit = async (req, res) => {
    try {
        const { id, productname, description, productprice, saleprice, stock, category, highlight1, highlight2, paymentoption, rating } = req.body;

        // Check if files were uploaded
        if (req.files && req.files.length > 0) {
            const photos = req.files.map(file => {
                return {
                    title: file.originalname,
                    filepath: file.filename
                };
            });


            // Update the product with the new photo array
            await Product.findByIdAndUpdate(id, {
                productname,
                description,
                productprice,
                saleprice,
                stock,
                category,
                paymentoption,
                rating,
                photo: photos
            });
        } else {
            // If no files were uploaded, update the product without modifying the photo array
            await Product.findByIdAndUpdate(id, {
                productname,
                description,
                productprice,
                saleprice,
                stock,
                category,
                paymentoption,
                rating
            });
        }

        req.session.message = 'Edited Successfully';
        return res.redirect('/productedit');
    } catch (error) {
        console.error(error);
        res.render('error');
    }
};
