class ErrorCostumer extends Error {
    constructor(code,message,) {
        super(`code:${code} , message: ${message}`);
        this.code = code;
        this.message = message;
    }
}
module.exports = ErrorCostumer