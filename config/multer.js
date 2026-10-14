const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create the profile upload directory if it doesn't exist.
const profileUploadDir = path.join(
  __dirname,
  "../public/uploads/profiles"
);

fs.mkdirSync(profileUploadDir, { recursive: true });

// Allow only supported image types.
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp"
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, JPEG, PNG and WEBP images are allowed."
      )
    );
  }
};

// 1. Existing product-image storage — keep this unchanged.
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname).toLowerCase();

    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: productStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB for existing uploads
  }
});

// 2. New profile-picture storage.
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profileUploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname).toLowerCase();

    cb(null, uniqueName);
  }
});

const uploadProfilePicture = multer({
  storage: profileStorage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2 MB for profile pictures
  }
});

// Keep the existing exports working.
// Add the new handler as a property of the existing middleware.
upload.uploadProfilePicture = uploadProfilePicture;

module.exports = upload;
