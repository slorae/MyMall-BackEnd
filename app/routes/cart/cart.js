var express = require('express');
var router = express.Router();
var Cart = require('../../models/cart');
var Cloth = require('../../models/cloth');


// 每个用户只对应一个购物车，可以用 user_id 作为购物车的主键
// 获取单个购物车详情
router.get('/', function(req, rootRes, next) {
   Cart.findOne({
     user_id: req.headers.id,
   }, function(err, res) {
      // 购物车没有实例化过
      if (!res) {
        return rootRes.send([]);
      }
      rootRes.send(res);
   })
});

// 将服装加入购物车
router.post('/add/:cloth_id', function(req, rootRes, next) {
  // 查询到需要加载的服装
  Cloth.findById(req.params.cloth_id, function(err, cloth) {
    if (!cloth) return rootRes.status(400).send({code: 'no such cloth'});
    var newCloth = {
      cloth_id: cloth._id, // 服装 id
      name: cloth.name, // 服装名
      brand: cloth.brand, // 品牌
      cloth_cover: cloth.cloth_cover, // 封面
      kind: cloth.kind, // 类别
      price: cloth.price, // 价格
    };
    Cart.findOne({
        user_id: req.headers.id,
      }, function(err, cart) {
          // 购物车没有实例化过
          if (!cart) {
            var cartEnitity = new Cart({
              user_id: req.headers.id,
              cloths: [newCloth],
            });
            // 保存一个新购物车实例
            return cartEnitity.save(function(err, res) {
              return rootRes.send(res);
            });
          }
          // 购物车实例化过
           return Cart.findByIdAndUpdate(cart._id, { 
              $push: {
                'cloths' : newCloth,
              }
            }, { 
              safe: true, 
              upsert: true
            }, function(err, res) {
              // 重新查询一下购物车
              Cart.findById(cart._id, function(err, res){
                return rootRes.send(res); 
              });
            });
      });
  });
});

// 将服装取出购物车
router.delete('/delete/:id', function(req, rootRes, next) {
  Cart.update({user_id: req.headers.id },{ 
      $pull:{
        cloths: { _id:  req.params.id }
      }
    }, function(err, res){
        return rootRes.send('ok');
    });
});

module.exports = router;
