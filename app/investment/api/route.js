import { NextResponse } from "next/server";
import UserModel from "../../../mongodbConnect";
import crypto from "crypto";

export async function POST(request) {
  const { 
    investmentType, 
    amount, 
    duration, 
    email, 
    partnerEmail, 
    initiatorPercentage, 
    partnerPercentage 
  } = await request.json();

  try {
    // Find the initiating user
    const initiator = await UserModel.findOne({ email });
    
    if (!initiator) {
      return NextResponse.json({ 
        success: false, 
        message: "User not found" 
      }, { status: 404 });
    }

    // Check if user has sufficient balance
    if (initiator.tradingBalance < amount) {
      return NextResponse.json({ 
        success: false, 
        message: "Insufficient balance" 
      }, { status: 400 });
    }

    const investmentId = crypto.randomUUID();
    const currentDate = new Date();
    
    // Calculate end date based on duration
    const endDate = new Date(currentDate);
    if (duration === "3 months") {
      endDate.setMonth(endDate.getMonth() + 3);
    } else if (duration === "6 months") {
      endDate.setMonth(endDate.getMonth() + 6);
    } else if (duration === "1 year") {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // Calculate ROI based on duration
    let roi = 0;
    if (duration === "3 months") {
      roi = 0.15; // 15% for 3 months
    } else if (duration === "6 months") {
      roi = 0.30; // 30% for 6 months
    } else if (duration === "1 year") {
      roi = 0.65; // 65% for 1 year
    }

    if (investmentType === "sole") {
      // Process sole investment
      const investment = {
        id: investmentId,
        type: "sole",
        amount,
        duration,
        startDate: currentDate,
        endDate,
        status: "active",
        roi,
        expectedReturn: amount + (amount * roi)
      };

      // Deduct amount from user's trading balance
      initiator.tradingBalance -= amount;
      
      // Add investment to user's investments array
      initiator.investments.push(investment);
      
      // Save changes to the database
      await initiator.save();

      // Create notification for the user
      const notification = {
        id: crypto.randomUUID(),
        method: "success",
        type: "transaction",
        message: `Your ${duration} investment of $${amount} has been successfully activated.`,
        date: new Date(),
      };

      // Add notification to user's notifications array
      if (!initiator.notifications) {
        initiator.notifications = [];
      }
      initiator.notifications.push(notification);
      
      // Set isReadNotifications to false
      initiator.isReadNotifications = false;
      
      await initiator.save();

      return NextResponse.json({
        success: true,
        message: "Investment successfully created",
        investment
      });
    } else if (investmentType === "joint") {
      // Find the partner user
      const partner = await UserModel.findOne({ email: partnerEmail });
      
      if (!partner) {
        return NextResponse.json({ 
          success: false, 
          message: "Partner user not found" 
        }, { status: 404 });
      }

      // Calculate amounts based on percentages
      const initiatorAmount = (amount * initiatorPercentage) / 100;
      const partnerAmount = (amount * partnerPercentage) / 100;

      // Create investment object for initiator
      const investment = {
        id: investmentId,
        type: "joint",
        totalAmount: amount,
        initiatorEmail: email,
        partnerEmail,
        initiatorPercentage,
        partnerPercentage,
        initiatorAmount,
        partnerAmount,
        duration,
        startDate: currentDate,
        endDate,
        status: "pending",
        roi,
        expectedReturn: amount + (amount * roi)
      };

      // Deduct initiator's portion from their trading balance
      initiator.tradingBalance -= initiatorAmount;
      
      // Add investment to initiator's investments array
      initiator.investments.push(investment);
      
      // Also add investment to partner's investments array so they can see it in their dashboard
      if (!partner.investments) {
        partner.investments = [];
      }
      partner.investments.push(investment);
      
      // Save changes to the database for both users
      await initiator.save();
      await partner.save();

      // Create notification for the partner
      const notification = {
        id: crypto.randomUUID(),
        method: "pending",
        type: "investment",
        message: `${initiator.name} has invited you to join a $${amount} ${duration} investment. Your contribution: $${partnerAmount} (${partnerPercentage}%)`,
        date: new Date(),
        investmentId,
        action: "investment_invitation"
      };

      // Add notification to partner's notifications array
      if (!partner.notifications) {
        partner.notifications = [];
      }
      partner.notifications.push(notification);
      
      // Set isReadNotifications to false for partner
      partner.isReadNotifications = false;
      
      await partner.save();

      // Create notification for the initiator
      const initiatorNotification = {
        id: crypto.randomUUID(),
        method: "pending",
        type: "investment",
        message: `Your joint investment invitation of $${amount} for ${duration} has been sent to ${partner.name}`,
        date: new Date(),
      };

      // Add notification to initiator's notifications array
      if (!initiator.notifications) {
        initiator.notifications = [];
      }
      initiator.notifications.push(initiatorNotification);
      
      // Set isReadNotifications to false for initiator
      initiator.isReadNotifications = false;
      
      await initiator.save();

      return NextResponse.json({
        success: true,
        message: "Joint investment invitation sent",
        investment
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid investment type" 
      }, { status: 400 });
    }
  } catch (error) {
    console.error("Error creating investment:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Internal server error" 
    }, { status: 500 });
  }
} 