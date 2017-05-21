var express = require('express');
var router = express.Router();
var Analysis = require('../../models/analysis');
var Order = require('../../models/order');
var Kind = require('../../models/kind');
var Cloth = require('../../models/cloth');


// 所有订单
router.get('/order_cover', function(req, rootRes, next) {
    // unpay:未付款 unsend: 未发货 unassign: 未签收 assign： 已签收  cancel: 取消
    var result = {
      labels: ['未付款', '未发货', '未签收', '已签收', '取消'],
      data: [],
    };
    Order.count({
      state: 'unpay',
    },function(err, count) {
      result.data.push(count);
      Order.count({
        state: 'unsend',
      },function(err, count) {
        result.data.push(count);
        Order.count({
          state: 'unassign',
        },function(err, count) {
          result.data.push(count);
          Order.count({
            state: 'assign',
          },function(err, count) {
            result.data.push(count);
             Order.count({
              state: 'cancel',
            },function(err, count) {
              result.data.push(count);
              rootRes.send(result);
            });
          });
        });
      });
    });
});

// 注册用户
router.get('/people', function(req, rootRes, next) {
    Analysis.find({ type: 'people'}).exec(function(err, res) {
      var result = {
        labels: [],
        data: [],
      };
      for(var i = 0; i < res.length; i ++) {
        result.labels.push(res[i].create_at);
        result.data.push(res[i].number);
      }
      rootRes.send(result);
    });
});


// 营业额统计
router.get('/income', function(req, rootRes, next) {
    Analysis.find({ type: 'income'}).exec(function(err, res) {
      var result = {
        labels: [],
        data: [],
      };
      for(var i = 0; i < res.length; i ++) {
        result.labels.push(res[i].create_at);
        result.data.push(res[i].number);
      }
      rootRes.send(result);
    });
});

// 订单数量
router.get('/order_raise', function(req, rootRes, next) {
    Analysis.find({ type: 'order'}).exec(function(err, res) {
      var result = {
        labels: [],
        data: [],
      };
      for(var i = 0; i < res.length; i ++) {
        result.labels.push(res[i].create_at);
        result.data.push(res[i].number);
      }
      rootRes.send(result);
    });
});

module.exports = router;
