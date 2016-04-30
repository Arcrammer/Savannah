"use strict";

var express = require('express');
var router = express.Router();
var products = require('../data/amazon');

router.get('/', (req, res, next) => {
  let viewData = {
    title: 'Products',
    products: products.hardware._result
  };
  res.render('products', viewData);
});

router.get('/electronics', (req, res, next) => {
  products.electronics.then((electronics) => {
    var viewData = {
      title: "Electronics",
      products: electronics
    };
    res.render('products', viewData);
  });
});

router.get('/software', (req, res, next) => {
  products.software.then((software) => {
    let viewData = {
      title: "Software",
      products: software
    };
    res.render('products', viewData);
  });
});

router.get('/hardware', (req, res, next) => {
  products.hardware.then((hardware) => {
    let viewData = {
      title: "Hardware",
      products: hardware
    };
    res.render('products', viewData);
  });
});

router.get('/products/:asin', (req, res, next) => {
  products.with_asin(req.params.asin).then((result) => {
    let viewData = {
      title: 'Product Details',
      productAsin: result[0].ASIN[0],
      productInfo: result[0].ItemAttributes[0],
      productImages: result[0].ImageSets[0].ImageSet,
      productListPrice: result[0].Offers[0].Offer[0].OfferListing[0].Price[0].FormattedPrice,
      productComments: [{
        author: {
          name: 'Otis Bryant',
          imageFilename: 'otis_bryant.jpg'
        },
        time: 'Monday, 11 April, 2016',
        text: '<p>This product is lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent molestie elit vitae tortor blandit, tincidunt commodo velit feugiat.</p><p>Cras eros ligula, consequat at dui vitae, fermentum elementum nisl. Aenean volutpat sagittis nisl efficitur consectetur. Proin nec dignissim massa, a lobortis sapien. Proin pretium rhoncus commodo. Vivamus ipsum enim, pulvinar vel fermentum in, vehicula id dui.</p>'
      }]
    };
    res.render('product-detail', viewData);
  });
});

module.exports = router;
