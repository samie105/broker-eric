import { NextResponse } from "next/server";
import { connectToDB } from "../../../../../utils/db";
import mongoose from "mongoose";

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Staking option ID is required" },
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
    
    // Find the index of the staking option to delete
    const optionIndex = stakingDocument.options.findIndex(option => option.id === id);
    
    if (optionIndex === -1) {
      return NextResponse.json(
        { success: false, message: "Staking option not found" },
        { status: 404 }
      );
    }
    
    // Remove the staking option
    stakingDocument.options.splice(optionIndex, 1);
    
    // Save the document
    await stakingDocument.save();
    
    return NextResponse.json({
      success: true,
      message: "Staking option deleted successfully"
    });
    
  } catch (error) {
    console.error("Error deleting staking option:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete staking option" },
      { status: 500 }
    );
  }
} 