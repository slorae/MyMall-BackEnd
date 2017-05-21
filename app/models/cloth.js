var mongoose = require('../helpers/mongodb.js'),
    Schema = mongoose.Schema;

var ClothSchema = new Schema({
    name : { type: String }, // 服装名
    brand: { type: String }, // 品牌
    cloth_cover: { type: String }, // 封面
    kind: { type: String , default: '未分类'}, // 类别
    title: { type: String, default: '暂无简述' }, // 简述
    description: { type: String, default: '暂无介绍'}, //详细介绍

    price: { type: Number, default: 0 }, // 价格

    thumb_up: { type: Number, default: 0 }, // 点赞数
    thumb_down: { type: Number, default: 0 }, // 倒喝彩数

    total: { type: Number, default: 0 }, // 上架总数
    left: { type: Number, default: 0}, // 剩余总数

    create_at: { type: Date, default: Date.now }, // 创建时间
    update_at: { type: Date, default: Date.now}, // 更新时间

    state: { type: String , default: 'draft'}, // 当前状态: 未上线 draft， 已上线， 已下线， 售罄, 今日推荐 recommend
});

// 前置操作
ClothSchema.pre('save', function(next) {
  if (this.isNew) {
    this.create_at = this.update_at = Date.now();
  
  } else {
    this.update_at = Date.now();
  }
    next();
});


var ClothModel =  mongoose.model('Cloth',ClothSchema);



module.exports = ClothModel;
