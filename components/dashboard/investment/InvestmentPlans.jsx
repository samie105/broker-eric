"use client";
import React, { useState, useEffect } from "react";
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
  const [plans, setPlans] = useState([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);

  // Fetch investment plans from the database
  useEffect(() => {
    const fetchInvestmentPlans = async () => {
      try {
        setIsLoadingPlans(true);
        const response = await axios.get("/api/admin/investment-plans");
        if (response.data.success) {
          setPlans(response.data.plans);
        } else {
          // If no plans are found in the database, use fallback default plans
          setPlans([
            {
              id: "3-month",
              title: "3 Months",
              description: "Short-term investment with quick returns",
              roi: 15, // 15% ROI
              minAmount: 1000,
              color: "#0052FF",
              duration: "3 Months"
            },
            {
              id: "6-month",
              title: "6 Months",
              description: "Medium-term balanced investment",
              roi: 30, // 30% ROI
              minAmount: 2000,
              color: "#6B4BC9",
              duration: "6 Months"
            },
            {
              id: "1-year",
              title: "1 Year",
              description: "Long-term investment with maximum returns",
              roi: 65, // 65% ROI
              minAmount: 5000,
              color: "#CF9B03",
              duration: "1 Year"
            }
          ]);
        }
      } catch (error) {
        console.error("Error fetching investment plans:", error);
        // Use fallback default plans on error
        setPlans([
          {
            id: "3-month",
            title: "3 Months",
            description: "Short-term investment with quick returns",
            roi: 15, // 15% ROI
            minAmount: 1000,
            color: "#0052FF",
            duration: "3 Months"
          },
          {
            id: "6-month",
            title: "6 Months",
            description: "Medium-term balanced investment",
            roi: 30, // 30% ROI
            minAmount: 2000,
            color: "#6B4BC9",
            duration: "6 Months"
          },
          {
            id: "1-year",
            title: "1 Year",
            description: "Long-term investment with maximum returns",
            roi: 65, // 65% ROI
            minAmount: 5000,
            color: "#CF9B03",
            duration: "1 Year"
          }
        ]);
      } finally {
        setIsLoadingPlans(false);
      }
    };

    fetchInvestmentPlans();
  }, []);

  // Calculate partner percentage based on initiator percentage
  const partnerPercentage = 100 - initiatorPercentage;

  // Minimum contribution percentage
  const MIN_CONTRIBUTION_PERCENTAGE = 30;

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

      // Check for minimum contribution percentage
      if (initiatorPercentage < MIN_CONTRIBUTION_PERCENTAGE || partnerPercentage < MIN_CONTRIBUTION_PERCENTAGE) {
        toast.error(`Both partners must contribute at least ${MIN_CONTRIBUTION_PERCENTAGE}% to the investment`);
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
      {isLoadingPlans ? (
        <div className="flex justify-center items-center py-12">
          <InfinitySpin width="100" color={isDarkMode ? "#fff" : "#000"} />
        </div>
      ) : plans.length === 0 ? (
        <div className={`text-center py-16 max-w-lg mx-auto ${isDarkMode ? "text-white/80" : ""}`}>
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                <path d="M21 6.375c0 2.692-4.03 4.875-9 4.875S3 9.067 3 6.375 7.03 1.5 12 1.5s9 2.183 9 4.875z" />
                <path d="M12 12.75c2.685 0 5.19-.586 7.078-1.609a8.283 8.283 0 001.897-1.384c.016.121.025.244.025.368C21 12.817 16.97 15 12 15s-9-2.183-9-4.875c0-.124.009-.247.025-.368a8.285 8.285 0 001.897 1.384C6.809 12.164 9.315 12.75 12 12.75z" />
                <path d="M12 16.5c2.685 0 5.19-.586 7.078-1.609a8.282 8.282 0 001.897-1.384c.016.121.025.244.025.368 0 2.692-4.03 4.875-9 4.875s-9-2.183-9-4.875c0-.124.009-.247.025-.368a8.284 8.284 0 001.897 1.384C6.809 15.914 9.315 16.5 12 16.5z" />
                <path d="M12 20.25c2.685 0 5.19-.586 7.078-1.609a8.282 8.282 0 001.897-1.384c.016.121.025.244.025.368 0 2.692-4.03 4.875-9 4.875s-9-2.183-9-4.875c0-.124.009-.247.025-.368a8.284 8.284 0 001.897 1.384C6.809 19.664 9.315 20.25 12 20.25z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">No Investment Plans Available</h3>
            <p className="text-sm mb-4 max-w-md mx-auto">
              Our team is currently developing new investment opportunities for you. Please check back soon for exclusive investment plans tailored to help you grow your portfolio.
            </p>
            <div className={`text-xs inline-flex items-center ${isDarkMode ? "text-white/60" : "text-gray-500"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
              </svg>
              We refresh investment plans regularly
            </div>
          </div>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
          <Card 
              key={plan._id || plan.id} 
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
      )}

      {/* Investment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleDialogClose()}>
        <DialogContent 
          className={`sm:max-w-[500px] ${
            isDarkMode ? "bg-[#111] text-white border-[#333]" : ""
          }`}
        >
          <DialogHeader>
            <DialogTitle>Create Investment</DialogTitle>
            <DialogDescription className={isDarkMode ? "text-white/60" : ""}>
              {selectedPlan && `${selectedPlan.title} plan with ${selectedPlan.roi}% ROI`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Investment Amount</Label>
              <Input
                id="amount"
                type="number"
                min={selectedPlan?.minAmount || 0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className={isDarkMode ? "bg-[#222] text-white border-[#333]" : ""}
              />
              <div className={`text-xs ${isDarkMode ? "text-white/60" : "text-gray-500"}`}>
                {selectedPlan && `Minimum investment: $${selectedPlan.minAmount.toLocaleString()}`}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Investment Type</Label>
              <div className="flex space-x-4">
                <div 
                  className={`flex-1 p-3 rounded-md cursor-pointer transition-colors ${
                    investmentType === "sole" 
                      ? isDarkMode 
                        ? "bg-[#222] border-2 border-blue-500"
                        : "bg-blue-50 border-2 border-blue-500"
                      : isDarkMode
                        ? "bg-[#222] border border-[#333] hover:border-blue-500/50"
                        : "bg-gray-50 border border-gray-200 hover:border-blue-500/50"
                  }`}
                  onClick={() => setInvestmentType("sole")}
                >
                  <div className="flex items-start">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      investmentType === "sole"
                        ? "bg-blue-500 text-white"
                        : isDarkMode
                          ? "bg-[#333] text-[#555]"
                          : "bg-gray-200 text-gray-400"
                    }`}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                  </div>
                  <div className="flex-1 ml-2">
                    <div className="font-medium">Sole Investment</div>
                    <div className={`text-xs ${isDarkMode ? "text-white/60" : "text-gray-500"}`}>
                        Invest on your own and keep all returns
                      </div>
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`flex-1 p-3 rounded-md cursor-pointer transition-colors ${
                    investmentType === "joint" 
                      ? isDarkMode 
                        ? "bg-[#222] border-2 border-blue-500"
                        : "bg-blue-50 border-2 border-blue-500"
                      : isDarkMode
                        ? "bg-[#222] border border-[#333] hover:border-blue-500/50"
                        : "bg-gray-50 border border-gray-200 hover:border-blue-500/50"
                  }`}
                  onClick={() => setInvestmentType("joint")}
                >
                  <div className="flex items-start">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      investmentType === "joint"
                        ? "bg-blue-500 text-white"
                        : isDarkMode
                          ? "bg-[#333] text-[#555]"
                          : "bg-gray-200 text-gray-400"
                    }`}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
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
                        min={MIN_CONTRIBUTION_PERCENTAGE}
                        max={100 - MIN_CONTRIBUTION_PERCENTAGE}
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
                    <div className={`text-xs ${isDarkMode ? "text-amber-400" : "text-amber-600"}`}>
                      Both partners must contribute at least {MIN_CONTRIBUTION_PERCENTAGE}% to the investment
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