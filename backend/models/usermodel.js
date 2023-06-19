const mongoose = require('mongoose')


const userSchema = new mongoose.Schema({
    username: String,
    lastname: String,
    password: String,
    email: String,
    gender: String,
    mobilenumber: Number,
    status: {
        type: String,
        enum: ['blocked', 'unblocked'], // Update the enum values here
        default: 'unblocked'
    },
    otp: {
        code: String,
        expiresAt: Date,
    }
})

const User = mongoose.model('User', userSchema)

const adminSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    otp: {
        code: String,
        expiresAt: Date,
    }
})

const Admin = mongoose.model('Admin', adminSchema)

module.exports = {
    User, Admin
}