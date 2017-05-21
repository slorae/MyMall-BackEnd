var express = require('express');
var router = express.Router();
var User = require('../../../models/user');

// 获取所有地址
router.get('/', function(req, rootRes, next) {
   User.findAddressesByUserId(req.headers.id, function(err, res) {
      rootRes.send(res);
   });
});

module.exports = router;
