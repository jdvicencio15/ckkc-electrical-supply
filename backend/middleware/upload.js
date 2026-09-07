const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  const extension = file.originalname
    .toLowerCase()
    .slice(file.originalname.lastIndexOf("."));

  const isValidExtension =
    allowedExtensions.includes(extension);

  const isValidMimeType =
    allowedMimeTypes.includes(file.mimetype);

  const isOctetStream =
    file.mimetype === "application/octet-stream";

  if (
    isValidMimeType ||
    (isOctetStream && isValidExtension)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, JPEG, PNG, and WEBP images are allowed."
      )
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = upload;