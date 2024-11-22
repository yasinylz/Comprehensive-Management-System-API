var express = require('express');
const fs=require('fs')
var router = express.Router();
let routes=fs.readdirSync(__dirname)
for(let route of routes){
  if(route.includes('.js')&&route!='index.js'){
    router.use(`/${route.replace('.js','')}`,require(`./${route}`))
  }
}

module.exports = router;
