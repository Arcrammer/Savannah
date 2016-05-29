"use strict";

var express = require('express');
var router = express.Router();
var Seminar = require('../models/Seminar');

router.get('/:id', (req, res, next) => {
  let viewData = {
    filters: [
      'Upcoming',
      'Android',
      'AngularJS',
      'Backbone',
      'Back-End',
      'CoffeeScript',
      'Django',
      'Docker',
      'EmberJS',
      'ExpressJS',
      'Far Cry',
      'Final Fantasy',
      'Firewatch',
      'Front-End',
      'Git',
      'Grand Theft Auto',
      'Heroku',
      'iOS Development',
      'Laravel',
      'Less',
      'Linux',
      'Minecraft',
      'Node',
      'OS X Development',
      'React',
      'React Native',
      'Ruby on Rails',
      'Task Runners',
      'tvOS Development',
      'Ubuntu Server',
      'Sass',
      'watchOS Development',
      'WordPress',
      'WSGI'
    ],
    months: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ]
  };
  Seminar.find({idHash: req.params.id}, (err, seminar) => {
    viewData.seminar = seminar[0];
    viewData.title = viewData.seminar.title;
    res.render('seminar-detail', viewData);
  });
});

router.get('/', (req, res, next) => {
  let viewData = {
    title: "Seminars",
    filters: [
      'Upcoming',
      'Android',
      'AngularJS',
      'Backbone',
      'Back-End',
      'CoffeeScript',
      'Django',
      'Docker',
      'EmberJS',
      'ExpressJS',
      'Far Cry',
      'Final Fantasy',
      'Firewatch',
      'Front-End',
      'Git',
      'Grand Theft Auto',
      'Heroku',
      'iOS Development',
      'Laravel',
      'Less',
      'Linux',
      'Minecraft',
      'Node',
      'OS X Development',
      'React',
      'React Native',
      'Ruby on Rails',
      'Task Runners',
      'tvOS Development',
      'Ubuntu Server',
      'Sass',
      'watchOS Development',
      'WordPress',
      'WSGI'
    ]
  };
  Seminar.find({}, (err, seminars) => {
    viewData.seminars = seminars;
    res.render('seminars', viewData);
  })
});

router.post('/review', (req, res, next) => {
  // Save the review of the seminar
  Seminar.update({idHash: req.body.id_hash}, {
    $push: {
      reviews: {
        stars: req.body.star_count,
        body: req.body.review_body,
        author: {
          name: (req.user) ? req.user.full_name : req.body.full_name,
          photo: (req.user) ? req.user.photo : '',
          location: (req.user) ? req.user.location : req.body.location
        }
      }
    }
  }, (err) => {if (err) throw err;});
  res.redirect('/seminars/' + req.body.id_hash);
});

module.exports = router;
