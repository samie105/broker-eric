import { NextResponse } from "next/server";
import { connectToDB } from "../../../../utils/db";
import { InvestmentPlan } from "../../../../models/investmentPlanModel";

// Get all investment plans
export async function GET(request) {
  try {
    await connectToDB();
    
    const plans = await InvestmentPlan.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, plans });
  } catch (error) {
    console.error("Error fetching investment plans:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch investment plans" },
      { status: 500 }
    );
  }
}

// Create a new investment plan
export async function POST(request) {
  try {
    const body = await request.json();
    const { title, description, roi, minAmount, color, duration } = body;
    
    if (!title || !description || !roi || !minAmount || !color || !duration) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }
    
    await connectToDB();
    
    const newPlan = new InvestmentPlan({
      title,
      description,
      roi: Number(roi),
      minAmount: Number(minAmount),
      color,
      duration
    });
    
    await newPlan.save();
    
    return NextResponse.json({
      success: true,
      message: "Investment plan created successfully",
      plan: newPlan
    });
  } catch (error) {
    console.error("Error creating investment plan:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create investment plan" },
      { status: 500 }
    );
  }
} 