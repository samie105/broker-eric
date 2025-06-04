import { NextResponse } from "next/server";
import UserModel from "../../../../mongodbConnect";

export async function POST(request) {
  const { email } = await request.json();

  try {
    // Check if email is provided
    if (!email) {
      return NextResponse.json({ 
        success: false, 
        message: "Email is required" 
      }, { status: 400 });
    }

    // Find user by email
    const user = await UserModel.findOne({ email });
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: "User not found" 
      }, { status: 404 });
    }

    // Return user details without sensitive information
    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error("Error checking user:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Internal server error" 
    }, { status: 500 });
  }
} 