import nodemailer from "nodemailer";

export async function sendVerificationEmail(email: string, token: string) {
  // Create transporter inside the function to ensure process.env is read correctly
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Using the built-in service helper for Gmail
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const confirmLink = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`;

  const mailOptions = {
    from: `"One Buck Circus" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Finalize Your Clown Enrollment! 🎪",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e1e1e1; border-radius: 20px; overflow: hidden;">
        <div style="background: #000; padding: 40px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 32px; letter-spacing: -1px;">One Buck Circus</h1>
        </div>
        <div style="padding: 40px;">
          <h2 style="color: #333; margin-top: 0;">Welcome, Performer!</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Your scroll has been signed, but the Oracle requires one final verification before you can enter the tent.
          </p>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${confirmLink}" style="background: #8b5cf6; color: #fff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 18px;">
              Verify My Enrollment
            </a>
          </div>
          <p style="color: #999; font-size: 12px;">
            If you didn't sign this scroll, please ignore this email. The link expires in 24 hours.
          </p>
        </div>
      </div>
    `,
  };

  try {
    console.log(`[SMTP] Attempting to send verification to ${email} using ${process.env.SMTP_USER}...`);
    
    // Test the connection before sending
    await transporter.verify();
    console.log("[SMTP] Connection verified. Sending mail...");

    const info = await transporter.sendMail(mailOptions);
    console.log("[SMTP] Success! Message ID:", info.messageId);
    return { success: true };
  } catch (error: any) {
    console.error("[SMTP] CRITICAL FAILURE:", error.message);
    if (error.code === 'EAUTH') {
      console.error("[SMTP] Authentication failed. Check your App Password and Email.");
    }
    return { success: false, error };
  }
}
