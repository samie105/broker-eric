import { NextResponse } from "next/server";
import { connectToDB } from "../../../../../utils/db";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, coinName, coinSymbol, description, percentageRage, cryptoMinimum, cycle, durations } = body;
    
    // Validate required fields
    if (!id || !coinName || !coinSymbol || !durations || durations.length === 0) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Check if image exists in public folder
    const imagePath = `/assets/markets/crypto/${coinSymbol.toUpperCase()}.svg`;
    const fullPath = path.join(process.cwd(), 'public', imagePath);
    
    // Verify the image file exists
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json(
        { success: false, message: `Image for ${coinSymbol} does not exist` },
        { status: 400 }
      );
    }
    
    // Connect to the database
    await connectToDB();
    
    // Get StakingOptions model
    const StakingOptions = mongoose.models.StakingOptions || mongoose.model("StakingOptions", new mongoose.Schema({
      options: [Object]
    }, { strict: false }));
    
    // Find existing staking options document
    const stakingDocument = await StakingOptions.findOne();
    
    if (!stakingDocument) {
      return NextResponse.json(
        { success: false, message: "No staking options found" },
        { status: 404 }
      );
    }
    
    // Find the index of the staking option to update
    const optionIndex = stakingDocument.options.findIndex(option => option.id === id);
    
    if (optionIndex === -1) {
      return NextResponse.json(
        { success: false, message: "Staking option not found" },
        { status: 404 }
      );
    }
    
    // Update the staking option
    stakingDocument.options[optionIndex] = {
      ...stakingDocument.options[optionIndex],
      name: `${coinName} Staking`,
      coinName,
      coinSymbol,
      description: description || `Stake your ${coinName} and earn rewards.`,
      percentageRage: percentageRage || `${Math.min(...durations.map(d => d.percentage))}% - ${Math.max(...durations.map(d => d.percentage))}%`,
      cryptoMinimum: cryptoMinimum || 0.001,
      cycle: cycle || "Monthly",
      durations,
      imagePath
    };
    
    // Save the document
    await stakingDocument.save();
    
    return NextResponse.json({
      success: true,
      message: "Staking option updated successfully",
      stake: stakingDocument.options[optionIndex]
    });
    
  } catch (error) {
    console.error("Error updating staking option:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update staking option" },
      { status: 500 }
    );
  }
} 