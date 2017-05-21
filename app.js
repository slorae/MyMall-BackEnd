// 第三方库
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var fs = require('fs');
// 自定义定时任务
require('./app/helpers/timer');

// 设置允许跨域请求数据
app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
  res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,PATCH,OPTIONS");
  res.header("X-Powered-By",' 3.2.1')

  // 让options请求快速返回
  if(req.method === "OPTIONS") {
    res.end();
    return;
  }
  if (req.originalUrl === '/auth' || 
      req.originalUrl === '/login' ||
      req.originalUrl === '/cloth/today/recommend' || 
      req.originalUrl === '/cloths' || 
      req.originalUrl === '/register' || 
      req.originalUrl === '/upload' ||
      req.originalUrl.substring(0,7) === '/static' ||
      (req.originalUrl.substring(0,14) === '/cloth/comments' && req.method === "GET")) {
    next();
  } else {
    //做一次身份验证 验证成功则将id放进请求头带给下一步操作
    if (req.headers.authorization) {
      User.find({ auth: req.headers.authorization}, function(err, r) {
        if (err) {
          return res.status(500).send(err);
        }
        if (r.length === 1) {
          req.headers.id = r[0]._id;
          next();
        } else {
          return res.status(401).send({
            code: 'auth error'
          });
        }
      });
    } else {
      // 如果 authorization 不存在 则直接结束
      res.status(401).send({
        code: 'need authorization',
      });
    }
  }
});

// 静态资源托管
app.use('/static',express.static('upload'));
// 自定义方法集
var User = require('./app/models/user');
// 上传图片
app.use('/upload', require('./app/routes/upload/upload'));

// 写入日志文件
var logger = require('morgan');
var accessLogStream = fs.createWriteStream('./log/access.log', {flags: 'a'})
app.use(logger('common', {stream: accessLogStream}));

// cookie 和 body 中间件
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// 错误处理 中间件
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send({
    message: ' 500 error, please contact me at olive.wang@daocloud.io',
    error: err.stack,
  });
});

// 用户基本信息相关
app.use('/login', require('./app/routes/user/login/login'));
app.use('/register', require('./app/routes/user/register/register'));
app.use('/auth', require('./app/routes/user/auth/auth'));
app.use('/user', require('./app/routes/user/user'));
app.use('/address', require('./app/routes/user/address/address'));
app.use('/addresses', require('./app/routes/user/address/addresses'));

// 订单相关
app.use('/order', require('./app/routes/order/order'));
app.use('/orders', require('./app/routes/order/orders'));

// 购物车相关
app.use('/cart', require('./app/routes/cart/cart'));

// 服装相关
app.use('/cloth', require('./app/routes/cloth/cloth'));
app.use('/cloths', require('./app/routes/cloth/cloths'));

// 管理员权限
app.use('/admin', require('./app/routes/admin/admin'));

// 分类管理
app.use('/kind', require('./app/routes/kind/kind'));

// 数据报表
app.use('/analysis', require('./app/routes/analysis/analysis'));

module.exports = app;
