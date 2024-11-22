const  logger=require('./logger');
let  instance=null
class LoggerClass{
    constructor(){if(!instance){
        instance=this
    }
    return instance}

    #createLogObject(email,location,proc_type,log){
        return {email,location,proc_type,log}
    }
    info(email,location,proc_type,log){
        logger.info(this.#createLogObject(email,location,proc_type,log))
    }
    warn(email,location,proc_type,log){
        logger.warn(this.#createLogObject(email,location,proc_type,log))
    }
    error(email,location,proc_type,log){
        logger.error(this.#createLogObject(email,location,proc_type,log))
    }
    debug(email,location,proc_type,log){
        logger.debug(this.#createLogObject(email,location,proc_type,log))
    }
    verbose(email,location,proc_type,log){
        logger.verbose(this.#createLogObject(email,location,proc_type,log))
    }
    http(email,location,proc_type,log){
        logger.http(this.#createLogObject(email,location,proc_type,log))
    }
    silly(email,location,proc_type,log){
        logger.silly(this.#createLogObject(email,location,proc_type,log))
    }
}

module.exports=new LoggerClass()