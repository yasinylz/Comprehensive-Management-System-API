# Comprehensive-Management-System-API 🌟 

Comprehensive-Management, kapsamlı bir **Node.js Backend Eğitimi Projesi** kapsamında geliştirilmiş, CRUD işlemlerinden kullanıcı yetkilendirmeye, çoklu dil desteğinden güvenlik özelliklerine kadar uzanan modern bir **Admin Paneli Uygulaması**dır. Bu proje, Node.js ve Express.js'in gücünü kullanarak gerçek dünya uygulamalarına ışık tutmaktadır.

---

## 📋 Özellikler  
1. **Proje Mimarisi ve Yapısı**  
   - Modüler proje yapısı.  
   - .env ile environment yönetimi.  

2. **Veritabanı ve CRUD İşlemleri**  
   - MongoDB ile güçlü veritabanı altyapısı.  
   - Kullanıcı ve rol bazlı endpointler.  

3. **Kimlik Doğrulama ve Yetkilendirme**  
   - JWT ile kimlik doğrulama.  
   - Rol tabanlı yetki kontrolü.  

4. **Loglama ve Güvenlik**  
   - Kullanıcı ve sistem logları.  
   - NPM audit ile güvenlik açıklarını kontrol etme.  

5. **Ek Özellikler**  
   - Çoklu dil desteği (Internationalization).  
   - Excel içeri ve dışarı aktarma.  
   - Server Sent Events (SSE) ile gerçek zamanlı bildirimler.  

---

## 🚀 Kullanılan Teknolojiler  
- **Backend Framework**: Node.js & Express.js  
- **Veritabanı**: MongoDB  
- **Authentication**: JWT  
- **Loglama**: Winston  
- **Güvenlik**: NPM Audit  
- **Excel İşlemleri**: ExcelJS  
- **Dil Desteği**: i18next  

---

## 📖 Kurulum ve Kullanım Kılavuzu  

### 1. Projeyi Klonlama  

git clone https://github.com/kullanici-adi/nodenova-admin.git
cd nodenova-admin
2. Gerekli Paketleri Kurma
bash
Kodu kopyala
npm install
3. Çevre Değişkenlerini Ayarlama
Projenin kök dizininde .env dosyası oluşturup aşağıdaki değerleri ekleyin:

makefile
Kodu kopyala
MONGO_URI=mongodb://localhost:27017/nodenova
JWT_SECRET=supersecretkey
PORT=3000
4. Projeyi Başlatma
bash
Kodu kopyala
npm start
Artık projeniz http://localhost:3000 adresinde çalışıyor olacak.

📚 Endpointler
Kullanıcı İşlemleri
Yöntem	Endpoint	Açıklama
GET	/users	Tüm kullanıcıları listele.
POST	/users	Yeni kullanıcı oluştur.
PUT	/users/:id	Kullanıcıyı güncelle.
DELETE	/users/:id	Kullanıcıyı sil.
Rol İşlemleri
Yöntem	Endpoint	Açıklama
GET	/roles	Tüm rolleri listele.
POST	/roles	Yeni rol oluştur.
PUT	/roles/:id	Rolü güncelle.
DELETE	/roles/:id	Rolü sil.
🔒 Güvenlik ve Testler
NPM Audit: Güvenlik açıklarını kontrol edin.
bash
Kodu kopyala
npm audit
Postman ile Test Etme: Endpointlerinizi Postman'de kolayca test edin.
📦 Ek Özellikler
Dil Desteği:
GET /translate ile mevcut dilleri öğrenebilir ve proje içeriğini özelleştirebilirsiniz.
Excel Export/Import:
GET /export ile veritabanını Excel olarak dışarı aktarın.
POST /import ile Excel dosyalarını yükleyin.
🛠 Geliştirici Notları
Projenin geliştirilmesi sırasında şu teknikler kullanıldı:

RESTful API standartları.
Kod kontrolü için ESLint.
Modern Node.js mimarisi ile verimli kod yazımı.
