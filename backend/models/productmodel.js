// const mongoose = require('mongoose');
// const mongoosePaginate = require('mongoose-paginate');

// const productSchema = new mongoose.Schema({
//   productname: String,
//   description: String,
//   productprice: Number,
//   saleprice: Number,
//   stock: Number,
//   category: String,
//   highlight1: [{
//     point1: String,
//     point2: String,
//     point3: String,
//     point4: String,
//     point5: String,
//   }],
//   highlight2: [{
//     point1: String,
//     point2: String,
//     point3: String,
//     point4: String,
//     point5: String,
//   }],
//   paymentoption: String,
//   rating: String,
//   photo: [{
//     title: String,
//     filepath: String,
//   }],
// });
// productSchema.plugin(mongoosePaginate);
// const Product = mongoose.model('Product', productSchema);



// const cartSchema = new mongoose.Schema({
//   productid: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Product', // Correctly referencing the Product model
//     required: true,
//   },
//   productname: { type: String, required: true },
//   description: String,
//   productprice: Number,
//   saleprice: Number,
//   stock: Number,
//   quantity: {
//     type: Number,
//     default: 1
//   },
//   totalPrice: {
//     type: Number,
//     required: true,
//   },
//   category: { type: String, required: true },
//   rating: { type: String, required: true },
//   image: {
//     title: { type: String },
//     filepath: { type: String }
//   }
// });

// const addressSchema = new mongoose.Schema({
//   name: String,
//   address: String,
//   houseno: Number,
//   city: String,
//   district: String,
//   state: String,
//   country: String,
//   zip: Number
// });

// const orderSchema = new mongoose.Schema({
//   address: {
//     name: String,
//     address: String,
//     houseno: Number,
//     city: String,
//     district: String,
//     state: String,
//     country: String,
//     zip: Number
//   },
//   product: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Product',
//   }],
//   paymentmode: {
//     type: String,
//     required: true,
//   },
//   totalPrice: {
//     type: String,
//     required: true,
//   },
//   status: {
//     type: String,
//     required: true,
//   }
// });

// const wishlistSchema = new mongoose.Schema({
//   product: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Product',
//   }
// });


// const Cart = mongoose.model('Cart', cartSchema);
// const Address = mongoose.model('Address', addressSchema);
// const Order = mongoose.model('Order', orderSchema);
// const Wishlist = mongoose.model('Wishlist', wishlistSchema)

// module.exports = {
//   Product,
//   Cart,
//   Address,
//   Order,
//   Wishlist,
// };

const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const productSchema = new mongoose.Schema({
  productname: String,
  description: String,
  productprice: Number,
  saleprice: Number,
  stock: Number,
  category: String,
  rating: {
    type: Number,
    default: 1,
  },
  highlight1: [{
    point1: String,
    point2: String,
    point3: String,
    point4: String,
    point5: String,
  }],
  highlight2: [{
    point1: String,
    point2: String,
    point3: String,
    point4: String,
    point5: String,
  }],
  paymentoption: String,
  rating: String,
  photo: [{
    filepath: String,
    width: Number,
    height: Number
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
});
productSchema.plugin(mongoosePaginate);



const cartSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  productname: { type: String, required: true },
  description: String,
  productprice: Number,
  saleprice: Number,
  stock: Number,

  quantity: {
    type: Number,
    required: true,
  },

  totalPrice: {
    type: Number,
    required: false,
  },
  lastprice: {
    type: Number,
    required: false,
  },

  couponprice: {
    type: Number,
    required: true,
    default: 0,
  },

  category: { type: String, required: true },
  image: {
    title: { type: String },
    filepath: { type: String }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  coupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon',

  }
});

const addressSchema = new mongoose.Schema({
  name: String,
  address: String,
  houseno: Number,
  city: String,
  district: String,
  state: String,
  country: String,
  zip: Number,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
});


const orderSchema = new mongoose.Schema({
  date: Date,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cart',
  },
  address: {
    name: String,
    address: String,
    houseno: Number,
    city: String,
    district: String,
    state: String,
    country: String,
    zip: Number
  },
  product: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
  paymentmode: {
    type: String,
    required: true,
  },
  totalPrice: {
    type: String,
    required: true,
  },
  lastprice: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    default: 1
  },

  orderShipped: {
    type: Date,
  },
  orderOnRoute: {
    type: Date
  },
  orderDelivered: {
    type: Date
  }
});

const wishlistSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
});

const CardSchema = new mongoose.Schema({
  cardname: {
    type: String,
    required: true
  },
  cardnumber: {
    type: String, // Changed the data type to String
    required: true
  },

  expirymonth: {
    type: Number,
    required: true
  },
  expiryyear: {
    type: Number,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
});

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  name: String,
  review: String,
  // Other fields in your schema
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  }
});


const PaymentSchema = new mongoose.Schema({
  orderId: String,
  amount: Number,
  currency: String,
  status: String,
});


// Create a Coupon schema
const couponSchema = new mongoose.Schema({
  image: {
    title: String,
    filepath: String,
  },
  description: String,
  percentage: Number,
  details: String,
  expires: String,
  terms: {
    type: String,
    required: true,
  },
});



const bannerSchema = new mongoose.Schema({
  image: {
    title: String,
    filepath: String,
  },
  targetURL: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
});

const Banner = mongoose.model('Banner', bannerSchema);



// Create a Coupon model
const Coupon = mongoose.model('Coupon', couponSchema);

// Create a model based on the schema
const Review = mongoose.model('Review', reviewSchema);
const Payment = mongoose.model('Payment', PaymentSchema);
const Product = mongoose.model('Product', productSchema);
const Card = mongoose.model('Card', CardSchema);
const Cart = mongoose.model('Cart', cartSchema)
const Address = mongoose.model('Address', addressSchema);
const Order = mongoose.model('Order', orderSchema);
const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = {
  Payment,
  Product,
  Cart,
  Address,
  Order,
  Wishlist,
  Card,
  Review,
  Coupon,
  Banner
};
