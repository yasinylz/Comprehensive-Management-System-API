const  mongoose = require('mongoose');
const Users = require('./Users');
const Roles = require('./Roles');
const  userRoleSchema = new mongoose.Schema({
    user_id: {type:mongoose.SchemaTypes.ObjectId,ref:Users},
    role_id: {type:mongoose.SchemaTypes.ObjectId,ref:Roles}
},{valueKey:false,timestamps: true});

module.exports = mongoose.model('UserRoles', userRoleSchema)