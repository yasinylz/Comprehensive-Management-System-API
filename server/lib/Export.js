const xlsx=require("node-xlsx");
class Export{
    constructor(){}
    toExcel(titles,colums,data=[]){
        let  rows=[]
        rows.push(titles)
        for(let i=0;i<data.length;i++){
            let  row=[]
            for(let j=0;j<colums.length;j++){
                row.push(data[i][colums[j]])
            }
            rows.push(row)
        }
        return xlsx.build([{
            name:"Sheet 1",
            data:rows
        }])
    }
}
module.exports= Export;