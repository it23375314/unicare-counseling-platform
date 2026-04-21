const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends a stylized session summary email to the student
 */
const sendBookingConfirmation = async (appointment) => {
  const { studentName, studentEmail, counsellorName, date, time, price, reasonDescription } = appointment;

  const mailOptions = {
    from: `"UniCare Platform" <${process.env.EMAIL_USER}>`,
    to: studentEmail,
    subject: `Booking Confirmed: Session with ${counsellorName}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 24px; color: #1e293b; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="color: #059669; font-size: 32px; font-weight: 800; font-style: italic; margin: 0;">UniCare <span style="font-style: normal; color: #1e293b;">Platform.</span></h1>
          <p style="color: #64748b; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 8px;">Session Confirmation Vault</p>
        </div>

        <div style="background-color: #f8fafc; padding: 30px; border-radius: 20px; margin-bottom: 30px; border: 1px solid #f1f5f9;">
          <h2 style="font-size: 20px; font-weight: 800; margin-top: 0; color: #334155;">Hello ${studentName},</h2>
          <p style="font-size: 15px; color: #64748b; line-height: 1.6;">Your session intake has been successfully recorded. Below is your clinical coordination summary for your upcoming session.</p>
        </div>

        <div style="margin-bottom: 40px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #94a3b8; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">Assigned Expert</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #1e293b; font-size: 15px; font-weight: 700; text-align: right;">${counsellorName}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #94a3b8; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">Temporal Coordination</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #1e293b; font-size: 15px; font-weight: 700; text-align: right;">${date} @ ${time}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #94a3b8; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">Total Valuation</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #1e293b; font-size: 15px; font-weight: 700; text-align: right;">Rs. ${Number(price) + 200}</td>
            </tr>
          </table>
        </div>

        ${reasonDescription ? `
          <div style="margin-bottom: 40px; border-left: 4px solid #059669; padding-left: 20px;">
            <p style="color: #94a3b8; font-size: 11px; font-weight: 800; text-transform: uppercase; margin-bottom: 8px;">Session Objectives</p>
            <p style="font-size: 14px; color: #475569; italic; line-height: 1.5; margin: 0;">"${reasonDescription}"</p>
          </div>
        ` : ''}

        <div style="background-color: #ecfdf5; border: 1px solid #d1fae5; padding: 20px; border-radius: 16px; margin-bottom: 40px;">
          <p style="margin: 0; font-size: 13px; color: #065f46; font-weight: 600; text-align: center;">🛡️ Your safety and privacy are our top priority.</p>
        </div>

        <div style="text-align: center; border-top: 1px solid #f1f5f9; padding-top: 30px; font-size: 12px; color: #94a3b8;">
          <p style="margin: 0;">UniCare University Wellness Center</p>
          <p style="margin: 4px 0 0 0;">This is an automated notification. Please do not reply directly.</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Booking Email Sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending booking email:', error);
    return false;
  }
};

/**
 * Sends a cancellation notification with refund details
 */
const sendCancellationEmail = async (appointment, refundEligible) => {
  const { studentName, studentEmail, counsellorName, date, time } = appointment;

  const mailOptions = {
    from: `"UniCare Platform" <${process.env.EMAIL_USER}>`,
    to: studentEmail,
    subject: `Session Cancelled: Summary & Refund Status`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 24px; color: #1e293b; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 40px;">
          <div style="width: 64px; height: 64px; background-color: #fee2e2; border-radius: 20px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
            <span style="font-size: 32px;">🛑</span>
          </div>
          <h1 style="color: #e11d48; font-size: 28px; font-weight: 800; margin: 0;">Session Cancelled.</h1>
          <p style="color: #64748b; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 8px;">Counselling Coordination Update</p>
        </div>

        <div style="background-color: #f8fafc; padding: 30px; border-radius: 20px; margin-bottom: 30px; border: 1px solid #f1f5f9;">
          <h2 style="font-size: 20px; font-weight: 800; margin-top: 0; color: #334155;">Hello ${studentName},</h2>
          <p style="font-size: 15px; color: #64748b; line-height: 1.6;">Your scheduled session with **${counsellorName}** on **${date}** has been cancelled as per your request.</p>
        </div>

        <div style="background-color: ${refundEligible ? '#ecfdf5' : '#fff1f2'}; border: 1px solid ${refundEligible ? '#d1fae5' : '#ffe4e6'}; padding: 30px; border-radius: 24px; margin-bottom: 40px; text-align: center;">
          <p style="margin: 0 0 10px 0; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: ${refundEligible ? '#065f46' : '#9f1239'};">Refund Status Assessment</p>
          <h3 style="margin: 0; font-size: 24px; font-weight: 900; color: ${refundEligible ? '#065f46' : '#9f1239'};">
            ${refundEligible ? 'Eligible for Full Refund' : 'Non-Refundable Window'}
          </h3>
          <p style="margin: 15px 0 0 0; font-size: 14px; color: ${refundEligible ? '#065f46' : '#9f1239'}; line-height: 1.5; font-weight: 500;">
            ${refundEligible 
              ? "Since you cancelled more than 2 hours before the session, we have initiated a full refund to your university account. Processing takes 3-5 business days." 
              : "Per university policy, sessions cancelled within 2 hours of the start time are not eligible for a refund. We appreciate your understanding."}
          </p>
        </div>

        <div style="text-align: center; border-top: 1px solid #f1f5f9; padding-top: 30px; font-size: 12px; color: #94a3b8;">
          <p style="margin: 0;">UniCare University Wellness Center</p>
          <p style="margin: 4px 0 0 0;">Student Support Vault & Coordination</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Cancellation Email Sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending cancellation email:', error);
    return false;
  }
};

module.exports = { sendBookingConfirmation, sendCancellationEmail };
