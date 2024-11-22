const express = require('express');
const Response = require('../lib/Response');
const AuditLogs = require('../db/models/AuditLogs');
const moment = require('moment');
const router = express.Router();
const auth = require('../lib/auth')(); // auth modülünü bir fonksiyon olarak çağırıyoruz

router.all("*", auth.authenticate(), (req, res, next) => {
  next();
});
router.post('/', auth.checkRoles("auditlogs_view"),async (req, res) => {
  const { beggin_date, end_date, limit = 500, skip = 0 } = req.body;

  try {
    const query = {};

    // Tarih filtrelemesi
    if (beggin_date && end_date) {
      query.createdAt = {
        $gte: moment(beggin_date).toDate(),
        $lte: moment(end_date).toDate(),
      };
    } else {
      query.createdAt = {
        $gte: moment().subtract(1, 'day').startOf('day').toDate(),
        $lte: moment().toDate(),
      };
    }

    // Kayıtları getir
    const auditLogs = await AuditLogs.find(query)
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit));

    // Başarılı yanıt döndür
    res.json(Response.successRespose(auditLogs));
  } catch (error) {
    // Hata yanıtı döndür
    const errorResponse = Response.errorRespose(error,req.user?.language);
    res.status(errorResponse.code).json(errorResponse);
  }
});

module.exports = router;
