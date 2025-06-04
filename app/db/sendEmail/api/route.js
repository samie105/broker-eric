import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request) {
  const { email, amount, name } = await request.json();

  // Create a Nodemailer transporter with your email credentials

  try {
    // Send the email

    return new NextResponse({
      status: 200,
      body: "Deposit confirmation email sent successfully",
    });
  } catch (error) {
    console.error("Error while sending email:", error);
    return new NextResponse({
      status: 500,
      body: "Internal Server Error",
    });
  }
}
