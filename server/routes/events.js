const express = require('express');
const router = express.Router();
const { HTTP_CODES } = require('../config/Enum');
const emitter = require('../lib/Emitter');

emitter.addEmitter('notifications');

router.get('/', async (req, res) => {
    res.writeHead(HTTP_CODES.OK, {
        "Content-Type": "text/event-stream",
        "Connection": "keep-alive",
        "Cache-Control": "no-cache, no-transform",
    });

    const listener = (data) => {
        // SSE formatına uygun hale getirildi
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // 'messages' olayına dinleyici ekliyoruz
    emitter.getEmitter('notifications').on('messages', listener);

    // Bağlantı kesildiğinde dinleyiciyi kaldırıyoruz ve yanıtı sonlandırıyoruz
    req.on('close', () => {
        emitter.getEmitter('notifications').off('messages', listener);
        res.end();
    });
});

module.exports = router;
