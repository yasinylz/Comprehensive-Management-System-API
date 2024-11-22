module.exports={
    privGroups:[
        {id:"USERS",name:"Kullanıcı İşlemleri"},
        {id:"ROLES",name:"Rol İşlemleri"},
        {id:"CATEGORIES",name:"Kategori İşlemleri"},
        {id:"AUDITLOGS",name:"Denetim günlükleri İşlemleri"},
      
    ],
    privileges:[
        {key:"user_view",name:"Kullanıcıları Görüntüle",group:"USERS",descriction:"Kullanıcıları görüntüleme izni"},
        {key:"user_add",name:"Kullanıcı Ekle",group:"USERS",description:"Kullanıcı ekle izni"},
        {key:"user_edit",name:"Kullanıcı Düzenle",group:"USERS",description:"Kullanıcı düzenle izni"},
        {key:"user_delete",name:"Kullanıcı Sil",group:"USERS",description:"Kullanıcı silme izni"},

        {key:"roles_view",name:"Rolleri Görüntüle",group:"ROLES",description:"Rolleri görüntüleme izni"},
        {key:"roles_add",name:"Rol Ekle",group:"ROLES",description:"Rol ekle izni"},
        {key:"roles_edit",name:"Rol Düzenle",group:"ROLES",description:"Rol düzenle izni"},
        {key:"roles_delete",name:"Rol Sil",group:"ROLES",description:"Rol silme izni"},
       
        {key:"categories_view",name:"Kategorileri Görüntüle",group:"CATEGORIES",description:"Kategorileri görüntüleme izni"},
        {key:"categories_add",name:"Kategori Ekle",group:"CATEGORIES",description:"Kategori ekle izni"},
        {key:"categories_edit",name:"Kategori Düzenle",group:"CATEGORIES",description:"Kategori düzenle izni"},
        {key:"categories_delete",name:"Kategori Sil",group:"CATEGORIES",description:"Kategori silme izni"},
        {key:" categories_export",name:"Kategori İndir",group:"CATEGORIES",description:"Kategori indirme izni"},


        {key:"auditlogs_view",name:"Denetim günlükleri Görüntüle",group:"AUDITLOGS",description:"Denetim günlükleri görüntüleme izni"},
        {key:"auditlogs_delete",name:"Denetim günlükleri Sil",group:"AUDITLOGS",description:"Denetim günlükleri silme izni"},
    ]
}