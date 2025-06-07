import { NextResponse } from "next/server";
import UserModel from "../../../../mongodbConnect";

export async function POST(request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ 
        success: false, 
        message: "Email is required" 
      }, { status: 400 });
    }

    // Find the user
    const user = await UserModel.findOne({ email });
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: "User not found" 
      }, { status: 404 });
    }

    // Extract stakingInvitations
    const stakingInvitations = user.stakingInvitations || [];
    
    // Count pending invitations that require action
    const pendingInvitations = stakingInvitations.filter(
      invitation => invitation.status === "pending-partner"
    );

    return NextResponse.json({
      success: true,
      pendingInvitations,
      count: pendingInvitations.length
    });
  } catch (error) {
    console.error("Error checking staking invitations:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to check staking invitations" 
    }, { status: 500 });
  }
}

