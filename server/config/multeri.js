// config/multer.js
import multer from "multer";

// this line creates the multer instance and exports it as the default
export default multer({ storage: multer.memoryStorage() });
