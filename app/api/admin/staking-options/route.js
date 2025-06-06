import { NextResponse } from "next/server";
import { connectToDB } from "../../../../utils/db";
import mongoose from "mongoose";

export async function GET() {
  try {
    // Connect to the database
    await connectToDB();
    
    // Get StakingOptions model
    const StakingOptions = mongoose.models.StakingOptions || mongoose.model("StakingOptions", new mongoose.Schema({
      options: [Object]
    }, { strict: false }));
    
    // Find existing staking options document
    const stakingDocument = await StakingOptions.findOne();
    
    if (!stakingDocument) {
      return NextResponse.json({ options: [] });
    }
    
    return NextResponse.json({ options: stakingDocument.options || [] });
    
  } catch (error) {
    console.error("Error fetching staking options:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch staking options" },
      { status: 500 }
    );
  }
} 