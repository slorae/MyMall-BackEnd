var express = require('express');
var router = express.Router();
var Kind = require('../../models/kind');

// 所有分类
router.get('/', function(req, rootRes, next) {
    Kind.find({}, function(err, kinds) {
        return rootRes.send(kinds);
    });
});

// 新增分类
router.post('/', function(req, rootRes, next) {
  var kindEntity = new Kind(req.body);
  kindEntity.save(function(err, kind) {
    return rootRes.send(kind);
  });
});

// 编辑分类
router.patch('/:kind_id', function(req, rootRes, next) {
    Kind.findByIdAndUpdate(req.params.kind_id, {
        name: req.body.name,
    }, function(err) {
        Kind.findById(req.params.kind_id, function(err, kind) {
            Kind.find({kind: kind.name}, function(err, kinds) {
                if (kinds.length > 0) {
                    for (var i = 0; i <kinds.length; i++) {
                        Kind.findByIdAndUpdate(kinds[i]._id, {kind: req.body.name});
                    }
                }
                rootRes.send(kind);
            });
        });
    });
});

// 删除分类
router.delete('/:kind_id', function(req, rootRes, next) {
    Kind.findById(req.params.kind_id, function(err, kind) {
        if (err || !kind) return rootRes.status(404),send({code: 'no such kind'});
        Kind.find({kind: kind.name}, function(err, kinds) {
            if (kinds.length > 0) {
                for (var i = 0; i <kinds.length; i++) {
                    Kind.findByIdAndUpdate(kinds[i]._id, {kind: '未分类'});
                }
            }
            Kind.remove({
                _id: req.params.kind_id,
            }, function(err) {
                return rootRes.send('ok');
            });
        });
    })
    
});



module.exports = router;
