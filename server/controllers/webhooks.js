import { Webhook } from "svix";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

export const clerkWebhook = async (req, res) => {
    try {
        console.log("Webhook request received"); // Debug log

        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
        const payload = req.body; // Use raw body if required by Clerk
        const headers = {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"]
        };

        // Verify webhook signature
        whook.verify(JSON.stringify(payload), headers);
        console.log("Webhook verified successfully"); // Debug log

        const { data, type } = payload;

        if (!data) {
            return res.status(400).json({ error: "Invalid webhook data" });
        }

        switch (type) {
            case "user.created": {
                if (!data.id || !data.email_addresses?.length) {
                    return res.status(400).json({ error: "Invalid user data" });
                }

                const newUser = new User({
                    _id: data.id,
                    email: data.email_addresses[0]?.email_address || "",
                    name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
                    image: data.image_url || "",
                    resume: ""
                });

                await newUser.save();
                console.log("User created:", newUser); // Debug log
                return res.status(201).json({ message: "User created successfully", user: newUser });
            }

            case "user.updated": {
                if (!data.id) {
                    return res.status(400).json({ error: "User ID is missing" });
                }

                const updatedUser = await User.findByIdAndUpdate(data.id, {
                    name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
                    email: data.email_addresses[0]?.email_address || "",
                    image: data.image_url || ""
                }, { new: true });

                if (!updatedUser) {
                    return res.status(404).json({ error: "User not found" });
                }

                console.log("User updated:", updatedUser); // Debug log
                return res.json({ message: "User updated successfully", user: updatedUser });
            }

            case "user.deleted": {
                if (!data.id) {
                    return res.status(400).json({ error: "User ID is missing" });
                }

                const deletedUser = await User.findByIdAndDelete(data.id);
                if (!deletedUser) {
                    return res.status(404).json({ error: "User not found" });
                }

                console.log("User deleted:", deletedUser); // Debug log
                return res.json({ message: "User deleted successfully" });
            }

            default:
                return res.status(400).json({ error: "Unknown webhook event type" });
        }
    } catch (err) {
        console.error("Webhook error:", err.message);
        return res.status(500).json({ error: "Server error" });
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
        console.log("User manually created:", newUser); // Debug log
        return res.status(201).json({ message: "User created successfully", user: newUser });
    } catch (err) {
        console.error("Create User Error:", err.message);
        return res.status(500).json({ error: "Server error" });
    }
};
