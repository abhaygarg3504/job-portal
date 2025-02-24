import { Webhook } from "svix";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

export const clerkWebhook = async (req, res) => {
    try {
        console.log("request hit webhook endpoint")
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
        const payload = JSON.stringify(req.body);

        whook.verify(payload, {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"]
        });
        console.log("svix verified")
        const { data, type } = req.body;

        switch (type) {
            case 'user.created': {
                const newUser = new User({
                    _id: data.id,
                    email: data.email_addresses[0].email_address,
                    name: `${data.first_name} ${data.last_name}`,
                    image: data.image_url,
                    resume: ''
                });

                await newUser.save();
                return res.json({ message: "User created successfully" });
            }

            case 'user.updated': {
                await User.findByIdAndUpdate(data.id, {
                    name: `${data.first_name} ${data.last_name}`,
                    email: data.email_addresses[0].email_address,
                    image: data.image_url
                });
                return res.json({ message: "User updated successfully" });
            }

            case 'user.deleted': {
                await User.findByIdAndDelete(data.id);
                return res.json({ message: "User deleted successfully" });
            }

            default:
                return res.status(400).json({ error: "Unknown webhook event" });
        }
    } catch (err) {
        console.error("Webhook error:", err.message);
        return res.status(500).json({ error: err.message });
    }
};

// API for creating users manually from frontend
export const createUser = async (req, res) => {
    try {
        const { id, name, email, image, resume } = req.body;

        if (!id || !name || !email || !image) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const userExists = await User.findById(id);
        if (userExists) {
            return res.status(400).json({ error: "User already exists" });
        }

        const newUser = new User({
            _id: id,
            name,
            email,
            image,
            resume: resume || ""
        });

        await newUser.save();
        res.status(201).json({ message: "User created successfully", user: newUser });
    } catch (err) {
        console.error("Create User Error:", err.message);
        res.status(500).json({ error: "Server error" });
    }
};
