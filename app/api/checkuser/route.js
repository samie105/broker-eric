import { NextResponse } from "next/server";
import UserModel from "../../../mongodbConnect";

export async function POST(request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ 
        exists: false, 
        message: "Email is required" 
      }, { status: 400 });
    }

    // Convert email to lowercase for case-insensitive comparison
    const normalizedEmail = email.toLowerCase();
    
    const user = await UserModel.findOne({ 
      email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') }
    });
    
    if (user) {
      return NextResponse.json({ 
        exists: true, 
        name: user.name || user.firstName || 'User',
        email: user.email
      }, { status: 200 });
    } else {
      return NextResponse.json({ 
        exists: false, 
        message: "User not found" 
      }, { status: 200 });
    }
  } catch (error) {
    console.error("Error checking user:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
} 