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
import contactRoutes from "./routes/contactRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { Server } from "socket.io";
import http from "http";
const app = express();

const corsConfig = {
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};

app.use(cors(corsConfig));
app.options("*", cors(corsConfig)); // fixed empty string to "*"
app.use(express.json());
app.use(clerkMiddleware());

const server = http.createServer(app);

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
app.use("/api/contacts", contactRoutes);
app.use("/api/messages", messageRoutes);

export const io = new Server(server, {
  cors: {
    origin: "*", 
  },
});

export const userSocketMap = {};

io.on("connection", (socket) => {
  const { id, model } = socket.handshake.query;

    if (id && model) {
      userSocketMap[`${model}_${id}`] = socket.id;
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
      delete userSocketMap[`${model}_${id}`];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });

})

app.post("/webhooks", clerkWebhook);

app.get("/api/company/register", (req, res) => {
  res.render("register");
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});
