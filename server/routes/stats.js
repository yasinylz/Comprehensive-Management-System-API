const express = require('express');
const Response = require('../lib/Response');
const AuditLogs = require('../db/models/AuditLogs');
const Categories = require('../db/models/Categories');
const Users = require('../db/models/Users');



const router = express.Router();
const auth = require('../lib/auth')(); // auth modülünü bir fonksiyon olarak çağırıyoruz

router.all("*", auth.authenticate(), (req, res, next) => {
  next();
});
router.post('/auditlogs', /*auth.checkRoles("auditlogs_view"),*/async (req, res) => {
 
  try {
    let  body=req.body;
    let filter={};

    if(typeof body.location==="string") filter.location=body.location 
    let result=await AuditLogs.aggregate([
        {$match:filter},
        {$group:{_id:{email:"$email",proc_type:"$proc_type"},count:{$sum:1}}},
        {$sort:{count:-1}}

    ])
    res.json(Response.successRespose(result));
  

} catch (error) {
    // Hata yanıtı döndür
    const errorResponse = Response.errorRespose(error,req.user?.language);
    res.status(errorResponse.code).json(errorResponse);
  }
});
router.post('/categories/uniq', /*auth.checkRoles("auditlogs_view"),*/async (req, res) => {
 
  try {
    let  body=req.body;
    let filter={};


if (typeof body.is_active === "boolean") {
  filter.is_active = body.is_active;
}
    let result=await Categories.distinct("category_name",filter)
    res.json(Response.successRespose({result,count:result.length}));
  

} catch (error) {
    // Hata yanıtı döndür
    const errorResponse = Response.errorRespose(error,req.user?.language);
    res.status(errorResponse.code).json(errorResponse);
  }
});
router.post('/users/count', async (req, res) => {
  try {
    let  body=req.body;
    let filter={};

    if(typeof body.is_active==="boolean") filter.is_active=body.is_active 
    
    // Replacing the deprecated `count` method with `countDocuments`
    let result = await Users.countDocuments(filter);
    
    // Return the result using the success response method
    res.json(Response.successRespose({ result }));
  } catch (error) {
    // Error handling: pass the error to the error response method
    const errorResponse = Response.errorRespose(error, req.user?.language);
    
    // Send the error response
    res.json(errorResponse);
  }
});

module.exports = router;
