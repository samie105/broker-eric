import { NextResponse } from "next/server";
import UserModel from "../../../../mongodbConnect";

export async function POST(request) {
  const { email, withdrawMethod, amount, transactionStatus } =
    await request.json();
  const lowerEmail = email.toLowerCase();
  const id = crypto.randomUUID();
  try {
    // Search for the user with the provided email
    const user = await UserModel.findOne({ email: lowerEmail });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" });
    }

    // Generate current date in the desired format
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Create a new withdrawal entry object
    const withdrawalEntry = {
      id,
      dateAdded: currentDate,
      withdrawMethod,
      amount,
      transactionStatus,
    };

    // Push the new withdrawal entry to the user's withdrawalHistory array
    user.withdrawalHistory.push(withdrawalEntry);

    // Save the changes to the user
    await user.save();

    return NextResponse.json({
      success: true,
      message: user.withdrawalHistory,
      id,
      date: currentDate,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "An error occurred: " + error,
    });
  }
}
