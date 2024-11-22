const  mongoose = require('mongoose');
const  auditLogSchema = new mongoose.Schema({
    level: String,
    email: String,
    location: String,
    proc_type: String,
    log:{type:mongoose.SchemaTypes.Mixed}
},{valueKey:false,timestamps: true});

module.exports = mongoose.model('AuditLogs', auditLogSchema)