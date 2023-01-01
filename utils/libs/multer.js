const multer = require("multer");
const path = require("path");

// Multer config
module.exports = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
   //  console.log({file});
    let ext = path.extname(file.originalname);  
    if (ext !== ".pdf" && ext !== ".docx" && ext !== ".doc") {
      cb(new Error(`File type is not supported, must be a .pdf or .docx or .doc`), false);
      return;
    }
    cb(null, true);
  },
  
});
