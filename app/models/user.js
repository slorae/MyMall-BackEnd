var mongoose = require('../helpers/mongodb.js'),
    Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
// 加密难度
var HARD = 10;

var UserSchema = new Schema({
    account : { type: String }, //账号
    password: { type: String }, // 密码
    name: { type: String }, // 昵称
    create_at: { type: Date }, // 创建时间
    update_at: { type: Date }, // 更新时间
    active_at: { type: Date }, // 最近活跃
    auth: { type: String }, // 认证信息
    type: { type: String }, // 用户类型  'user':普通用户  'admin': 管理员
    avatar: { type: String }, // 头像
    addresses: [{ //地址
      contact_name: { type: String }, // 联系人
      detail: { type: String }, // 详细地址
      phone: { type: String }, // 联系电话
      is_default: { type: Boolean, default: false }, // 是否为默认地址 
    }],
    balance: { type: Number, default: 0 }, // 账户余额
    is_deleted: { type: Boolean, default: false }, // 是否已被删除 
    tag: { type: String }, // 用户标签
});

// 查询用户所有地址
UserSchema.static('findAddressesByUserId', function (user_id, callback) {
  return  this.findById(user_id, function (err, res) {
    callback(err, res.addresses);
  });
});

// 新增，更新单个地址
UserSchema.static('saveAddressById', function (user_id, data, callback) {
  var userSchema = this;
  userSchema.findById(user_id, function(err, user) {
    if (err) callback(err);
    if (data._id) {
      // 修改地址
      for (var i = 0; i< user.addresses.length; i++) {
        if(user.addresses[i]._id == data._id){
          user.addresses[i].contact_name = data.contact_name;
          user.addresses[i].detail = data.detail;
          user.addresses[i].is_default = data.is_default;
          user.addresses[i].phone = data.phone;
          
          //混合类型因为没有特定约束，
          //因此可以任意修改，一旦修改了原型，
          //则必须调用markModified()
          //传入read，表示该属性类型发生变化
          user.markModified('contact_name');
          user.markModified('detail');
          user.markModified('is_default');
          user.markModified('phone');
          
          //保存
          user.save(function(err, res) {
            return callback(err, res.addresses);
          }); 
          return;
        }
      }

      return callback({code: 'no such address'});
    }
    if (user.addresses.length < 4) {
      // 新增地址
      return userSchema.findByIdAndUpdate(user_id, { 
          $push: {
            'addresses' : data
          }
        }, { 
          safe: true, 
          upsert: true
        }, function(err, res) {
          if (err) callback(err);
          userSchema.findById(user_id, function(err, res){
            callback(err, res.addresses);
          });
        });
    } else {
      return callback({
        code: 'addresses too many',
      });
    }
  })
});

// 密码加盐加密操作
UserSchema.pre('save', function(next) {
  user = this;
  if (this.isNew) {
    this.create_at = this.update_at = Date.now();
    bcrypt.genSalt(HARD, function(err, salt) {
      if (err) return next(err);
      bcrypt.hash(user.password, salt, function(err, hash) {
        if (err) return next(err);
          user.password = hash;
          next();
        });
    });
  } else {
    this.update_at = Date.now();
    this.active_at = Date.now();
    next();
  }
});

// 密码匹配
UserSchema.methods = {
  comparePassword:  function (password, callback) {
    bcrypt.compare(password, this.password, function(err, isMatch){
      if (err) return callback(err);
      callback(null, isMatch);
    });
  }
};

var UserModel =  mongoose.model('User',UserSchema);
module.exports = UserModel;
