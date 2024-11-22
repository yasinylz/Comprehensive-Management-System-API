const express = require('express');
const Response = require('../lib/Response');
const Categories = require('../db/models/Categories');
const ErrorCostumer = require('../lib/ErrorCostumer');
const router = express.Router();
const AuditLogsLib = require('../lib/AuditLogs');
const Enum=require('../config/Enum')
const  logger = require('../lib/logger/LoggerClass');
const auth = require('../lib/auth')(); // auth modülünü bir fonksiyon olarak çağırıyoruz
const config = require("../config");
const i18n = new (require('../lib/i18n'))(config.DEFAULT_LANG);
const  emitter=require('../lib/Emitter')
const  excelExport=new  (require('../lib/Export'))();
const path = require('path');
const fs = require('fs');
const  multer=require('multer');
const Import = new (require('../lib/Import'))();


router.all("*", auth.authenticate(), (req, res, next) => {
  next();
});
// GET categories
router.get('/', /*auth.checkRoles("categories_view"),*/async (req, res) => {
    try {
        const categories = await Categories.find({});
        res.json(Response.successRespose(categories));
    } catch (error) {
      const errorResponse = Response.errorRespose(error,req.user?.language);
      res.status(errorResponse.code).json(errorResponse);
    }
});

// POST add category
router.post("/add",/* auth.checkRoles("categories_add"),*/async (req, res) => {
    try {
      if(!req.body.category_name){
        throw new ErrorCostumer(Enum.HTTP_CODES.BAD_REQUEST,i18n.translate("COMMON.MUST_BE_MUST",req.user?.language,["name"]))
      }
      const categoryCheck = await Categories.findOne({ category_name: req.body.category_name });
      
      if(categoryCheck){
        throw new ErrorCostumer(Enum.HTTP_CODES.BAD_REQUEST,i18n.translate("COMMON.MUST_BE_MUST_A_HAVE",req.user?.language,["name"]))
      
      }
        const category = await Categories.create(req.body);
       

        AuditLogsLib.info(req.user?.email,"Categories","Kategori eklendi",category)
        logger.info(req.user?.email,"Categories","Kategori eklendi",category)
        const message = i18n.translate("CATEGORIES.ADDED", req.user?.language, [category.category_name]);

        // listener'a doğru mesaj gönderiyoruz
        emitter.getEmitter('notifications').emit('messages', { 
            success: "success", 
            message: message 
        });

       
        res.json(Response.successRespose(category));
    } catch (error) {
      logger.error(req.user?.email,"Categories","Kategori eklendi",error)
      const errorResponse = Response.errorRespose(error,req.user?.language);
      res.json(errorResponse);
    }
});

// PUT update category
router.put("/update",auth.checkRoles("categories_edit"), async (req, res) => {

  if(!req.body.category_name||!req.body._id){
    throw new ErrorCostumer(Enum.HTTP_CODES.BAD_REQUEST,i18n.translate("COMMON.MUST_BE_MUST_global",req.user?.language,["name","Id"]))
  }
    try {
        const category = await Categories.findByIdAndUpdate(req.body._id, req.body, { new: true });
        if (!category) {
            return res.status(404).json(Response.errorRespose({ message: "Kategori bulunamadı" }));
        }
        AuditLogsLib.info(req.user?.email,"Categories","Kategori güncellendi",{_id:req.body._id, ...category})

        res.json(Response.successRespose(category));
    } catch (error) {
      const errorResponse = Response.errorRespose(error,req.user?.language);
      res.status(errorResponse.code).json(errorResponse);
    }
});

// DELETE delete category
router.delete("/delete",auth.checkRoles("categories_delete"),  async (req, res) => {
  if(!req.body._id){
    throw new ErrorCostumer(Enum.HTTP_CODES.BAD_REQUEST,i18n.translate("COMMON.MUST_BE_MUST",req.user?.language,["Id"]))
  }
    try {
        const category = await Categories.findByIdAndDelete(req.body._id);
        if (!category) {
            return res.status(404).json(Response.errorRespose({ message: "Kategori bulunamadı" }));
        }
        AuditLogsLib.info(req.user?.email,"Categories","Kategori silindi",{_id:req.body._id})

        res.json(Response.successRespose(category));
    } catch (error) {
      const errorResponse = Response.errorRespose(error,req.user?.language);
      res.status(errorResponse.code).json(errorResponse);
    }
});

router.post('/export',/*auth.checkRoles("categories_export"),*/ async (req, res) => {
  try {
    // Tüm kategorileri veri tabanından alın
    const categories = await Categories.find({});
    
    // Excel dosyasını oluştur
    let excel = excelExport.toExcel(
      ["Category Name", "Is Active", "Created By"],
      ["category_name", "is_active", "created_by"],
      categories
    );

    // /tmp klasörünün var olup olmadığını kontrol et ve yoksa oluştur
    const tmpDir = path.join(__dirname, '../tmp/category_excels'+Date.now()+'.xlsx');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir);
    }

    // Dosya yolunu oluştur
    let filePath = path.join(tmpDir, `categories_export_${Date.now()}.xlsx`);
    
    // Excel dosyasını yaz
    fs.writeFileSync(filePath, excel, 'utf-8');

    // Dosyayı kullanıcıya gönder
    res.download(filePath, (err) => {
      if (err) {
        throw err;
      } else {
        // Dosya indirme tamamlandıktan sonra dosyayı sil
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) console.error("Dosya silinirken hata oluştu:", unlinkErr);
        });
      }
    });

  } catch (error) {
    const errorResponse = Response.errorRespose(error, req.user?.language);
    res.status(errorResponse.code).json(errorResponse);
  }
});
let multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.FILE_UPLOAD_PATH)
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: multerStorage
}).single("gb_file");

router.post('/import', /*auth.checkRoles("categories_export"),*/ upload, async (req, res) => {
  try {
    // Yüklenen dosyayı alın
    let file = req.file; // req.files değil req.file kullanın
    

    // Dosyanın var olup olmadığını kontrol edin
    if (!file) {
      throw new Error("Dosya yüklenemedi. Lütfen tekrar deneyin.");
    }

    // Dosyayı işleyin
    let rows = Import.fromExcel(file.path);

    // Satırları işleyerek kategoriler tablosuna ekleyin
    for (let i = 1; i < rows.length; i++) {
    
      await Categories.create({
        category_name: rows[i][1],
        is_active: rows[i][2],
        created_by: rows[i][3]
      });
      
    }

    res.json(Response.successRespose(req.body));

  } catch (error) {
    // `errorResponse.code` değerinin geçerli olup olmadığını kontrol edin
    const errorResponse = Response.errorRespose(error, req.user?.language);
    const statusCode = errorResponse.code || 500; // Geçerli bir kod değilse 500 olarak ayarla
    res.status(statusCode).json(errorResponse);
  }
});
module.exports = router;
