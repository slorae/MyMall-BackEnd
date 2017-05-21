var express = require('express');
var router = express.Router();
var User = require('../../models/user');
var Order = require('../../models/order');
var Cloth = require('../../models/cloth');
var Comment = require('../../models/comment');
var Cart = require('../../models/cart');



// 获取所有用户 / 管理员
router.get('/users', function(req, rootRes, next) {
  User.count({ type: req.query.type, is_deleted: false}, function(err, count) {
    User.find({ type: req.query.type, is_deleted: false})
      .skip(parseInt(req.query.page) * parseInt(req.query.per_page))
      .limit(parseInt(req.query.per_page))
      .exec(function(err, users){ 
      let data = {
        paginate: {
          page: parseInt(req.query.page),
          per_page: parseInt(req.query.per_page),
          total_counts: count,
          total_pages: Math.ceil(count/req.query.per_page),
        },
      };
      data[req.query.type+'s'] = users;
      return rootRes.send(data);
    }); 
  });
});

// 获取所有订单
router.get('/orders', function(req, rootRes, next) {
  if (req.query.id) {
    return Order.findById(req.query.id, function(err, order) {
      if (err || !order) return rootRes.send({
        orders: [],
        paginate: {
          page: 0,
          per_page: parseInt(req.query.per_page),
          total_counts: 0,
          total_pages: 0,
        },
      });
      return rootRes.send({
        orders: [order],
        paginate: {
          page: 0,
          per_page: parseInt(req.query.per_page),
          total_counts: 1,
          total_pages: 0,
        },
      });
    });
  }
  var query = {};
  Order.count(query, function(err, count) {
    Order.find(query).skip(parseInt(req.query.page)).limit(parseInt(req.query.per_page)).exec(function(err, orders){ 
      return rootRes.send({
        orders: orders,
        paginate: {
          page: parseInt(req.query.page),
          per_page: parseInt(req.query.per_page),
          total_counts: count,
          total_pages: Math.ceil(count/req.query.per_page),
        },
      });
    }); 
  });
});

// 新增管理员
router.post('/user', function(req, rootRes, next) {
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
        name: req.body.name,
        active_at: new Date(),
        type: 'admin',
      });
      user.save(function (err, res) {
        // 存储 auth
        User.findByIdAndUpdate(res._id, {
          auth: res._id,
        }, function(err, authres){
            return rootRes.send({ code: 'ok' });
        })
      });
    }
  })
});

// 删除用户
router.delete('/user/:id', function(req, rootRes, next) {
  User.findByIdAndUpdate(req.params.id, {
    is_deleted: true,
    update_at: Date.now(),
  }, function(err, res) {
    return rootRes.send({code: 'ok'});
  });
});

// 获取所有服装
router.get('/cloths', function(req, rootRes, next) {
  Cloth.count({}, function(err, count) {
    Cloth.find({}).sort({ create_at: -1 })
    .skip(parseInt(req.query.page * parseInt(req.query.per_page)))
    .limit(parseInt(req.query.per_page))
    .exec(function(err, cloths){ 
      let data = {
        paginate: {
          page: parseInt(req.query.page),
          per_page: parseInt(req.query.per_page),
          total_counts: count,
          total_pages: Math.ceil(count/req.query.per_page),
        },
        cloths: cloths,
      };
      return rootRes.send(data);
    }); 
  });
});

// 管理员新创建服装
router.post('/cloth', function(req, rootRes, next) {
  var reqCloth = req.body;
  reqCloth.left = req.body.total;
  var cloth = new Cloth(reqCloth);
  cloth.save(function (err, res) {
    return rootRes.send(res);
  });
});

// 管理员更新服装
router.patch('/cloth/:id', function(req, rootRes, next) {
  req.body.left = req.body.total;
  Cloth.findByIdAndUpdate(req.params.id, req.body, function(err, res) {
    Cloth.findById(req.params.id, function(err, cloth) {
      return rootRes.send(cloth);
    });
  });

});

// 管理员更新服装状态
router.patch('/cloth/changestate/:id', function(req, rootRes, next) {
  var newState = req.body.state;
  Cloth.findById(req.params.id, function(err, cloth) {
    // 需要把其他推荐服装全部设置为 online
    if (cloth.state === 'online' && newState === 'recommend'){
      return Cloth.find({state: 'recommend'}, function(err, cloths) {
        if (cloths.length > 0) {
          Cloth.findByIdAndUpdate(cloths[0]._id, { state: 'online'}, function(err, res) {
            Cloth.findByIdAndUpdate(req.params.id, req.body, function(err, res) {
                return rootRes.send({code: 'ok'});
            });
          });
        } else {
          Cloth.findByIdAndUpdate(req.params.id, req.body, function(err, res) {
                return rootRes.send({code: 'ok'});
            });
        }
      });
    } else {
      return Cloth.findByIdAndUpdate(req.params.id, req.body, function(err, res) {
          return rootRes.send({code: 'ok'});
      });
    }
    return rootRes.status(404).send({code: 'err'})
  });


});

// 管理员设置今日推荐
router.patch('/cloth/today/recommend/:cloth_id', function(req, rootRes, next) {
  Cloth.findByIdAndUpdate(req.params.cloth_id, {
      state: 'recommend',
    }, function(err, res) {
        rootRes.send('ok');
    });
});

// 管理员获取服装的评论
router.get('/comments/:cloth_id', function(req, rootRes, next) {
  var condition = {
    cloth_id: req.params.cloth_id,
  };
  Comment.count(condition, function(err, count) {
    Comment.find(condition).skip(parseInt(req.query.page)).limit(parseInt(req.query.per_page)).exec(function(err, comments){ 
      return rootRes.send({
        paginate: {
          page: parseInt(req.query.page),
          per_page: parseInt(req.query.per_page),
          total_counts: count,
          total_pages: Math.ceil(count/req.query.per_page),
        },
        comments: comments,
      });
    }); 
  });
});
module.exports = router;
