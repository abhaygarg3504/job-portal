import cron from "node-cron";
import nodemailer from "nodemailer";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

// Setup Nodemailer with Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MY_EMAIL, // your Gmail address
    pass: process.env.MY_EMAIL_PASSWORD, // 16-digit App Password
  },
});

export const scheduleSubscriptionCheck = () => {
  // Runs every day at 9 AM
  cron.schedule("0 9 * * *", async () => {
    try {
      const users = await User.find({ isPro: true });

      for (const user of users) {
        if (!user.proExpiresAt || isNaN(new Date(user.proExpiresAt))) {
          continue; // skip if no valid expiry date
        }

        const expiryDate = new Date(user.proExpiresAt);
        const now = new Date();
        const timeDiff = expiryDate - now;
        const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        if (daysLeft <= 5 && daysLeft > 0) {
          // Send reminder email
          const mailOptions = {
            from: process.env.GOOGLE_EMAIL,
            to: user.email,
            subject: "Subscription Expiry Reminder",
            text: `Hi ${user.name}, your subscription will expire in ${daysLeft} day(s). Please renew to keep your Pro benefits.`,
          };

          await transporter.sendMail(mailOptions);
          console.log(`Reminder email sent to ${user.email}`);
        }

        // If expired
        if (daysLeft <= 0) {
          user.isPro = false;
          user.proExpiresAt = null;
          await user.save();
          console.log(`Updated subscription: ${user.email} set to isPro=false`);
        }
      }
    } catch (err) {
      console.error("Cron Job Error:", err.message);
    }
  });
};
