import { NextResponse } from "next/server";
import UserModel from "../../../../mongodbConnect";
import crypto from "crypto";

/**
 * Handles investment request responses (accept/decline)
 */
export async function POST(request) {
  try {
    const { email, investmentId, response } = await request.json();

    // Validate input parameters
    if (!email || !investmentId || !response) {
      return NextResponse.json({ 
        success: false, 
        message: "Missing required parameters" 
      }, { status: 400 });
    }

    if (response !== "accept" && response !== "decline") {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid response type. Must be 'accept' or 'decline'" 
      }, { status: 400 });
    }

    // Find the responding user
    const responder = await UserModel.findOne({ email });
    
    if (!responder) {
      return NextResponse.json({ 
        success: false, 
        message: "User not found" 
      }, { status: 404 });
    }

    // Find the investment initiator
    const initiator = await UserModel.findOne({
      "investments.id": investmentId,
      "investments.type": "joint",
      "investments.status": "pending"
    });

    if (!initiator) {
      return NextResponse.json({ 
        success: false, 
        message: "Investment request not found or already processed" 
      }, { status: 404 });
    }

    // Find the specific investment
    const investmentIndex = initiator.investments.findIndex(
      inv => inv.id === investmentId && inv.status === "pending"
    );

    if (investmentIndex === -1) {
      return NextResponse.json({ 
        success: false, 
        message: "Investment request not found or already processed" 
      }, { status: 404 });
    }

    const investment = initiator.investments[investmentIndex];

    // Verify that this is a joint investment and the responder is the partner
    if (investment.type !== "joint" || investment.partnerEmail !== email) {
      return NextResponse.json({ 
        success: false, 
        message: "Not authorized to respond to this investment request" 
      }, { status: 403 });
    }

    // Find the investment in responder's array if it exists
    const responderInvestmentIndex = responder.investments?.findIndex(
      inv => inv.id === investmentId
    ) ?? -1;
    
    // Initialize message variable in the outer scope
    let message;
    
    // Process the response
    if (response === "accept") {
      // Check if responder has sufficient balance
      if (responder.tradingBalance < investment.partnerAmount) {
        return NextResponse.json({ 
          success: false, 
          message: `Insufficient balance. You need $${investment.partnerAmount} to accept this investment.` 
        }, { status: 400 });
      }

      // Update investment status to active in initiator's record
      initiator.investments[investmentIndex].status = "active";
      
      // Deduct partner's portion from their trading balance
      responder.tradingBalance -= investment.partnerAmount;
      
      // Update or create the investment in responder's array
      if (responderInvestmentIndex !== -1) {
        responder.investments[responderInvestmentIndex].status = "active";
      } else {
        // Ensure investments array exists
        if (!responder.investments) {
          responder.investments = [];
        }
        
        // Add the investment to responder's array
        responder.investments.push({
          ...investment,
          status: "active"
        });
      }
      
      // Create notifications
      const initiatorNotification = {
        id: crypto.randomUUID(),
        method: "success",
        type: "investment",
        message: `${responder.name} has accepted your joint investment invitation of $${investment.totalAmount} for ${investment.duration}.`,
        date: new Date(),
      };

      const partnerNotification = {
        id: crypto.randomUUID(),
        method: "success",
        type: "investment",
        message: `You have successfully joined ${initiator.name}'s $${investment.totalAmount} ${investment.duration} investment with a contribution of $${investment.partnerAmount}.`,
        date: new Date(),
      };

      // Initialize notifications arrays if they don't exist
      if (!initiator.notifications) initiator.notifications = [];
      if (!responder.notifications) responder.notifications = [];
      
      // Add notifications
      initiator.notifications.push(initiatorNotification);
      responder.notifications.push(partnerNotification);
      
      // Set notification flags
      initiator.isReadNotifications = false;
      responder.isReadNotifications = false;
      
      // Set success message
      message = "Investment accepted successfully";
    } else {
      // Decline case
      
      // Refund the initiator's portion
      initiator.tradingBalance += investment.initiatorAmount;
      
      // Update investment status to rejected in initiator's record
      initiator.investments[investmentIndex].status = "rejected";
      
      // Update or create the investment in responder's array
      if (responderInvestmentIndex !== -1) {
        responder.investments[responderInvestmentIndex].status = "rejected";
      } else {
        // Ensure investments array exists
        if (!responder.investments) {
          responder.investments = [];
        }
        
        // Add the investment to responder's array
        responder.investments.push({
          ...investment,
          status: "rejected"
        });
      }
      
      // Create notifications
      const initiatorNotification = {
        id: crypto.randomUUID(),
        method: "failure",
        type: "investment",
        message: `${responder.name} has declined your joint investment invitation of $${investment.totalAmount} for ${investment.duration}. Your contribution has been refunded.`,
        date: new Date(),
      };

      const partnerNotification = {
        id: crypto.randomUUID(),
        method: "neutral",
        type: "investment",
        message: `You have declined ${initiator.name}'s joint investment invitation of $${investment.totalAmount} for ${investment.duration}.`,
        date: new Date(),
      };

      // Initialize notifications arrays if they don't exist
      if (!initiator.notifications) initiator.notifications = [];
      if (!responder.notifications) responder.notifications = [];
      
      // Add notifications
      initiator.notifications.push(initiatorNotification);
      responder.notifications.push(partnerNotification);
      
      // Set notification flags
      initiator.isReadNotifications = false;
      responder.isReadNotifications = false;
      
      // Set success message
      message = "Investment declined successfully";
    }
    
    // Log the investment status changes to help with debugging
    console.log("INVESTMENT STATUS UPDATE:");
    console.log(`Initiator (${initiator.email}) investment status: ${initiator.investments[investmentIndex].status}`);
    console.log(`Responder (${responder.email}) investment status: ${responderInvestmentIndex !== -1 ? 
      responder.investments[responderInvestmentIndex].status : 
      "No existing investment, will create with status: " + (response === "accept" ? "active" : "rejected")}`);
    
    // Always use the direct update approach for consistency
    try {
      console.log("Using direct update method for reliability");
      
      // Process initiator update
      const initiatorUpdate = await UserModel.findOneAndUpdate(
        { 
          email: initiator.email,
          "investments.id": investmentId 
        },
        { 
          $set: { 
            "investments.$.status": response === "accept" ? "active" : "rejected",
            tradingBalance: initiator.tradingBalance,
            isReadNotifications: false
          },
          $push: { 
            notifications: response === "accept" ? 
              {
                id: crypto.randomUUID(),
                method: "success",
                type: "investment",
                message: `${responder.name} has accepted your joint investment invitation of $${investment.totalAmount} for ${investment.duration}.`,
                date: new Date(),
              } :
              {
                id: crypto.randomUUID(),
                method: "failure",
                type: "investment",
                message: `${responder.name} has declined your joint investment invitation of $${investment.totalAmount} for ${investment.duration}. Your contribution has been refunded.`,
                date: new Date(),
              }
          }
        },
        { new: true }
      );
      
      console.log("Initiator update result:", initiatorUpdate ? "Success" : "Failed");

      // Process responder update - first check if responder has the investment already
      let responderUpdate;
      
      if (responderInvestmentIndex !== -1) {
        // Update existing investment
        responderUpdate = await UserModel.findOneAndUpdate(
          { 
            email: responder.email,
            "investments.id": investmentId 
          },
          { 
            $set: { 
              "investments.$.status": response === "accept" ? "active" : "rejected",
              tradingBalance: responder.tradingBalance,
              isReadNotifications: false
            },
            $push: { 
              notifications: response === "accept" ? 
                {
                  id: crypto.randomUUID(),
                  method: "success",
                  type: "investment",
                  message: `You have successfully joined ${initiator.name}'s $${investment.totalAmount} ${investment.duration} investment with a contribution of $${investment.partnerAmount}.`,
                  date: new Date(),
                } :
                {
                  id: crypto.randomUUID(),
                  method: "neutral",
                  type: "investment",
                  message: `You have declined ${initiator.name}'s joint investment invitation of $${investment.totalAmount} for ${investment.duration}.`,
                  date: new Date(),
                }
            }
          },
          { new: true }
        );
      } else {
        // Investment doesn't exist in responder's array - add it with proper status
        responderUpdate = await UserModel.findOneAndUpdate(
          { email: responder.email },
          { 
            $push: { 
              investments: {
                ...investment,
                status: response === "accept" ? "active" : "rejected"
              },
              notifications: response === "accept" ? 
                {
                  id: crypto.randomUUID(),
                  method: "success",
                  type: "investment",
                  message: `You have successfully joined ${initiator.name}'s $${investment.totalAmount} ${investment.duration} investment with a contribution of $${investment.partnerAmount}.`,
                  date: new Date(),
                } :
                {
                  id: crypto.randomUUID(),
                  method: "neutral",
                  type: "investment",
                  message: `You have declined ${initiator.name}'s joint investment invitation of $${investment.totalAmount} for ${investment.duration}.`,
                  date: new Date(),
                }
            },
            $set: {
              tradingBalance: responder.tradingBalance,
              isReadNotifications: false
            }
          },
          { new: true }
        );
      }
      
      console.log("Responder update result:", responderUpdate ? "Success" : "Failed");
      
      // Double-check that both updates succeeded
      if (!initiatorUpdate || !responderUpdate) {
        console.error("One or both updates failed - making one final attempt using separate operations");
        
        // Make one final attempt for the initiator
        if (!initiatorUpdate) {
          await UserModel.updateOne(
            { email: initiator.email, "investments.id": investmentId },
            { $set: { "investments.$.status": response === "accept" ? "active" : "rejected" } }
          );
        }
        
        // Make one final attempt for the responder
        if (!responderUpdate && responderInvestmentIndex !== -1) {
          await UserModel.updateOne(
            { email: responder.email, "investments.id": investmentId },
            { $set: { "investments.$.status": response === "accept" ? "active" : "rejected" } }
          );
        }
      }
      
      // Return success response
      return NextResponse.json({
        success: true,
        message: message
      });
    } catch (saveError) {
      console.error("Error saving changes:", saveError);
      
      // One last desperate attempt with minimal change
      try {
        console.log("Making emergency direct status update attempt");
        
        // Just update the status fields directly
        await UserModel.updateOne(
          { email: initiator.email, "investments.id": investmentId },
          { $set: { "investments.$.status": response === "accept" ? "active" : "rejected" } }
        );
        
        if (responderInvestmentIndex !== -1) {
          await UserModel.updateOne(
            { email: responder.email, "investments.id": investmentId },
            { $set: { "investments.$.status": response === "accept" ? "active" : "rejected" } }
          );
        }
        
        return NextResponse.json({
          success: true,
          message: message + " (partial update success)"
        });
      } catch (emergencyError) {
        console.error("Emergency update failed:", emergencyError);
        return NextResponse.json({ 
          success: false, 
          message: "Failed to save changes: " + (saveError.message || "Unknown error") 
        }, { status: 500 });
      }
    }
  } catch (error) {
    console.error("Error responding to investment:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Internal server error: " + (error.message || "Unknown error") 
    }, { status: 500 });
  }
} 