const config = require("../config");
const Enum = require("../config/Enum");
const ErrorCostumer = require("./ErrorCostumer");
const i18n=new  (require("./i18n"))(config.DEFAULT_LANG);

class Response {
    constructor() {}
    static successRespose(data, code = 200) {
        return { code, data };
    }

    static errorRespose(error,lang) {
        // error.message'in var olup olmadığını kontrol et
        

        if (error instanceof ErrorCostumer) {
            return {
                code: error.code,
                message: error.message,
                description: error.description
            };
        }else if (error.message.includes("E11000")){
            return {
                code: Enum.HTTP_CODES.CONFLICT,
                error: { message: i18n.translate("COMMON.ALREADY_EXISTS",lang),"description":i18n.translate("COMMON.ALREADY_EXISTS",lang) }
            };
        }

        return {
            code: Enum.HTTP_CODES.INTERNAL_SERVER_ERROR,
            error: { message: i18n.translate("COMMON. ",lang) ,"description":error.message }
        };
    }
}

module.exports = Response;
