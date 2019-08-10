const jwt = require("jsonwebtoken");
const keys = require("../config/keys");

const passport = require("passport");

//here we defined our custom middlewares

module.exports = {
  ensureAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      // req.flash('error_msg', 'Please log in to view that resource');
      console.log("Please log in to view that resource");
      //  res.json({ msg: "Please log in to view that resource" });
      res.sendStatus(403);
      //res.redirect("/users/login");
    }
  },

  verifyToken: function(req, res, next) {
    //here we check authentication of the user from thier token
    const bearerHeader = req.headers["authorization"];
    console.log("bearerHeader is " + bearerHeader);
    if (typeof bearerHeader !== "undefined") {
      const bearer = bearerHeader.split(" ");
      //  console.log(bearer);
      const bearerToken = bearer[1];

      req.token = bearerToken;

      next();
    } else {
      res.sendStatus(403); //if no user token so res will be forbidden
    }
  }
};
