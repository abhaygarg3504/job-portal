import express from "express"
import cors from "cors"
import "dotenv/config"
import connectDB from './config/db.js'
import { clerkWebhook } from "./controllers/webhooks.js"

const app = express();

app.use(cors());
app.use(express.json())
connectDB()

app.get('/', async(req, res)=>{
    res.send("API working")
})

app.post('/webhooks', clerkWebhook);

const PORT = process.env.PORT || 5000

app.listen(PORT,()=>{
    console.log(`Server running at ${PORT}`)
})
