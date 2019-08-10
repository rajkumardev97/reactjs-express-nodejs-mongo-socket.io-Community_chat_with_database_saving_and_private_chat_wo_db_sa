const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const MatcheduserlistSchema = new Schema({
  myid: {
    type: String
  },
  matcheduserid: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Matcheduserlist = mongoose.model(
  "matcheduserlist",
  MatcheduserlistSchema
);
