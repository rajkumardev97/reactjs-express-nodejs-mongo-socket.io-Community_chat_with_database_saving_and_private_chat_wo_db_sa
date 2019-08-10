const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
var fs = require("fs");
const passport = require("passport");

var dateFormat = require("dateformat");

const nodemailer = require("nodemailer");

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "client/public/uploads/userprofile/");
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + file.originalname);
  }
});

var uploadprofilepic = multer({ storage: storage }); //setting the default folder for multer

///////////

const storagemypht = multer.diskStorage({
  destination: function(req, files, cb) {
    cb(null, "client/public/uploads/myphotos/");
  },
  filename: function(req, files, cb) {
    cb(null, Date.now() + files.originalname);
  }
});

const uploadmyphotos = multer({
  storage: storagemypht
});

/////////////

const storagecoverpic = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "client/public/uploads/usercover/");
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + file.originalname);
  }
});

var uploadcoverpic = multer({ storage: storagecoverpic }); //setting the default folder for multer

//////////

/////////////

const storageuserpostpt = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "client/public/uploads/userpostphoto/");
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + file.originalname);
  }
});

var uploadpostphoto = multer({ storage: storageuserpostpt }); //setting the default folder for multer

//////////

const authorizedrole = require("../../config/authorizeroles");

//const { ensureAuthenticated, isAdmin } = require("../../config/auth"); //this middleware check only login user can access routes

const { ensureAuthenticated, verifyToken } = require("../../config/auth"); //this middleware check only login user can access routes
// Load Input Validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

const validateChangedPassInput = require("../../validation/changepassword");

// Load User model
const User = require("../../models/User");
// Load Matcheduserlist model
const Matcheduserlist = require("../../models/Matcheduserlist");

// @route   GET api/users/test
// @desc    Tests users route
// @access  Public
router.get("/test", (req, res) => res.json({ msg: "Users Works" }));

router.post("/checkemailexist", (req, res) => {
  console.log("received email is : " + req.body.email);
  //User => its User model
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      errors.email = "Email already exists";
      return res.status(400).json(errors);
    } else {
      res.json({ success: "done" });
    }
  });
});

// @route   POST api/users/register
// @desc    Register user
// @access  Public
router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body); //here we pulled out errors and isValid from validateRegisterInput() this function where re.body include everything that sent to its routes in this case name,email,mobile and password

  // Check Validation
  if (!isValid) {
    //if isValid is not empty its mean errors object has got some errors so in this case it will redirect to the register
    return res.status(400).json(errors);
  }
  //User => its User model
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      errors.email = "Email already exists";
      return res.status(400).json(errors);
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: "200", // Size
        r: "pg", // Rating
        d: "mm" // Default
      });

      const newUser = new User({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        nickname: req.body.nickname,
        gender: req.body.gender,
        ilike: req.body.ilike,
        nearcity: req.body.nearcity,
        maxdistance: req.body.maxdistance,
        location: req.body.location,
        phone: req.body.phone,
        email: req.body.email,
        avatar,
        password: req.body.password,
        profilepic:"https://fatedate.emspare.com/public/uploads/userprofile/defaultprofile.jpg",
        coverpic:"https://fatedate.emspare.com/public/uploads/usercover/defaultcover.jpg"
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash; //set password to hash password
          newUser
            .save()
            .then(user => res.json(user)) //here we send back new user register information as a response from the success server side
            .catch(err => console.log(err));
        });
      });
    }
  });
});

// @route   GET api/users/login
// @desc    Login User / Returning JWT Token
// @access  Public
router.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body); //here we pulled out errors and isValid from validateRegisterInput() this function where re.body include everything that sent to its routes in this case name,email,mobile and password

  // Check Validation
  if (!isValid) {
    //if isValid is not empty its mean errors object has got some errors so in this case it will redirect to the register
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  // Find user by email
  User.findOne({ email }).then(user => {
    //using this user we can access all the information like user.id,user.email,user.mobile etc

    // Check for user
    if (!user) {
      errors.email = "User not found";
      return res.status(404).json(errors);
    }

    // Check Password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        // res.json({ msg: "Success" });

        // User Matched

        const payload = {
          id: user.id,
          role: user.role,
          firstname: user.firstname,
          lastname: user.lastname,
          nickname: user.nickname,
          gender: user.gender,
          ilike: user.ilike,
          nearcity: user.nearcity,
          maxdistance: user.maxdistance,
          location: user.location,
          phone: user.phone,
          avatar: user.avatar,
          email: user.email,
          age: user.age,
          profilepic: user.profilepic,
          coverpic: user.coverpic,
          myphotos: user.myphotos,
          userpost: user.userpost
        }; // Sign Token
        jwt.sign(
          payload,
          keys.secretOrKey, //here we set the key(secret from the config/keys.js) with payload(login user information)
          { expiresIn: "24h" }, //24 hour the key will expire the user should again login
          (err, token) => {
            //here we set the token and send as response to the authenticated user
            res.json({
              success: true,
              token: "Bearer " + token
            });
          }
        );
      } else {
        return res.status(400).json({ password: "Password incorrect" });
      }
    });
  });
});

// @route   GET api/users/current   //who ever token belongs too
// @desc    Return current user
// @access  Private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      mobile: req.user.mobile,
      avatar: req.user.avatar
    });
  }
);

router.post("/forgotpassword", (req, res) => {
  const email = req.body.email;

  // Find user by email
  User.findOne({ email }).then(user => {
    //using this user we can access all the information like user.id,user.email,user.mobile etc

    let errors = {};
    let emailexist = true;
    // Check for user
    if (!user) {
      console.log("Your Email is not exist !!");
      errors.message = "Your Email is not exist !!";
      errors.className = "alert-danger";
      emailexist = false;
      return res.status(404).json(errors);
    }

    if (emailexist) {
      let useremail = user.email;
      let userpassword = user.password;
      console.log(
        "user email is exist!! Ready to send password reset link to user email : " +
          useremail
      );

      // Reset Token
      user.resettoken = jwt.sign(
        { email: user.email },
        keys.secretOrKey, //here we set the key(secret from the config/keys.js) with payload(login user information)
        { expiresIn: "1h" } //1 hour the key will expire the user should again login
      );

      user
        .save()
        .then(user => {
          const output = `
        <p>Hello ${user.name}</p>
         
        <p>You recently request a password reset link. Please click on the link below to reset your password:</p><br /> 
        <a href="http://localhost:3000/reset-password/${
          user.resettoken
        }">http://localhost:3000/reset-password</a>
      `;

          // create reusable transporter object using the default SMTP transport
          let transporter = nodemailer.createTransport({
            host: "mail.nvoos.com",
            port: 25,
            secure: false, // true for 465, false for other ports
            auth: {
              user: "test@nvoos.com", // your nvoos email address like test@nvoos.com
              pass: "test@123" //password
            },
            tls: {
              rejectUnauthorized: false
            }
          });

          // setup email data with unicode symbols
          let mailOptions = {
            from: "test@nvoos.com", // sender address
            to: `${useremail}`, // list of receivers
            subject: "Reset Your Password || Earthmoving Software", // Subject line
            text: "Reset Your Password", // plain text body
            html: output // html body
          };

          // send mail with defined transport object
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              return console.log(error);
            }
            console.log("Message sent: %s", info.messageId);
            // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

            res.json({ success: "check your mail" });
          });
        })
        .catch(err => {
          errors.message = "Something went wrong !!";
          errors.className = "alert-danger";

          return res.status(404).json(errors);
        });
    }
  });
});

router.get("/resetpassword/:token", (req, res) => {
  User.findOne({ resettoken: req.params.token }).then(user => {
    let errors = {};
    errors.message = "Something went wrong !!";
    errors.className = "alert-danger";

    var token = req.params.token;
    jwt.verify(token, keys.secretOrKey, function(err, decoded) {
      if (err) {
        console.log("token is invalid");
        errors.message = "Reset Password link has expired !!";
        errors.className = "alert-danger";

        return res.status(404).json(errors); //Token has expired or invalid
      } else {
        if (!user) {
          errors.message = "Reset Password link has expired !!";
          errors.className = "alert-danger";

          return res.status(404).json(errors);
        } else {
          console.log("token is valid");
          res.json(user);
        }
      }
    });
  });
});

router.put("/saveresetpassword/", (req, res) => {
  var useremail = req.body.email;

  console.log("email received:" + useremail);
  User.findOne({ email: req.body.email }).then(user => {
    let errors = {};
    errors.message = "Something went wrong !!";
    errors.className = "alert-danger";
    if (user) {
      if (!req.body.password == "" || !req.body.confirmpassword == "") {
        bcrypt.compare(req.body.password, user.password).then(isMatch => {
          if (isMatch) {
            console.log("user password should be different!!");
            errors.message = "user password should be different!!";
            errors.className = "alert-danger";

            return res.status(404).json(errors); //Token has expired or invalid
          } else {
            user.password = req.body.password;

            bcrypt.genSalt(10, (err, salt) => {
              bcrypt.hash(user.password, salt, (err, hash) => {
                if (err) throw err;
                user.password = hash; //set password to hash password
                user.resettoken = "";

                user
                  .save()
                  .then(user => {
                    const output = `
                  <p>Hello ${user.name}</p>
                   
                  <p>Your Password Changed Successfully!!</p>
                `;

                    // create reusable transporter object using the default SMTP transport
                    let transporter = nodemailer.createTransport({
                      host: "mail.nvoos.com",
                      port: 25,
                      secure: false, // true for 465, false for other ports
                      auth: {
                        user: "test@nvoos.com", // your nvoos email address like test@nvoos.com
                        pass: "test@123" //password
                      },
                      tls: {
                        rejectUnauthorized: false
                      }
                    });

                    // setup email data with unicode symbols
                    let mailOptions = {
                      from: "test@nvoos.com", // sender address
                      to: `${useremail}`, // list of receivers
                      subject:
                        "Password Reset Successfully || Earthmoving Software", // Subject line
                      text: "Password Reset", // plain text body
                      html: output // html body
                    };

                    // send mail with defined transport object
                    transporter.sendMail(mailOptions, (error, info) => {
                      if (error) {
                        return console.log(error);
                      }
                      console.log("Message sent: %s", info.messageId);
                      // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

                      res.json({ success: "password reset successfully" });
                    });
                  })
                  .catch(err => console.log(err));
              });
            });
          }
        });
      }
    } else {
      console.log("user is not found");
      errors.message = "Something Went Wrong Try After Some Time !!";
      errors.className = "alert-danger";

      return res.status(404).json(errors); //Token has expired or invalid
    }
  });
});

router.post(
  "/updateuserdata",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    const errors = {};

    const name = req.body.name;
    const email = req.body.email;
    const mobile = req.body.mobile;
    const website = req.body.website;

    //console.log("data received : " + name, email, mobile, website);

    User.findOneAndUpdate({ email: email }, req.body, { new: true })
      .then(user => {
        user
          .save()
          .then(user => {
            res.json(user);
          })
          .catch(err => {
            errors.message = "Something Went Wrong Try After Some Time !!";
            errors.className = "alert-danger";

            return res.status(404).json(errors);
          });
        //console.log("user update : " + user);
      })
      .catch(err => {
        errors.message = "Something Went Wrong Try After Some Time !!";
        errors.className = "alert-danger";

        return res.status(404).json(errors);
      });
  }
);

router.post(
  "/changeduserpass",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    const { errors, isValid } = validateChangedPassInput(req.body); //here we pulled out errors and isValid from validateChangedPassInput() this function where re.body include everything that sent to its routes in this case currentpassword and newpassword,newpassword2

    // Check Validation
    if (!isValid) {
      //if isValid is not empty its mean errors object has got some errors so in this case it will redirect to the register
      return res.status(400).json(errors);
    }

    const email = req.user.email;
    const currentpassword = req.body.currentpassword;
    const newpassword = req.body.newpassword;
    const newpassword2 = req.body.newpassword2;

    /*   console.log(
      "data is : " + email,
      currentpassword,
      newpassword,
      newpassword2
    );*/
    // Find user by email
    User.findOne({ email }).then(user => {
      //using this user we can access all the information like user.id,user.email,user.mobile etc

      let errors = {};
      let emailexist = true;
      // Check for user
      if (!user) {
        console.log("Your Email is not exist !!");
        errors.message = "Your Email is not exist !!";
        errors.className = "alert-danger";
        emailexist = false;
        return res.status(404).json(errors);
      }

      if (emailexist) {
        let useremail = user.email;
        //  let userpassword = user.password;
        console.log("user email is exist!! " + useremail);
        // Check Password
        bcrypt.compare(currentpassword, user.password).then(isMatch => {
          if (isMatch) {
            // res.json({ msg: "Success" });

            bcrypt.genSalt(10, (err, salt) => {
              bcrypt.hash(newpassword, salt, (err, hash) => {
                if (err) throw err;
                user.password = hash; //set password to hash password

                user
                  .save()
                  .then(user => {
                    const output = `
                  <p>Hello ${user.name}</p>
                   
                  <p>Your Password Changed Successfully!!</p>
                `;

                    // create reusable transporter object using the default SMTP transport
                    let transporter = nodemailer.createTransport({
                      host: "mail.nvoos.com",
                      port: 25,
                      secure: false, // true for 465, false for other ports
                      auth: {
                        user: "test@nvoos.com", // your nvoos email address like test@nvoos.com
                        pass: "test@123" //password
                      },
                      tls: {
                        rejectUnauthorized: false
                      }
                    });

                    // setup email data with unicode symbols
                    let mailOptions = {
                      from: "test@nvoos.com", // sender address
                      to: `${useremail}`, // list of receivers
                      subject:
                        "Password Changed Successfully || Earthmoving Software", // Subject line
                      text: "Password Changed", // plain text body
                      html: output // html body
                    };

                    // send mail with defined transport object
                    transporter.sendMail(mailOptions, (error, info) => {
                      if (error) {
                        return console.log(error);
                      }
                      console.log("Message sent: %s", info.messageId);
                      // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

                      res.json({ success: "password changed successfully" });
                    });
                  })
                  .catch(err => console.log(err));
              });
            });

            // User Matched
            console.log("Your current password is matched");
          } else {
            errors.message = "Your current password is not matched!!";
            errors.className = "alert-danger";
            return res.status(400).json(errors);
          }
        });
      }
    });
  }
);

//////////////////

router.post(
  "/updateprofilepic",
  uploadprofilepic.single("fileData"),
  (req, res, next) => {
    console.log("here we will upload the user profile pic!!");

    //logger.info(req.file); //this will be automatically set by multer
    //logger.info(req.body);
    //below code will read the data from the upload folder. Multer     will automatically upload the file in that folder with an  autogenerated name
    const userFields = {};
    if (req.body.userid) userFields.userid = req.body.userid;
    if (req.body.email) userFields.email = req.body.email;
    console.log("user id is : " + userFields.userid);
    console.log("user email is : " + userFields.email);

    if (req.file.path) {
      fs.readFile(req.file.path, (err, contents) => {
        if (err) {
          console.log("Error: ", err);
        } else {
          console.log("File contents ", contents);

          console.log("req.file.path is : ", req.file.path);
          userFields.profilepic =
            "http://192.168.222.1:3000/uploads/userprofile/" +
            req.file.filename;
          console.log("file path is set to : " + userFields.profilepic);

          User.findByIdAndUpdate(userFields.userid, {
            $set: { profilepic: userFields.profilepic },
            new: true
          })
            .then(user => {
              if (user) {
                console.log("user profile pic updated!!");
                console.log("user data is : " + user);
                res.json(user);
              }
            })
            .catch(err => {
              return res.status(400).json({ msg: err });
            });
        }
      });
    } else {
      console.log("req.file.path is not defined!!");
    }
  }
);

router.post(
  "/updatecoverpic",
  uploadcoverpic.single("fileData"),
  (req, res, next) => {
    console.log("here we will upload the user cover pic!!");

    //logger.info(req.file); //this will be automatically set by multer
    //logger.info(req.body);
    //below code will read the data from the upload folder. Multer     will automatically upload the file in that folder with an  autogenerated name
    const userFields = {};
    if (req.body.userid) userFields.userid = req.body.userid;
    if (req.body.email) userFields.email = req.body.email;
    console.log("user id is : " + userFields.userid);
    console.log("user email is : " + userFields.email);

    if (req.file.path) {
      fs.readFile(req.file.path, (err, contents) => {
        if (err) {
          console.log("Error: ", err);
        } else {
          console.log("File contents ", contents);

          console.log("req.file.path is : ", req.file.path);
          userFields.coverpic =
            "http://192.168.222.1:3000/uploads/usercover/" + req.file.filename;
          console.log("file path is set to : " + userFields.coverpic);

          User.findByIdAndUpdate(userFields.userid, {
            $set: { coverpic: userFields.coverpic },
            new: true
          })
            .then(user => {
              if (user) {
                console.log("user cover pic updated!!");
                console.log("user data is : " + user);
                res.json(user);
              }
            })
            .catch(err => {
              return res.status(400).json({ msg: err });
            });
        }
      });
    } else {
      console.log("req.file.path is not defined!!");
    }
  }
);

router.post("/uploadmyphotos", uploadmyphotos.any(), (req, res, next) => {
  console.log("here we will upload the myphotos !!");

  //logger.info(req.file); //this will be automatically set by multer
  //logger.info(req.body);
  //below code will read the data from the upload folder. Multer     will automatically upload the file in that folder with an  autogenerated name
  const userFields = {};
  if (req.body.userid) userFields.userid = req.body.userid;
  if (req.body.email) userFields.email = req.body.email;
  console.log("user id is : " + userFields.userid);
  console.log("user email is : " + userFields.email);

  User.findOne({ _id: userFields.userid })
    .then(async user => {
      if (user) {
        console.log("insert my photos start!!");

        if (req.files) {
          for (let i = 0; i < req.files.length; i += 1) {
            await user.myphotos.unshift(
              "http://192.168.222.1:3000/uploads/myphotos/" +
                req.files[i].filename
            );

            console.log("photo " + i + " : " + req.files[i].filename);
          }

          console.log("insert my photos finish!!");
          user.save().then(user => {
            console.log("all my photos save successfully!!");
            res.json(user);
          });
        }
      }
    })
    .catch(err => {
      return res.status(400).json({ msg: err });
    });
});

router.post(
  "/createuserpost",
  uploadpostphoto.single("fileData"),
  (req, res, next) => {
    console.log("here we will upload the user post pic!!");

    const userFields = {};
    if (req.body.userid) userFields.userid = req.body.userid;
    if (req.body.email) userFields.email = req.body.email;
    if (req.body.postdesc) userFields.postdesc = req.body.postdesc;
    console.log("user id is : " + userFields.userid);
    console.log("user email is : " + userFields.email);
    console.log("user postdesc is : " + userFields.postdesc);

    if (req.file.path) {
      fs.readFile(req.file.path, (err, contents) => {
        if (err) {
          console.log("Error: ", err);
        } else {
          console.log("File contents ", contents);

          console.log("req.file.path is : ", req.file.path);
          userFields.postphoto =
            "http://192.168.222.1:3000/uploads/userpostphoto/" +
            req.file.filename;
          console.log("file path is set to : " + userFields.postphoto);

          User.findOne({ _id: userFields.userid })
            .then(async user => {
              if (user) {
                console.log("post create start");
                var postdata = {
                  postdesc: userFields.postdesc,
                  postphoto: userFields.postphoto
                };

                await user.userpost.unshift(postdata);
                user.save().then(user => {
                  console.log("user post created!!");
                  console.log("user data is : " + user);
                  console.log("post create end");
                  res.json(user);
                });
              }
            })
            .catch(err => {
              return res.status(400).json({ msg: err });
            });
        }
      });
    } else {
      console.log("req.file.path is not defined!!");
    }
  }
);

router.get("/userbyid/:id", (req, res, next) => {
  var userid = req.params.id;
  console.log("user id is : " + userid);
  User.findOne({ _id: userid })
    .then(user => {
      if (user) {
        res.json(user);
      }
    })
    .catch(err => {
      return res.status(400).json({ msg: err });
    });
});

router.post("/edituserprofile", (req, res, next) => {
  var userid = req.body.userid;
  console.log("user id is : " + userid);
  User.findByIdAndUpdate(userid, req.body, function(
    //req.body => stockdata that we send from its action from [editStock]
    err,
    user
  ) {
    if (err) {
      console.log("user profile update error is : " + err);
      return res.status(400).json({ msg: err });
    }

    res.json(user);
  }).catch(err => {
    return res.status(400).json({ msg: err });
  });
});

router.get("/mysixphotosuserbyid/:id", (req, res, next) => {
  var userid = req.params.id;
  console.log("user id is : " + userid);
  User.findOne({ _id: userid })
    .then(async user => {
      if (user) {
        var mysixpotos = [];

        for (var i = 0; i <= 5; i++) {
          if (user.myphotos[i]) {
            await mysixpotos.push(user.myphotos[i]);
          }
        }

        res.json(mysixpotos);
      }
    })
    .catch(err => {
      return res.status(400).json({ msg: err });
    });
});

router.get("/setfateshottoken/:id", (req, res) => {
  var userid = req.params.id;
  console.log("received userid is : " + userid);
  // Find user by id
  User.findOne({ _id: userid }).then(user => {
    //using this user we can access all the information like user.id,user.email,user.mobile etc

    let errors = {};
    let idexist = true;
    // Check for user
    if (!user) {
      console.log("Your Id is not exist !!");
      errors.message = "Your Id is not exist !!";
      errors.className = "alert-danger";
      idexist = false;
      return res.status(404).json(errors);
    }

    if (idexist) {
      if (user.userpaymentstatus == "paid") {
        console.log("paid user request!!");

        if (user.totalDuration == 15) {
          console.log("totalDuration is already set : " + user.totalDuration);
          user.totalDuration = 15;
          // user.fateshotchoosenum = 0;
        } else {
          console.log("totalDuration is new set : " + user.totalDuration);

          user.totalDuration = 15;
          //user.fateshotchoosenum = 0;
        }

        user
          .save()
          .then(user => {
            // console.log(user);
            var totalDuration = user.totalDuration;

            console.log("totalDuration is : " + totalDuration);
            res.json(totalDuration);
          })
          .catch(err => {
            errors.message = "Something went wrong !!";
            errors.className = "alert-danger";

            return res.status(404).json(errors);
          });
      } else {
        console.log("free user request!!");

        if (user.fateshotplayday) {
          console.log("user.fateshotplayday is already set for day");
          jwt.verify(user.fateshotplayday, keys.secretOrKey, function(
            err,
            decoded
          ) {
            if (err) {
              console.log("token is invalid");
              errors.message = "token link has expired !!";
              errors.className = "alert-danger";

              return res.status(404).json(errors); //Token has expired or invalid
            } else {
              if (decoded) {
                var expdate = dateFormat(`${decoded.newdate}`, "dd-mm-yyyy");
                var currentdate = dateFormat(`${new Date()}`, "dd-mm-yyyy");

                console.log("decoded token is : " + expdate);

                console.log("currentdate is : " + currentdate);

                if (expdate == currentdate) {
                  //if expdate token date is less then now date so its mean time to intialize new date 1 current day for user
                  console.log("exp date and today date is same free user");

                  if (parseInt(user.fateshotplaycount) == 10) {
                    console.log(
                      "fateshotplaycount is : " +
                        user.fateshotplaycount +
                        "so you cannot play more today!!"
                    );

                    errors.message = "You can only play 10 times per day";
                    errors.className = "alert-danger";

                    var freelimitexceed = "freelimitexceed";

                    return res.json(freelimitexceed);
                  } else {
                    console.log(
                      "fateshotplaycount is : " +
                        user.fateshotplaycount +
                        " so you can play " +
                        (10 - parseInt(user.fateshotplaycount)) +
                        " times today!!"
                    );

                    if (user.totalDuration == 15) {
                      console.log(
                        "totalDuration is already set : " + user.totalDuration
                      );
                      user.totalDuration = 15;
                      user.fateshotplaycount =
                        parseInt(user.fateshotplaycount) + 1;
                    } else {
                      console.log(
                        "totalDuration is new set : " + user.totalDuration
                      );

                      user.totalDuration = 15;
                      user.fateshotplaycount =
                        parseInt(user.fateshotplaycount) + 1;
                    }

                    user
                      .save()
                      .then(user => {
                        //console.log(user);
                        var totalDuration = user.totalDuration;

                        console.log("totalDuration is : " + totalDuration);
                        res.json(totalDuration);
                      })
                      .catch(err => {
                        errors.message = "Something went wrong !!";
                        errors.className = "alert-danger";

                        return res.status(404).json(errors);
                      });
                  }
                } else {
                  console.log(
                    "expdate and currentdate is not same of free user"
                  );

                  // fateshotplayday Token
                  user.fateshotplayday = jwt.sign(
                    { newdate: new Date() },
                    keys.secretOrKey, //here we set the key(secret from the config/keys.js) with payload(login user information)
                    { expiresIn: "24h" } //1 hour the key will expire the user should again login
                  );

                  if (user.totalDuration == 15) {
                    console.log(
                      "totalDuration is already set : " + user.totalDuration
                    );
                    user.totalDuration = 15;
                    user.fateshotplaycount = 1;
                  } else {
                    console.log(
                      "totalDuration is new set : " + user.totalDuration
                    );

                    user.totalDuration = 15;
                    user.fateshotplaycount = 1;
                  }

                  user
                    .save()
                    .then(user => {
                      // console.log(user);
                      var totalDuration = user.totalDuration;

                      console.log("totalDuration is : " + totalDuration);
                      res.json(totalDuration);
                    })
                    .catch(err => {
                      errors.message = "Something went wrong !!";
                      errors.className = "alert-danger";

                      return res.status(404).json(errors);
                    });
                }
              }
            }
          });
        } else {
          console.log("user.fateshotplayday is not set for day");

          // fateshotplayday Token
          user.fateshotplayday = jwt.sign(
            { newdate: new Date() },
            keys.secretOrKey, //here we set the key(secret from the config/keys.js) with payload(login user information)
            { expiresIn: "24h" } //1 hour the key will expire the user should again login
          );

          if (user.totalDuration == 15) {
            console.log("totalDuration is already set : " + user.totalDuration);
            user.totalDuration = 15;
            user.fateshotplaycount = 1;
          } else {
            console.log("totalDuration is new set : " + user.totalDuration);

            user.totalDuration = 15;
            user.fateshotplaycount = 1;
          }

          user
            .save()
            .then(user => {
              // console.log(user);
              var totalDuration = user.totalDuration;

              console.log("totalDuration is : " + totalDuration);
              res.json(totalDuration);
            })
            .catch(err => {
              errors.message = "Something went wrong !!";
              errors.className = "alert-danger";

              return res.status(404).json(errors);
            });
        }
      }
    }
  });
});
router.get("/resetfateshottoken/:id", (req, res) => {
  var userid = req.params.id;
  console.log("received userid is : " + userid);
  // Find user by id
  User.findOne({ _id: userid }).then(user => {
    //using this user we can access all the information like user.id,user.email,user.mobile etc

    let errors = {};
    let idexist = true;
    // Check for user
    if (!user) {
      console.log("Your Id is not exist !!");
      errors.message = "Your Id is not exist !!";
      errors.className = "alert-danger";
      idexist = false;
      return res.status(404).json(errors);
    }

    if (idexist) {
      if (user.userpaymentstatus == "paid") {
        console.log("paid user request!!");

        user.totalDuration = 0;
        user.fateshotchoosenum = 0;

        user
          .save()
          .then(user => {
            // console.log(user);
            var totalDuration = user.totalDuration;

            console.log("totalDuration is : " + totalDuration);
            res.json(totalDuration);
          })
          .catch(err => {
            errors.message = "Something went wrong !!";
            errors.className = "alert-danger";

            return res.status(404).json(errors);
          });
      } else {
        console.log("free user request!!");

        if (user.fateshotplaycount == 10) {
          console.log(
            "fateshotplaycount is : " +
              user.fateshotplaycount +
              "so you cannot play more today!!"
          );

          errors.message = "You can only play 10 times per day";
          errors.className = "alert-danger";
          var freelimitexceed = "freelimitexceed";

          return res.json(freelimitexceed);
        } else {
          console.log(
            "fateshotplaycount is : " +
              user.fateshotplaycount +
              " so you can play " +
              (10 - parseInt(user.fateshotplaycount)) +
              " times today!!"
          );

          user.totalDuration = 0;
          user.fateshotchoosenum = 0;

          user
            .save()
            .then(user => {
              //   console.log(user);
              var totalDuration = user.totalDuration;

              console.log("totalDuration is : " + totalDuration);
              res.json(totalDuration);
            })
            .catch(err => {
              errors.message = "Something went wrong !!";
              errors.className = "alert-danger";

              return res.status(404).json(errors);
            });
        }
      }
    }
  });
});

router.get("/fateshotmatcher/:choosenum&:userid", (req, res) => {
  var userid = req.params.userid;
  var choosenum = parseInt(req.params.choosenum);

  console.log("received userid is : " + userid);
  console.log("received choosenum is : " + choosenum);

  // Find user by id
  User.findOne({ _id: userid }).then(user => {
    //using this user we can access all the information like user.id,user.email,user.mobile etc

    let errors = {};
    let idexist = true;
    // Check for user
    if (!user) {
      console.log("Your Id is not exist !!");
      errors.message = "Your Id is not exist !!";
      errors.className = "alert-danger";
      idexist = false;
      return res.status(404).json(errors);
    }

    if (idexist) {
      if (user.userpaymentstatus == "paid") {
        console.log("paid user request!!");

        user.fateshotchoosenum = choosenum;

        user
          .save()
          .then(user => {
            var mymatchesarr = user.mymatches;

            var mymatcheslen = user.mymatches.length;

            //here we make match and if it is found then insert in thier match list array
            //  console.log(user);

            if(user.ilike=="both"){
              User.aggregate([
                //stage 1
                {
                  $match: {
                    _id: { $ne: user._id }, //exclude requesting user id
                    fateshotchoosenum: { $gt: 0, $eq: choosenum }
                  }
                }
              ])
                .then(user => {
                  var muserfound = user;
                  //matched user array of object
                  if (muserfound.length) {
                    console.log("matched user found");
                    console.log(muserfound);
                    var toparruser = muserfound[0];
                    console.log("toparruser is : " + toparruser);
                    //here we check match user exist in requesting user match arrays
                    console.log(
                      "-->here we check match user exist in requesting user match arrays start<--"
                    );
              
                    if (mymatcheslen == 0) {
                      console.log("mymatches length is :" + mymatcheslen);
              
                      console.log("Ready to insert first match user to my match start");
                      Matcheduserlist.find({
                        matcheduserid: muserfound[0]._id
                      }).then(matcheduserlist => {
                        if (matcheduserlist.length) {
                          //user has already match with someone (top matched user locked with someone)
                          console.log(
                            "user has already match with someone (top matched user locked with someone)"
                          );
              
                          var checkmatchedarr = "false";
                          res.json(checkmatchedarr);
                        } else {
                          //user has no match with someone (top matched user are not locked with someone)
              
                          console.log(
                            "user has no match with someone (top matched user are not locked with someone)"
                          );
              
                          const myidwithmatchedusr = {
                            myid: userid, //requested user id
                            matcheduserid: muserfound[0]._id
                          };
                          new Matcheduserlist(myidwithmatchedusr)
                            .save()
                            .then(matcheduserlist => {
                              const matchedusridwithmy = {
                                myid: muserfound[0]._id, //matched user id
                                matcheduserid: userid //requested user id
                              };
              
                              new Matcheduserlist(matchedusridwithmy)
                                .save()
                                .then(matcheduserlist => {
                                  User.findOne({ _id: userid }).then(user => {
                                    user.totalDuration = 0;
                                    user.choosenum = 0;
                                    user.save().then(user => {
                                      console.log(
                                        "my reset totalDuration and choosenum to 0!!"
                                      );
              
                                      User.findOne({ _id: muserfound[0]._id }).then(user => {
                                        user.totalDuration = 0;
                                        user.choosenum = 0;
                                        user.save().then(user => {
                                          console.log(
                                            "match user reset totalDuration and choosenum to 0!!"
                                          );
                                          var checkmatchedarr = "true";
                                          res.json(checkmatchedarr);
                                        });
                                      });
                                    });
                                  });
                                });
                            });
                        }
                      });
                    } else {
                      //req user has mymatcharr len greater then 0
                      console.log("req user has mymatcharr len greater then 0!!");
                      var useridfoundinmcarr = true;
                      console.log("mymatches length is :" + mymatcheslen);
                      for (var u = 0; u < mymatchesarr.length; u++) {
                        if (toparruser._id == mymatchesarr[u].userid) {
                          console.log("matched user already in requested user mymatch array");
                          // useridfoundinmcarr = false;
                          // var nomatchfound = "nomatchfound";
                          // res.json(nomatchfound);
                          var checkmatchedarr = "false";
                          return res.json(checkmatchedarr);
                        }
                      }
              
                      if (useridfoundinmcarr) {
                        console.log("new matched user found : " + toparruser);
                        console.log("Ready to insert first match user to my match start");
                        Matcheduserlist.find({
                          matcheduserid: muserfound[0]._id
                        }).then(matcheduserlist => {
                          if (matcheduserlist.length) {
                            //user has already match with someone (top matched user locked with someone)
                            console.log(
                              "user has already match with someone (top matched user locked with someone)"
                            );
              
                            var checkmatchedarr = "false";
                            res.json(checkmatchedarr);
                          } else {
                            //user has no match with someone (top matched user are not locked with someone)
              
                            console.log(
                              "user has no match with someone (top matched user are not locked with someone)"
                            );
              
                            const myidwithmatchedusr = {
                              myid: userid, //requested user id
                              matcheduserid: muserfound[0]._id
                            };
                            new Matcheduserlist(myidwithmatchedusr)
                              .save()
                              .then(matcheduserlist => {
                                const matchedusridwithmy = {
                                  myid: muserfound[0]._id, //matched user id
                                  matcheduserid: userid //requested user id
                                };
              
                                new Matcheduserlist(matchedusridwithmy)
                                  .save()
                                  .then(matcheduserlist => {
                                    User.findOne({ _id: userid }).then(user => {
                                      user.totalDuration = 0;
                                      user.choosenum = 0;
                                      user.save().then(user => {
                                        console.log(
                                          "my reset totalDuration and choosenum to 0!!"
                                        );
              
                                        User.findOne({ _id: muserfound[0]._id }).then(
                                          user => {
                                            user.totalDuration = 0;
                                            user.choosenum = 0;
                                            user.save().then(user => {
                                              console.log(
                                                "match user reset totalDuration and choosenum to 0!!"
                                              );
                                              var checkmatchedarr = "true";
                                              res.json(checkmatchedarr);
                                            });
                                          }
                                        );
                                      });
                                    });
                                  });
                              });
                          }
                        });
                      }
                    }
                    console.log(
                      "-->here we check match user exist in requesting user match arrays end<--"
                    );
                  } else {
                    console.log("no matched user found in aggregation user array!!");
              
                    //errors.message = "Sorry,No Match Found";
                    // errors.className = "alert-danger";
                    //  var nomatchfound = "nomatchfound";
                    var checkmatchedarr = "false";
                    return res.json(checkmatchedarr);
                  }
                })
                .catch(err => {
                  console.log("match error is : " + err);
                });
              

            }else{
              
            User.aggregate([
              //stage 1
              {
                $match: {
                  _id: { $ne: user._id }, //exclude requesting user id
                  fateshotchoosenum: { $gt: 0, $eq: choosenum },
                  gender: { $eq: user.ilike }
                }
              }
            ])
              .then(user => {
                var muserfound = user;
                //matched user array of object
                if (muserfound.length) {
                  console.log("matched user found");
                  console.log(muserfound);
                  var toparruser = muserfound[0];
                  console.log("toparruser is : " + toparruser);
                  //here we check match user exist in requesting user match arrays
                  console.log(
                    "-->here we check match user exist in requesting user match arrays start<--"
                  );

                  if (mymatcheslen == 0) {
                    console.log("mymatches length is :" + mymatcheslen);

                    console.log(
                      "Ready to insert first match user to my match start"
                    );
                    Matcheduserlist.find({
                      matcheduserid: muserfound[0]._id
                    }).then(matcheduserlist => {
                      if (matcheduserlist.length) {
                        //user has already match with someone (top matched user locked with someone)
                        console.log(
                          "user has already match with someone (top matched user locked with someone)"
                        );

                        var checkmatchedarr = "false";
                        res.json(checkmatchedarr);
                       
                      } else {
                        //user has no match with someone (top matched user are not locked with someone)

                        console.log(
                          "user has no match with someone (top matched user are not locked with someone)"
                        );

                        const myidwithmatchedusr = {
                          myid: userid, //requested user id
                          matcheduserid: muserfound[0]._id
                        };
                        new Matcheduserlist(myidwithmatchedusr)
                          .save()
                          .then(matcheduserlist => {
                            const matchedusridwithmy = {
                              myid: muserfound[0]._id, //matched user id
                              matcheduserid: userid //requested user id
                            };

                            new Matcheduserlist(matchedusridwithmy)
                              .save()
                              .then(matcheduserlist => {
                                User.findOne({ _id: userid }).then(user => {
                                  user.totalDuration = 0;
                                  user.choosenum = 0;
                                  user.save().then(user => {
                                    console.log(
                                      "my reset totalDuration and choosenum to 0!!"
                                    );

                                    User.findOne({ _id: muserfound[0]._id }).then(user => {
                                      user.totalDuration = 0;
                                      user.choosenum = 0;
                                      user.save().then(user => {
                                        console.log(
                                          "match user reset totalDuration and choosenum to 0!!"
                                        );
                                        var checkmatchedarr = "true";
                                        res.json(checkmatchedarr);
                                        
                                      });
                                    });

                                    
                                  });
                                });
                                
                              });
                          });
 
                      }
                    });
                  }else {
                    //req user has mymatcharr len greater then 0
                    console.log("req user has mymatcharr len greater then 0!!")
                    var useridfoundinmcarr = true;
                    console.log("mymatches length is :" + mymatcheslen);
                    for (var u = 0; u < mymatchesarr.length; u++) {
                      if (toparruser._id == mymatchesarr[u].userid) {
                        console.log(
                          "matched user already in requested user mymatch array"
                        );
                        // useridfoundinmcarr = false;
                        // var nomatchfound = "nomatchfound";
                        // res.json(nomatchfound);
                        var checkmatchedarr = "false";
                        return res.json(checkmatchedarr);
                         
                      }
                    }

                    if (useridfoundinmcarr) {
                      console.log("new matched user found : " + toparruser);
                      console.log(
                        "Ready to insert first match user to my match start"
                      );
                      Matcheduserlist.find({
                        matcheduserid: muserfound[0]._id
                      }).then(matcheduserlist => {
                        if (matcheduserlist.length) {
                          //user has already match with someone (top matched user locked with someone)
                          console.log(
                            "user has already match with someone (top matched user locked with someone)"
                          );
  
                          var checkmatchedarr = "false";
                          res.json(checkmatchedarr);
                         
                        } else {
                          //user has no match with someone (top matched user are not locked with someone)
  
                          console.log(
                            "user has no match with someone (top matched user are not locked with someone)"
                          );
  
                          const myidwithmatchedusr = {
                            myid: userid, //requested user id
                            matcheduserid: muserfound[0]._id
                          };
                          new Matcheduserlist(myidwithmatchedusr)
                            .save()
                            .then(matcheduserlist => {
                              const matchedusridwithmy = {
                                myid: muserfound[0]._id, //matched user id
                                matcheduserid: userid //requested user id
                              };
  
                              new Matcheduserlist(matchedusridwithmy)
                                .save()
                                .then(matcheduserlist => {
                                  User.findOne({ _id: userid }).then(user => {
                                    user.totalDuration = 0;
                                    user.choosenum = 0;
                                    user.save().then(user => {
                                      console.log(
                                        "my reset totalDuration and choosenum to 0!!"
                                      );
  
                                      User.findOne({ _id: muserfound[0]._id }).then(user => {
                                        user.totalDuration = 0;
                                        user.choosenum = 0;
                                        user.save().then(user => {
                                          console.log(
                                            "match user reset totalDuration and choosenum to 0!!"
                                          );
                                          var checkmatchedarr = "true";
                                          res.json(checkmatchedarr);
                                          
                                        });
                                      });
  
                                      
                                    });
                                  });
                                  
                                });
                            });
   
                        }
                      });
                    }
                  }
                  console.log(
                    "-->here we check match user exist in requesting user match arrays end<--"
                  );
                } else {
                  console.log("no matched user found in aggregation user array!!");

                  //errors.message = "Sorry,No Match Found";
                 // errors.className = "alert-danger";
                //  var nomatchfound = "nomatchfound";
                var checkmatchedarr = "false";
                return res.json(checkmatchedarr);
               
                }
              })
              .catch(err => {
                console.log("match error is : " + err);
              });

            }

          })
          .catch(err => {
            errors.message = "Something went wrong !!";
            errors.className = "alert-danger";

            return res.status(404).json(errors);
          });
      } else {
        console.log("free user request!!");

        if (user.fateshotplaycount == 10) {
          console.log(
            "fateshotplaycount is : " +
              user.fateshotplaycount +
              "so you cannot play more today!!"
          );

          errors.message = "You can only play 10 times per day";
          errors.className = "alert-danger";
          var freelimitexceed = "freelimitexceed";

          return res.json(freelimitexceed);
        } else {
          console.log(
            "fateshotplaycount is : " +
              user.fateshotplaycount +
              " so you can play " +
              (10 - parseInt(user.fateshotplaycount)) +
              " times today!!"
          );

          user.fateshotchoosenum = choosenum;

          user
            .save()
            .then(user => {
              var mymatchesarr = user.mymatches;

              var mymatcheslen = user.mymatches.length;
              //here we make match and if it is found then insert in thier match list array
      //  console.log(user);

      User.aggregate([
        //stage 1
        {
          $match: {
            _id: { $ne: user._id }, //exclude requesting user id
            fateshotchoosenum: { $gt: 0, $eq: choosenum },
            gender: { $eq: user.ilike }
          }
        }
      ])
        .then(user => {
          var muserfound = user;
          //matched user array of object
          if (muserfound.length) {
            console.log("matched user found");
            console.log(muserfound);
            var toparruser = muserfound[0];
            console.log("toparruser is : " + toparruser);
            //here we check match user exist in requesting user match arrays
            console.log(
              "-->here we check match user exist in requesting user match arrays start<--"
            );

            if (mymatcheslen == 0) {
              console.log("mymatches length is :" + mymatcheslen);

              console.log("Ready to insert first match user to my match start");
              Matcheduserlist.find({
                matcheduserid: muserfound[0]._id
              }).then(matcheduserlist => {
                if (matcheduserlist.length) {
                  //user has already match with someone (top matched user locked with someone)
                  console.log(
                    "user has already match with someone (top matched user locked with someone)"
                  );

                  var checkmatchedarr = "false";
                  res.json(checkmatchedarr);
                } else {
                  //user has no match with someone (top matched user are not locked with someone)

                  console.log(
                    "user has no match with someone (top matched user are not locked with someone)"
                  );

                  const myidwithmatchedusr = {
                    myid: userid, //requested user id
                    matcheduserid: muserfound[0]._id
                  };
                  new Matcheduserlist(myidwithmatchedusr)
                    .save()
                    .then(matcheduserlist => {
                      const matchedusridwithmy = {
                        myid: muserfound[0]._id, //matched user id
                        matcheduserid: userid //requested user id
                      };

                      new Matcheduserlist(matchedusridwithmy)
                        .save()
                        .then(matcheduserlist => {
                          User.findOne({ _id: userid }).then(user => {
                            user.totalDuration = 0;
                            user.choosenum = 0;
                            user.save().then(user => {
                              console.log(
                                "my reset totalDuration and choosenum to 0!!"
                              );

                              User.findOne({ _id: muserfound[0]._id }).then(
                                user => {
                                  user.totalDuration = 0;
                                  user.choosenum = 0;
                                  user.save().then(user => {
                                    console.log(
                                      "match user reset totalDuration and choosenum to 0!!"
                                    );
                                    var checkmatchedarr = "true";
                                    res.json(checkmatchedarr);
                                  });
                                }
                              );
                            });
                          });
                        });
                    });
                }
              });
            } else {
              //req user has mymatcharr len greater then 0
              console.log("req user has mymatcharr len greater then 0!!");
              var useridfoundinmcarr = true;
              console.log("mymatches length is :" + mymatcheslen);
              for (var u = 0; u < mymatchesarr.length; u++) {
                if (toparruser._id == mymatchesarr[u].userid) {
                  console.log(
                    "matched user already in requested user mymatch array"
                  );
                  // useridfoundinmcarr = false;
                  // var nomatchfound = "nomatchfound";
                  // res.json(nomatchfound);
                  var checkmatchedarr = "false";
                  return res.json(checkmatchedarr);
                }
              }

              if (useridfoundinmcarr) {
                console.log("new matched user found : " + toparruser);
                console.log(
                  "Ready to insert first match user to my match start"
                );
                Matcheduserlist.find({
                  matcheduserid: muserfound[0]._id
                }).then(matcheduserlist => {
                  if (matcheduserlist.length) {
                    //user has already match with someone (top matched user locked with someone)
                    console.log(
                      "user has already match with someone (top matched user locked with someone)"
                    );

                    var checkmatchedarr = "false";
                    res.json(checkmatchedarr);
                  } else {
                    //user has no match with someone (top matched user are not locked with someone)

                    console.log(
                      "user has no match with someone (top matched user are not locked with someone)"
                    );

                    const myidwithmatchedusr = {
                      myid: userid, //requested user id
                      matcheduserid: muserfound[0]._id
                    };
                    new Matcheduserlist(myidwithmatchedusr)
                      .save()
                      .then(matcheduserlist => {
                        const matchedusridwithmy = {
                          myid: muserfound[0]._id, //matched user id
                          matcheduserid: userid //requested user id
                        };

                        new Matcheduserlist(matchedusridwithmy)
                          .save()
                          .then(matcheduserlist => {
                            User.findOne({ _id: userid }).then(user => {
                              user.totalDuration = 0;
                              user.choosenum = 0;
                              user.save().then(user => {
                                console.log(
                                  "my reset totalDuration and choosenum to 0!!"
                                );

                                User.findOne({ _id: muserfound[0]._id }).then(
                                  user => {
                                    user.totalDuration = 0;
                                    user.choosenum = 0;
                                    user.save().then(user => {
                                      console.log(
                                        "match user reset totalDuration and choosenum to 0!!"
                                      );
                                      var checkmatchedarr = "true";
                                      res.json(checkmatchedarr);
                                    });
                                  }
                                );
                              });
                            });
                          });
                      });
                  }
                });
              }
            }
            console.log(
              "-->here we check match user exist in requesting user match arrays end<--"
            );
          } else {
            console.log("no matched user found in aggregation user array!!");

            //errors.message = "Sorry,No Match Found";
            // errors.className = "alert-danger";
            //  var nomatchfound = "nomatchfound";
            var checkmatchedarr = "false";
            return res.json(checkmatchedarr);
          }
        })
        .catch(err => {
          console.log("match error is : " + err);
        });
            })
            .catch(err => {
              errors.message = "Something went wrong !!";
              errors.className = "alert-danger";

              return res.status(404).json(errors);
            });
        }
      }
    }
  });
});

router.get("/fateshotmatcheddata/:userid", (req, res) => {
  var userid = req.params.userid;
   
  console.log("fateshotmatcheddata received userid is : " + userid); 

  // Find user by id
  User.findOne({ _id: userid }).then(user => {
    //using this user we can access all the information like user.id,user.email,user.mobile etc

    let errors = {};
    let idexist = true;
    // Check for user
    if (!user) {
      console.log("Your Id is not exist !!");
      errors.message = "Your Id is not exist !!";
      errors.className = "alert-danger";
      idexist = false;
      return res.status(404).json(errors);
    }

    if (idexist) {
       
      Matcheduserlist.findOne({myid:userid}).then(matcheduserlist=>{

        console.log("////////// fateshotmatcheddata start /////////")
       
        if(matcheduserlist){
          console.log("matcheduserlist is set") 
           console.log("myid has match to :"+matcheduserlist)
           var myid=matcheduserlist.myid
           var matcheduserid= matcheduserlist.matcheduserid
  
          User.findOne({_id:matcheduserid}).then(user=>{
           var matched=user
            console.log("matched user for id : "+userid+" is : "+user.firstname)

            User.findOne({_id:myid}).then(user=>{

              var matcheduserinsert=true
              
              for(var i=0;i<user.mymatches.length;i++){
                if(user.mymatches[i]._id==matcheduserid){
                  console.log("matched user already found in mymatches array!!")
                  matcheduserinsert=false 
                  
                  Matcheduserlist.findOneAndRemove({myid:userid}).then(response=>{
                    console.log("my id remove from Matcheduserlist")
                  res.json(matched)
                }).catch(err=>{
                  console.log("myid remove from Matcheduserlist err is : "+err)
                })
                  
                }
              }

              if(matcheduserinsert){

                console.log("insert new match user in mymatch arr")

                var newmatch={
                  userid:matched._id,
                  firstname:matched.firstname,
                  lastname:matched.lastname,
                  gender:matched.gender,
                  profilepic:matched.profilepic
                }


            user.mymatches.unshift(newmatch)

            user.save().then(user=>{
              console.log("new match save successfully!!")
              Matcheduserlist.findOneAndRemove({myid:userid}).then(response=>{
                console.log("my id remove from Matcheduserlist")
              res.json(matched)
            }).catch(err=>{
              console.log("myid remove from Matcheduserlist err is : "+err)
            })
            })
            
              }
            
            }) 
          })
        }else{
          console.log("matcheduserlist is not set")
          console.log("myid has no match !!")
          var nomatchfound = "nomatchfound";
          res.json(nomatchfound);
        }

        console.log("////////// fateshotmatcheddata end /////////")
      })
         
      
    }
  });
});



router.get("/getmymatchesuser/:userid", (req, res) => {
  var userid = req.params.userid;
   
  console.log("getmymatchesuser received userid is : " + userid); 

  // Find user by id
  User.findOne({ _id: userid }).then(async user => {
    //using this user we can access all the information like user.id,user.email,user.mobile etc

    let errors = {};
    let idexist = true;
    // Check for user
    if (!user) {
      console.log("Your Id is not exist !!");
      errors.message = "Your Id is not exist !!";
      errors.className = "alert-danger";
      idexist = false;
      return res.status(404).json(errors);
    }

    if (idexist) {
       
     var mymatches=user.mymatches

     var finalmatchuserdata=[]
console.log("mymatches user data gethering start!!")
for(var i=0;i<user.mymatches.length;i++){
 await User.findOne({_id:user.mymatches[i].userid}).then(async user=>{
    
console.log("mymatches user found no is : "+i)
const userdata={
  userid:user._id,
  firstname:user.firstname,
  lastname:user.lastname,
  profilepic:user.profilepic,
  date:user.date
}

await finalmatchuserdata.unshift(userdata)
  }).catch(err=>{
    console.log("getmymatchesuser error is : "+err)
    res.json(finalmatchuserdata)
  })
}

console.log("mymatches user data gethering end!!")

         console.log("finalmatchuserdata is : "+finalmatchuserdata)
         res.json(finalmatchuserdata)
      
    }
  });
});



module.exports = router;
