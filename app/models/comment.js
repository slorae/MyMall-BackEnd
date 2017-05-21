var mongoose = require('../helpers/mongodb.js'),
    Schema = mongoose.Schema;

var CommentSchema = new Schema({
    cloth_id : { type: String }, // 服装Id
	cloth_name: { type: String }, // 服装名字 
    comment_body: { type: String }, // 评论内容
    user: {
		user_id: { type: String }, // 用户ID
		name: { type: String }, // 用户姓名
		avatar: { type: String }, // 用户姓名
    },
    reply: { // 回复
    	user_id: { type: String }, // 用户ID
    	name: { type: String }, // 用户姓名
		avatar: { type: String }, // 用户姓名
		comment_body: { type: String }, // 评论内容
		create_at: { type: Date}, // 创建时间
   	}, 
    create_at: { type: Date, default: Date.now}, // 创建时间
    update_at: { type: Date, default: Date.now}, // 创建时间
});

// 前置操作
CommentSchema.pre('save', function(next) {
  if (this.isNew) {
    this.create_at = this.update_at = Date.now();
  
  } else {
    this.update_at = Date.now();
  }
    next();
});

var CommentModel =  mongoose.model('Comment',CommentSchema);
module.exports = CommentModel;
