import { NextResponse } from "next/server";
import UserModel from "../../../../mongodbConnect";
import crypto from "crypto";

export async function POST(request) {
  try {
    const { stakingId, email, response, initiatorEmail } = await request.json();

    // Validate required fields
    if (!stakingId || !email || !response || !initiatorEmail) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find the user and initiator
    const user = await UserModel.findOne({ email });
    const initiator = await UserModel.findOne({ email: initiatorEmail });

    if (!user || !initiator) {
      return NextResponse.json(
        { success: false, message: "User or initiator not found" },
        { status: 404 }
      );
    }

    // Find the staking invitation
    const invitation = user.stakingInvitations?.find(
      (inv) => inv.id === stakingId
    );

    if (!invitation) {
      return NextResponse.json(
        { success: false, message: "Staking invitation not found" },
        { status: 404 }
      );
    }

    // Determine new statuses based on response
    const partnerStatus = response === "accept" ? "awaiting_verification" : "declined";
    const initiatorStatus = response === "accept" ? "awaiting_verification" : "rejected";

    try {
      // Update partner's invitation using findOneAndUpdate
      const partnerUpdate = await UserModel.findOneAndUpdate(
        { email, "stakingInvitations.id": stakingId },
        { 
          $set: { 
            "stakingInvitations.$.status": partnerStatus,
            isReadNotifications: false 
          }
        },
        { new: true }
      );

      // Update initiator's staking record using findOneAndUpdate
      const initiatorUpdate = await UserModel.findOneAndUpdate(
        { email: initiatorEmail, "stakings.id": stakingId },
        { 
          $set: { 
            "stakings.$.status": initiatorStatus,
            "stakings.$.partnerStatus": response === "accept" ? "connected" : "declined",
            "stakings.$.partnerDepositStatus": response === "accept" ? "pending" : null,
            isReadNotifications: false 
          }
        },
        { new: true }
      );

      if (response === "accept") {
        // If accepted, create staking record for partner
        if (!user.stakings) user.stakings = [];
        const stakingRecord = {
          ...invitation,
          status: "awaiting_verification",
          partnerStatus: "connected",
          isPartner: true,
          partnerDepositStatus: "pending" // Track partner's deposit status
        };
        await UserModel.findOneAndUpdate(
          { email },
          { 
            $push: { stakings: stakingRecord }
          }
        );

        // Notify initiator of acceptance
        const acceptNotification = {
          id: crypto.randomUUID(),
          method: "success",
          type: "staking",
          message: `${user.name} has accepted your joint transaction request for ${invitation.stakedAmount} ${invitation.stakedAssetSymbol}. Awaiting verification.`,
          date: new Date(),
          category: "staking",
          status: "unread",
          stakingId: stakingId
        };

        await UserModel.findOneAndUpdate(
          { email: initiatorEmail },
          { 
            $push: { notifications: acceptNotification },
            $set: { isReadNotifications: false }
          }
        );

        // Notify admins
        const adminUsers = await UserModel.find({ role: "admin" });
        for (const admin of adminUsers) {
          const adminNotification = {
            id: crypto.randomUUID(),
            method: "info",
            type: "staking",
            message: `New joint transaction request: ${invitation.stakedAmount} ${invitation.stakedAssetSymbol} from ${initiator.name} and ${user.name} needs verification`,
            date: new Date(),
            category: "staking",
            status: "unread",
            stakingId: stakingId,
            requiresAction: true
          };

          await UserModel.findOneAndUpdate(
            { _id: admin._id },
            {
              $push: { notifications: adminNotification },
              $set: { isReadNotifications: false }
            }
          );
        }
      } else {
        // Notify initiator of rejection
        const rejectNotification = {
          id: crypto.randomUUID(),
          method: "error",
          type: "staking",
          message: `${user.name} has declined your joint transaction request for ${invitation.stakedAmount} ${invitation.stakedAssetSymbol}.`,
          date: new Date(),
          category: "staking",
          status: "unread",
          stakingId: stakingId
        };

        await UserModel.findOneAndUpdate(
          { email: initiatorEmail },
          { 
            $push: { notifications: rejectNotification },
            $set: { isReadNotifications: false }
          }
        );
      }

      return NextResponse.json({
        success: true,
        message: response === "accept"
          ? "Successfully accepted transaction request. Awaiting verification."
          : "Successfully rejected transaction request"
      });
    } catch (error) {
      console.error("Error updating records:", error);
      return NextResponse.json(
        { success: false, message: "Failed to update staking records" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error handling staking response:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process staking response" },
      { status: 500 }
    );
  }
}