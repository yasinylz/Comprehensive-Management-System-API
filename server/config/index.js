/* eslint-disable no-undef */
module.exports = {
    "LOG_LEVEL": process.env.LOG_LEVEL || "debug",
    "CONNECTION_STRING": process.env.CONNECTION_STRING || 'mongodb://localhost:27017/nodejs-backend-mastery',
    "JWT": {
        "SECRET": process.env.JWT_SECRET ||"yJ0iJIUzI1NiJ9.eyJfaWQiOiI2NzYxMTc1MTEzNjAwMH0.Bv8cr3L_Rpte4ldooKI-t6LC8N",
        "EXPIRE": 24 * 60 * 60 // 24 saat
    },
    DEFAULT_LANG:process.env.DEFAULT_LANG || 'EN',
    "FILE_UPLOAD_PATH": process.env.FILE_UPLOAD_PATH 
};
