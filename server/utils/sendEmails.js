// // sendEmail.js
// import sgMail from '@sendgrid/mail';

// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// /**
//  * Send an email using SendGrid
//  * @param {string} to - Recipient email
//  * @param {string} subject - Email subject
//  * @param {string} htmlContent - Email HTML content
//  */
// export const sendEmail = async (to, subject, htmlContent) => {
//   const msg = {
//     to,
//     from: process.env.SENDGRID_VERIFIED_SENDER, // your verified sender email
//     subject,
//     html: htmlContent,
//   };

//   try {
//     await sgMail.send(msg);
//     // console.log('Email sent to:', to);
//   } catch (error) {
//     console.error('Error sending email:', error);
//     throw error; // let caller handle error
//   }
// };
// sendEmail.js


import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MY_EMAIL,
    pass: process.env.MY_EMAIL_PASSWORD, // 16-digit App Password if using Gmail
  },
});

/**
 * Send an email using Gmail via Nodemailer
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} htmlContent - Email HTML content
 */
export const sendEmail = async (to, subject, htmlContent) => {
  const mailOptions = {
    from: `"Job Portal" <${process.env.MY_EMAIL}>`,
    to,
    subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    // console.log(`Email sent to: ${to}`);
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw error;
  }
};
