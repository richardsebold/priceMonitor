const mongoose = require("mongoose");

const { Schema } = mongoose

const User = mongoose.model(
  "User",
  new Schema(
    {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
    }
    ,
    password: {
      type: String,
      required: true,
    },
    image: {
        type: String,
        required: false,
    },
    phone: {
        type: String,
        required: false,
    }
  },
    { timestamps: true }
  ),
);

module.exports = User;
