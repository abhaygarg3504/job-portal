import { Webhook } from "svix";
import User from "../models/User.js";

export const clerkWebhook = async (req, res) => {
    try {
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
        whook.verify(JSON.stringify(req.body), {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"]
        });

        const { data, type } = req.body;

        switch (type) {
            case 'user-created': {
                const userdata = {
                    _id: data.id,
                    email: data.email_addresses[0].email_address,
                    name: `${data.first_name} ${data.last_name}`,
                    image: data.image_url,
                    resume: ''
                };

                await User.create(userdata);
                res.json({ message: "User created successfully" });
                break;
            }

            case 'user-updated': {
                await User.findByIdAndUpdate(data.id, {
                    name: `${data.first_name} ${data.last_name}`,
                    email: data.email_addresses[0].email_address,
                    image: data.image_url
                });
                 res.json({ message: "User updated successfully" });
                break;
            }

            case 'user-deleted': {
                await User.findByIdAndDelete(data.id);
                 res.json({ message: "User deleted successfully" });
                break ;           
            }

            default:
                break;
        }
    } catch (err) {
        console.error("Webhook error:", err.message);
        return res.status(500).json({ error: err.message });
    }
};
