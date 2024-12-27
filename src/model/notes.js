const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  categorie: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    default: null,
  },
  userId: {
    type: String,
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
});

const Note = mongoose.model("Note", noteSchema);

module.exports = Note;
