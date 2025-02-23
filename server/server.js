// import express from "express"
// import cors from "cors"
// import "dotenv/config"
// import connectDB from './config/db.js'
// import { clerkWebhook } from "./controllers/webhooks.js"
// import companyRouter  from "./routes/companyRoutes.js"
// import jobRouter from "./routes/jobRoutes.js"
// import userRouter from "./routes/userRoutes.js"
// import connectCloudinary from "./config/cloudinary.js"
// import path from "path"
// import {clerkMiddleware} from "@clerk/express"

// const app = express();

// app.use(cors());
// app.use(express.json())
// app.use(clerkMiddleware())
// await connectDB()
// await connectCloudinary()

// app.get('/', async(req, res)=>{
//     res.send("API working")
// })
// app.set("view engine", "ejs");
// app.set("views", path.join(path.resolve(), "views")); // Ensure correct views folder path


// app.use('/api/company', companyRouter)
// app.use('/api/jobs', jobRouter)
// app.use('/api/users', userRouter)
// app.post('/webhooks', clerkWebhook);
// // Route to render the registration form

// app.get("/api/company/register", (req, res) => {
//     res.render("register"); // Render the EJS form
// });


// const PORT = process.env.PORT || 5000

// app.listen(PORT,()=>{
//     console.log(`Server running at ${PORT}`)
// })
import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/db.js";
import { clerkWebhook } from "./controllers/webhooks.js";
import companyRouter from "./routes/companyRoutes.js";
import jobRouter from "./routes/jobRoutes.js";
import userRouter from "./routes/userRoutes.js";
import connectCloudinary from "./config/cloudinary.js";
import path from "path";
import { clerkMiddleware } from "@clerk/express";

const app = express();

app.use(cors());
app.use(express.json()); // <-- Move this before clerkMiddleware
app.use(clerkMiddleware()); 

await connectDB();
await connectCloudinary();

app.get("/", async (req, res) => {
    res.send("API working");
});
app.set("view engine", "ejs");
app.set("views", path.join(path.resolve(), "views"));

app.use("/api/company", companyRouter);
app.use("/api/jobs", jobRouter);
app.use("/api/users", userRouter);

// Use raw-body for webhooks to avoid JSON parsing issues
app.post("/webhooks", clerkWebhook);

app.get("/api/company/register", (req, res) => {
    res.render("register");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running at ${PORT}`);
});
