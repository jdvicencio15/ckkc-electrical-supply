const cloudinary = require("../config/cloudinary");

const uploadLogo = async (filePath) => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: "ckkc/business-logo",
    resource_type: "image",
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
};

const deleteLogo = async (publicId) => {
  if (!publicId) return;

  await cloudinary.uploader.destroy(publicId);
};

module.exports = {
  uploadLogo,
  deleteLogo,
};