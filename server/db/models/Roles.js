const  mongoose = require('mongoose');
const RolePrivileges = require('./RolePrivileges');
const  Schema = mongoose.Schema;
const  roleSchema = new Schema({
    role_name: {type:String,required:true,unique:true},
    is_active: {type:Boolean,default:true},
    created_by:mongoose.SchemaTypes.ObjectId,
},{valueKey:false,timestamps: true});

class Roles extends mongoose.Model{
    static async deleteMany(quary){

      if(quary._id){
        await RolePrivileges.deleteMany({role_id:quary._id})
      }
        await super.deleteMany(quary);
    }

}
module.exports = mongoose.model('Roles', roleSchema)