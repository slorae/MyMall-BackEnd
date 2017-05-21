var express = require('express');
var router = express.Router();
var User = require('../../models/user');
var Cloth = require('../../models/cloth');
var Comment = require('../../models/comment');


// 获取某件服装信息
router.get('/:cloth_id', function(req, rootRes, next) {
  Cloth.findById(req.params.cloth_id, function(err, res) {
    rootRes.send(res);
  });
});

// 今日推荐服装
router.get('/today/recommend', function(req, rootRes, next) {
  if (req.headers.authorization) {
    return User.findById(req.headers.authorization, function(err, user) {
      if (err || !user) return rootRes.status(401).send({code: 'no such user'});
      if (user.tag) {
        return Cloth.find({state: 'online', kind: user.tag})
          .sort({ thumb_up: -1 })
          .limit(10)
          .exec(function(err, cloths) {
            if (cloths.length === 0) {
              return Cloth.findOne({
                  state: 'recommend',
                }).limit(10).exec(function(err, cloth) {
                  rootRes.send([cloth]);
                });
            }
            rootRes.send(cloths);
        });
      } else {
        return Cloth.findOne({
            state: 'recommend',
          }).limit(10).exec(function(err, cloth) {
            rootRes.send([cloth]);
          });
      }
    })
  } else {
    // 最多只推10件服装
    return Cloth.findOne({
        state: 'recommend',
      }).limit(10).exec(function(err, cloth) {
        rootRes.send([cloth]);
      });
  }
});

// 点赞
router.post('/thumb_up/:cloth_id', function(req, rootRes, next) {
  Cloth.findById(req.params.cloth_id, function(err, res) {
    var newThumbUp = res.thumb_up + 1;
    Cloth.findByIdAndUpdate(req.params.cloth_id, {
        thumb_up: newThumbUp,
      }, function (err, res) {
        rootRes.send({
          thumb_up: newThumbUp,
        });
      });
  });
});

// 倒彩
router.post('/thumb_down/:cloth_id', function(req, rootRes, next) {
 Cloth.findById(req.params.cloth_id, function(err, res) {
    var newThumbDown = res.thumb_down + 1;
    Cloth.findByIdAndUpdate(req.params.cloth_id, {
        thumb_down: newThumbDown,
      }, function (err, res) {
        rootRes.send({
          thumb_down: newThumbDown,
        });
      });
  });
});


// 获取服装所有评论
router.get('/comments/all/:cloth_id', function(req, rootRes, next) {
	Comment.find({cloth_id : req.params.cloth_id}, function(err, comments) {
      return rootRes.send(comments);
	});
});

// 评论
router.post('/comments/new/:cloth_id', function(req, rootRes, next) {
	User.findById(req.headers.id, function(err, user) {
      Cloth.findById(req.params.cloth_id, function(err, cloth) {
	      var comment = new Comment({
	      	cloth_id : cloth._id, // 服装Id
          cloth_name: cloth.name, //服装名
          comment_body: req.body.comment, // 评论内容
          user: {
            user_id: user._id, // 用户ID
            name: user.name, // 用户姓名
            avatar: user.avatar, // 用户姓名
          },
	      });
	      comment.save(function(err, res) {
  			return rootRes.send(res);
	      });
		});
	});
});

// 回复
router.post('/comments/reply/:comment_id', function(req, rootRes, next) {
	User.findById(req.headers.id, function(err, user) {
      Comment.findByIdAndUpdate(req.params.comment_id, {
      	reply: { // 回复
          user_id: user._id, // 用户ID
          name: user.name, // 用户姓名
          avatar: user.avatar, // 用户姓名
          comment_body: req.body.body, // 回复内容
          create_at: Date.now(), //回复时间
        }, 
      }, function(err, cloth) {
	      Comment.findById(req.params.comment_id, function(err, comment) {
	      	return rootRes.send(comment);
	      });
		});
	});
});

// 删除服装评论
router.delete('/comments/delete/:comment_id', function(req, rootRes, next) {
  Comment.remove({_id: req.params.comment_id}, function(err, res) {
    return rootRes.send('ok');
  });
});

module.exports = router;
