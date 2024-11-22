const mongoose = require('mongoose');
const categorySchema = new mongoose.Schema({
    category_name: {type:String,required:true,unique:true},
    is_active: {type:Boolean,default:true},
    created_by:{type:mongoose.SchemaTypes.ObjectId},
},{versionKey: false,timestamps: true});

module.exports = mongoose.model('Categories', categorySchema)