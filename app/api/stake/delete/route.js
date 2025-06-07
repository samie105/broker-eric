import { NextResponse } from "next/server";
import UserModel from "../../../../mongodbConnect";
import crypto from "crypto";

// Helper function to handle staking deletion logic
async function deleteStaking(email, stakingId) {
  try {
    // Find the user
    const user = await UserModel.findOne({ email });
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: "User not found" 
      }, { status: 404 });
    }

    // Find the staking in the user's stakings array
    const stakingIndex = user.stakings.findIndex(
      stake => stake.id === stakingId
    );

    if (stakingIndex === -1) {
      return NextResponse.json({ 
        success: false, 
        message: "Staking request not found" 
      }, { status: 404 });
    }

    const staking = user.stakings[stakingIndex];

    // Check if this is the user's staking or if they are the partner
    if (staking.initiatorEmail !== email && staking.partnerEmail !== email) {
      return NextResponse.json({ 
        success: false, 
        message: "Not authorized to delete this staking request" 
      }, { status: 403 });
    }

    // If user is the initiator, handle the cancellation process
    if (staking.initiatorEmail === email && staking.status === "pending") {
      // Create notification for the initiator
      const initiatorNotification = {
        id: crypto.randomUUID(),
        method: "neutral",
        type: "staking",
        message: `You have cancelled your joint transaction invitation of ${staking.stakedAmount} ${staking.stakedAssetSymbol} for ${staking.stakedDuration} months.`,
        date: new Date(),
        category: "staking",
        status: "unread"
      };
      
      // Add notification to initiator's notifications array
      if (!user.notifications) {
        user.notifications = [];
      }
      user.notifications.push(initiatorNotification);
      
      // Set isReadNotifications to false
      user.isReadNotifications = false;
      
      // If there's a partner, notify them and remove the staking from their invitations
      if (staking.partnerEmail) {
        const partner = await UserModel.findOne({ email: staking.partnerEmail });
        
        if (partner) {
          // Remove the staking invitation from partner's stakingInvitations array
          if (partner.stakingInvitations && partner.stakingInvitations.length > 0) {
            const partnerInvitationIndex = partner.stakingInvitations.findIndex(
              invitation => invitation.id === stakingId
            );
            
            if (partnerInvitationIndex !== -1) {
              partner.stakingInvitations.splice(partnerInvitationIndex, 1);
            }
          }
          
          // Create notification for the partner
          const partnerNotification = {
            id: crypto.randomUUID(),
            method: "neutral",
            type: "staking",
            message: `${user.name} has cancelled their joint transaction invitation of ${staking.stakedAmount} ${staking.stakedAssetSymbol} for ${staking.stakedDuration} months.`,
            date: new Date(),
            category: "staking",
            status: "unread"
          };
          
          // Add notification to partner's notifications array
          if (!partner.notifications) {
            partner.notifications = [];
          }
          partner.notifications.push(partnerNotification);
          
          // Set isReadNotifications to false for partner
          partner.isReadNotifications = false;
          
          await partner.save();
        }
      }
    }

    // Remove the staking from the user's stakings array
    user.stakings.splice(stakingIndex, 1);
    
    // Save changes to the database
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Transaction request cancelled successfully"
    });
  } catch (error) {
    console.error("Error deleting staking request:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Internal server error" 
    }, { status: 500 });
  }
}

// POST method handler
export async function POST(request) {
  const { email, stakingId } = await request.json();
  return deleteStaking(email, stakingId);
}

// DELETE method handler (fallback for browsers that don't support fetch with POST)
export async function DELETE(request) {
  // Extract query parameters from URL
  const url = new URL(request.url);
  const email = url.searchParams.get('email');
  const stakingId = url.searchParams.get('stakingId');
  
  if (!email || !stakingId) {
    return NextResponse.json({ 
      success: false, 
      message: "Missing required parameters" 
    }, { status: 400 });
  }
  
  return deleteStaking(email, stakingId);
} 