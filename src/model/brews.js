const mongoose = require("mongoose");

const brewSchema = new mongoose.Schema({
  brewName: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  bottleSize: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    default: null,
    required: true,
  },
  userId: {
    type: String,
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  slug: {
    type: String,
    allowNull: false,
    unique: true,
  },
  shareableLink: {
    type: String,
  },
  image: {
    type: String,
    default: null,
  },
});

const Brew = mongoose.model("Brew", brewSchema);

module.exports = Brew;
