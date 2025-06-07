"use client";
import React, { useState, useEffect } from "react";
import { useTheme } from "../../../contexts/themeContext";
import { useUserData } from "../../../contexts/userrContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import Mystakings from "./Mystakings";
import StakingRequests from "./StakingRequests";
import { Skeleton } from "../../ui/skeleton";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";

export default function StakingModule() {
  const { isDarkMode } = useTheme();
  const { details, setDetails } = useUserData();
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "plans");
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [isCheckingInvitations, setIsCheckingInvitations] = useState(false);
  
  // Handle URL tab parameter
  useEffect(() => {
    if (tabParam && ["plans", "mystakings", "requests"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);
  
  // Count pending staking requests from current user data
  useEffect(() => {
    if (details && details.stakingInvitations) {
      const count = details.stakingInvitations.filter(
        invitation => invitation.status === "pending-partner"
      ).length;
      setPendingRequestsCount(count);
    }
  }, [details]);
  
  // Periodically check for new staking invitations
  useEffect(() => {
    // Don't run if we don't have user details yet
    if (!details || details === 0 || !details.email) return;
    
    // Function to check for new invitations
    const checkForNewInvitations = async () => {
      // Skip if already checking
      if (isCheckingInvitations) return;
      
      try {
        setIsCheckingInvitations(true);
        
        const response = await axios.post("/api/stake/check-invitations", {
          email: details.email
        });
        
        if (response.data.success) {
          // If the count from the API is different from what we have locally,
          // that means there are new invitations
          const serverCount = response.data.count;
          const localCount = details.stakingInvitations?.filter(
            invitation => invitation.status === "pending-partner"
          ).length || 0;
          
          // If server has more invitations than our local state, refresh the data
          if (serverCount > localCount) {
            // Get the new invitations from the server
            const newInvitations = response.data.pendingInvitations;
            
            // Update local state with the new invitations
            setDetails(prev => {
              // Get existing invitations that are not pending-partner
              const existingNonPendingInvitations = prev.stakingInvitations?.filter(
                inv => inv.status !== "pending-partner"
              ) || [];
              
              // Combine with new pending invitations
              return {
                ...prev,
                stakingInvitations: [
                  ...existingNonPendingInvitations,
                  ...newInvitations
                ]
              };
            });
            
            // Update the count immediately
            setPendingRequestsCount(serverCount);
          }
        }
      } catch (error) {
        console.error("Error checking for new staking invitations:", error);
      } finally {
        setIsCheckingInvitations(false);
      }
    };
    
    // Check immediately on mount
    checkForNewInvitations();
    
    // Set up interval to check every 15 seconds
    const intervalId = setInterval(checkForNewInvitations, 15000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [details, isCheckingInvitations, setDetails]);
  
  const handleTabChange = (value) => {
    setActiveTab(value);
    router.push(`/dashboard/stake/mystakings?tab=${value}`, { scroll: false });
  };
  
  if (!details || details === 0) {
    return (
      <div className="p-4 mt-4">
        <Skeleton
          className={`h-10 mb-4 ${
            isDarkMode ? "bg-[#333]" : "bg-gray-200/80"
          }`}
        />
        <Skeleton
          className={`h-60 mb-4 ${
            isDarkMode ? "bg-[#333]" : "bg-gray-200/80"
          }`}
        />
        <Skeleton
          className={`h-60 ${isDarkMode ? "bg-[#333]" : "bg-gray-200/80"}`}
        />
      </div>
    );
  }

  return (
    <div className={`p-4 ${isDarkMode ? "text-white/90" : ""}`}>
      <div className="header mb-6">
        <h1 className="text-2xl font-bold">Staking Portal</h1>
        <p className={`text-sm ${isDarkMode ? "text-white/70" : "text-gray-600"}`}>
          Grow your assets with solo or joint staking options
        </p>
      </div>

      <Tabs 
        defaultValue="mystakings" 
        value={activeTab} 
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList 
          className={`grid w-full grid-cols-2 mb-8 ${
            isDarkMode 
              ? "bg-[#222] text-white/80" 
              : "bg-gray-100"
          }`}
        >
          <TabsTrigger 
            value="mystakings"
            className={`${
              activeTab === "mystakings" && isDarkMode 
                ? "bg-[#111] text-white" 
                : activeTab === "mystakings" 
                  ? "bg-white" 
                  : ""
            }`}
          >
            My Stakings
          </TabsTrigger>
          <TabsTrigger 
            value="requests"
            className={`${
              activeTab === "requests" && isDarkMode 
                ? "bg-[#111] text-white" 
                : activeTab === "requests" 
                  ? "bg-white" 
                  : ""
            } relative`}
          >
            Requests
            {pendingRequestsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {pendingRequestsCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="mystakings" className="mt-0">
          <Mystakings />
        </TabsContent>
        
        <TabsContent value="requests" className="mt-0">
          <StakingRequests />
        </TabsContent>
      </Tabs>
    </div>
  );
} 