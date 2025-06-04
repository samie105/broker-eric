import { NextResponse } from "next/server";
import UserModel from "../../../../mongodbConnect";
import crypto from "crypto";

// Helper function to handle investment deletion logic
async function deleteInvestment(email, investmentId) {
  try {
    // Find the user
    const user = await UserModel.findOne({ email });
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: "User not found" 
      }, { status: 404 });
    }

    // Find the investment in the user's investments array
    const investmentIndex = user.investments.findIndex(
      inv => inv.id === investmentId
    );

    if (investmentIndex === -1) {
      return NextResponse.json({ 
        success: false, 
        message: "Investment not found" 
      }, { status: 404 });
    }

    const investment = user.investments[investmentIndex];

    // Check if this is the user's investment or if they are the partner
    if (investment.initiatorEmail !== email && investment.partnerEmail !== email) {
      return NextResponse.json({ 
        success: false, 
        message: "Not authorized to delete this investment" 
      }, { status: 403 });
    }

    // Check if the investment is in pending status
    if (investment.status !== "pending") {
      return NextResponse.json({ 
        success: false, 
        message: "Only pending investments can be deleted" 
      }, { status: 400 });
    }

    // If user is the initiator, refund their contribution
    if (investment.initiatorEmail === email) {
      user.tradingBalance += investment.initiatorAmount;
      
      // Create notification for the initiator
      const initiatorNotification = {
        id: crypto.randomUUID(),
        method: "neutral",
        type: "investment",
        message: `You have cancelled your joint investment invitation of $${investment.totalAmount} for ${investment.duration}. Your contribution has been refunded.`,
        date: new Date(),
      };
      
      // Add notification to initiator's notifications array
      user.notifications.push(initiatorNotification);
      
      // Set isReadNotifications to false
      user.isReadNotifications = false;
      
      // If there's a partner, notify them and remove the investment from their array
      if (investment.partnerEmail) {
        const partner = await UserModel.findOne({ email: investment.partnerEmail });
        
        if (partner) {
          // Remove the investment from partner's investments array
          const partnerInvestmentIndex = partner.investments.findIndex(
            inv => inv.id === investmentId
          );
          
          if (partnerInvestmentIndex !== -1) {
            partner.investments.splice(partnerInvestmentIndex, 1);
          }
          
          // Create notification for the partner
          const partnerNotification = {
            id: crypto.randomUUID(),
            method: "neutral",
            type: "investment",
            message: `${user.name} has cancelled their joint investment invitation of $${investment.totalAmount} for ${investment.duration}.`,
            date: new Date(),
          };
          
          // Add notification to partner's notifications array
          partner.notifications.push(partnerNotification);
          
          // Set isReadNotifications to false for partner
          partner.isReadNotifications = false;
          
          await partner.save();
        }
      }
    } else if (investment.partnerEmail === email) {
      // If user is the partner, notify the initiator and remove from their array too
      const initiator = await UserModel.findOne({ email: investment.initiatorEmail });
      
      if (initiator) {
        // Remove the investment from initiator's investments array
        const initiatorInvestmentIndex = initiator.investments.findIndex(
          inv => inv.id === investmentId
        );
        
        if (initiatorInvestmentIndex !== -1) {
          // If initiator is found, refund their contribution
          initiator.tradingBalance += investment.initiatorAmount;
          
          initiator.investments.splice(initiatorInvestmentIndex, 1);
          
          // Create notification for the initiator
          const initiatorNotification = {
            id: crypto.randomUUID(),
            method: "neutral",
            type: "investment",
            message: `${user.name} has declined your joint investment invitation of $${investment.totalAmount} for ${investment.duration}. Your contribution has been refunded.`,
            date: new Date(),
          };
          
          // Add notification to initiator's notifications array
          initiator.notifications.push(initiatorNotification);
          
          // Set isReadNotifications to false for initiator
          initiator.isReadNotifications = false;
          
          await initiator.save();
        }
      }
      
      // Create notification for the partner (current user)
      const partnerNotification = {
        id: crypto.randomUUID(),
        method: "neutral",
        type: "investment",
        message: `You have declined the joint investment invitation of $${investment.totalAmount} for ${investment.duration}.`,
        date: new Date(),
      };
      
      // Add notification to partner's notifications array
      user.notifications.push(partnerNotification);
      
      // Set isReadNotifications to false
      user.isReadNotifications = false;
    }

    // Remove the investment from the user's investments array
    user.investments.splice(investmentIndex, 1);
    
    // Save changes to the database
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Investment request deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting investment:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Internal server error" 
    }, { status: 500 });
  }
}

// POST method handler
export async function POST(request) {
  const { email, investmentId } = await request.json();
  return deleteInvestment(email, investmentId);
}

// DELETE method handler
export async function DELETE(request) {
  // Extract query parameters from URL
  const url = new URL(request.url);
  const email = url.searchParams.get('email');
  const investmentId = url.searchParams.get('investmentId');
  
  if (!email || !investmentId) {
    return NextResponse.json({ 
      success: false, 
      message: "Missing required parameters" 
    }, { status: 400 });
  }
  
  return deleteInvestment(email, investmentId);
} 