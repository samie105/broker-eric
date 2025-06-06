import mongoose from "mongoose";

const investmentPlanSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    roi: {
      type: Number,
      required: [true, "ROI is required"],
    },
    minAmount: {
      type: Number,
      required: [true, "Minimum amount is required"],
    },
    color: {
      type: String,
      required: [true, "Color is required"],
      default: "#0052FF",
    },
    duration: {
      type: String,
      required: [true, "Duration is required"],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const InvestmentPlan = mongoose.models.InvestmentPlan || mongoose.model("InvestmentPlan", investmentPlanSchema); 