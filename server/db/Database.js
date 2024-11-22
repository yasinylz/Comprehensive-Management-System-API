const mongoose = require('mongoose');
let  instance=null
class Database {
  
    constructor() {
      if(!instance){
          instance=this
          this.mongoConnection=null;
      }
      return instance
    }
    async connect(options){
      try {
        console.log("MongoDB Connection...")
        let  db=await mongoose.connect(options.CONNECTION_STRING)
        this.mongoConnection=db;
      

      } catch (error) {
        process.exit(1)
      }
    }
}

module.exports = Database;