import multer from "multer";
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")   //file ikde store hoti ahe
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)    //file user jya name ne detoy tych name ne save kartoy apn
    }
  })
  
export const upload = multer({
     storage: storage
})