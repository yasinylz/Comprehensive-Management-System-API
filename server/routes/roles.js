const express = require('express');
const Response = require('../lib/Response');  
const Role = require('../db/models/Roles'); 
const ErrorCustomer = require('../lib/ErrorCostumer');
const RolePrivilege = require('../db/models/RolePrivileges');
const Enum = require('../config/Enum');
const rolePrivileges = require('../config/role_privileges');
const config = require("../config");
const UserRoles = require('../db/models/UserRoles');
const i18n = new (require('../lib/i18n'))(config.DEFAULT_LANG);



const router = express.Router();
const auth = require('../lib/auth')(); // auth modülünü bir fonksiyon olarak çağırıyoruz

router.all("*", auth.authenticate(), (req, res, next) => {
  next();
});
/**
 * GET - Tüm Rolleri Getir
 */
router.get('/', /*auth.checkRoles("roles_view"),*/async (req, res) => {
  try {
    const roles = await Role.find({}).lean();
    for(let  i=0;i<roles.length;i++){
      let  permissions=await RolePrivilege.find({role_id:roles[i]._id})
      roles[i].permissions=permissions
    }
    res.json(Response.successRespose(roles));
  } catch (error) {
    const errorResponse = Response.errorRespose(error,req.user?.language);
    res.status(errorResponse.code).json(errorResponse);
  }
});

/**
 * POST - Yeni Rol Ekle
 */
router.post('/add',auth.checkRoles("roles_add"), async (req, res) => {
  try {
    const { role_name, permission } = req.body;
    
    if (!role_name) {
      throw new ErrorCustomer(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.MUST_BE_MUST",req.user?.language,["Id"]));
    }

    if (!permission || !Array.isArray(permission) || permission.length === 0) {
      throw new ErrorCustomer(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.INVALID_PERMİSSION",req.user?.language,["Id"]));
    }

    const roleExists = await Role.findOne({ role_name });
    if (roleExists) {
      throw new ErrorCustomer(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.ROLE_NAME_EXIST",req.user?.language,));
    }

    const role = await Role.create(req.body);
    await Promise.all(permission.map(perm => RolePrivilege.create({ role_id: role._id, permission: perm })));

    res.json(Response.successRespose(role));
  } catch (error) {
    const errorResponse = Response.errorRespose(error,req.user?.language);
    res.status(errorResponse.code).json(errorResponse);
  }
});

/**
 * PUT - Rol Güncelle
 */
router.put('/update',auth.checkRoles("roles_edit"), async (req, res) => {
  try {
    const { _id, role_name, permission } = req.body;

    if (!role_name) {
      throw new ErrorCustomer(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.MUST_BE_MUST",req.user?.language,["name"]));
    }

    let  userRoles=await UserRoles.findOne({user_id:req.user.id,role_id:req.body._id})
    if(userRoles){
      throw new ErrorCustomer(Enum.HTTP_CODES.FORBIDDEN, i18n.translate("COMMON.INVALID_PERMİSSION",req.user?.language,));
    }
    const existingPermissions = await RolePrivilege.find({ role_id: _id });
    
    const permissionsToRemove = existingPermissions.filter(
      item => !permission.includes(item.permission)
    );

    const newPermissions = permission.filter(
      perm => !existingPermissions.map(item => item.permission).includes(perm)
    );

    await Promise.all(permissionsToRemove.map(item => RolePrivilege.findByIdAndDelete(item._id)));
    await Promise.all(newPermissions.map(perm => RolePrivilege.create({ role_id: _id, permission: perm })));

    const roleExists = await Role.findOne({ role_name });
    if (roleExists && roleExists._id.toString() !== _id) {
      throw new ErrorCustomer(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.ROLE_NAME_EXIST",req.user?.language,));
    }

    const updatedRole = await Role.findByIdAndUpdate(_id, req.body, { new: true });
    if (!updatedRole) {
      throw new ErrorCustomer(Enum.HTTP_CODES.NOT_FOUND, i18n.translate("COMMON.ROLE_NOT_FOUND",req.user?.language,));
    }

    res.json(Response.successRespose(updatedRole));
  } catch (error) {
    const errorResponse = Response.errorRespose(error,req.user?.language);
    res.status(errorResponse.code).json(errorResponse);
  }
});

/**
 * DELETE - Rol Sil
 */
router.delete('/delete',auth.checkRoles("roles_delete"), async (req, res) => {
  try {
    const { _id } = req.body;
    const role = await Role.findByIdAndDelete(_id);

    if (!role) {
      throw new ErrorCustomer(Enum.HTTP_CODES.NOT_FOUND, i18n.translate("COMMON.ROLE_NOT_FOUND",req.user?.language,));
    }

    await RolePrivilege.deleteMany({ role_id: _id });
    res.json(Response.successRespose({ success: true }));
  } catch (error) {
    const errorResponse = Response.errorRespose(error,req.user?.language);
    res.status(errorResponse.code).json(errorResponse);
  }
});

/**
 * GET - Tüm Role Privileges Getir
 */
router.get("/role_privileges", (req, res) => {
  res.json({ rolePrivileges });
});

module.exports = router;
