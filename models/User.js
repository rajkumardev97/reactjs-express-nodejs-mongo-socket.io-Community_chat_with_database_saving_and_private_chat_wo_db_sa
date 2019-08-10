const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const UserSchema = new Schema({
  firstname: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  nickname: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  ilike: {
    type: String,
    required: true
  },
  nearcity: {
    type: String,
    required: true
  },
  maxdistance: {
    type: Number,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  phone: {
    type: Number,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String
  },
  age: {
    type: Number
  },
  profilepic: {
    type: String
  },
  coverpic: {
    type: String
  },
  myphotos: [],
  role: {
    type: String,
    default: "user"
  },
  userpost: [
    {
      postdesc: {
        type: String
      },
      postphoto: {
        type: String
      },
      date: {
        type: Date,
        default: Date.now
      }
    }
  ],
  mymatches: [
    {
      userid: {
        type: String
      },
      firstname: {
        type: String
      },
      lastname: {
        type: String
      },
      gender: {
        type: String
      },
      profilepic: {
        type: String
      },
      date: {
        type: Date,
        default: Date.now
      }
    }
  ],
  userpaymentstatus: {
    type: String,
    required: false,
    default: "paid"
  },
  totalDuration: {
    type: Number,
    required: false
  },
  fateshotchoosenum: {
    type: Number,
    required: false,
    default: 0
  },
  fateshotplayday: {
    type: String,
    required: false
  },
  fateshotplaycount: {
    type: Number,
    required: false,
    default: 0
  },
  resettoken: {
    type: String,
    required: false
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = User = mongoose.model("users", UserSchema);
