const express = require("express");

const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");

const session = require("express-session");
const MongoStore = require("connect-mongo")(session);

const expressValidator = require("express-validator");

const path = require("path");

const users = require("./routes/api/users");

const app = express();

// our server instance

var http = require("http").createServer(app);

// This creates our socket using the instance of the server
//var io = require("socket.io")(http);

var io = (module.exports.io = require("socket.io")(http));

const SocketManager = require("./SocketManager");

//And we can create a connection:
/*io.on("connection", () => {
  console.log("a user is connected");
});*/
io.on("connection", SocketManager);

// DB Config
const db = require("./config/keys").mongoURI;

mongoose.Promise = global.Promise;
//Connect to Mongo

mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("MongoDB Connected..."))
  .catch(err => console.log(err));

//For example, use the following code to serve images, CSS files, and JavaScript files in a directory named public:

//Now, you can load the files that are in the public directory:

//http://localhost:3000/images/kitten.jpg
//http://localhost:3000/css/style.css
//http://localhost:3000/js/app.js
//http://localhost:3000/images/bg.png
//http://localhost:3000/hello.html

var publicDir = require("path").join(__dirname, "public");
app.use(express.static(publicDir));

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Express Session middleware

app.use(
  session({
    secret: "mysupersecret",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: { maxAge: 180 * 60 * 1000 } //cookie expire after 180 min or 3 hours
    //well now session has been configured you are storing it mongodb on the server and on the client also still in the cookie and will expire after 3 hours
    //as we know that http is state less protocol where all the service provider on internet provide best service by the helping of sessions and cookies where most of time session maintain at the server side(like starbucks coffie server) and the cookie always store at client side(like assume starbucks member card (which has some info of client in terms of cookies) ) so lot of starbucks client has their different taste of coffies that they order prev time so starbucks server maintain the sessions of respective client cookies for helping,tracking,analyzing the each starbucks client
    //normally sessions are store at server side(but its less faster or server client communication which is take time at server side then if we store session at client side its much faster quick res or communication which is faster at client because there are no commu in server and client, session already maintaining at client side) but there are some application which store sessions at client side
    //session and cookie make stateful
    //disadvantage of storing session at client side is lot of space where cookie take around 4kb space at client side so best option to store session at server side
  })
);

// Passport Config
require("./config/passport")(passport);
// Passport middleware
app.use(passport.initialize());

app.use(passport.session());

{
  /*}
app.get("*", function(req, res, next) {
  res.locals.user = req.user || null;
  next();
});
*/
}

{
  /*}
app.get("*", function(req, res, next) {
  res.locals.user = req.user || null;
  if (!res.locals.user) {
    console.log("The res.locals.user value is : " + res.locals.user);
    console.log(req.user);
  } else {
    console.log("The res.locals.user value is : " + res.locals.user);
    res.locals.user.forEach(function(item) {
      console.log(item); // the item (ex. turkey)
    });
  }
  next();
});
*/
}

{
  /*

app.get("*", function(req, res, next) {
  res.locals.cart = req.session.cart;
  if (!req.session.cart) {
    console.log("cart is null");
  } else {
    console.log("cart has item" + req.session.cart);
    req.session.cart.forEach(function(item) {
      console.log(item); // the item (ex. turkey)
    });
  }
  next();
});
*/
}

//Express Messagess middleware
app.use(require("connect-flash")());
app.use(function(req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

//Set Global errors variables
app.locals.errors = null;

// Use Routes
app.use("/api/users", users);

const port = process.env.PORT || 5005;

var server = http.listen(port, () =>
  console.log(`Server running on port ${port}`)
);
