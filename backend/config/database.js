require('dotenv').config();
const mongoose = require('mongoose');

const connectDatabase = async () => {
  try {
    const url = process.env.DB_LOCAL_URI;
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB is connected');
    console.log('MongoDB URL:', url);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1); // Exit the process with a non-zero status code
  }
};

module.exports = connectDatabase;

