"use strict";
var express = require('express');
var router = express.Router();
var passport = require('passport');
var flash = require('connect-flash');
var bcrypt = require('bcrypt');
var projectRootPath = require('app-root-path');
var multer = require('multer');
var crypto = require('crypto');
var mime = require('mime');
var User = require('../models/User');
var prettyjson = require('prettyjson');

// Multer doesn't now how to handle filenames >___>
var upload = multer({storage: multer.diskStorage({
  destination: function (req, file, done) {
    // Determine which directory to save the file to
    var savePath = projectRootPath + '/public/images';
    if (file.fieldname == "profile_photo") {
      // It's a profile photo
      savePath += '/users';
    } else if (file.fieldname == "profile_header_photo") {
      // It's a header photo
      savePath += '/user-headers';
    }
    done(null, savePath);
  },
  filename: function (req, file, done) {
    User.find({_id: req.user._id}, (err, user) => {
      var filename = req.user.first_name.toLowerCase()
        + "_"
        + req.user.last_name.toLowerCase()
        + '.'
        + mime.extension(file.mimetype);

      // Store the appropriate filenames in the database
      if (file.fieldname == "profile_photo") {
        // It's a profile photo
        user.photo = filename;
        try {
          User.update({_id: req.user._id}, {
            $set: {photo: filename}
          }, (err) => {
            if (err) throw err;
          });
        } catch (err) {
          console.error('err.message:', prettyjson.render(err.message));
        }
      } else if (file.fieldname == "profile_header_photo") {
        // It's a header photo
        user.header_photo = filename;
        try {
          User.update({_id: req.user._id}, {
            $set: {header_photo: filename}
          }, (err) => {
            if (err) throw err;
          });
        } catch (err) {
          console.error('err.message:', prettyjson.render(err.message));
        }
      }

      req.login(req.user, (err) => {
        done(null, filename);
      });
    });
  }
})});

// Routes
router.get('/profile', (req, res, next) => {
  User.find({_id: req.user._id}, (err, user) => {
    // Make Passport reauthenticate them so we
    // get the latest data in their session
    // which is what the view displays
    req.login(user[0], (err) => {
      // Update the user for the whole app
      req.app.locals.user = req.user;

      res.render('auth/profile', {
        title: 'Profile',
        saved: req.flash('saved')
      });
    });
  });
});

router.post('/profile/update', upload.fields([{
  name: 'profile_photo',
  maxCount: 1
}, {
  name: 'profile_header_photo',
  maxCount: 1
}]), (req, res, next) => {
  User.find({_id: req.user._id}, (err, user) => {
    var user = user[0];

    // Set submitted data if they provided it
    if (req.body.first_name) {
      user.full_name = req.body.first_name + " " + req.body.last_name;
    }
    user.first_name = req.body.first_name || user.first_name;
    user.last_name = req.body.last_name || user.last_name;
    user.email_address = req.body.email_address || user.email_address;
    user.location = req.body.location || user.location;

    let passwordsMatch = (req.body.password == req.body.password_confirmation);
    if (req.body.password && passwordsMatch) {
      // Change the users' password
      if (req.body.password) {
        var hashPassword = new Promise((fulfill, reject) => {
          bcrypt.hash(req.body.password, 12, (err, hashedPassword) => {
            if (err) reject(err);
            fulfill(hashedPassword);
          });
        });
      }
    }

    // Save those settings
    if (hashPassword) {
      hashPassword.then((hashedPassword) => {
        user.password = hashedPassword;
        user.save(() => {
          // Flash the 'Saved' message
          req.flash('saved', 'Your changes might have been saved but idk <span>🤓</span>');

          // Make Passport reauthenticate them so
          // we get the new data in their session
          req.login(req.user, () => {
            res.redirect('/auth/profile');
          });
        });
      });
    } else {
      // The passwords didn't match
      req.flash('saved', 'Those passwords didn\'t match.');
      res.redirect('/auth/profile');
    }
  });
});

router.get('/login', (req, res, next) => {
  res.render('auth/login', {
    title: 'Login',
    message: req.flash('error')
  });
});

router.post('/login', passport.authenticate('local', {
  successReturnToOrRedirect: '/',
  failureRedirect: '/auth/login',
  failureFlash: true
}));

router.get('/register', (req, res, next) => {
  res.render('auth/register', {
    title: 'Sign up'
  });
});

router.post('/register', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/auth/login',
  failureFlash: true
}));

router.get('/logout', (req, res, next) => {
  if (req.user) {
    console.info('"' + req.user.name + '" logged out.');
    req.logout();
  }
  res.redirect('/');
});

module.exports = router;
