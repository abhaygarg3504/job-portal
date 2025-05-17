// sendEmail.js
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Send an email using SendGrid
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} htmlContent - Email HTML content
 */
export const sendEmail = async (to, subject, htmlContent) => {
  const msg = {
    to,
    from: process.env.SENDGRID_VERIFIED_SENDER, // your verified sender email
    subject,
    html: htmlContent,
  };

  try {
    await sgMail.send(msg);
    // console.log('Email sent to:', to);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error; // let caller handle error
  }
};
