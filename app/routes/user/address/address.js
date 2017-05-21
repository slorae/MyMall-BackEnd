var express = require('express');
var router = express.Router();
var User = require('../../../models/user');

// 新建地址
router.post('/', function(req, rootRes, next) {
  // 保存，将数据返回
  User.saveAddressById(req.headers.id, req.body, function(err, res) {
    rootRes.send(res);
  });
});

// 修改地址
router.patch('/:address_id', function(req, rootRes, next) {
  // 保存，将数据返回
  User.saveAddressById(req.headers.id, req.body, function(err, res) {
    rootRes.send(res);
  });
});
module.exports = router;
