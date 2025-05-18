"use client";
import React, { useState } from "react";
import { useTheme } from "../../../contexts/themeContext";
import { useUserData } from "../../../contexts/userrContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Slider } from "../../ui/slider";
import { InfinitySpin } from "react-loader-spinner";
import axios from "axios";
import toast from "react-hot-toast";

// Investment plans data
const investmentPlans = [
  {
    id: "3-month",
    title: "3 Months",
    description: "Short-term investment with quick returns",
    roi: 15, // 15% ROI
    minAmount: 1000,
    color: "#0052FF"
  },
  {
    id: "6-month",
    title: "6 Months",
    description: "Medium-term balanced investment",
    roi: 30, // 30% ROI
    minAmount: 2000,
    color: "#6B4BC9"
  },
  {
    id: "1-year",
    title: "1 Year",
    description: "Long-term investment with maximum returns",
    roi: 65, // 65% ROI
    minAmount: 5000,
    color: "#CF9B03"
  }
];

export default function InvestmentPlans() {
  const { isDarkMode } = useTheme();
  const { details, email, setDetails, setNotification } = useUserData();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [investmentType, setInvestmentType] = useState("sole");
  const [amount, setAmount] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");
  const [isCheckingPartner, setIsCheckingPartner] = useState(false);
  const [partnerDetails, setPartnerDetails] = useState(null);
  const [partnerError, setPartnerError] = useState("");
  const [initiatorPercentage, setInitiatorPercentage] = useState(50);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate partner percentage based on initiator percentage
  const partnerPercentage = 100 - initiatorPercentage;

  // Handle plan selection and open dialog
  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setAmount(plan.minAmount.toString());
    setIsDialogOpen(true);
  };

  // Reset form when dialog closes
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedPlan(null);
    setInvestmentType("sole");
    setAmount("");
    setPartnerEmail("");
    setPartnerDetails(null);
    setPartnerError("");
    setInitiatorPercentage(50);
    setIsSubmitting(false);
  };

  // Check if partner exists
  const checkPartner = async () => {
    if (!partnerEmail || partnerEmail === email) {
      setPartnerError(partnerEmail === email ? "You cannot partner with yourself" : "Partner email is required");
      setPartnerDetails(null);
      return;
    }

    setIsCheckingPartner(true);
    setPartnerError("");
    
    try {
      const response = await axios.post("/api/investment/user", { email: partnerEmail });
      
      if (response.data.success) {
        setPartnerDetails(response.data.user);
        setPartnerError("");
      }
    } catch (error) {
      setPartnerDetails(null);
      setPartnerError(error.response?.data?.message || "User not found");
    } finally {
      setIsCheckingPartner(false);
    }
  };

  // Handle investment submission
  const handleSubmit = async () => {
    // Validate form
    if (!selectedPlan) {
      toast.error("Please select an investment plan");
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const numAmount = Number(amount);
    
    if (numAmount < selectedPlan.minAmount) {
      toast.error(`Minimum investment amount is $${selectedPlan.minAmount}`);
      return;
    }

    if (numAmount > details.tradingBalance) {
      toast.error("Insufficient balance");
      return;
    }

    if (investmentType === "joint") {
      if (!partnerDetails) {
        toast.error("Please enter a valid partner email");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const payload = {
        investmentType,
        amount: numAmount,
        duration: selectedPlan.title,
        email,
        partnerEmail: investmentType === "joint" ? partnerEmail : null,
        initiatorPercentage: investmentType === "joint" ? initiatorPercentage : 100,
        partnerPercentage: investmentType === "joint" ? partnerPercentage : 0
      };

      const response = await axios.post("/api/investment", payload);

      if (response.data.success) {
        // Update user's trading balance
        const deductedAmount = investmentType === "joint" 
          ? (numAmount * initiatorPercentage) / 100 
          : numAmount;
          
        setDetails(prev => ({
          ...prev,
          tradingBalance: prev.tradingBalance - deductedAmount,
          investments: [...prev.investments, response.data.investment]
        }));

        // Show success message
        toast.success(
          investmentType === "joint" 
            ? "Joint investment invitation sent" 
            : "Investment created successfully"
        );

        // Close dialog
        handleDialogClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create investment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {investmentPlans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`${
              isDarkMode ? "bg-[#111] text-white border-[#222]" : "bg-white"
            } hover:shadow-md transition-all`}
          >
            <CardHeader>
              <CardTitle 
                className="text-xl font-bold"
                style={{ color: plan.color }}
              >
                {plan.title}
              </CardTitle>
              <CardDescription className={isDarkMode ? "text-white/60" : ""}>
                {plan.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div 
                  className="text-4xl font-bold mb-2"
                  style={{ color: plan.color }}
                >
                  {plan.roi}%
                </div>
                <p className={`text-sm ${isDarkMode ? "text-white/60" : "text-gray-500"}`}>
                  Expected ROI
                </p>
              </div>
              <div className={`p-3 rounded-md ${isDarkMode ? "bg-[#222]" : "bg-gray-50"} mb-4`}>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${isDarkMode ? "text-white/60" : "text-gray-500"}`}>
                    Min. Investment
                  </span>
                  <span className="font-bold">
                    ${plan.minAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className={`text-sm ${isDarkMode ? "text-white/60" : "text-gray-500"}`}>
                    On $10,000
                  </span>
                  <span className="font-bold">
                    ${(10000 + (10000 * plan.roi / 100)).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                style={{ backgroundColor: plan.color }}
                onClick={() => handleSelectPlan(plan)}
              >
                Start Investment
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Investment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleDialogClose()}>
        <DialogContent 
          className={`sm:max-w-[500px] ${
            isDarkMode ? "bg-[#111] text-white border-[#222]" : "bg-white"
          }`}
        >
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedPlan?.title} Investment
            </DialogTitle>
            <DialogDescription className={isDarkMode ? "text-white/60" : ""}>
              Expected ROI: {selectedPlan?.roi}% at the end of {selectedPlan?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Investment Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={selectedPlan?.minAmount}
                placeholder={`Min: $${selectedPlan?.minAmount}`}
                className={isDarkMode ? "bg-[#222] text-white border-[#333]" : ""}
              />
              <div className={`text-xs ${isDarkMode ? "text-white/60" : "text-gray-500"}`}>
                Your balance: ${details.tradingBalance.toLocaleString()}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Investment Type</Label>
              <div className="space-y-2">
                <div 
                  className={`flex items-center space-x-2 p-3 rounded-md cursor-pointer ${
                    isDarkMode ? "bg-[#222]" : "bg-gray-50"
                  }`}
                  onClick={() => setInvestmentType("sole")}
                >
                  <div className="relative flex items-center">
                    <input
                      type="radio"
                      id="sole"
                      value="sole"
                      checked={investmentType === "sole"}
                      onChange={() => setInvestmentType("sole")}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border ${investmentType === "sole" ? 'border-primary' : 'border-gray-400'} flex items-center justify-center`}>
                      {investmentType === "sole" && (
                        <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 ml-2">
                    <div className="font-medium">Sole Investment</div>
                    <div className={`text-xs ${isDarkMode ? "text-white/60" : "text-gray-500"}`}>
                      Invest on your own and receive all returns
                    </div>
                  </div>
                </div>
                <div 
                  className={`flex items-center space-x-2 p-3 rounded-md cursor-pointer ${
                    isDarkMode ? "bg-[#222]" : "bg-gray-50"
                  }`}
                  onClick={() => setInvestmentType("joint")}
                >
                  <div className="relative flex items-center">
                    <input
                      type="radio"
                      id="joint"
                      value="joint"
                      checked={investmentType === "joint"}
                      onChange={() => setInvestmentType("joint")}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border ${investmentType === "joint" ? 'border-primary' : 'border-gray-400'} flex items-center justify-center`}>
                      {investmentType === "joint" && (
                        <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 ml-2">
                    <div className="font-medium">Joint Investment</div>
                    <div className={`text-xs ${isDarkMode ? "text-white/60" : "text-gray-500"}`}>
                      Partner with another user and share the investment and returns
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {investmentType === "joint" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="partnerEmail">{"Partner's "}Email</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="partnerEmail"
                      value={partnerEmail}
                      onChange={(e) => {
                        setPartnerEmail(e.target.value);
                        setPartnerDetails(null);
                        setPartnerError("");
                      }}
                      placeholder="Enter partner's email"
                      className={isDarkMode ? "bg-[#222] text-white border-[#333]" : ""}
                    />
                    <Button 
                      onClick={checkPartner}
                      disabled={isCheckingPartner || !partnerEmail}
                      variant="outline"
                      className={isDarkMode ? "border-[#333] text-white" : ""}
                    >
                      {isCheckingPartner ? "Checking..." : "Verify"}
                    </Button>
                  </div>
                  {partnerError && (
                    <div className="text-xs text-red-500">{partnerError}</div>
                  )}
                  {partnerDetails && (
                    <div className={`p-2 rounded-md ${isDarkMode ? "bg-green-900/20" : "bg-green-50"} text-sm`}>
                      <div className="font-medium text-green-600">Partner verified: {partnerDetails.name}</div>
                    </div>
                  )}
                </div>

                {partnerDetails && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Investment Share</Label>
                      <span className={`text-xs ${isDarkMode ? "text-white/60" : "text-gray-500"}`}>
                        Your contribution: ${((Number(amount) * initiatorPercentage) / 100).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="w-12 text-right">{initiatorPercentage}%</span>
                      <Slider
                        value={[initiatorPercentage]}
                        min={10}
                        max={90}
                        step={5}
                        onValueChange={(value) => setInitiatorPercentage(value[0])}
                        className="flex-1"
                      />
                      <span className="w-12">{partnerPercentage}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>You</span>
                      <span>Partner</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={handleDialogClose}
              className={isDarkMode ? "border-[#333] text-white" : ""}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || (investmentType === "joint" && !partnerDetails)}
              style={{ backgroundColor: selectedPlan?.color }}
            >
              {isSubmitting ? (
                <InfinitySpin width="100" color="#ffffff" />
              ) : investmentType === "joint" ? (
                "Send Investment Invitation"
              ) : (
                "Confirm Investment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 