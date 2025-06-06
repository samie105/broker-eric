"use client";
import React, { useState, useEffect } from "react";
import { useTheme } from "../../../contexts/themeContext";
import { useUserData } from "../../../contexts/userrContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Button } from "../../ui/button";
import axios from "axios";
import toast from "react-hot-toast";

export default function OngoingInvestments() {
  const { isDarkMode } = useTheme();
  const { details, email, setDetails } = useUserData();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filter investments based on active tab
  const filteredInvestments = details.investments?.filter(investment => {
    if (activeTab === "all") return true;
    if (activeTab === "sole") return investment.type === "sole";
    if (activeTab === "joint") return investment.type === "joint";
    if (activeTab === "pending") return investment.status === "pending";
    if (activeTab === "active") return investment.status === "active";
    return true;
  }) || [];

  // Format date for display
  const formatDate = (dateString) => {
    try {
      // If the date is invalid or undefined, return a placeholder
      if (!dateString) return "Not specified";
      
      // Log incoming dateString for debugging
      console.log("Formatting date:", dateString);
      
      // Make sure we're working with a proper date
      const date = new Date(dateString);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.warn("Invalid date detected:", dateString);
        return "Invalid date";
      }
      
      // For debugging
      const formattedDate = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
      
      console.log(`Formatted ${dateString} to ${formattedDate}`);
      return formattedDate;
    } catch (error) {
      console.error("Date formatting error:", error, "for date:", dateString);
      return "Invalid date";
    }
  };

  // Format relative time
  const getTimeRemaining = (endDateString) => {
    try {
      if (!endDateString) return "Unknown";
      
      const endDate = new Date(endDateString);
      
      // Check if date is valid
      if (isNaN(endDate.getTime())) {
        console.warn("Invalid end date for time remaining:", endDateString);
        return "Unknown";
      }
      
      // For debugging
      const timeRemaining = formatDistanceToNow(endDate, { addSuffix: true });
      console.log(`Time remaining for ${endDateString}: ${timeRemaining}`);
      
      return timeRemaining;
    } catch (error) {
      console.error("Error calculating time remaining:", error, "for date:", endDateString);
      return "Unknown";
    }
  };

  // Handle investment selection and open dialog
  const handleViewInvestment = (investment) => {
    setSelectedInvestment(investment);
    setIsDialogOpen(true);
  };

  // Handle investment response (accept/decline)
  const handleInvestmentResponse = async (investmentId, response) => {
    setIsLoading(true);
    
    try {
      const payload = {
        email,
        investmentId,
        response
      };

      const apiResponse = await axios.post("/api/investment/respond", payload);
      
      if (apiResponse.data.success) {
        // Immediately update the UI with the changes
        const updatedInvestments = details.investments.map(inv => {
          if (inv.id === investmentId) {
            return { 
              ...inv, 
              status: response === "accept" ? "active" : "rejected" 
            };
          }
          return inv;
        });
        
        // Update the trading balance for accept actions
        let updatedBalance = details.tradingBalance;
        if (response === "accept") {
          const investment = details.investments.find(inv => inv.id === investmentId);
          if (investment) {
            updatedBalance -= investment.partnerAmount;
          }
        }
        
        // Update the details immediately with optimistic UI
        setDetails(prev => ({
          ...prev,
          investments: updatedInvestments,
          tradingBalance: updatedBalance
        }));
        
        // Show success toast
        toast.success(
          response === "accept" 
            ? "Investment accepted successfully" 
            : "Investment declined successfully"
        );
        
        // Close dialog
        setIsDialogOpen(false);
        
        // Fetch fresh data to ensure consistency
        setTimeout(() => {
          fetch("/fetching/fetchAllDetails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
          })
          .then(response => response.json())
          .then(data => {
            setDetails(data);
          })
          .catch(error => {
            console.error("Error fetching updated data:", error);
          });
        }, 1000);
      } else {
        toast.error(apiResponse.data.message || "Failed to process response");
      }
    } catch (error) {
      console.error("Error processing investment response:", error);
      toast.error(error.response?.data?.message || "Failed to process response");
    } finally {
      setIsLoading(false);
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "completed":
        return "bg-blue-500";
      case "rejected":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Check if user is the partner in a joint investment
  const isPartner = (investment) => {
    return investment.type === "joint" && investment.partnerEmail === email;
  };

  // Check if investment requires action from the user
  const requiresAction = (investment) => {
    return investment.status === "pending" && isPartner(investment);
  };

  return (
    <div>
      <div className="mb-6">
        <Tabs 
          defaultValue="all" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList 
            className={`grid w-full grid-cols-5 mb-6 ${
              isDarkMode 
                ? "bg-[#222] text-white/80" 
                : "bg-gray-100"
            }`}
          >
            <TabsTrigger 
              value="all"
              className={`${
                activeTab === "all" && isDarkMode 
                  ? "bg-[#111] text-white" 
                  : activeTab === "all" 
                    ? "bg-white" 
                    : ""
              }`}
            >
              All
            </TabsTrigger>
            <TabsTrigger 
              value="sole"
              className={`${
                activeTab === "sole" && isDarkMode 
                  ? "bg-[#111] text-white" 
                  : activeTab === "sole" 
                    ? "bg-white" 
                    : ""
              }`}
            >
              Sole
            </TabsTrigger>
            <TabsTrigger 
              value="joint"
              className={`${
                activeTab === "joint" && isDarkMode 
                  ? "bg-[#111] text-white" 
                  : activeTab === "joint" 
                    ? "bg-white" 
                    : ""
              }`}
            >
              Joint
            </TabsTrigger>
            <TabsTrigger 
              value="active"
              className={`${
                activeTab === "active" && isDarkMode 
                  ? "bg-[#111] text-white" 
                  : activeTab === "active" 
                    ? "bg-white" 
                    : ""
              }`}
            >
              Active
            </TabsTrigger>
            <TabsTrigger 
              value="pending"
              className={`${
                activeTab === "pending" && isDarkMode 
                  ? "bg-[#111] text-white" 
                  : activeTab === "pending" 
                    ? "bg-white" 
                    : ""
              }`}
            >
              Pending
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filteredInvestments.length === 0 ? (
        <div className={`text-center py-12 ${isDarkMode ? "text-white/60" : "text-gray-500"}`}>
          <div className="text-4xl mb-4">💼</div>
          <h3 className="text-lg font-medium mb-2">No investments found</h3>
          <p className="text-sm">
            {activeTab === "all" 
              ? "You don't have any investments yet. Start investing to see them here."
              : `No ${activeTab} investments found.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredInvestments.map((investment) => (
            <Card 
              key={investment.id} 
              className={`${
                isDarkMode ? "bg-[#111] text-white border-[#222]" : "bg-white"
              } hover:shadow-md transition-all`}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-bold">
                    ${investment.totalAmount ? investment.totalAmount.toLocaleString() : (investment.amount ? investment.amount.toLocaleString() : '0')} - {investment.duration}
                  </CardTitle>
                  <Badge className={`${getStatusColor(investment.status)} text-white`}>
                    {investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
                  </Badge>
                </div>
                <CardDescription className={isDarkMode ? "text-white/60" : ""}>
                  {investment.type === "joint" 
                    ? `Joint with ${investment.partnerEmail === email ? investment.initiatorEmail : investment.partnerEmail}` 
                    : "Sole Investment"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2">
                  {investment.type === "joint" && (
                    <div className="flex justify-between text-sm">
                      <span className={isDarkMode ? "text-white/60" : "text-gray-500"}>Your contribution:</span>
                      <span className="font-medium">
                        ${investment.partnerEmail === email 
                          ? (investment.partnerAmount ? investment.partnerAmount.toLocaleString() : '0')
                          : (investment.initiatorAmount ? investment.initiatorAmount.toLocaleString() : '0')} 
                        ({investment.partnerEmail === email 
                          ? investment.partnerPercentage 
                          : investment.initiatorPercentage}%)
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className={isDarkMode ? "text-white/60" : "text-gray-500"}>Expected return:</span>
                    <span className="font-medium">
                      ${investment.type === "joint" 
                        ? ((investment.partnerEmail === email 
                            ? (investment.partnerAmount || 0) 
                            : (investment.initiatorAmount || 0)) * (1 + (investment.roi || 0))).toLocaleString() 
                        : ((investment.amount || 0) * (1 + (investment.roi || 0))).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={isDarkMode ? "text-white/60" : "text-gray-500"}>End date:</span>
                    <span>{formatDate(investment.endDate)}</span>
                  </div>
                  {investment.status === "active" && (
                    <div className="flex justify-between text-sm">
                      <span className={isDarkMode ? "text-white/60" : "text-gray-500"}>Time remaining:</span>
                      <span>{getTimeRemaining(investment.endDate)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                {requiresAction(investment) ? (
                  <Button 
                    onClick={() => window.location.href = "/dashboard/investment?tab=requests"} 
                    variant="outline" 
                    className="w-full"
                  >
                    View in Requests
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handleViewInvestment(investment)} 
                    variant="outline" 
                    className="w-full"
                  >
                    View Details
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Investment Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className={isDarkMode ? "bg-[#111] text-white border-[#333]" : ""}>
          <DialogHeader>
            <DialogTitle>Investment Details</DialogTitle>
            <DialogDescription className={isDarkMode ? "text-white/60" : ""}>
              View details about your investment
            </DialogDescription>
          </DialogHeader>
          
          {selectedInvestment && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={isDarkMode ? "text-white/60" : "text-gray-500"}>Type:</span>
                  <span className="font-medium">{selectedInvestment.type.charAt(0).toUpperCase() + selectedInvestment.type.slice(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? "text-white/60" : "text-gray-500"}>Amount:</span>
                  <span className="font-medium">
                    ${selectedInvestment.type === "joint" 
                      ? (selectedInvestment.totalAmount ? selectedInvestment.totalAmount.toLocaleString() : '0')
                      : (selectedInvestment.amount ? selectedInvestment.amount.toLocaleString() : '0')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? "text-white/60" : "text-gray-500"}>Duration:</span>
                  <span className="font-medium">{selectedInvestment.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? "text-white/60" : "text-gray-500"}>Status:</span>
                  <Badge className={`${getStatusColor(selectedInvestment.status)} text-white`}>
                    {selectedInvestment.status.charAt(0).toUpperCase() + selectedInvestment.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? "text-white/60" : "text-gray-500"}>Start Date:</span>
                  <span className="font-medium">{formatDate(selectedInvestment.startDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? "text-white/60" : "text-gray-500"}>End Date:</span>
                  <span className="font-medium">{formatDate(selectedInvestment.endDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? "text-white/60" : "text-gray-500"}>Expected Return:</span>
                  <span className="font-medium text-green-500">
                    ${selectedInvestment.expectedReturn ? selectedInvestment.expectedReturn.toLocaleString() : '0'}
                  </span>
                </div>
                
                {selectedInvestment.type === "joint" && (
                  <>
                    <div className="h-px bg-gray-200 dark:bg-gray-700 my-3"></div>
                    <div className="flex justify-between">
                      <span className={isDarkMode ? "text-white/60" : "text-gray-500"}>Your Contribution:</span>
                      <span className="font-medium">
                        ${isPartner(selectedInvestment) 
                          ? (selectedInvestment.partnerAmount ? selectedInvestment.partnerAmount.toLocaleString() : '0')
                          : (selectedInvestment.initiatorAmount ? selectedInvestment.initiatorAmount.toLocaleString() : '0')} 
                        ({isPartner(selectedInvestment) 
                          ? selectedInvestment.partnerPercentage 
                          : selectedInvestment.initiatorPercentage}%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDarkMode ? "text-white/60" : "text-gray-500"}>Partner:</span>
                      <span className="font-medium">
                        {isPartner(selectedInvestment) 
                          ? selectedInvestment.initiatorEmail 
                          : selectedInvestment.partnerEmail}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDarkMode ? "text-white/60" : "text-gray-500"}>Partner&apos;s Contribution:</span>
                      <span className="font-medium">
                        ${isPartner(selectedInvestment) 
                          ? (selectedInvestment.initiatorAmount ? selectedInvestment.initiatorAmount.toLocaleString() : '0')
                          : (selectedInvestment.partnerAmount ? selectedInvestment.partnerAmount.toLocaleString() : '0')} 
                        ({isPartner(selectedInvestment) 
                          ? selectedInvestment.initiatorPercentage 
                          : selectedInvestment.partnerPercentage}%)
                      </span>
                    </div>
                  </>
                )}
              </div>
              
              {requiresAction(selectedInvestment) && (
                <div className="pt-4">
                  <Button 
                    onClick={() => window.location.href = "/dashboard/investment?tab=requests"} 
                    className="w-full"
                  >
                    View in Requests
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 