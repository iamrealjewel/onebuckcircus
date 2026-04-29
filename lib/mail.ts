import nodemailer from "nodemailer";
import { getAIResponse } from "@/lib/ai";

async function getFunnyEmailMessage(type: "request" | "confirm" | "password") {
  const prompt = type === "request" 
    ? `Generate a very short, funny, sarcastic, circus-themed message (1-2 sentences) about someone requesting to change their email address. Maybe they are running from the authorities, escaping a bad act, or dodging the lion tamer. Return strictly valid JSON: {"message": "..."}`
    : type === "confirm"
      ? `Generate a very short, funny, sarcastic, circus-themed message (1-2 sentences) confirming a new email address. Maybe verifying they are not a figment of a chaotic imagination, or making sure they didn't accidentally sign up a monkey. Return strictly valid JSON: {"message": "..."}`
      : `Generate a very short, funny, sarcastic, circus-themed message (1-2 sentences) about someone forgetting their password. Maybe they got amnesia from the cannonball act or lost it in the ball pit. Return strictly valid JSON: {"message": "..."}`;
  
  try {
    const aiRes = await getAIResponse(prompt);
    // Find json block
    const match = aiRes.content.match(/```(?:json)?\s*([\s\S]*?)```/);
    const rawJson = match ? match[1] : aiRes.content;
    const parsed = JSON.parse(rawJson);
    return parsed.message || (type === "request" 
      ? "We received a request to change your email address. Are the authorities finally catching up to you? No judgment here."
      : type === "confirm"
        ? "This is the final step to adopting your shiny new email address. We just need to make sure this inbox actually exists."
        : "A password reset has been requested. We assume you hit your head during the trapeze act.");
  } catch (err) {
    return type === "request" 
      ? "We received a request to change your email address. Are the authorities finally catching up to you? No judgment here."
      : type === "confirm"
        ? "This is the final step to adopting your shiny new email address. We just need to make sure this inbox actually exists and isn't just a figment of your chaotic imagination."
        : "A password reset has been requested for your account. Please try not to forget it next time.";
  }
}

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

export async function sendEmailChangeRequest(email: string, token: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  const confirmLink = `${process.env.NEXTAUTH_URL}/auth/change-email?token=${token}`;
  const funnyMessage = await getFunnyEmailMessage("request");

  const mailOptions = {
    from: `"One Buck Circus" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Identity Crisis? (Email Change Request) 🎪",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e1e1e1; border-radius: 20px; overflow: hidden;">
        <div style="background: #000; padding: 40px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 32px; letter-spacing: -1px;">One Buck Circus</h1>
        </div>
        <div style="padding: 40px;">
          <h2 style="color: #333; margin-top: 0;">Running Away from the Circus?</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            ${funnyMessage}
            <br/><br/>
            Click the button below to prove you still control this old inbox and tell us where to send your new clown scrolls.
          </p>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${confirmLink}" style="background: #8b5cf6; color: #fff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 18px;">
              Verify Old Inbox & Proceed
            </a>
          </div>
          <p style="color: #999; font-size: 12px;">
            If you didn't request this, some other joker is trying to steal your identity. Ignore this email and stay chaotic. (Expires in 24 hours).
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.verify();
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error: any) {
    console.error("[SMTP] CRITICAL FAILURE:", error.message);
    return { success: false, error };
  }
}

export async function sendNewEmailConfirmation(email: string, token: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  const confirmLink = `${process.env.NEXTAUTH_URL}/auth/confirm-new-email?token=${token}`;
  const funnyMessage = await getFunnyEmailMessage("confirm");

  const mailOptions = {
    from: `"One Buck Circus" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Final Act: Confirm Your New Identity 🎪",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e1e1e1; border-radius: 20px; overflow: hidden;">
        <div style="background: #000; padding: 40px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 32px; letter-spacing: -1px;">One Buck Circus</h1>
        </div>
        <div style="padding: 40px;">
          <h2 style="color: #333; margin-top: 0;">Look at you, all brand new.</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            ${funnyMessage}
          </p>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${confirmLink}" style="background: #10b981; color: #fff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 18px;">
              Confirm New Email
            </a>
          </div>
          <p style="color: #999; font-size: 12px;">
            Click it before the circus leaves town. (Expires in 24 hours).
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.verify();
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error: any) {
    console.error("[SMTP] CRITICAL FAILURE:", error.message);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  const confirmLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;
  const funnyMessage = await getFunnyEmailMessage("password");

  const mailOptions = {
    from: `"One Buck Circus" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Amnesia? (Password Reset Request) 🎪",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e1e1e1; border-radius: 20px; overflow: hidden;">
        <div style="background: #000; padding: 40px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 32px; letter-spacing: -1px;">One Buck Circus</h1>
        </div>
        <div style="padding: 40px;">
          <h2 style="color: #333; margin-top: 0;">Password Reset</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            ${funnyMessage}
          </p>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${confirmLink}" style="background: #ef4444; color: #fff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 18px;">
              Reset Password
            </a>
          </div>
          <p style="color: #999; font-size: 12px;">
            If you did not request this, please ignore this email. Your password will remain unchanged. This link expires in 24 hours.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.verify();
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error: any) {
    console.error("[SMTP] CRITICAL FAILURE:", error.message);
    return { success: false, error };
  }
}

export async function sendFriendInvitationEmail(email: string, inviterName: string, token: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  const signupLink = `${process.env.NEXTAUTH_URL}/auth?refToken=${token}`;

  const prompt = `Act as the cynical Oracle of the 'One Buck Circus'. ${inviterName} is inviting someone to join the circus. Generate a very short, funny, sarcastic message (1-2 sentences) begging/threatening them to join. Return strictly valid JSON: {"message": "..."}`;
  
  let funnyMessage = "${inviterName} thinks you belong in a circus. Frankly, we agree.";
  try {
    const aiRes = await getAIResponse(prompt);
    const match = aiRes.content.match(/```(?:json)?\s*([\s\S]*?)```/);
    const rawJson = match ? match[1] : aiRes.content;
    const parsed = JSON.parse(rawJson);
    if (parsed.message) funnyMessage = parsed.message;
  } catch (err) {}

  const mailOptions = {
    from: `"One Buck Circus" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `${inviterName} has summoned you to the Circus 🎪`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e1e1e1; border-radius: 20px; overflow: hidden; background: #fff;">
        <div style="background: #000; padding: 40px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 32px; letter-spacing: -1px; text-transform: uppercase;">One Buck Circus</h1>
        </div>
        <div style="padding: 40px;">
          <h2 style="color: #333; margin-top: 0; font-size: 24px;">The Oracle has spoken...</h2>
          <div style="background: #f3f4f6; border-left: 4px solid #eab308; padding: 20px; margin: 20px 0; font-style: italic; color: #4b5563;">
            "${funnyMessage}"
          </div>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Your friend <strong>${inviterName}</strong> thinks you are a perfect fit for our circus of chaos. Join them and unlock the madness.
          </p>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${signupLink}" style="background: #000; color: #fff; padding: 18px 36px; border-radius: 14px; text-decoration: none; font-weight: 900; font-size: 18px; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">
              🎪 Enter the Tent
            </a>
          </div>
          <p style="color: #999; font-size: 11px; text-align: center; margin-top: 40px;">
            If you want to stay boring, ignore this email. No judgment. Okay, maybe a little.
          </p>
        </div>
      </div>
    `,
  };

  try {
    console.log(`[SMTP] Attempting to send invitation to ${email} (Inviter: ${inviterName})...`);
    await transporter.verify();
    console.log("[SMTP] Connection verified. Sending invitation...");
    const info = await transporter.sendMail(mailOptions);
    console.log("[SMTP] Success! Invitation sent. Message ID:", info.messageId);
    return { success: true };
  } catch (error: any) {
    console.error("[SMTP] CRITICAL FAILURE:", error.message);
    return { success: false, error };
  }
}
export async function sendAccessRoastEmail(email: string, senderName: string, gameName: string, roast: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  const mailOptions = {
    from: `"One Buck Circus" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `You just got BURNED by ${senderName} 🎪🔥`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #f97316; border-radius: 20px; overflow: hidden; background: #fff;">
        <div style="background: linear-gradient(to right, #000, #f97316); padding: 40px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 32px; letter-spacing: -1px; text-transform: uppercase;">The Oracle's Burn</h1>
        </div>
        <div style="padding: 40px;">
          <h2 style="color: #333; margin-top: 0; font-size: 24px;">Apply Ice to Burned Area...</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Your friend <strong>${senderName}</strong> tried to invite you to a match of <strong>${gameName}</strong>, but the Oracle noticed you are currently too "insignificant" to have access.
          </p>
          <div style="background: #fff7ed; border-left: 4px solid #f97316; padding: 25px; margin: 20px 0; font-style: italic; color: #7c2d12; font-size: 18px; line-height: 1.5; border-radius: 0 12px 12px 0;">
            "${roast}"
          </div>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            If you want to stop being the punchline of the Oracle's jokes, we suggest you upgrade your Circus Pass immediately.
          </p>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.NEXTAUTH_URL}/circus-pass" style="background: #f97316; color: #fff; padding: 18px 36px; border-radius: 14px; text-decoration: none; font-weight: 900; font-size: 18px; text-transform: uppercase; letter-spacing: 1px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(249, 115, 22, 0.3);">
              Upgrade My Pass
            </a>
          </div>
          <p style="color: #999; font-size: 11px; text-align: center; margin-top: 40px;">
            This roast was officially authorized by the One Buck Circus. Don't take it personally. Or do. It's funnier that way.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.verify();
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error: any) {
    console.error("[SMTP] ROAST FAILURE:", error.message);
    return { success: false, error };
  }
}
