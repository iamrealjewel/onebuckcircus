import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { sendVerificationEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { email, password, name, gender, age, address, agree } = await req.json();

    if (!agree) {
      return new NextResponse("You must agree to be a joker!", { status: 400 });
    }

    // 1. Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return new NextResponse("This email is already part of the circus.", { status: 400 });
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3. Create user (unverified)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        gender,
        age: parseInt(age),
        address,
        emailVerified: null, // Not verified yet
      }
    });

    // 4. Generate Verification Token
    const token = uuidv4();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires
      }
    });

    // 5. Send Real Email via SMTP
    const mailRes = await sendVerificationEmail(email, token);
    if (!mailRes.success) {
      console.error("Critical: Could not send verification email.");
      // We still return success to the user so they check, but log the error
    }

    return NextResponse.json({ 
      message: "Check your email to finalize your clown enrollment!",
      userId: user.id 
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    return new NextResponse("Error during signup: " + error.message, { status: 500 });
  }
}
