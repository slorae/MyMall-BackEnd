var express = require('express');
var router = express.Router();
var User = require('../../../models/user');

// 注册
router.post('/', function(req, rootRes, next) {
  // 基件参数验证
  if (!req.body.account || !req.body.password) {
    res.status(403).send({
      code: 'need account and password',
    });
  }
  // 查看该账号是否已被注册
  User.find({
    account: req.body.account,
  }, function(err, res){
    if (res.length > 0) {
      rootRes.status(403).send({
        code: 'account_repeat',
      });
    } else {
      var user = new User({
        account : req.body.account,
        password: req.body.password,
        name: req.body.account,
        active_at: new Date(),
        type: 'user',
      });
      user.save(function (err, res) {
        // 存储 auth
        User.findByIdAndUpdate(res._id, {
          auth: res._id,
        }, function(err, authres){
            rootRes.send({
              code: 'ok',
            });
        })
      });
    }
  })
});

module.exports = router;
