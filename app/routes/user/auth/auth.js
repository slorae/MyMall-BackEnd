var express = require('express');
var router = express.Router();
var User = require('../../../models/user');

// login
router.post('/', function(req, rootRes, next) {
  if (!req.body.auth) {
    rootRes.status(401).send({
      code: 'need auth in request body',
    });
  }
  User.find({ auth: req.body.auth }, function(err, res) {
    if (res.length === 1) {
      User.findByIdAndUpdate(res[0]._id, {
        active_at: Date.now(),
      }, function(err, user) {
        rootRes.send({
          auth: {
            auth: user.auth,
            timestamp: ((new Date().getTime()) + 86400000 * 20),
          },
          user: {
            _id: user._id,
            account: user.account,
            name: user.name,
            avatar: user.avatar,
            create_at: user.create_at,
            active_at: user.active_at,
            type: user.type,
            balance: user.balance,
          }
        });
      });
    } else {
      return rootRes.status(401).send({
        code: 'no such user'
      });
    }
  });
});

module.exports = router;
