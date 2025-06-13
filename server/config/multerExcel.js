
// config/multerExcel.js
import multer from "multer";

const storage = multer.memoryStorage();
const uploadExcel = multer({ storage });

export default uploadExcel;