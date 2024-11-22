const  xlsx = require("node-xlsx");
const  ErrorCostumer = require("./ErrorCostumer");
const {HTTP_CODES}=require("../config/Enum")
class Import{
   fromExcel(filePath){
    let  workSheet=xlsx.parse(filePath);
    if(!workSheet||workSheet.length==0){
        throw new ErrorCostumer(HTTP_CODES.BAD_REQUEST,"File is empty")
    }
    let  rows=workSheet[0].data;

    if(rows?.length==0){
        throw new ErrorCostumer(HTTP_CODES.BAD_REQUEST,"File is empty")
    }
    return rows
   }

}
module.exports =Import;