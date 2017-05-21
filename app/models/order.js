var mongoose = require('../helpers/mongodb.js'),
    Schema = mongoose.Schema;

var OrderSchema = new Schema({
    user_id: { type: String },
    cloths: [{
      cloth_id: { type: String },
      name: { type: String }, // 姓名
      brand: { type: String }, // 品牌
      cloth_cover: { type: String }, // 封面
      price: { type: Number, default: 0 }, // 价格
      kind: { type: String } // 类别
    }],
    address: { //地址
      contact_name: { type: String }, // 联系人
      detail: { type: String }, // 详细地址
      phone: { type: String }, // 联系电话
    },
    has_pay: { type: Boolean, default: false },
    pay_num: { type: Number, default: 0 }, // 价格
    state: { type: String, default: 'unpay' }, // unpay:未付款 unsend: 未发货 unassign: 未签收 assign： 已签收  cancel: 取消
    create_at: { type: Date, default: Date.now}, // 创建时间
    update_at: { type: Date, default: Date.now}, // 更新时间
});


// 前置操作
OrderSchema.pre('save', function(next) {
  if (this.isNew) {
    this.create_at = this.update_at = Date.now();
  
  } else {
    this.update_at = Date.now();
  }
    next();
});



var OrderModel =  mongoose.model('Order',OrderSchema);
module.exports = OrderModel;
