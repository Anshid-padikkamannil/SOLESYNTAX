const multer = require("multer");
const path = require('path');

const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, 'public/images');
  },

  filename: (req, file, cb) => {

    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);

    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {

  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(
      `Invalid image type: ${file.mimetype}. Only JPG, JPEG, PNG and WEBP images are allowed.`
    ));
  }

};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

module.exports = upload;