var express = require('express');
var router = express.Router();
var User = require('../../models/user');
var bcrypt  = require('bcrypt');

// 获取单个用户信息
router.get('/:user_id', function(req, rootRes, next) {
  User.findById(req.params.user_id, function(err, user) {
    if (err || !user) return rootRes.status(404).send({code: 'no such user'});
    return rootRes.send(res);
  });
});

// 修改单个用户信息
router.patch('/:user_id', function(req, rootRes, next) {
  var mode = {};
  if (req.body.name) {
    mode.name = req.body.name;
  }
  if (req.body.avatar) {
    mode.avatar = req.body.avatar;
  }
  User.findByIdAndUpdate(req.params.user_id, mode, function(err, res) {
    if (req.body.name) {
      res.name = req.body.name;
    }
    if (req.body.avatar) {
      res.avatar = req.body.avatar;
    }
    return rootRes.send(res);
  });
});

// 修改用户密码
router.patch('/:user_id/password', function(req, rootRes, next) {
  User.findById(req.params.user_id, function(err, user) {
    if (err || !user) return rootRes.status(404).send({code: 'no such user'});
    user.comparePassword(req.body.old_password, function(err, isMatch){ 
      if (!isMatch)  return rootRes.status(403).send({code: 'old password error'});
      bcrypt.genSalt(10, function(err, salt) {
       bcrypt.hash(req.body.new_password, salt, function(err, hash) {
         User.findByIdAndUpdate(req.params.user_id, {
              password: hash,
            }, function(err, res) {
                return rootRes.send('ok');
            });
        });
      });
    });
  });
});

// 充值余额
router.patch('/:user_id/charge', function(req, rootRes, next) {
  User.findById(req.params.user_id, function(err, user) {
    if (err || !user) return rootRes.status(404).send({code: 'no such user'});
    var afterBalance = user.balance + parseInt(req.body.charge_number);
    User.findByIdAndUpdate(req.params.user_id, {
      balance: afterBalance,
    }, function(err, res) {
        User.findById(req.params.user_id, function(err, user) {
          return rootRes.send({
            balance: afterBalance,
          });
        });
    });
  });
});

// 打用户标签
router.patch('/tag/:user_id', function(req, rootRes, next) {
  User.findById(req.params.user_id, function(err, user) {
    if (err || !user) return rootRes.status(404).send({code: 'no such user'});
    User.findByIdAndUpdate(req.params.user_id, {
      tag: req.body.tag,
    }, function(err, res) {
        return rootRes.send({code: 'tag success'});
    });
  });
});

module.exports = router;
