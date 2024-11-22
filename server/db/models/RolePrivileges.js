const  mongoose = require('mongoose');
const  rolePrivilegeSchema = new mongoose.Schema({
    role_id:{type:mongoose.SchemaTypes.ObjectId},
    permission:{type:String, required:true},
    created_by:{type:mongoose.SchemaTypes.ObjectId}
  
},{valueKey:false,timestamps: true});

module.exports = mongoose.model('RolePrivilegeSchema', rolePrivilegeSchema)