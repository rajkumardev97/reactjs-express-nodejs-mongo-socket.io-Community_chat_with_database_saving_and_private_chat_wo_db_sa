const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const CommunitychatsSchema = new Schema({
  id: {
    type: String
  },
  time: {
    type: String
  },
  message: {
    type: String
  },
  sender: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Communitychats = mongoose.model(
  "communitychats",
  CommunitychatsSchema
);
