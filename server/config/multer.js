// import multer from "multer";

// const storage = multer.diskStorage({})

// const upload = multer({storage,
    
// })

// export default upload
// server/config/multer.js
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

export default upload;