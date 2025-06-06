import { NextResponse } from "next/server";
import { connectToDB } from "../../../../../utils/db";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";

export async function POST(request) {
  try {
    const body = await request.json();
    const { coinName, coinSymbol, description, percentageRage, cryptoMinimum, cycle, durations } = body;
    
    // Validate required fields
    if (!coinName || !coinSymbol || !durations || durations.length === 0) {
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
    
    // Generate ID for the new stake
    const stakeId = `${coinSymbol.toLowerCase()}_stake_${Date.now()}`;
    
    // Create new stake object
    const newStake = {
      id: stakeId,
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
    
    // Connect to the database
    await connectToDB();
    
    // Create or update StakingOptions model
    const StakingOptions = mongoose.models.StakingOptions || mongoose.model("StakingOptions", new mongoose.Schema({
      options: [Object]
    }, { strict: false }));
    
    // Find existing staking options document or create new one
    let stakingDocument = await StakingOptions.findOne();
    
    if (!stakingDocument) {
      stakingDocument = new StakingOptions({
        options: [newStake]
      });
    } else {
      // Add new stake to options array
      stakingDocument.options.push(newStake);
    }
    
    // Save the document
    await stakingDocument.save();
    
    return NextResponse.json({
      success: true,
      message: "Staking option created successfully",
      stake: newStake
    });
    
  } catch (error) {
    console.error("Error creating staking option:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create staking option" },
      { status: 500 }
    );
  }
} 