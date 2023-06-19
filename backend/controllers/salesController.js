const moment = require('moment');
const { Order, Product } = require('../models/productmodel');
const ExcelJS = require('exceljs');

exports.getSalesReports = async (req, res) => {
  const today = moment().startOf('day');
  const tomorrow = moment(today).endOf('day');
  const startOfWeek = moment().startOf('week');
  const endOfWeek = moment(startOfWeek).endOf('week');
  const startOfYear = moment().startOf('year');
  const endOfYear = moment(startOfYear).endOf('year');

  try {
    const dailySales = await Order.aggregate([
      { $match: { date: { $gte: today.toDate(), $lt: tomorrow.toDate() } } },
      { $lookup: { from: 'products', localField: 'product', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $project: { date: 1, quantity: 1, totalPrice: 1, productName: '$product.productname' } }
    ]);

    const weeklySales = await Order.aggregate([
      { $match: { date: { $gte: startOfWeek.toDate(), $lt: endOfWeek.toDate() } } },
      { $lookup: { from: 'products', localField: 'product', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $project: { date: 1, quantity: 1, totalPrice: 1, productName: '$product.productname' } }
    ]);

    const yearlySales = await Order.aggregate([
      { $match: { date: { $gte: startOfYear.toDate(), $lt: endOfYear.toDate() } } },
      { $lookup: { from: 'products', localField: 'product', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $project: { date: 1, quantity: 1, totalPrice: 1, productName: '$product.productname' } }
    ]);

    res.render('saleReport', { dailySales, weeklySales, yearlySales }); // Render the saleReport page with the data

  } catch (err) {
    console.error('Error retrieving sales reports:', err);
    res.status(500).send('Internal Server Error');
  }
};

exports.downloadSalesReport = async (req, res) => {
  const today = moment().startOf('day');
  const tomorrow = moment(today).endOf('day');
  const startOfWeek = moment().startOf('week');
  const endOfWeek = moment(startOfWeek).endOf('week');
  const startOfYear = moment().startOf('year');
  const endOfYear = moment(startOfYear).endOf('year');

  try {
    const dailySales = await Order.aggregate([
      { $match: { date: { $gte: today.toDate(), $lt: tomorrow.toDate() } } },
      { $lookup: { from: 'products', localField: 'product', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $project: { date: 1, quantity: 1, totalPrice: 1, productName: '$product.productname' } }
    ]);

    const weeklySales = await Order.aggregate([
      { $match: { date: { $gte: startOfWeek.toDate(), $lt: endOfWeek.toDate() } } },
      { $lookup: { from: 'products', localField: 'product', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $project: { date: 1, quantity: 1, totalPrice: 1, productName: '$product.productname' } }
    ]);

    const yearlySales = await Order.aggregate([
      { $match: { date: { $gte: startOfYear.toDate(), $lt: endOfYear.toDate() } } },
      { $lookup: { from: 'products', localField: 'product', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $project: { date: 1, quantity: 1, totalPrice: 1, productName: '$product.productname' } }
    ]);

    const format = req.query.format;

    if (format === 'pdf') {
      const pdfReport = generatePDFReport(dailySales, weeklySales, yearlySales);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=sales_report.pdf');
      pdfReport.pipe(res);

    } else if (format === 'excel') {
      const excelReport = generateExcelReport(dailySales, weeklySales, yearlySales);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=sales_report.xlsx');
      await excelReport.xlsx.write(res);
      res.end();
    } else {
      res.status(400).json({ error: 'Invalid format specified' });
    }
  } catch (err) {
    console.error('Error generating sales report:', err);
    res.status(500).send('Internal Server Error');
  }
};

function generatePDFReport(dailySales, weeklySales, yearlySales) {
  const PDFDocument = require('pdfkit');
  const doc = new PDFDocument();

  doc.fontSize(16).text('Sales Report', { align: 'center' });
  doc.moveDown();

  const salesData = [
    { title: 'Daily Sales', data: dailySales },
    { title: 'Weekly Sales', data: weeklySales },
    { title: 'Yearly Sales', data: yearlySales }
  ];

  salesData.forEach((sales) => {
    doc.fontSize(12).text(sales.title, { underline: true });
    doc.moveDown();

    if (sales.data.length > 0) {
      // Draw table headers
      doc.font('Helvetica-Bold').text('Date', 50, doc.y, { continued: true });
      doc.font('Helvetica-Bold').text('Product Name', 150, doc.y, { continued: true });
      doc.font('Helvetica-Bold').text('Quantity', 350, doc.y, { continued: true });
      doc.font('Helvetica-Bold').text('Total Price', 450, doc.y);

      doc.moveDown();

      // Draw table rows
      sales.data.forEach((sale) => {
        doc.font('Helvetica').text(sale.date.toISOString().split('T')[0], 50, doc.y, { continued: true });
        doc.font('Helvetica').text(sale.productName, 150, doc.y, { continued: true });
        doc.font('Helvetica').text(sale.quantity.toString(), 350, doc.y, { continued: true });
        doc.font('Helvetica').text(sale.totalPrice.toString(), 450, doc.y);

        doc.moveDown();
      });
    } else {
      doc.text('No sales data available');
      doc.moveDown();
    }
  });

  doc.end();
  return doc;
}


function generateExcelReport(dailySales, weeklySales, yearlySales) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sales Report');

  worksheet.columns = [
    { header: 'Date', key: 'date', width: 20 },
    { header: 'Product Name', key: 'productName', width: 30 },
    { header: 'Quantity', key: 'quantity', width: 15 },
    { header: 'Total Price', key: 'totalPrice', width: 15 }
  ];

  dailySales.forEach((sale) => {
    worksheet.addRow({
      date: sale.date,
      productName: sale.productName,
      quantity: sale.quantity,
      totalPrice: sale.totalPrice
    });
  });

  weeklySales.forEach((sale) => {
    worksheet.addRow({
      date: sale.date,
      productName: sale.productName,
      quantity: sale.quantity,
      totalPrice: sale.totalPrice
    });
  });

  yearlySales.forEach((sale) => {
    worksheet.addRow({
      date: sale.date,
      productName: sale.productName,
      quantity: sale.quantity,
      totalPrice: sale.totalPrice
    });
  });

  return workbook;
}
