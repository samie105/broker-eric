"use client";
import React, { useState, useEffect } from "react";
import { useTheme } from "../../../contexts/themeContext";
import { useUserData } from "../../../contexts/userrContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import InvestmentPlans from "./InvestmentPlans";
import OngoingInvestments from "./OngoingInvestments";
import InvestmentRequests from "./InvestmentRequests";
import { Skeleton } from "../../ui/skeleton";
import { useSearchParams } from "next/navigation";

export default function InvestmentModule() {
  const { isDarkMode } = useTheme();
  const { details } = useUserData();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "plans");
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  
  // Handle URL tab parameter
  useEffect(() => {
    if (tabParam && ["plans", "ongoing", "requests"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);
  
  // Count pending investment requests
  useEffect(() => {
    if (details && details.investments) {
      const count = details.investments.filter(
        inv => inv.type === "joint" && 
        inv.partnerEmail === details.email && 
        inv.status === "pending"
      ).length;
      setPendingRequestsCount(count);
    }
  }, [details]);
  
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
        <h1 className="text-2xl font-bold">Investment Portal</h1>
        <p className={`text-sm ${isDarkMode ? "text-white/70" : "text-gray-600"}`}>
          Grow your assets with sole or joint investments
        </p>
      </div>

      <Tabs 
        defaultValue="plans" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList 
          className={`grid w-full grid-cols-3 mb-8 ${
            isDarkMode 
              ? "bg-[#222] text-white/80" 
              : "bg-gray-100"
          }`}
        >
          <TabsTrigger 
            value="plans"
            className={`${
              activeTab === "plans" && isDarkMode 
                ? "bg-[#111] text-white" 
                : activeTab === "plans" 
                  ? "bg-white" 
                  : ""
            }`}
          >
            Investment Plans
          </TabsTrigger>
          <TabsTrigger 
            value="ongoing"
            className={`${
              activeTab === "ongoing" && isDarkMode 
                ? "bg-[#111] text-white" 
                : activeTab === "ongoing" 
                  ? "bg-white" 
                  : ""
            }`}
          >
            My Investments
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
        
        <TabsContent value="plans" className="mt-0">
          <InvestmentPlans />
        </TabsContent>
        
        <TabsContent value="ongoing" className="mt-0">
          <OngoingInvestments />
        </TabsContent>
        
        <TabsContent value="requests" className="mt-0">
          <InvestmentRequests />
        </TabsContent>
      </Tabs>
    </div>
  );
} 