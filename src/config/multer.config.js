import multer from "multer";
import paths from "../utils/paths.js";
import { generateNameForFile } from "../utils/random.js";

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, paths.images);
  },
  filename: (req, file, callback) => {
    const filename = generateNameForFile(file.originalname);

    callback(null, filename);
  },
});

const fileFilter = (req, file, callback) => {
  if (file.mimetype.startsWith("image/")) {
    callback(null, true);
  } else {
    callback(new Error("❌ Acá sólo se permiten Imágenes..."), false);
  }
};

const uploader = multer({ storage, fileFilter });

export default uploader;
