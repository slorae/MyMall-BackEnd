var mongoose = require('../helpers/mongodb.js'),
    Schema = mongoose.Schema;

var KindSchema = new Schema({
    name: { type: String }, // 类目名
    create_at: { type: Date, default: Date.now}, // 创建时间
    update_at: { type: Date, default: Date.now}, // 更新时间
});

// 前置操作
KindSchema.pre('save', function(next) {
  if (this.isNew) {
    this.create_at = this.update_at = Date.now();
  
  } else {
    this.update_at = Date.now();
  }
    next();
});

var KindModel =  mongoose.model('Kind',KindSchema);



module.exports = KindModel;
