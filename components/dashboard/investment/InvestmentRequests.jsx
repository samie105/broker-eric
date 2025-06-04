"use client";
import React, { useState, useEffect } from "react";
import { useTheme } from "../../../contexts/themeContext";
import { useUserData } from "../../../contexts/userrContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import axios from "axios";
import toast from "react-hot-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../ui/alert-dialog";

export default function InvestmentRequests() {
  const { isDarkMode } = useTheme();
  const { details, email, setDetails } = useUserData();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);
  
  // Filter investments that are requests (joint investments where user is partner or initiator)
  const getFilteredRequests = () => {
    if (!details?.investments) return [];
    
    // Force re-evaluation by making a fresh array
    const currentInvestments = [...(details.investments || [])];
    
    return currentInvestments.filter(investment => {
      // Show joint investments where user is either the partner or initiator
      const isJointPartner = investment.type === "joint" && investment.partnerEmail === email;
      const isJointInitiator = investment.type === "joint" && investment.initiatorEmail === email;
      
      if (activeTab === "pending") {
        return (isJointPartner || isJointInitiator) && investment.status === "pending";
      } else if (activeTab === "responded") {
        return (isJointPartner || isJointInitiator) && (investment.status === "active" || investment.status === "rejected");
      } else if (activeTab === "all") {
        return isJointPartner || isJointInitiator;
      }
      
      return false;
    });
  };
  
  // Recalculate filtered requests whenever details, email, or activeTab changes
  const filteredRequests = getFilteredRequests();
  
  // Add an effect to refresh the component when details change
  useEffect(() => {
    // This will force the component to re-calculate filteredRequests when details update
    console.log("Investment details updated, refreshing view...");
  }, [details.investments]);

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  // Check if user is the initiator of the investment
  const isInitiator = (investment) => {
    // Add null check to prevent TypeError
    if (!investment) return false;
    return investment.initiatorEmail === email;
  };

  // Handle opening the confirmation dialog
  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
  };

  // Handle opening the delete confirmation dialog
  const handleDeleteRequest = (request) => {
    setRequestToDelete(request);
    setIsDeleteDialogOpen(true);
    setIsDialogOpen(false); // Close the details dialog if open
  };

  // Handle investment response (accept/decline)
  const handleInvestmentResponse = async (response) => {
    if (!selectedRequest) return;
    
    // Check if user has sufficient balance for accepting
    if (response === "accept") {
      if (details.tradingBalance < selectedRequest.partnerAmount) {
        toast.error(`Insufficient balance. You need $${selectedRequest.partnerAmount.toLocaleString()} to accept this investment.`);
        return;
      }
    }
    
    setIsLoading(true);
    
    try {
      // Make API call
      const payload = {
        email,
        investmentId: selectedRequest.id,
        response
      };

      const result = await axios.post("/api/investment/respond", payload);
      
      if (result.data.success) {
        // Update local state with updated status
        const updatedInvestments = details.investments.map(inv => {
          if (inv.id === selectedRequest.id) {
            return { ...inv, status: response === "accept" ? "active" : "rejected" };
          }
          return inv;
        });
        
        // Update the trading balance for accept actions
        let updatedBalance = details.tradingBalance;
        if (response === "accept") {
          updatedBalance -= selectedRequest.partnerAmount;
        }
        
        // Update the details state
        setDetails(prev => ({
          ...prev,
          tradingBalance: updatedBalance,
          investments: updatedInvestments
        }));
        
        // Close dialog
        setIsDialogOpen(false);
        
        // Show toast
        toast.success(result.data.message || (
          response === "accept" 
            ? "Investment accepted successfully" 
            : "Investment declined successfully"
        ));
        
        // Immediately refresh the component state with the updated status
        setActiveTab(response === "accept" ? "ongoing" : "responded");
        
        // Fetch fresh data after a short delay to ensure server-side changes are reflected
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
            if (data) {
              console.log("Updated investment data received", data.investments);
              setDetails(data);
            }
          })
          .catch(error => {
            console.error("Error fetching updated data:", error);
          });
        }, 1000);
      } else {
        toast.error(result.data.message || "Failed to process response");
      }
    } catch (error) {
      console.error("Error responding to investment:", error);
      toast.error(error.response?.data?.message || "Failed to process response");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle investment deletion
  const handleConfirmDelete = async () => {
    if (!requestToDelete) return;
    
    setIsLoading(true);
    
    try {
      // Make API call
      const result = await axios.post("/api/investment/delete", {
        email,
        investmentId: requestToDelete.id
      });
      
      if (result.data.success) {
        // Update the local state to remove the deleted investment
        const updatedInvestments = details.investments.filter(
          inv => inv.id !== requestToDelete.id
        );
        
        // If user is initiator and status is pending, update balance with refund
        let updatedBalance = details.tradingBalance;
        if (isInitiator(requestToDelete) && requestToDelete.status === "pending") {
          updatedBalance += requestToDelete.initiatorAmount;
        }
        
        // Update the details state
        setDetails(prev => ({
          ...prev,
          tradingBalance: updatedBalance,
          investments: updatedInvestments
        }));
        
        // Close dialog
        setIsDeleteDialogOpen(false);
        
        // Show toast
        toast.success("Investment request deleted successfully");
        
        // Fetch fresh data after a short delay
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
        toast.error(result.data.message || "Failed to delete investment request");
      }
    } catch (error) {
      // Show error
      toast.error(error.response?.data?.message || "Failed to delete investment request");
    } finally {
      setIsLoading(false);
      setRequestToDelete(null);
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
      case "cancelled":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Tabs 
          defaultValue="pending" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList 
            className={`grid w-full grid-cols-3 mb-6 ${
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
              All Requests
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
            <TabsTrigger 
              value="responded"
              className={`${
                activeTab === "responded" && isDarkMode 
                  ? "bg-[#111] text-white" 
                  : activeTab === "responded" 
                    ? "bg-white" 
                    : ""
              }`}
            >
              Responded
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filteredRequests.length === 0 ? (
        <div className={`text-center py-12 ${isDarkMode ? "text-white/60" : "text-gray-500"}`}>
          <div className="text-4xl mb-4">📬</div>
          <h3 className="text-lg font-medium mb-2">No investment requests found</h3>
          <p className="text-sm">
            {activeTab === "pending" 
              ? "You don't have any pending investment requests at the moment." 
              : activeTab === "responded" 
                ? "You haven't responded to any investment requests yet." 
                : "You don't have any investment requests."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRequests.map((request) => (
            <Card 
              key={request.id} 
              className={`${
                isDarkMode ? "bg-[#111] text-white border-[#222]" : "bg-white"
              } hover:shadow-md transition-all`}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-bold">
                    ${request.totalAmount.toLocaleString()} - {request.duration}
                  </CardTitle>
                  <Badge className={`${getStatusColor(request.status)} text-white`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </Badge>
                </div>
                <CardDescription className={isDarkMode ? "text-white/60" : ""}>
                  {isInitiator(request) ? `To: ${request.partnerEmail}` : `From: ${request.initiatorEmail}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className={isDarkMode ? "text-white/60" : "text-gray-500"}>
                      {isInitiator(request) ? "Your contribution:" : "Your contribution:"}
                    </span>
                    <span className="font-medium">
                      ${isInitiator(request) 
                        ? request.initiatorAmount.toLocaleString() 
                        : request.partnerAmount.toLocaleString()} 
                      ({isInitiator(request) 
                        ? request.initiatorPercentage 
                        : request.partnerPercentage}%)
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={isDarkMode ? "text-white/60" : "text-gray-500"}>Expected return:</span>
                    <span className="font-medium">
                      ${isInitiator(request)
                        ? (request.initiatorAmount + (request.initiatorAmount * (request.roi || 0))).toLocaleString()
                        : (request.partnerAmount + (request.partnerAmount * (request.roi || 0))).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={isDarkMode ? "text-white/60" : "text-gray-500"}>Start date:</span>
                    <span>{formatDate(request.startDate)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                {request.status === "pending" && !isInitiator(request) ? (
                  <Button 
                    onClick={() => handleViewRequest(request)} 
                    variant="outline" 
                    className="w-full"
                  >
                    Respond to Request
                  </Button>
                ) : request.status === "pending" && isInitiator(request) ? (
                  <Button 
                    onClick={() => handleDeleteRequest(request)} 
                    variant="outline"
                    className={`w-full ${isDarkMode ? "hover:bg-red-900/20 hover:text-red-400" : "hover:bg-red-50 hover:text-red-600"}`}
                  >
                    Cancel Request
                  </Button>
                ) : (
                  <div className="flex w-full gap-2">
                    <Button 
                      onClick={() => handleViewRequest(request)} 
                      variant="outline" 
                      className="flex-1"
                    >
                      View Details
                    </Button>
                    <Button
                      onClick={() => handleDeleteRequest(request)}
                      variant="outline"
                      className={`${isDarkMode ? "hover:bg-red-900/20 hover:text-red-400" : "hover:bg-red-50 hover:text-red-600"}`}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Request Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className={isDarkMode ? "bg-[#111] text-white border-[#333]" : ""}>
          <DialogHeader>
            <DialogTitle>Investment Request</DialogTitle>
            <DialogDescription className={isDarkMode ? "text-white/60" : ""}>
              {selectedRequest?.status === "pending" && !isInitiator(selectedRequest)
                ? "Review and respond to this investment request" 
                : isInitiator(selectedRequest) && selectedRequest?.status === "pending"
                ? "Your pending investment request"
                : "Investment request details"}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={isDarkMode ? "text-white/60" : "text-gray-500"}>Amount:</span>
                  <span className="font-medium">${selectedRequest.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? "text-white/60" : "text-gray-500"}>Duration:</span>
                  <span className="font-medium">{selectedRequest.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? "text-white/60" : "text-gray-500"}>
                    {isInitiator(selectedRequest) ? "To:" : "From:"}
                  </span>
                  <span className="font-medium">
                    {isInitiator(selectedRequest) ? selectedRequest.partnerEmail : selectedRequest.initiatorEmail}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? "text-white/60" : "text-gray-500"}>Your contribution:</span>
                  <span className="font-medium">
                    ${isInitiator(selectedRequest) 
                      ? selectedRequest.initiatorAmount.toLocaleString() 
                      : selectedRequest.partnerAmount.toLocaleString()} 
                    ({isInitiator(selectedRequest) 
                      ? selectedRequest.initiatorPercentage 
                      : selectedRequest.partnerPercentage}%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? "text-white/60" : "text-gray-500"}>
                    {isInitiator(selectedRequest) ? "Partner's contribution:" : "Initiator's contribution:"}
                  </span>
                  <span className="font-medium">
                    ${isInitiator(selectedRequest) 
                      ? selectedRequest.partnerAmount.toLocaleString() 
                      : selectedRequest.initiatorAmount.toLocaleString()} 
                    ({isInitiator(selectedRequest) 
                      ? selectedRequest.partnerPercentage 
                      : selectedRequest.initiatorPercentage}%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? "text-white/60" : "text-gray-500"}>Expected return:</span>
                  <span className="font-medium">
                    ${isInitiator(selectedRequest)
                      ? (selectedRequest.initiatorAmount + (selectedRequest.initiatorAmount * (selectedRequest.roi || 0))).toLocaleString()
                      : (selectedRequest.partnerAmount + (selectedRequest.partnerAmount * (selectedRequest.roi || 0))).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? "text-white/60" : "text-gray-500"}>Status:</span>
                  <Badge className={`${getStatusColor(selectedRequest.status)} text-white`}>
                    {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                  </Badge>
                </div>
              </div>
              
              {selectedRequest.status === "pending" && !isInitiator(selectedRequest) && (
                <div className="space-y-2">
                  {details.tradingBalance < selectedRequest.partnerAmount && (
                    <div className={`p-3 rounded-md ${isDarkMode ? "bg-red-900/30 text-red-300" : "bg-red-50 text-red-600"}`}>
                      <p className="text-sm font-medium">Insufficient balance</p>
                      <p className="text-xs mt-1">
                        You need ${selectedRequest.partnerAmount.toLocaleString()} to accept this investment. 
                        Your current balance is ${details.tradingBalance.toLocaleString()}.
                      </p>
                      <Button 
                        variant="destructive" 
                        className="mt-2 text-xs h-8"
                        onClick={() => window.location.href = '/dashboard/deposits'}
                      >
                        Deposit Funds
                      </Button>
                    </div>
                  )}
                  
                  <DialogFooter className="flex sm:justify-between gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => handleInvestmentResponse("decline")}
                      disabled={isLoading}
                      className={isDarkMode ? "border-[#333] hover:bg-[#222]" : ""}
                    >
                      Decline
                    </Button>
                    <Button 
                      onClick={() => handleInvestmentResponse("accept")}
                      disabled={isLoading || details.tradingBalance < selectedRequest.partnerAmount}
                    >
                      Accept
                    </Button>
                  </DialogFooter>
                </div>
              )}
              
              {selectedRequest.status === "pending" && isInitiator(selectedRequest) && (
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => handleDeleteRequest(selectedRequest)}
                    disabled={isLoading}
                    className={`${isDarkMode ? "border-[#333] hover:bg-red-900/20 hover:text-red-400" : "hover:bg-red-50 hover:text-red-600"}`}
                  >
                    Cancel Request
                  </Button>
                </DialogFooter>
              )}
              
              {selectedRequest.status !== "pending" && (
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => handleDeleteRequest(selectedRequest)}
                    disabled={isLoading}
                    className={`${isDarkMode ? "border-[#333] hover:bg-red-900/20 hover:text-red-400" : "hover:bg-red-50 hover:text-red-600"}`}
                  >
                    Delete from History
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className={isDarkMode ? "bg-[#111] text-white border-[#333]" : ""}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {requestToDelete?.status === "pending" && isInitiator(requestToDelete)
                ? "Cancel Investment Request"
                : "Delete Investment Request"}
            </AlertDialogTitle>
            <AlertDialogDescription className={isDarkMode ? "text-white/60" : ""}>
              {requestToDelete?.status === "pending" && isInitiator(requestToDelete)
                ? "Are you sure you want to cancel this investment request? Your contribution will be refunded."
                : "Are you sure you want to delete this investment request from your history?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className={isDarkMode ? "bg-[#222] text-white hover:bg-[#333] border-[#444]" : ""}
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleConfirmDelete}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 