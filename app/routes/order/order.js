var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var Order = require('../../models/order');
var Cart = require('../../models/cart');
var User = require('../../models/user');
var Cloth = require('../../models/user');

// 新建订单
router.post('/', function(req, rootRes, next) {
   var body = req.body.cloths;
   var cloths = [];
   var pay_num = 0;
   for (var i = 0; i< body.length; i++) {
     var temp = {
      cloth_id: body[i]._id,
      name: body[i].name,
      brand: body[i].brand,
      cloth_cover: body[i].cloth_cover,
      price: body[i].price,
      kind: body[i].kind,
     };
     cloths.push(temp);
     pay_num += body[i].price;
    // 从购物车中取出已经下单的服装
     Cart.update({user_id: req.headers.id }, { 
        $pull:{
          cloths: { _id: body[i]._id }
        }
     }, function(err, res) {
     });
   }
   var orderEntity = new Order({
     user_id: req.headers.id,
     cloths: cloths,
     address: req.body.address,
     has_pay: false,
     pay_num: pay_num,
     state: 'unpay',
   });
   orderEntity.save(function(err, res) {
    return rootRes.send(res);
   });
});

// 获取某个订单
router.get('/:id', function(req, rootRes, next) {
  Order.findById(req.params.id, function(err, order) { 
    return rootRes.send(order);
  });
});

// 删除订单
router.delete('/:id', function(req, rootRes, next) {
  Order.remove({_id: req.params.id}, function(err, res) { 
    return rootRes.send({code: 'ok'});
  });
});

// 修改订单
router.patch('/:id', function(req, rootRes, next) {
  // 保存，将数据返回
  var data = req.body;
  if (data.state === 'cancel') {
    User.findById(data.user_id, function(err, user) {
      var balance = user.balance + parseInt(data.pay_num);
      User.findByIdAndUpdate(data.user_id, {balance: balance}, function() {});
    });
  }
  data.update_at = Date.now();
  Order.findByIdAndUpdate(req.params.id, data, function(err, order) {
    Order.findById(req.params.id, function(err, order){
      return rootRes.send(order);
    });
  });
});

// 订单付款
router.patch('/:id/pay', function(req, rootRes, next) {
  // 保存，将数据返回
  User.findById(req.headers.id, function(err, user) {
    bcrypt.compare(req.body.password, user.password, function(err, isMatch){
      if (err) return rootRes.status(500).send(err);
      if (isMatch) {
        return Order.findById(req.body.order_id, function(err, order) {
          if (err || !order) rootRes.status(404).send({code: 'no such order'});
          Order.findByIdAndUpdate(req.body.order_id, {
            state: 'unsend',
            has_pay: true,
            update_at: Date.now(),
          }, function(err, res) {
            User.findById(req.headers.id, function(err, user) {
              var balance = user.balance - order.pay_num;
              User.findByIdAndUpdate(user._id, {
                  balance: balance,
                }, function (err, res) {
                  rootRes.send({code: 'ok'});
                });
            });
          })
        });
      }
      return rootRes.status(403).send({code: 'password error'});
    });
  });
});

module.exports = router;
