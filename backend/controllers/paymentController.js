const Razorpay = require('razorpay');
const { Product, Cart, Order, Card, Address, Payment, Review, Wishlist } = require('../models/productmodel');


const razorpayInstance = new Razorpay({
    key_id: 'rzp_test_c6JWs9bblKyxcL',
    key_secret: '7NNfuYJz48DiFCf0lnL3TC8M'
});

const renderProductPage = async (req, res) => {

    try {

        const userSession = res.locals.userSession;

        const cards = await Card.find({ user: userSession })

        const address = await Address.findOne({});

        const products = await Cart.find({ user: userSession });

        let totalPrice = 0;

        // Calculate the total price by summing up the saleprice of all products in the cart
        products.forEach((product) => {
            totalPrice += product.totalPrice;
        });

        const formattedTotalPrice = totalPrice.toLocaleString('en-IN', {
            style: 'currency',
            currency: 'INR',
        });


        if (!products) {
            return res.status(404).render('error', { message: 'Product not found' });
        }

        if (!address) {
            return res.status(404).render('error', { message: 'Address not found' });
        }


        res.render('orderpayment', { products, cards, address, totalPrice: formattedTotalPrice, formData: address || {} });
    } catch (err) {
        console.error(err);
        res.render('error');
    }

}

const createOrderPayment = async (req, res) => {
    try {
        const amount = req.body.amount * 100
        const options = {
            amount: amount,
            currency: 'INR',
            receipt: 'razorUser@gmail.com'
        }

        razorpayInstance.orders.create(options,
            (err, order) => {
                if (!err) {
                    res.status(200).send({
                        success: true,
                        msg: 'Order Created',
                        order_id: order.id,
                        amount: amount,
                        key_id: "rzp_test_c6JWs9bblKyxcL",
                        product_name: req.body.name,
                        description: req.body.description,
                        contact: "7561849356",
                        name: "Nikhil Scaria",
                        email: "nikhilscaria3@gmail.com"
                    });
                }
                else {
                    res.status(400).send({ success: false, msg: 'Something went wrong!' });
                }
            }
        );

    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    renderProductPage,
    createOrderPayment
}