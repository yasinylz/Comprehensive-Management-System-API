const mongoose = require('mongoose');
const is= require('is_js')
const  bcrypt = require('bcrypt');  
const  {PASS_LENGTH,HTTP_CODES}=require('../../config/Enum')
const CustomError= require('../../lib/ErrorCostumer')
const  {DEFAULT_LANG} = require('../../config');

const userSchema = new mongoose.Schema({
    first_name: {type: String, required: true},
    last_name: {type: String, required: true},
    email: {type: String, unique: true,required: true},
    password: {type: String, required: true},
    is_active: {type: Boolean, default: true},
    phone_number: {type: String},
    language: {type: String,default:DEFAULT_LANG},
    created_by:{type:mongoose.SchemaTypes.ObjectId}
},{valueKey:false,timestamps: true});
  
class Users extends mongoose.Model{
    validPassword(password){
        return bcrypt.compareSync(password, this.password);
    }
    static validateFiledsBeforeAuth(email, password){
        if(typeof password !== 'string' || password.length < PASS_LENGTH||is.not.email(email)){
            throw new CustomError(HTTP_CODES.UNAUTHORIZED,"Validation failed","email or password  wrong");

            

        }
        return null;
}
}
userSchema.loadClass(Users);

module.exports = mongoose.model('Users', userSchema)