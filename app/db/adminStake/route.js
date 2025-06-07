import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import UserModel from "../../../mongodbConnect";

// Function to send an email
const sendEmail = async (email, subject, message) => {
  // Replace with your nodemailer setup
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "ericastacy52@gmail.com",
      pass: "yiay aadh pupe bdgc",
    },
  });

  const mailOptions = {
    from: "Capital Nexus <support@thekapitalnexus.com>",
    to: email,
    subject: subject,
    text: message,
  };

  await transporter.sendMail(mailOptions);
};

export async function POST(request) {
  const { email, stakeId, newStatus, amount, asset, name, isApproval = false, isJoint = false, partnerEmail } =
    await request.json();

  try {
    // Find the user and the specific withdrawal record
    const updateObj = {
      $set: {
        "stakings.$.status": newStatus,
        "stakings.$.lastPaid": new Date(),
      },
    };

    if (newStatus === "active") {
      // For initial stake approval
      updateObj.$push = {
        notifications: {
          id: crypto.randomUUID(),
          method: "success",
          type: "staking",
          message: `Your staking request for ${asset} has been approved and is now active.`,
          date: Date.now(),
        },
      };
      updateObj.$set.isReadNotifications = false;
    }
    else if (newStatus === "rejected") {
      // For stake rejection, refund the amount
      const user = await UserModel.findOne({ email });
      if (!user) {
        return new NextResponse({
          status: 404,
          body: "User not found"
        });
      }
      
      const stake = user.stakings.find(s => s.id === stakeId);
      if (!stake) {
        return new NextResponse({
          status: 404,
          body: "Stake not found"
        });
      }

      const refundAmount = isJoint ? stake.stakedAmount * (stake.initiatorPercentage / 100) : stake.stakedAmount;
      
      updateObj.$inc = {
        tradingBalance: +refundAmount,
      };
      updateObj.$push = {
        notifications: {
          id: crypto.randomUUID(),
          method: "error",
          type: "staking",
          message: `Your staking request for ${asset} has been rejected. The staked amount has been refunded to your trading balance.`,
          date: Date.now(),
        },
      };
      updateObj.$set.isReadNotifications = false;
    }
    else if (newStatus === "completed") {
      // For stake completion
      updateObj.$inc = {
        tradingBalance: +amount,
      };
      updateObj.$push = {
        notifications: {
          id: crypto.randomUUID(),
          method: "success",
          type: "transaction",
          message: `You have received your final $${amount} from your ${asset} monthly staking returns, your staking period comes to an end.`,
          date: Date.now(),
        },
      };
      updateObj.$set.isReadNotifications = false;
    }
    else if (newStatus === "ongoing") {
      // For monthly returns
      updateObj.$inc = {
        tradingBalance: +amount,
      };
      updateObj.$push = {
        notifications: {
          id: crypto.randomUUID(),
          method: "success",
          type: "trade",
          message: `You have received $${amount} from your ${asset} monthly staking returns.`,
          date: Date.now(),
        },
      };
      updateObj.$set = {
        isReadNotifications: false,
        paidStaking: Date.now(),
        lastButtonClick: Date.now(),
      };
    }

    const updatedUser = await UserModel.findOneAndUpdate(
      { email, "stakings.id": stakeId },
      updateObj,
      {
        new: true, // Return the updated document
      }
    );

    if (!updatedUser) {
      return new NextResponse({
        status: 404,
        body: "User or stake record not found",
      });
    }

    // Send email based on transaction status
    let emailSubject, emailMessage;
    
    if (newStatus === "active") {
      emailSubject = "Staking Update: Stake Request Approved";
      emailMessage = `
        Dear ${name},\n\n
        We are pleased to inform you that your staking request for ${asset} has been approved and is now active.\n\n
        Your stake will start earning returns according to the selected duration and ROI.\n\n
        If you have any questions or concerns, feel free to reach out to our support team.\n\n
        Thank you for your trust and cooperation.\n\n
        Best regards,\n
        Capital Nexus Team.
      `;
    } 
    else if (newStatus === "rejected") {
      emailSubject = "Staking Update: Stake Request Rejected";
      emailMessage = `
        Dear ${name},\n\n
        We regret to inform you that your staking request for ${asset} has been rejected.\n\n
        The staked amount has been refunded to your trading balance.\n\n
        If you have any questions or would like to understand more about this decision, please contact our support team.\n\n
        Thank you for your understanding.\n\n
        Best regards,\n
        Capital Nexus Team.
      `;
    }
    else if (newStatus === "ongoing") {
      emailSubject = "Staking Update: Monthly Returns";
      emailMessage = `
        Dear ${name},\n\n
        We want to inform you that you have received $${amount} from your ${asset} staking in your balance. The staking process is still ongoing.\n\n
        If you have any questions or concerns, feel free to reach out to our support team.\n\n
        Thank you for your trust and cooperation.\n\n
        Best regards,\n
        Capital Nexus Team.
      `;
    } 
    else if (newStatus === "completed") {
      emailSubject = "Staking Update: Staking Process Completed";
      emailMessage = `
        Dear ${name},\n\n
        Congratulations! We are pleased to inform you that you've received your final ROI of ${amount} from your ${asset} staking.\n\n Congratulations!!! 🎉🎉 \n Your staking process has come to an end.\n\n
        We appreciate your participation, and if you have any further inquiries, please don't hesitate to contact us.\n\n
        Thank you for your trust and cooperation.\n\n
        Best regards,\n
        Capital Nexus Team.
      `;
    }

    if (emailSubject && emailMessage) {
      await sendEmail(email, emailSubject, emailMessage);
    }

    // Handle joint staking approval/rejection
    if (isJoint && isApproval && partnerEmail) {
      const partnerUser = await UserModel.findOne({ 
        email: partnerEmail, 
        "stakings.id": stakeId 
      });

      if (partnerUser) {
        const partnerUpdateObj = {
          $set: {
            "stakings.$.status": newStatus,
            "stakings.$.lastPaid": new Date(),
          },
          $push: {
            notifications: {
              id: crypto.randomUUID(),
              method: newStatus === "active" ? "success" : "error",
              type: "staking",
              message: newStatus === "active" 
                ? `Your joint staking request for ${asset} has been approved and is now active.`
                : `Your joint staking request for ${asset} has been rejected. Any staked amount has been refunded.`,
              date: Date.now(),
            },
          },
          $set: { isReadNotifications: false }
        };

        if (newStatus === "rejected") {
          const partnerStake = partnerUser.stakings.find(s => s.id === stakeId);
          if (partnerStake) {
            const refundAmount = partnerStake.stakedAmount * (partnerStake.partnerPercentage / 100);
            partnerUpdateObj.$inc = { tradingBalance: +refundAmount };
          }
        }

        await UserModel.findOneAndUpdate(
          { email: partnerEmail, "stakings.id": stakeId },
          partnerUpdateObj,
          { new: true }
        );

        // Send email to partner
        const partnerEmailSubject = newStatus === "active" 
          ? "Joint Staking Update: Stake Request Approved"
          : "Joint Staking Update: Stake Request Rejected";
        
        const partnerEmailMessage = newStatus === "active"
          ? `Dear Partner,\n\n
            We are pleased to inform you that your joint staking request for ${asset} has been approved and is now active.\n\n
            Your stake will start earning returns according to the selected duration and ROI.\n\n
            If you have any questions or concerns, feel free to reach out to our support team.\n\n
            Thank you for your trust and cooperation.\n\n
            Best regards,\n
            Capital Nexus Team.`
          : `Dear Partner,\n\n
            We regret to inform you that your joint staking request for ${asset} has been rejected.\n\n
            Any staked amount has been refunded to your trading balance.\n\n
            If you have any questions or would like to understand more about this decision, please contact our support team.\n\n
            Thank you for your understanding.\n\n
            Best regards,\n
            Capital Nexus Team.`;

        await sendEmail(partnerEmail, partnerEmailSubject, partnerEmailMessage);
      }
    }

    // UI Response
    const successMessage = 
      newStatus === "active" ? "Stake approved successfully. All parties have been notified." :
      newStatus === "rejected" ? "Stake rejected successfully. All parties have been notified." :
      newStatus === "completed" ? "Staking process completed successfully. An email notification has been sent." :
      "Transaction status updated successfully. An email notification has been sent.";

    return new NextResponse(JSON.stringify({
      status: 200,
      message: successMessage,
      user: updatedUser
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error("Error while updating transaction status:", error);
    return new NextResponse(JSON.stringify({
      status: 500,
      message: "Internal Server Error"
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
