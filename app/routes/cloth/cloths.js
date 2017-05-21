var express = require('express');
var router = express.Router();
var Cloth = require('../../models/cloth');
var Kind = require('../../models/kind');


// 模糊查询服装
router.post('/query', function(req, rootRes, next) {
  var reg = new RegExp(req.body.keyword, 'i');
   Cloth.find({
     $or: [
       { 
         name: { $regex : reg },  // 服装名
       }, { 
         brand: { $regex : reg }, // 品牌
       }, { 
         title: { $regex : reg }, // 简述
       }, { 
         description: { $regex : reg }, // 详细描述 
       }
     ]
    }, function (err, res) {
      rootRes.send(res);
    });
});

// 获取服装列表(按照点赞升序)
router.get('/:kind_id', function(req, rootRes, next) {
   if (req.params.kind_id === 'all') {
    Cloth.find({ state: 'online'}).sort({ thumb_up: -1 }).exec(function (err, res) {
      rootRes.send(res);
    });
   } else {
     Kind.findById(req.params.kind_id, function(err, kind) {
       var query = {
         state: 'online',
       };
        if (!kind) {
          query.kind = '未分类';
        } else {
          query.kind = kind.name;
        }
        Cloth.find(query).sort({ thumb_up: -1 }).exec(function (err, res) {
          rootRes.send(res);
        });
     });
   }
});

module.exports = router;
