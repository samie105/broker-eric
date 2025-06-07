import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useUserData } from "../../../contexts/userrContext";
import { useTheme } from "../../../contexts/themeContext";
import { Badge } from "../../ui/badge";
import { InfinitySpin } from "react-loader-spinner";
import Image from "next/image";
import { Button } from "../../ui/button";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

export default function StakingInvitations() {
  const { details, setDetails } = useUserData();
  const { isDarkMode } = useTheme();
  const [isProcessing, setIsProcessing] = useState(null);
  const router = useRouter();

  // Get staking invitations from user data
  const invitations = details?.stakingInvitations || [];
  const hasInvitations = invitations.length > 0;

  // Handle response (accept or reject invitation)
  const handleResponse = async (stakingId, action) => {
    setIsProcessing(stakingId);
    
    try {
      const response = await axios.post("/api/stake/respond", {
        email: details.email,
        stakingId,
        action
      });
      
      if (response.status === 200) {
        // Create success message based on action
        const message = action === "accept" 
          ? "Staking invitation accepted successfully" 
          : "Staking invitation rejected";
          
        toast.success(message);
        
        // Update local state to remove the invitation
        const updatedInvitations = invitations.filter(inv => inv.id !== stakingId);
        
        setDetails(prev => ({
          ...prev,
          stakingInvitations: updatedInvitations
        }));
        
        if (action === "accept") {
          // Redirect to stakings page after a short delay
          setTimeout(() => {
            router.push("/dashboard/stake/mystakings");
          }, 1500);
        }
      }
    } catch (error) {
      console.error("Error responding to staking invitation:", error);
      toast.error(error.response?.data?.message || "Failed to process your response");
    } finally {
      setIsProcessing(null);
    }
  };

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown date";
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return "Invalid date";
    }
  };

  if (!hasInvitations) {
    return (
      <div className={`rounded-lg p-8 text-center ${
        isDarkMode ? "bg-[#111] text-white" : "bg-white text-gray-500 border border-gray-100"
      }`}>
        <div className="flex flex-col items-center justify-center">
          <div className="mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-gray-400">
              <path d="M5.223 2.25c-.497 0-.974.198-1.325.55l-1.3 1.298A3.75 3.75 0 007.5 9.75c.627.47 1.406.75 2.25.75.844 0 1.624-.28 2.25-.75.626.47 1.406.75 2.25.75.844 0 1.623-.28 2.25-.75a3.75 3.75 0 004.902-5.652l-1.3-1.299a1.875 1.875 0 00-1.325-.549H5.223z" />
              <path fillRule="evenodd" d="M3 20.25v-8.755c1.42.674 3.08.673 4.5 0A5.234 5.234 0 009.75 12c.804 0 1.568-.182 2.25-.506a5.234 5.234 0 002.25.506c.804 0 1.567-.182 2.25-.506 1.42.674 3.08.675 4.5.001v8.755h.75a.75.75 0 010 1.5H2.25a.75.75 0 010-1.5H3zm3-6a.75.75 0 01.75-.75h3a.75.75 0 01.75.75v3a.75.75 0 01-.75.75h-3a.75.75 0 01-.75-.75v-3zm8.25-.75a.75.75 0 00-.75.75v5.25c0 .414.336.75.75.75h3a.75.75 0 00.75-.75v-5.25a.75.75 0 00-.75-.75h-3z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-1">No Staking Invitations</h3>
          <p className="text-sm">You don&apos;t have any joint staking invitations at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg overflow-hidden ${
      isDarkMode ? "bg-[#111] text-white" : "bg-white border border-gray-100"
    }`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold">Joint Staking Invitations</h2>
      </div>
      
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {invitations.map((invitation) => (
          <div key={invitation.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="rounded-full overflow-hidden w-10 h-10">
                  <Image 
                    src={invitation.stakedAssetImagePath} 
                    alt={invitation.stakedAssetSymbol} 
                    width={40} 
                    height={40}
                  />
                </div>
                <div>
                  <h3 className="font-medium">
                    {invitation.stakedAmount} {invitation.stakedAssetSymbol} Staking
                  </h3>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    From {invitation.initiatorEmail}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Received {formatDate(invitation.dateStaked)}
                  </div>
                </div>
              </div>
              
              <Badge variant={isDarkMode ? "outline" : "secondary"} className="self-start">
                {invitation.stakedDuration} months
              </Badge>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className={`p-3 rounded-lg ${
                isDarkMode ? "bg-[#222] text-white" : "bg-gray-50"
              }`}>
                <div className="text-xs text-gray-500 dark:text-gray-400">Your Contribution</div>
                <div className="font-semibold">
                  {invitation.partnerContribution} {invitation.stakedAssetSymbol}
                </div>
                <div className="text-xs mt-1">
                  {invitation.partnerPercentage}% of total investment
                </div>
              </div>
              
              <div className={`p-3 rounded-lg ${
                isDarkMode ? "bg-[#222] text-white" : "bg-gray-50"
              }`}>
                <div className="text-xs text-gray-500 dark:text-gray-400">Expected Returns</div>
                <div className="font-semibold text-green-600 dark:text-green-400">
                  {invitation.totalReturns} {invitation.stakedAssetSymbol}
                </div>
                <div className="text-xs mt-1">
                  After {invitation.stakedDuration} months
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex space-x-3">
              <Button 
                onClick={() => handleResponse(invitation.id, "accept")}
                disabled={isProcessing === invitation.id}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                {isProcessing === invitation.id ? (
                  <InfinitySpin width="100" color="#ffffff" />
                ) : (
                  "Accept"
                )}
              </Button>
              <Button 
                onClick={() => handleResponse(invitation.id, "reject")}
                disabled={isProcessing === invitation.id}
                variant="outline" 
                className={`flex-1 ${isDarkMode ? "border-white/20 hover:bg-white/5" : ""}`}
              >
                Decline
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 