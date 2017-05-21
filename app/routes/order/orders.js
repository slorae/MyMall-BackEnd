var express = require('express');
var router = express.Router();
var Order = require('../../models/order');

// 获取所有订单
router.get('/', function(req, rootRes, next) {
  Order.find({ user_id: req.headers.id}, function(err, res) {
    return rootRes.send(res);
  });

});

module.exports = router;
