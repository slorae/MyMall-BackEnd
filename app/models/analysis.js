var mongoose = require('../helpers/mongodb.js'),
    Schema = mongoose.Schema;

var AnalysisSchema = new Schema({
    number: { type: Number, default: 0 },
    create_at: { type: Date, default: Date.now}, // 创建时间
    type: { type: String, } // 类型   'people' 注册用户统计   'income'  收入统计 order: 订单数
});

var AnalysisModel =  mongoose.model('Analysis',AnalysisSchema);
module.exports = AnalysisModel;
