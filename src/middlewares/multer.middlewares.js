import multer from "multer";
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./Public/temp")   //file ikde store hoti ahe
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)    //file user jya name ne detoy tych name ne save kartoy apn
    }
  })
  
export const upload = multer({
     storage: storage
})

// import multer from "multer";
// import path from "path";

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         console.log("Multer: Saving file to Public/temp"); // Debug log
//         cb(null, path.join(__dirname, "../Public/temp"));
//     },
//     filename: (req, file, cb) => {
//         console.log("Multer: Received file:", file.originalname); // Debug log
//         cb(null, Date.now() + "-" + file.originalname);
//     }
// });

// export const upload = multer({
//     storage,
//     limits: { fileSize: 1024 * 1024 * 5 }, // 5MB
//     fileFilter: (req, file, cb) => {
//         console.log("Multer: Checking file type:", file.mimetype); // Debug log
//         if (file.mimetype.startsWith("image/")) {
//             cb(null, true);
//         } else {
//             cb(new Error("Only image files are allowed!"), false);
//         }
//     }
// });

