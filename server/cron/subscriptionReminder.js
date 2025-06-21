import cron from "node-cron";
import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmails.js";

const CRON_SCHEDULE = process.env.CRON_SCHEDULE || "0 2 * * *"; // 2 AM daily

export const scheduleSubscriptionCheck = () => {
  cron.schedule(CRON_SCHEDULE, async () => {
    try {
      const now = new Date();

      //
      // 1) Deactivate expired subscriptions
      //
      const expiredUsers = await User.find({
        isPro: true,
        proExpiresAt: { $lte: now },
      });

      for (const user of expiredUsers) {
        user.isPro = false;
        user.proExpiresAt = null;
        await user.save();

        // optional: let them know
        await sendEmail(
          user.email,
          "Your Subscription Has Expired",
          `<p>Hi ${user.name},</p>
           <p>Your Pro subscription expired on ${now.toLocaleDateString()}.</p>
           <p>Renew anytime to regain access to premium features.</p>
           <p>– The Job Portal Team</p>`
        );

        console.log(`Deactivated and emailed expiry notice to ${user.email}`);
      }

      //
      // 2) Send 4‑day reminder
      //
      const fourDaysFromNow = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);
      const startOfDay = new Date(fourDaysFromNow).setHours(0, 0, 0, 0);
      const endOfDay   = new Date(fourDaysFromNow).setHours(23, 59, 59, 999);

      const usersToRemind = await User.find({
        isPro: true,
        proExpiresAt: { $gte: startOfDay, $lt: endOfDay },
      });

      for (const user of usersToRemind) {
        await sendEmail(
          user.email,
          "Your Subscription Expires in 4 Days",
          `<p>Hi ${user.name},</p>
           <p>Your Pro subscription will expire on ${user.proExpiresAt.toLocaleDateString()}.</p>
           <p>Please renew to keep enjoying premium features.</p>
           <p>– The Job Portal Team</p>`
        );
        console.log(`Sent expiry reminder to ${user.email}`);
      }
    } catch (err) {
      console.error("Subscription‐check cron error:", err);
    }
  });

  console.log(`Subscription‐check job scheduled (${CRON_SCHEDULE})`);
};
