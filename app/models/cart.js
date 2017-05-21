var mongoose = require('../helpers/mongodb.js'),
    Schema = mongoose.Schema;

var CartSchema = new Schema({
    user_id: { type: String },
    cloths: [{
       cloth_id: { type: String },
       name: { type: String }, // 服装名
       brand: { type: String }, // 品牌
       cloth_cover: { type: String }, // 封面
       kind: { type: String , default: 'unkind'}, // 类别
       price: { type: Number, default: 0 }, // 价格
    }],
});


var CartModel =  mongoose.model('Cart', CartSchema);

module.exports = CartModel;
