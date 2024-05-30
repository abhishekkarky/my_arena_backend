const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    return cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.replace(/\s/g, "_");
    cb(null, fileName);
  },
});

const upload = multer({ storage, limits: { fileSize: 40 * 1024 * 1024 } });

module.exports = upload;
