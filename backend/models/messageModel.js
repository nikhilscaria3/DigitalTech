// Define Message schema and model using Mongoose
const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    sender: String,
    receiver: String,
    content: String,
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
    userSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  });
  
  
  const Message = mongoose.model('Message', messageSchema);
  
  module.exports = { Message };