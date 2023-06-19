
const { Product } = require('../models/productmodel')
const fs = require('fs');
const { title } = require('process');
const sharp = require('sharp');
const path = require('path');

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.find({ category: "Smartphones" });

    // Extract image details from the nested structure
    const productWithImages = product.map(item => {
      const { _id, productname, description, productprice, saleprice, stock, category, photo } = item;
      const images = photo.map(image => ({ title: image.title, filepath: image.filepath }));
      return { _id, productname, description, productprice, saleprice, stock, category, images };
    });

    res.render('productadd', { product: productWithImages });
  } catch (err) {
    console.error(err);
    res.render('error');
  }
};



exports.createProduct = async (req, res) => {

  try {

    const { productname, productprice, saleprice, stock, category, highlight1, highlight2, paymentoption, rating } = req.body;


    const { title, description, width, height } = req.body;

    const uploadedImages = req.files.map(async file => {
      const imageFilePath = file.path;
      const { width: originalWidth, height: originalHeight } = await sharp(file.path).metadata();

      let resizedImageFilePath = file.path; // By default, use the original image path

      if (width && height) {
        resizedImageFilePath = `uploads/resized-${file.filename}`;

        await sharp(file.path)
          .resize(parseInt(width, 10), parseInt(height, 10))
          .toFile(resizedImageFilePath);
      }

      return {
        filepath: resizedImageFilePath,
        width: parseInt(width, 10) || originalWidth,
        height: parseInt(height, 10) || originalHeight
      };
    });

    const croppedImages = await Promise.all(uploadedImages);


    const product = new Product({
      title: title,
      description: description,
      photo: croppedImages,
      productname,
      productprice: parseFloat(productprice),
      saleprice: parseFloat(saleprice),
      stock: parseInt(stock),
      category,
      paymentoption,
      rating,
    });

    await product.save();
    res.redirect("/productadd");
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
