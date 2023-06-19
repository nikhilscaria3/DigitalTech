// const {Order} = require('../models/productmodel');

// exports.getOrder1 = async (req, res) => {
//     try {
//         const id = req.params.id;
//         const order = await Order.findById(id)
//             .populate({ path: 'address', model: 'Address' })
//             .populate({ path: 'product', model: 'Cart' });

//         if (!order) {
//             return res.status(404).render('error', { message: 'Order not found' });
//         }

//         let totalPrice = 0;

//         // Calculate the total price by summing up the saleprice of all products in the cart
//         order.product.forEach((product) => {
//             totalPrice += product.saleprice;
//         });

//         // Format the total price as currency
//         const formattedTotalPrice = totalPrice.toLocaleString('en-IN', {
//             style: 'currency',
//             currency: 'INR',
//         });

//         res.render('orderhistory', { order, totalPrice: formattedTotalPrice });
//     } catch (err) {
//         res.render('error');
//     }
// };

