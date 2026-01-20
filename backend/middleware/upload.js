

import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "sipinjam",
      allowed_formats: ["jpg", "jpeg", "png", "gif"],
      transformation: [{ width: 800, height: 800, crop: "limit" }],
    };
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Hanya file gambar (jpeg, jpg, png, gif) yang diperbolehkan!"));
    }
  }
});

export default upload;
