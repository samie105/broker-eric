import { NextResponse } from "next/server";
import UserModel from "../../../../mongodbConnect";
import crypto from "crypto";

export async function POST(request) {
  try {
    const { email, stakingId, proofOfPayment } = await request.json();

    // Validate required fields
    if (!email || !stakingId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find the partner user
    const partner = await UserModel.findOne({ email });
    if (!partner) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Find the partner's staking record
    const partnerStakingIndex = partner.stakings?.findIndex(
      (stake) => stake.id === stakingId && stake.isPartner
    );

    if (partnerStakingIndex === -1) {
      return NextResponse.json(
        { success: false, message: "Staking record not found" },
        { status: 404 }
      );
    }

    const staking = partner.stakings[partnerStakingIndex];
    const initiatorEmail = staking.initiatorEmail;

    // Find the initiator
    const initiator = await UserModel.findOne({ email: initiatorEmail });
    if (!initiator) {
      return NextResponse.json(
        { success: false, message: "Initiator not found" },
        { status: 404 }
      );
    }

    // Update partner's staking record
    await UserModel.findOneAndUpdate(
      { email, "stakings.id": stakingId },
      { 
        $set: { 
          "stakings.$.partnerDepositStatus": "completed",
          "stakings.$.partnerPaymentProof": proofOfPayment,
          isReadNotifications: false 
        }
      }
    );

    // Update initiator's staking record
    await UserModel.findOneAndUpdate(
      { email: initiatorEmail, "stakings.id": stakingId },
      { 
        $set: { 
          "stakings.$.partnerDepositStatus": "completed",
          "stakings.$.partnerPaymentProof": proofOfPayment,
          isReadNotifications: false 
        }
      }
    );

    // Notify initiator about partner's deposit
    const initiatorNotification = {
      id: crypto.randomUUID(),
      method: "success",
      type: "staking",
      message: `${partner.name} has completed their deposit of ${staking.partnerContribution} ${staking.stakedAssetSymbol} for your joint transaction.`,
      date: new Date(),
      category: "staking",
      status: "unread",
      stakingId: stakingId
    };

    await UserModel.findOneAndUpdate(
      { email: initiatorEmail },
      { 
        $push: { notifications: initiatorNotification },
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
        message: `${partner.name} has completed their deposit of ${staking.partnerContribution} ${staking.stakedAssetSymbol} for the joint transaction with ${initiator.name}. Verification required.`,
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

    return NextResponse.json({
      success: true,
      message: "Deposit confirmation successful. Transaction is awaiting verification."
    });
  } catch (error) {
    console.error("Error updating deposit status:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update deposit status" },
      { status: 500 }
    );
  }
} 