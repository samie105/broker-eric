"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useTheme } from "../../../contexts/themeContext";
import { useUserData } from "../../../contexts/userrContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import Image from "next/image";
import { toast } from "react-hot-toast";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../ui/alert-dialog";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import QRCode from "qrcode.react";

export default function StakingRequests() {
  const { isDarkMode } = useTheme();
  const { details, setDetails, address } = useUserData();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("received");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [depositAddress, setDepositAddress] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [showUploader, setShowUploader] = useState(false);
  const [isConfirmingDeposit, setIsConfirmingDeposit] = useState(false);

  // Wrap stakingInvitations in useMemo to prevent rerendering issues
  const stakingInvitations = useMemo(() => {
    return details?.stakingInvitations || [];
  }, [details?.stakingInvitations]);
  
  // Log staking invitations when they change
  useEffect(() => {
    console.log("Staking invitations:", stakingInvitations);
    console.log("Full user details:", details);
    
    // Check if we need to manually add stakingInvitations array
    if (!details.stakingInvitations && details.email) {
      console.log("No stakingInvitations array found, will add it to user data");
      setDetails(prev => ({
        ...prev,
        stakingInvitations: []
      }));
    }
  }, [details, stakingInvitations, setDetails]);
  
  // Force refresh of user data when component mounts or tab changes
  useEffect(() => {
    const refreshUserData = async () => {
      try {
        const response = await fetch("/fetching/fetchAllDetails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: details.email }),
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log("Refreshed user data:", data);
          setDetails(data);
        }
      } catch (error) {
        console.error("Error refreshing user data:", error);
      }
    };
    
    if (details && details.email) {
      refreshUserData();
    }
  }, [details.email, activeTab, setDetails]);
  
  const pendingReceivedRequests = stakingInvitations.filter(
    (request) => request.status === "pending-partner"
  );
  const processedReceivedRequests = stakingInvitations.filter(
    (request) => request.status !== "pending-partner"
  );

  // Sent requests (from stakings array where isJoint is true)
  const stakings = details?.stakings || [];
  const sentRequests = stakings.filter(
    (stake) => stake.isJoint && stake.initiatorEmail === details.email
  );
  const pendingSentRequests = sentRequests.filter(
    (stake) => stake.status === "pending" || stake.status === "awaiting_verification"
  );
  const processedSentRequests = sentRequests.filter(
    (stake) => stake.status !== "pending" && stake.status !== "awaiting_verification"
  );

  const handleAcceptStaking = async () => {
    if (!selectedRequest) return;
    setIsLoading(true);

    try {
      const response = await fetch("/api/stake/respond", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stakingId: selectedRequest.id,
          email: details.email,
          response: "accept",
          initiatorEmail: selectedRequest.initiatorEmail,
        }),
      });

      if (!response.ok) throw new Error("Failed to accept transaction");

      toast.success("Successfully accepted transaction request. Please complete your deposit for verification.");

      // Update local state
      setDetails((prev) => ({
        ...prev,
        stakingInvitations: prev.stakingInvitations.map((invite) =>
          invite.id === selectedRequest.id
            ? { ...invite, status: "awaiting_verification" }
            : invite
        ),
      }));
      
      // Close the details dialog
      setIsDialogOpen(false);
      
      // Show the deposit dialog
      setSelectedAsset({
        symbol: selectedRequest.stakedAssetSymbol,
        image: selectedRequest.stakedAssetImagePath,
        fullName: selectedRequest.stakedAsset,
        amount: selectedRequest.partnerContribution
      });
      
      // Get the deposit address for the selected asset
      if (address && address[selectedRequest.stakedAssetSymbol]) {
        setDepositAddress(address[selectedRequest.stakedAssetSymbol]);
      } else if (address && address[selectedRequest.stakedAsset]) {
        setDepositAddress(address[selectedRequest.stakedAsset]);
      } else {
        // Default address if none found
        setDepositAddress(address?.Bitcoin || "Address not available");
      }
      
      setIsDepositDialogOpen(true);
      
      // Fetch fresh data after a short delay to ensure server-side changes are reflected
      setTimeout(() => {
        fetch("/fetching/fetchAllDetails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: details.email }),
        })
        .then(response => response.json())
        .then(data => {
          if (data) {
            setDetails(data);
          }
        })
        .catch(error => {
          console.error("Error fetching updated data:", error);
        });
      }, 1000);
    } catch (error) {
      console.error("Error accepting transaction:", error);
      toast.error("Failed to accept transaction request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectStaking = async () => {
    if (!selectedRequest) return;
    setIsLoading(true);

    try {
      const response = await fetch("/api/stake/respond", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stakingId: selectedRequest.id,
          email: details.email,
          response: "reject",
          initiatorEmail: selectedRequest.initiatorEmail,
        }),
      });

      if (!response.ok) throw new Error("Failed to reject staking");

      toast.success("Successfully rejected staking request");
      // Update local state
      setDetails((prev) => ({
        ...prev,
        stakingInvitations: prev.stakingInvitations.map((invite) =>
          invite.id === selectedRequest.id
            ? { ...invite, status: "rejected" }
            : invite
        ),
      }));
      
      // Fetch fresh data after a short delay
      setTimeout(() => {
        fetch("/fetching/fetchAllDetails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: details.email }),
        })
        .then(response => response.json())
        .then(data => {
          if (data) {
            setDetails(data);
          }
        })
        .catch(error => {
          console.error("Error fetching updated data:", error);
        });
      }, 1000);
    } catch (error) {
      console.error("Error rejecting staking:", error);
      toast.error("Failed to reject staking request");
    } finally {
      setIsLoading(false);
      setIsDialogOpen(false);
    }
  };
  
  // Handle opening the delete confirmation dialog
  const handleDeleteRequest = (request) => {
    setRequestToDelete(request);
    setIsDeleteDialogOpen(true);
    setIsDialogOpen(false); // Close the details dialog if open
  };

  const formatDate = (date) => {
    try {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  };
  
  const getTimeAgo = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (error) {
      return "Unknown time";
    }
  };

  const getStatusDisplay = (status, partnerStatus) => {
    switch (status) {
      case "pending-partner":
        return {
          text: "Awaiting Your Response",
          class: isDarkMode ? "bg-yellow-900/40 text-yellow-300" : "bg-yellow-100 text-yellow-800"
        };
      case "pending":
        return {
          text: "Pending Partner",
          class: isDarkMode ? "bg-yellow-900/40 text-yellow-300" : "bg-yellow-100 text-yellow-800"
        };
      case "awaiting_verification":
        return {
          text: partnerStatus === "connected" ? "Connected, Awaiting Verification" : "Awaiting Verification",
          class: isDarkMode ? "bg-blue-900/40 text-blue-300" : "bg-blue-100 text-blue-800"
        };
      case "active":
        return {
          text: "Active",
          class: isDarkMode ? "bg-green-900/40 text-green-300" : "bg-green-100 text-green-800"
        };
      case "rejected":
        return {
          text: "Rejected",
          class: isDarkMode ? "bg-red-900/40 text-red-300" : "bg-red-100 text-red-800"
        };
      case "declined":
        return {
          text: "Declined",
          class: isDarkMode ? "bg-red-900/40 text-red-300" : "bg-red-100 text-red-800"
        };
      default:
        return {
          text: status,
          class: isDarkMode ? "bg-gray-900/40 text-gray-300" : "bg-gray-100 text-gray-800"
        };
    }
  };
  
  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(depositAddress);
    setIsCopied(true);
    toast.success("Address copied to clipboard");
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };
  
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsConfirmingDeposit(true);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "my_preset"); // Replace with your Cloudinary preset
      
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dgqjunu7l/upload", // Replace with your Cloudinary cloud name
        formData
      );
      
      setUploadedImageUrl(response.data.secure_url);
      setShowUploader(false);
      toast.success("Proof of transaction uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload proof of transaction");
    } finally {
      setIsConfirmingDeposit(false);
    }
  };
  
  const confirmDeposit = async () => {
    if (!selectedAsset || !uploadedImageUrl) {
      toast.error("Please upload proof of transaction first");
      return;
    }
    
    setIsConfirmingDeposit(true);
    
    try {
      // Add deposit to history
      const depositResponse = await axios.post("/history/deposit/api", {
        email: details.email,
        depositMethod: `${selectedAsset.symbol} Deposit for Transaction`,
        amount: selectedAsset.amount,
        transactionStatus: "Pending",
        image: uploadedImageUrl,
        name: details.name,
      });
      
      if (depositResponse.data.success) {
        // Update local state with deposit history
        setDetails((prevDeets) => ({
          ...prevDeets,
          depositHistory: [
            ...(prevDeets.depositHistory || []),
            {
              id: depositResponse.data.id,
              dateAdded: depositResponse.data.date,
              depositMethod: `${selectedAsset.symbol} Deposit for Transaction`,
              amount: selectedAsset.amount,
              transactionStatus: "Pending",
            },
          ],
        }));
        
        // Update staking deposit status
        const stakingResponse = await axios.post("/api/stake/deposit", {
          email: details.email,
          stakingId: selectedRequest.id,
          proofOfPayment: uploadedImageUrl
        });
        
        if (stakingResponse.data.success) {
          toast.success(`Deposit of ${selectedAsset.amount} ${selectedAsset.symbol} confirmed successfully. Transaction is awaiting verification.`);
          
          // Update local staking status
          setDetails((prevDeets) => ({
            ...prevDeets,
            stakings: prevDeets.stakings.map(stake => 
              stake.id === selectedRequest.id 
                ? {...stake, partnerDepositStatus: "completed", partnerPaymentProof: uploadedImageUrl}
                : stake
            )
          }));
          
          // Fetch fresh data after a short delay
          setTimeout(() => {
            fetch("/fetching/fetchAllDetails", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ email: details.email }),
            })
            .then(response => response.json())
            .then(data => {
              if (data) {
                setDetails(data);
              }
            })
            .catch(error => {
              console.error("Error fetching updated data:", error);
            });
          }, 1000);
        }
        
        setIsDepositDialogOpen(false);
        setUploadedImageUrl("");
        setShowUploader(false);
      }
    } catch (error) {
      console.error("Error confirming deposit:", error);
      toast.error("Failed to confirm deposit");
    } finally {
      setIsConfirmingDeposit(false);
    }
  };

  // Function to render the card-based UI for requests
  const renderRequestCard = (request, type) => {
    const status = getStatusDisplay(request.status, request.partnerStatus);
    const isPending = request.status === "pending-partner";
    const isInitiator = type === "sent";
    const partnerInfo = isInitiator ? request.partnerName : request.initiatorName;
    
    return (
      <Card 
        key={request.id}
        className={`mb-4 ${isDarkMode ? "bg-[#111] border-[#333]" : "bg-white"}`}
        onClick={() => handleViewRequest(request)}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-x-2">
              <Image
                src={request.stakedAssetImagePath}
                alt={request.stakedAsset}
                width={32}
                height={32}
                className="rounded-full"
              />
              <CardTitle className="text-lg">{request.stakedAssetSymbol} Transaction</CardTitle>
            </div>
            <Badge className={status.class}>
              {status.text}
            </Badge>
          </div>
          <CardDescription className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
            {isInitiator ? "To" : "From"}: {partnerInfo} • {getTimeAgo(request.dateStaked)}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 pb-2">
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <div className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Amount:</div>
            <div className="font-medium text-right">
              {parseFloat(request.stakedAmount).toFixed(6)} {request.stakedAssetSymbol}
            </div>
            
            <div className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Your Share:</div>
            <div className="font-medium text-right">
              {isInitiator ? request.initiatorPercentage : request.partnerPercentage}% 
              ({isInitiator 
                ? parseFloat(request.initiatorContribution).toFixed(6) 
                : parseFloat(request.partnerContribution).toFixed(6)} {request.stakedAssetSymbol})
            </div>
            
            <div className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Duration:</div>
            <div className="font-medium text-right">{request.stakedDuration} months</div>
            
            <div className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Total Returns:</div>
            <div className="font-medium text-right">
              {parseFloat(request.totalReturns).toFixed(6)} {request.stakedAssetSymbol}
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-0">
          {isPending && !isInitiator && (
            <div className="w-full grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={(e) => {
                e.stopPropagation();
                handleViewRequest(request);
              }}>
                View Details
              </Button>
              <Button onClick={(e) => {
                e.stopPropagation();
                setSelectedRequest(request);
                handleAcceptStaking();
              }}>
                Accept
              </Button>
            </div>
          )}
          {isInitiator && request.status === "pending" && (
            <Button variant="outline" className="w-full" onClick={(e) => {
              e.stopPropagation();
              handleDeleteRequest(request);
            }}>
              Cancel Request
            </Button>
          )}
          {(request.status === "awaiting_verification" || 
            request.status === "active" || 
            request.status === "rejected" || 
            request.status === "declined") && (
            <Button variant="outline" className="w-full" onClick={(e) => {
              e.stopPropagation();
              handleViewRequest(request);
            }}>
              View Details
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  };

  // Function to force refresh data
  const refreshData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/fetching/fetchAllDetails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: details.email }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Manually refreshed user data:", data);
        setDetails(data);
        toast.success("Data refreshed successfully");
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Error refreshing data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`mt-6 ${isDarkMode ? "text-white" : ""}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Transaction Requests</h2>
        <Button 
          size="sm" 
          onClick={refreshData} 
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? "Refreshing..." : "Refresh Data"}
        </Button>
      </div>
      <Tabs defaultValue="received" onValueChange={setActiveTab}>
        <TabsList className={`w-full justify-start ${isDarkMode ? "bg-[#222]" : ""}`}>
          <TabsTrigger 
            value="received" 
            className={`relative ${activeTab === "received" && isDarkMode ? "bg-[#111] text-white" : ""}`}
          >
            Received Requests
            {pendingReceivedRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {pendingReceivedRequests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="sent" 
            className={`relative ${activeTab === "sent" && isDarkMode ? "bg-[#111] text-white" : ""}`}
          >
            Sent Requests
            {pendingSentRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {pendingSentRequests.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="mt-4">
          {stakingInvitations.length === 0 ? (
            <Card className={`${isDarkMode ? "bg-[#111] border-[#333]" : ""}`}>
              <CardContent className="pt-6 pb-6 text-center">
                <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  No received transaction requests
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Pending Requests */}
              {pendingReceivedRequests.length > 0 && (
                <div className="mb-6">
                  <h3 className={`text-lg font-medium mb-3 ${isDarkMode ? "text-white/90" : ""}`}>
                    Awaiting Your Response
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {pendingReceivedRequests.map((request) => renderRequestCard(request, "received"))}
                  </div>
                </div>
              )}
              
              {/* Processed Requests */}
              {processedReceivedRequests.length > 0 && (
                <div>
                  <h3 className={`text-lg font-medium mb-3 ${isDarkMode ? "text-white/90" : ""}`}>
                    Past Requests
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {processedReceivedRequests.map((request) => renderRequestCard(request, "received"))}
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="sent" className="mt-4">
          {sentRequests.length === 0 ? (
            <Card className={`${isDarkMode ? "bg-[#111] border-[#333]" : ""}`}>
              <CardContent className="pt-6 pb-6 text-center">
                <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  No sent transaction requests
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Pending Sent Requests */}
              {pendingSentRequests.length > 0 && (
                <div className="mb-6">
                  <h3 className={`text-lg font-medium mb-3 ${isDarkMode ? "text-white/90" : ""}`}>
                    Pending Requests
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {pendingSentRequests.map((request) => renderRequestCard(request, "sent"))}
                  </div>
                </div>
              )}
              
              {/* Processed Sent Requests */}
              {processedSentRequests.length > 0 && (
                <div>
                  <h3 className={`text-lg font-medium mb-3 ${isDarkMode ? "text-white/90" : ""}`}>
                    Past Requests
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {processedSentRequests.map((request) => renderRequestCard(request, "sent"))}
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Request Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className={`sm:max-w-md ${isDarkMode ? "bg-[#111] text-white border-[#333]" : ""}`}>
          <DialogHeader>
            <DialogTitle>Transaction Request Details</DialogTitle>
            <DialogDescription className={isDarkMode ? "text-gray-400" : ""}>
              {selectedRequest?.isInitiator ? "You initiated" : "You received"} this transaction request {getTimeAgo(selectedRequest?.dateStaked)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="py-4">
              <div className="flex items-center gap-x-3 mb-4">
                <Image
                  src={selectedRequest.stakedAssetImagePath}
                  alt={selectedRequest.stakedAsset}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <h3 className="font-medium text-lg">{selectedRequest.stakedAssetSymbol} Transaction</h3>
                  <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {selectedRequest.stakedAsset}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-y-2">
                  <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Status:</p>
                  <p className="text-right">
                    <Badge className={getStatusDisplay(selectedRequest.status, selectedRequest.partnerStatus).class}>
                      {getStatusDisplay(selectedRequest.status, selectedRequest.partnerStatus).text}
                    </Badge>
                  </p>
                  
                  <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {selectedRequest.isInitiator ? "Partner" : "Initiator"}:
                  </p>
                  <p className="text-right font-medium">
                    {selectedRequest.isInitiator ? selectedRequest.partnerName : selectedRequest.initiatorName}
                  </p>
                  
                  <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Total Amount:</p>
                  <p className="text-right font-medium">
                    {parseFloat(selectedRequest.stakedAmount).toFixed(6)} {selectedRequest.stakedAssetSymbol}
                  </p>
                  
                  <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Your Contribution:</p>
                  <p className="text-right font-medium">
                    {selectedRequest.isInitiator 
                      ? parseFloat(selectedRequest.initiatorContribution).toFixed(6) 
                      : parseFloat(selectedRequest.partnerContribution).toFixed(6)} {selectedRequest.stakedAssetSymbol}
                    <span className="text-sm ml-1 opacity-70">
                      ({selectedRequest.isInitiator 
                        ? selectedRequest.initiatorPercentage 
                        : selectedRequest.partnerPercentage}%)
                    </span>
                  </p>
                  
                  <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Duration:</p>
                  <p className="text-right font-medium">{selectedRequest.stakedDuration} months</p>
                  
                  <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Monthly Returns:</p>
                  <p className="text-right font-medium">
                    {parseFloat(selectedRequest.monthlyReturns).toFixed(6)} {selectedRequest.stakedAssetSymbol}
                  </p>
                  
                  <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Total Returns:</p>
                  <p className="text-right font-medium">
                    {parseFloat(selectedRequest.totalReturns).toFixed(6)} {selectedRequest.stakedAssetSymbol}
                  </p>
                  
                  <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Date Initiated:</p>
                  <p className="text-right font-medium">{formatDate(selectedRequest.dateStaked)}</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="sm:justify-between">
            {selectedRequest?.status === "pending-partner" && !selectedRequest?.isInitiator && (
              <>
                <Button
                  variant="outline"
                  onClick={handleRejectStaking}
                  disabled={isLoading}
                  className={`${isDarkMode ? "border-[#444] hover:bg-[#222]" : ""}`}
                >
                  Decline
                </Button>
                <Button 
                  onClick={handleAcceptStaking}
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Accept"}
                </Button>
              </>
            )}
            
            {selectedRequest?.status === "pending" && selectedRequest?.isInitiator && (
              <Button
                variant="destructive"
                onClick={() => handleDeleteRequest(selectedRequest)}
                disabled={isLoading}
                className="ml-auto"
              >
                Cancel Request
              </Button>
            )}
            
            {(selectedRequest?.status !== "pending-partner" || selectedRequest?.isInitiator) && 
             selectedRequest?.status !== "pending" && (
              <Button 
                onClick={() => setIsDialogOpen(false)}
                className="ml-auto"
              >
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className={isDarkMode ? "bg-[#111] text-white border-[#333]" : ""}>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Transaction Request</AlertDialogTitle>
            <AlertDialogDescription className={isDarkMode ? "text-gray-400" : ""}>
              Are you sure you want to cancel this transaction request? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={isDarkMode ? "border-[#444] hover:bg-[#222] text-white" : ""}>
              No, Keep It
            </AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              try {
                // Call the API to delete the staking request
                const response = await fetch("/api/stake/delete", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    email: details.email,
                    stakingId: requestToDelete.id
                  }),
                });
                
                const data = await response.json();
                
                if (data.success) {
                  toast.success("Transaction request cancelled successfully");
              
                  // Update local state immediately for UI responsiveness
              if (requestToDelete) {
                setDetails((prev) => ({
                  ...prev,
                  stakings: prev.stakings.filter(stake => stake.id !== requestToDelete.id)
                }));
                  }
                  
                  // Fetch fresh data after a short delay to ensure server-side changes are reflected
                  setTimeout(() => {
                    fetch("/fetching/fetchAllDetails", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ email: details.email }),
                    })
                    .then(response => response.json())
                    .then(data => {
                      if (data) {
                        console.log("Updated staking data received:", data);
                        setDetails(data);
                      }
                    })
                    .catch(error => {
                      console.error("Error fetching updated data:", error);
                    });
                  }, 1000);
                } else {
                  toast.error(data.message || "Failed to cancel staking request");
                }
              } catch (error) {
                console.error("Error cancelling staking request:", error);
                toast.error("Failed to cancel staking request. Please try again.");
              } finally {
                setIsDeleteDialogOpen(false);
              }
            }}>
              Yes, Cancel It
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Deposit Dialog */}
      <Dialog open={isDepositDialogOpen} onOpenChange={setIsDepositDialogOpen}>
        <DialogContent className={`sm:max-w-md ${isDarkMode ? "bg-[#111] text-white border-[#333]" : ""}`}>
          <DialogHeader>
            <DialogTitle>Complete Your Transaction Deposit</DialogTitle>
            <DialogDescription className={isDarkMode ? "text-gray-400" : ""}>
              Please send exactly {selectedAsset?.amount} {selectedAsset?.symbol} to complete your part of the transaction.
            </DialogDescription>
          </DialogHeader>
          
          {selectedAsset && (
            <div className="py-4">
              <div className="flex items-center gap-x-3 mb-4">
                <Image
                  src={selectedAsset.image}
                  alt={selectedAsset.fullName}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <h3 className="font-medium text-lg">{selectedAsset.symbol}</h3>
                  <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {selectedAsset.fullName}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount" className="block mb-2">Amount to Deposit</Label>
                  <Input 
                    id="amount" 
                    value={selectedAsset.amount} 
                    disabled 
                    className={isDarkMode ? "bg-[#222] border-[#444] text-white" : ""}
                  />
                </div>
                
                <div>
                  <Label htmlFor="address" className="block mb-2">Deposit Address</Label>
                  <div className="relative">
                    <Input 
                      id="address" 
                      value={depositAddress} 
                      disabled 
                      className={isDarkMode ? "bg-[#222] border-[#444] text-white pr-20" : "pr-20"}
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="absolute right-1 top-1" 
                      onClick={handleCopyAddress}
                    >
                      {isCopied ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-center my-4">
                  <div className={`p-2 ${isDarkMode ? "bg-white" : "bg-gray-100"} rounded-md`}>
                    <QRCode value={depositAddress} size={150} />
                  </div>
                </div>
                
                {!showUploader && !uploadedImageUrl && (
                  <Button 
                    onClick={() => setShowUploader(true)} 
                    variant="outline" 
                    className="w-full"
                  >
                    Upload Proof of Transaction
                  </Button>
                )}
                
                {showUploader && (
                  <div className="space-y-2">
                    <Label htmlFor="proof">Upload Screenshot of Transaction</Label>
                    <Input 
                      id="proof" 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileUpload} 
                      className={isDarkMode ? "bg-[#222] border-[#444] text-white" : ""}
                    />
                  </div>
                )}
                
                {uploadedImageUrl && (
                  <div className="space-y-2">
                    <p className="text-sm text-green-500">✓ Proof uploaded successfully</p>
                    <Image 
                      src={uploadedImageUrl} 
                      alt="Proof of transaction" 
                      className="max-h-[200px] mx-auto object-contain rounded-md"
                      width={300}
                      height={200} 
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDepositDialogOpen(false)}
              className={isDarkMode ? "border-[#444] hover:bg-[#222]" : ""}
            >
              Close
            </Button>
            <Button 
              onClick={confirmDeposit}
              disabled={!uploadedImageUrl || isConfirmingDeposit}
            >
              {isConfirmingDeposit ? "Confirming..." : "Confirm Deposit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}