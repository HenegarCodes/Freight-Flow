const mongoose = require('mongoose');
const { type } = require('os');

const userSchema = new mongoose.Schema({
    Name: {type: String, required: true},
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

module.exports = mongoose.model('User', userSchema);
