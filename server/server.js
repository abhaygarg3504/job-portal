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
import { clerkMiddleware, requireAuth } from "@clerk/express";
import contactRoutes from "./routes/contactRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { Server } from "socket.io";
import http from "http";
import cron from "node-cron"
import Contact from "./models/Contact.js";
import { connectToDatabase } from "./config/postgresConnect.js";
import { scheduleSubscriptionCheck } from "./cron/subscriptionReminder.js";
const app = express();

const corsConfig = {
  origin: "*",
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
};
app.use(cors(corsConfig));
app.options("*", cors(corsConfig)); 
app.use(express.json());
app.use(clerkMiddleware());

const server = http.createServer(app);

await connectDB();
await connectCloudinary();

app.get("/", async (req, res) => {
  res.send("API working");
});

scheduleSubscriptionCheck()

app.set("view engine", "ejs");
app.set("views", path.join(path.resolve(), "views"));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use("/api/company", companyRouter);
app.use("/api/jobs", jobRouter);
app.use("/api/users", userRouter);
app.use("/api/contacts", contactRoutes);
app.use("/api/messages", messageRoutes);


await connectToDatabase()

export const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

export const userSocketMap = {};

const getOnlineUsers = () => {
  const users = [];

  Object.entries(userSocketMap).forEach(([model_id, sockets]) => {
    const [model, id] = model_id.split("_");
    const allJobTitles = new Set();

    Object.values(sockets).forEach((titles) => {
      titles.forEach((title) => allJobTitles.add(title));
    });

    users.push({
      id,
      model,
      jobTitles: Array.from(allJobTitles)
    });
  });

  return users;
};

io.on("connection", async (socket) => {
  const { id, model, jobTitles } = socket.handshake.query;

  if (!id || !model || !jobTitles) {
    console.warn("Invalid socket connection query params");
    return;
  }

  const parsedTitles = JSON.parse(jobTitles); 
  const modelKey = `${model}_${id}`;

  if (!userSocketMap[modelKey]) {
    userSocketMap[modelKey] = {};
  }

  userSocketMap[modelKey][socket.id] = parsedTitles;

  if (model === "User") {
    await Contact.updateMany(
      { userId: id, jobTitle: { $in: parsedTitles } },
      { $set: { isUserOnline: true } }
    );
  } else if (model === "Company") {
  await Contact.updateMany(
    { recruiterId: id, jobTitle: { $in: parsedTitles } },
    { $set: { isRecruiterOnline: true } }
  );
}

  console.log(`[CONNECTED] ${modelKey} via socket ${socket.id}`);
  io.emit("getOnlineUsers", getOnlineUsers());

  socket.on("disconnect", async () => {
    if (userSocketMap[modelKey]) {
      delete userSocketMap[modelKey][socket.id];

      if (Object.keys(userSocketMap[modelKey]).length === 0) {
        delete userSocketMap[modelKey];

       if (model === "User") {
          await Contact.updateMany(
            { userId: id, jobTitle: { $in: parsedTitles } },
            { $set: { isUserOnline: false } }
          );
        } else if (model === "Company") {
        await Contact.updateMany(
          { recruiterId: id, jobTitle: { $in: parsedTitles } },
          { $set: { isRecruiterOnline: false } }
        );
      }
      }
    }

    console.log(`[DISCONNECTED] ${modelKey} from socket ${socket.id}`);
    io.emit("getOnlineUsers", getOnlineUsers());
  });
});

app.post("/webhooks", clerkWebhook);

app.get("/api/company/register", (req, res) => {
  res.render("register");
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});
