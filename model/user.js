const mongoose = require('mongoose')
const jwt = require("jsonwebtoken");
const config = require("../config/index.js")
const user = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
})
user.methods.generateAccessJWT = function () {
    let payload = {
      id: this._id,
    };
    return jwt.sign(payload, config.SECRET_ACCESS_TOKEN, {
      expiresIn: '20m',
    });
};

module.exports = mongoose.model("user", user)