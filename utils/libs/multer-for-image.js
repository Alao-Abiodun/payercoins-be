const multer = require("multer");
const path = require("path");

// Multer config
module.exports = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
   //  console.log({file});
    let ext = path.extname(file.originalname);  
    if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg") {
      cb(new Error(`File type is not supported, must be a .png or .jpg or .jpeg`), false);
      return;
    }
    cb(null, true);
  },
  
});
