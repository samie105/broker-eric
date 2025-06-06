import { NextResponse } from "next/server";
import { connectToDB } from "../../../../../utils/db";
import mongoose from "mongoose";

export async function POST(request) {
  try {
    const body = await request.json();
    const { investmentId, userEmail, action } = body;
    
    if (!investmentId || !userEmail || !action) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Connect to the database
    await connectToDB();
    
    // Find the user and their investment
    const User = mongoose.models.User || mongoose.model("User", new mongoose.Schema({}, { strict: false }));
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }
    
    // Find the investment
    const investmentIndex = user.investments.findIndex(inv => inv.id === investmentId);
    
    if (investmentIndex === -1) {
      return NextResponse.json(
        { success: false, message: "Investment not found" },
        { status: 404 }
      );
    }
    
    const investment = user.investments[investmentIndex];
    
    // Handle the specified action
    if (action === "terminate") {
      // Simply mark the investment as terminated
      investment.status = "terminated";
      investment.endDate = new Date();
      
      // Save the updated user
      await user.save();
      
      return NextResponse.json({
        success: true,
        message: "Investment terminated successfully"
      });
    } 
    else if (action === "terminate_with_profit") {
      // Calculate profit based on ROI
      const amount = investment.type === "joint" 
        ? investment.totalAmount 
        : investment.amount;
        
      const profit = amount * (investment.roi / 100);
      
      // Update trading balance with original amount + profit
      user.tradingBalance = (user.tradingBalance || 0) + amount + profit;
      
      // Mark investment as completed
      investment.status = "completed";
      investment.endDate = new Date();
      
      // Save the updated user
      await user.save();
      
      // If it's a joint investment, update the partner's record too
      if (investment.type === "joint") {
        const partnerEmail = investment.initiatorEmail === userEmail 
          ? investment.partnerEmail 
          : investment.initiatorEmail;
          
        const partner = await User.findOne({ email: partnerEmail });
        
        if (partner) {
          const partnerInvestmentIndex = partner.investments.findIndex(inv => inv.id === investmentId);
          
          if (partnerInvestmentIndex !== -1) {
            const partnerInvestment = partner.investments[partnerInvestmentIndex];
            partnerInvestment.status = "completed";
            partnerInvestment.endDate = new Date();
            
            // Calculate partner's profit based on their contribution
            const partnerAmount = partnerEmail === investment.partnerEmail 
              ? investment.partnerAmount 
              : investment.initiatorAmount;
              
            const partnerProfit = partnerAmount * (investment.roi / 100);
            
            // Update partner's trading balance
            partner.tradingBalance = (partner.tradingBalance || 0) + partnerAmount + partnerProfit;
            
            // Save the updated partner
            await partner.save();
          }
        }
      }
      
      return NextResponse.json({
        success: true,
        message: "Investment terminated and profits paid successfully"
      });
    }
    else {
      return NextResponse.json(
        { success: false, message: "Invalid action specified" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error processing investment action:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process investment action" },
      { status: 500 }
    );
  }
} 