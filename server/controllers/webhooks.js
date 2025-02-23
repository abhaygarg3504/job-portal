import { Webhook } from "svix";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

export const clerkWebhook = async (req, res) => {
    try {
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
        const payload = JSON.stringify(req.body);

        whook.verify(payload, {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"]
        });

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


// import { Webhook } from "svix";
// import User from "../models/User.js";
// import dotenv from "dotenv";
// import getRawBody from "raw-body";

// dotenv.config();

// export const clerkWebhook = async (req, res) => {
//     try {
//         const payload = await getRawBody(req); // Get raw body
//         const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

//         whook.verify(payload.toString(), { // Convert to string before verification
//             "svix-id": req.headers["svix-id"],
//             "svix-timestamp": req.headers["svix-timestamp"],
//             "svix-signature": req.headers["svix-signature"]
//         });

//         const { data, type } = JSON.parse(payload.toString()); // Parse JSON manually

//         switch (type) {
//             case 'user.created': {
//                 const newUser = new User({
//                     _id: data.id,
//                     email: data.email_addresses[0].email_address,
//                     name: `${data.first_name} ${data.last_name}`,
//                     image: data.image_url,
//                     resume: ''
//                 });

//                 await newUser.save();
//                 return res.json({ message: "User created successfully" });
//             }

//             case 'user.updated': {
//                 await User.findByIdAndUpdate(data.id, {
//                     name: `${data.first_name} ${data.last_name}`,
//                     email: data.email_addresses[0].email_address,
//                     image: data.image_url
//                 });
//                 return res.json({ message: "User updated successfully" });
//             }

//             case 'user.deleted': {
//                 await User.findByIdAndDelete(data.id);
//                 return res.json({ message: "User deleted successfully" });
//             }

//             default:
//                 return res.status(400).json({ error: "Unknown webhook event" });
//         }
//     } catch (err) {
//         console.error("Webhook error:", err.message);
//         return res.status(500).json({ error: err.message });
//     }
// };
// import { Webhook } from "svix";
// import User from "../models/User.js";
// import dotenv from "dotenv";
// import getRawBody from "raw-body";

// dotenv.config();

// export const clerkWebhook = async (req, res) => {
//     try {
//         console.log("🔍 Webhook received - Checking headers and raw body...");

//         // Step 1: Ensure headers are received correctly
//         const svixId = req.headers["svix-id"];
//         const svixTimestamp = req.headers["svix-timestamp"];
//         const svixSignature = req.headers["svix-signature"];

//         if (!svixId || !svixTimestamp || !svixSignature) {
//             console.error("❌ Missing Svix headers!");
//             return res.status(400).json({ error: "Missing Svix headers" });
//         }
//         console.log("✅ Svix headers received.");

//         // Step 2: Get raw body data
//         const payload = await getRawBody(req);
//         console.log("✅ Raw payload received:", payload.toString());

//         // Step 3: Verify webhook signature
//         const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
//         try {
//             whook.verify(payload.toString(), {
//                 "svix-id": svixId,
//                 "svix-timestamp": svixTimestamp,
//                 "svix-signature": svixSignature
//             });
//             console.log("✅ Webhook signature verified.");
//         } catch (error) {
//             console.error("❌ Webhook signature verification failed!", error.message);
//             return res.status(403).json({ error: "Invalid webhook signature" });
//         }

//         // Step 4: Parse JSON payload safely
//         let parsedPayload;
//         try {
//             parsedPayload = JSON.parse(payload.toString());
//             console.log("✅ Parsed payload:", parsedPayload);
//         } catch (error) {
//             console.error("❌ JSON parsing failed:", error.message);
//             return res.status(400).json({ error: "Invalid JSON format" });
//         }

//         // Step 5: Extract type and data
//         const { data, type } = parsedPayload;
//         if (!data || !type) {
//             console.error("❌ Missing 'data' or 'type' in webhook payload!");
//             return res.status(400).json({ error: "Invalid webhook structure" });
//         }
//         console.log(`🔄 Processing webhook event: ${type}`);

//         // Step 6: Handle different event types
//         switch (type) {
//             case 'user.created': {
//                 console.log("🆕 Creating new user:", data);

//                 const newUser = new User({
//                     _id: data.id,
//                     email: data.email_addresses?.[0]?.email_address || "No email provided",
//                     name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
//                     image: data.image_url || '',
//                     resume: ''
//                 });

//                 await newUser.save();
//                 console.log("✅ User created successfully:", newUser);
//                 return res.json({ message: "User created successfully" });
//             }

//             case 'user.updated': {
//                 console.log("🔄 Updating user:", data);

//                 const updatedUser = await User.findByIdAndUpdate(data.id, {
//                     name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
//                     email: data.email_addresses?.[0]?.email_address || "No email provided",
//                     image: data.image_url || ''
//                 }, { new: true });

//                 console.log("✅ User updated successfully:", updatedUser);
//                 return res.json({ message: "User updated successfully" });
//             }

//             case 'user.deleted': {
//                 console.log("🗑️ Deleting user:", data);

//                 await User.findByIdAndDelete(data.id);
//                 console.log("✅ User deleted successfully:", data.id);
//                 return res.json({ message: "User deleted successfully" });
//             }

//             default:
//                 console.warn("⚠️ Unknown webhook event type:", type);
//                 return res.status(400).json({ error: "Unknown webhook event" });
//         }
//     } catch (err) {
//         console.error("❌ Webhook error:", err.message);
//         return res.status(500).json({ error: err.message });
//     }
// };
