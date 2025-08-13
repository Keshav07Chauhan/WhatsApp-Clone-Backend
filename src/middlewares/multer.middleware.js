import multer from "multer";

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "./public/temp")
    },
    filename: function(req, file, cb){
        cb(null, file.originalname)   //not advided to provide original name provided by user
    }
})

export const upload = multer({
    storage,            //it is not written as key:value pair as es6 is using which allows us to directly use as this if key and value have same name.
})