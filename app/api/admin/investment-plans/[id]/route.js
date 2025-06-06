import { NextResponse } from "next/server";
import { connectToDB } from "../../../../../utils/db";
import { InvestmentPlan } from "../../../../../models/investmentPlanModel";

// Get a specific investment plan
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    await connectToDB();
    
    const plan = await InvestmentPlan.findById(id);
    
    if (!plan) {
      return NextResponse.json(
        { success: false, message: "Investment plan not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, plan });
  } catch (error) {
    console.error("Error fetching investment plan:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch investment plan" },
      { status: 500 }
    );
  }
}

// Update an investment plan
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { title, description, roi, minAmount, color, duration } = body;
    
    await connectToDB();
    
    const updatedPlan = await InvestmentPlan.findByIdAndUpdate(
      id,
      {
        title,
        description,
        roi: Number(roi),
        minAmount: Number(minAmount),
        color,
        duration
      },
      { new: true }
    );
    
    if (!updatedPlan) {
      return NextResponse.json(
        { success: false, message: "Investment plan not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "Investment plan updated successfully",
      plan: updatedPlan
    });
  } catch (error) {
    console.error("Error updating investment plan:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update investment plan" },
      { status: 500 }
    );
  }
}

// Delete an investment plan
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    await connectToDB();
    
    const deletedPlan = await InvestmentPlan.findByIdAndDelete(id);
    
    if (!deletedPlan) {
      return NextResponse.json(
        { success: false, message: "Investment plan not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "Investment plan deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting investment plan:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete investment plan" },
      { status: 500 }
    );
  }
} 