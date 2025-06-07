import { NextResponse } from "next/server";
import UserModel from "../../../mongodbConnect";
import crypto from "crypto";

export async function POST(request) {
  const { email, stakings, amount, isJoint, partnerEmail } = await request.json();

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return NextResponse.json("User not found", { status: 404 });
    }

    // Generate unique ID if not provided
    stakings.id = stakings.id || crypto.randomUUID();
    stakings.dateStaked = new Date();
    
    // Set initial status
    stakings.status = isJoint ? "pending" : "awaiting_verification";
    stakings.isJoint = isJoint;

    // For joint staking
    if (isJoint && partnerEmail) {
      const partnerUser = await UserModel.findOne({ email: partnerEmail });
      if (!partnerUser) {
        return NextResponse.json("Partner not found", { status: 404 });
      }

      // Create record for the initiator
      const initiatorRecord = {
        ...stakings,
        initiatorEmail: email,
        initiatorName: user.name,
        partnerEmail: partnerEmail,
        partnerName: partnerUser.name,
        isInitiator: true,
        isPartner: false,
        status: "pending",
        partnerStatus: "pending-partner"
      };
      
      // Create record for partner's stakingInvitations
      const partnerRecord = {
        ...stakings,
        initiatorEmail: email,
        initiatorName: user.name,
        partnerEmail: partnerEmail,
        partnerName: partnerUser.name,
        isInitiator: false,
        isPartner: true,
        status: "pending-partner"
      };
      
      // Initialize arrays if they don't exist
      if (!user.stakings) user.stakings = [];
      if (!partnerUser.stakingInvitations) partnerUser.stakingInvitations = [];

      // Save records in respective arrays
      user.stakings.push(initiatorRecord);
      partnerUser.stakingInvitations.push(partnerRecord);

      // Create notification for partner
      const partnerNotification = {
        id: crypto.randomUUID(),
        method: "info",
        type: "staking",
        message: `${user.name} has invited you to join a ${stakings.stakedAmount} ${stakings.stakedAssetSymbol} transaction for ${stakings.stakedDuration} months. Your contribution will be ${stakings.partnerContribution} ${stakings.stakedAssetSymbol} (${stakings.partnerPercentage}%).`,
        date: new Date(),
        category: "staking",
        type: "joint-invitation",
        status: "unread",
        stakingId: stakings.id,
        requiresAction: true
      };

      // Add notification for partner
      if (!partnerUser.notifications) partnerUser.notifications = [];
      partnerUser.notifications.push(partnerNotification);
      partnerUser.isReadNotifications = false;
      await partnerUser.save();

      // Add notification for initiator
      if (!user.notifications) user.notifications = [];
      user.notifications.push({
        id: crypto.randomUUID(),
        method: "info",
        type: "staking",
        message: `Your joint transaction invitation of ${stakings.stakedAmount} ${stakings.stakedAssetSymbol} has been sent to ${partnerUser.email}.`,
        date: new Date(),
        category: "staking",
        status: "unread",
        stakingId: stakings.id
      });
    } else {
      // For solo staking
      stakings.initiatorEmail = email;
      stakings.initiatorName = user.name;
      if (!user.stakings) user.stakings = [];
      user.stakings.push(stakings);
    }

    // Notify admins of new staking request
    const adminUsers = await UserModel.find({ role: "admin" });
    for (const admin of adminUsers) {
      if (!admin.notifications) {
        admin.notifications = [];
      }
      admin.notifications.push({
        id: crypto.randomUUID(),
        method: "info",
        type: "staking",
        message: `New transaction request: ${stakings.stakedAmount} ${stakings.stakedAssetSymbol} from ${user.name}${isJoint ? ' (Joint transaction)' : ''}`,
        date: new Date(),
        stakingId: stakings.id,
        requiresAction: true
      });
      admin.isReadNotifications = false;
      await admin.save();
    }

    // Set notifications as unread
    user.isReadNotifications = false;

    // Save the updated user document
    const updatedUser = await user.save();

    return NextResponse.json({
      success: true,
      message: isJoint ? 
        "Joint transaction request sent successfully. Waiting for partner approval." :
        "Transaction request created successfully. Waiting for verification.",
      user: updatedUser
    });
  } catch (error) {
    console.error("Error in staking:", error);
    return NextResponse.json({ 
      success: false,
      message: "An error occurred while processing your staking request."
    }, { status: 500 });
  }
}
