var Analysis = require('../models/analysis');
var Order = require('../models/order');
var User = require('../models/user');
var schedule = require("node-schedule");
var moment = require("moment");
// 每晚23： 59 分统计一次数据
var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [0, new schedule.Range(1, 6)];
rule.hour = 12;
rule.minute = 40;
var j = schedule.scheduleJob(rule, function(){
    console.log('执行数据统计任务,当前时间是：', Date.now());
    var today = moment().format('L');
    // 当日产生订单统计
    Order.count({
        create_at: {
            "$gte": today
        }
    }, function(err, count) {
        var newData = new Analysis({
            type: 'order',
            number: count,
        });
        newData.save(function() {
        });
    });

    // 当日注册用户统计
    User.count({
        create_at: {
            "$gte": today
        }
    }, function(err, count) {
        var newData = new Analysis({
            type: 'people',
            number: count,
        });
        newData.save(function() {
        });
    });

    // 当日营业额统计
    Order.find({
        create_at: {
            "$gte": today
        },
        state: {
            "$ne": 'cancel',
        },
    }, function(err, orders) {
        var money = 0;
        for (var i = 0; i < orders.length; i++) {
            money += orders[i].pay_num;
        }
        var newData = new Analysis({
            type: 'income',
            number: money,
        });
        newData.save(function() {
        });
    });
});