var express = require('express');
var router = express.Router();
var User = require('../../../models/user');

// login
router.post('/', function(req, rootRes, next) {
  User.findOne({ account: req.body.account, is_deleted: false}, function(err, user){
      if (!user) {
        return rootRes.status(403).send({ code: 'no such account' });
      } 
      user.comparePassword(req.body.password, function(err, isMatch){
          if (isMatch) {
            return rootRes.send({
              auth: {
                auth: user.auth,
                // 一天 86400000 毫秒，默认缓存 20天
                timestamp: ((new Date().getTime()) + 86400000 * 20),
              },
              user: {
                _id: user._id,
                account: user.account,
                name: user.name,
                avatar: user.avatar,
                create_at: user.create_at,
                active_at: user.update_at,
                type: user.type,
                balance: user.balance,
              },
            })
          } else {
            return rootRes.status(403).send({ code: 'password error' });
          }
      });
    });
});

module.exports = router;
