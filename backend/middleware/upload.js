import multer from "multer";
import path from "path";
import fs from "fs";

// Buat folder uploads jika belum ada
const uploadDir = "uploads";

try {
  if (!fs.existsSync(uploadDir)) {
    console.log(`Creating uploads directory: ${uploadDir}`);
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`Uploads directory created successfully`);
  } else {
    console.log(`Uploads directory already exists: ${uploadDir}`);
  }
} catch (error) {
  console.error(`Error creating uploads directory: ${error.message}`);
}

// Konfigurasi storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure directory exists before saving file
    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    } catch (error) {
      console.error('Upload destination error:', error);
      cb(error, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "barang-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// Filter file (hanya gambar)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(
      new Error("Hanya file gambar (jpeg, jpg, png, gif) yang diperbolehkan!")
    );
  }
};

// Setup multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export default upload;
