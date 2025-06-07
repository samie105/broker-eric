"use client";
import React, { useEffect, useState } from "react";
import { useUserData } from "../../../contexts/userrContext";
import { useTheme } from "../../../contexts/themeContext";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { MoreHorizontal, ExternalLink } from "lucide-react";

export default function Mystakings() {
  const { details } = useUserData();
  const currentDate = new Date();
  const millisecondsInAMonth = 30 * 24 * 60 * 60 * 1000;
  const { isDarkMode } = useTheme();
  const [selectedStaking, setSelectedStaking] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Function to calculate remaining months more accurately
  const calculateRemainingMonths = (stakingDate, durationMonths) => {
    const stakeDate = new Date(stakingDate);
    // Calculate end date by adding the duration in months
    const endDate = new Date(stakeDate);
    endDate.setMonth(endDate.getMonth() + durationMonths);
    
    // If current date is past end date, staking is completed
    if (currentDate > endDate) {
      return "Completed";
    }
    
    // Calculate months between current date and end date
    const monthsDiff = (endDate - currentDate) / millisecondsInAMonth;
    return Math.ceil(monthsDiff);
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
  
  const getStatusDisplay = (stake) => {
    if (stake.isJoint && stake.partnerStatus === "pending") {
      return {
        text: "Awaiting Partner",
        class: isDarkMode ? "bg-yellow-900/40 text-yellow-300" : "bg-yellow-100 text-yellow-800"
      };
    }
    
    if (stake.status === "awaiting_verification") {
      return {
        text: "Awaiting Verification",
        class: isDarkMode ? "bg-blue-900/40 text-blue-300" : "bg-blue-100 text-blue-800"
      };
    }
    
    if (stake.status === "active" || stake.status === "ongoing" || stake.status === "Ongoing") {
      // Check if completed based on time
      const remainingMonths = calculateRemainingMonths(stake.dateStaked, stake.stakedDuration);
      if (remainingMonths === "Completed") {
        return {
          text: "Completed",
          class: isDarkMode ? "bg-green-900/40 text-green-300" : "bg-green-100 text-green-800"
        };
      }
      
      return {
        text: "Active",
        class: isDarkMode ? "bg-green-900/40 text-green-300" : "bg-green-100 text-green-800"
      };
    }
    
    return {
      text: stake.status,
      class: isDarkMode ? "bg-gray-900/40 text-gray-300" : "bg-gray-100 text-gray-800"
    };
  };
  
  const handleViewStaking = (stake) => {
    setSelectedStaking(stake);
    setIsDialogOpen(true);
  };
  
  // Group stakings by status
  const getGroupedStakings = () => {
    if (!details || !details.stakings || details.stakings.length === 0) {
      return { active: [], pending: [], completed: [], all: [] };
    }
    
    const active = [];
    const pending = [];
    const completed = [];
    const all = [];
    
    details.stakings.forEach(stake => {
      // Skip joint stakings that are still pending partner acceptance and shown in requests tab
      if (stake.isJoint && stake.status === "pending" && stake.isInitiator) {
        return;
      }
      
      all.push(stake);
      
      if (stake.status === "active" || stake.status === "ongoing" || stake.status === "Ongoing") {
        // Check if completed based on time
        const remainingMonths = calculateRemainingMonths(stake.dateStaked, stake.stakedDuration);
        if (remainingMonths === "Completed") {
          completed.push(stake);
        } else {
          active.push(stake);
        }
      } else if (stake.status === "awaiting_verification" || 
                (stake.isJoint && stake.partnerStatus === "pending")) {
        pending.push(stake);
      } else if (stake.status === "completed") {
        completed.push(stake);
      } else {
        // Default to pending for other statuses
        pending.push(stake);
      }
    });
    
    return { active, pending, completed, all };
  };
  
  const groupedStakings = getGroupedStakings();
  
  // Get filtered stakings based on active tab
  const getFilteredStakings = () => {
    switch (activeTab) {
      case "active":
        return groupedStakings.active;
      case "pending":
        return groupedStakings.pending;
      case "completed":
        return groupedStakings.completed;
      case "all":
      default:
        return groupedStakings.all;
    }
  };

  const filteredStakings = getFilteredStakings();

  return (
    <div className={`mt-3 pb-2 ${isDarkMode ? "text-white" : ""}`}>
      {details !== 0 && details.stakings && details.stakings.length === 0 && (
        <Card className={`${isDarkMode ? "bg-[#111] border-[#333]" : ""}`}>
          <CardContent className="pt-6 pb-6 text-center">
            <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              No transactions yet
            </p>
            <Button className="mt-4" onClick={() => window.location.href = "/dashboard/stake"}>
              Start a Transaction
            </Button>
          </CardContent>
        </Card>
      )}
      
      {details !== 0 && details.stakings && details.stakings.length > 0 && (
        <div>
          <Tabs 
            defaultValue="all" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList 
              className={`grid w-full grid-cols-4 mb-6 ${
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
                All ({groupedStakings.all.length})
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
                Active ({groupedStakings.active.length})
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
                Pending ({groupedStakings.pending.length})
              </TabsTrigger>
              <TabsTrigger 
                value="completed"
                className={`${
                  activeTab === "completed" && isDarkMode 
                    ? "bg-[#111] text-white" 
                    : activeTab === "completed" 
                      ? "bg-white" 
                      : ""
                }`}
              >
                Completed ({groupedStakings.completed.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-0">
              <Card className={`${isDarkMode ? "bg-[#111] border-[#333]" : ""}`}>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className={isDarkMode ? "bg-[#222]" : "bg-gray-50"}>
                        <TableRow>
                          <TableHead>Asset</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Returns</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStakings.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-6">
                              No transactions in this category
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredStakings.map((stake) => {
                            const status = getStatusDisplay(stake);
                            const remainingMonths = calculateRemainingMonths(stake.dateStaked, stake.stakedDuration);
                            
                            return (
                              <TableRow key={stake.id} className={isDarkMode ? "border-[#333] hover:bg-[#1a1a1a]" : "hover:bg-gray-50"}>
                                <TableCell>
                                  <div className="flex items-center gap-x-2">
                                    <Image
                                      src={stake.stakedAssetImagePath}
                                      alt={stake.stakedAsset}
                                      width={24}
                                      height={24}
                                      className="rounded-full"
                                    />
                                    <div>
                                      <div className="font-medium">{stake.stakedAssetSymbol}</div>
                                      <div className="text-xs text-muted-foreground">{stake.stakedAsset}</div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {stake.isJoint ? (
                                    <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800/50">
                                      Joint {stake.isPartner ? "(Partner)" : "(Initiator)"}
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50">
                                      Solo
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium">
                                    {parseFloat(stake.stakedAmount).toFixed(6)} {stake.stakedAssetSymbol}
                                  </div>
                                  {stake.isJoint && (
                                    <div className="text-xs text-muted-foreground">
                                      Your share: {stake.isPartner ? stake.partnerPercentage : stake.initiatorPercentage}%
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div>{stake.stakedDuration} months</div>
                                  {remainingMonths !== "Completed" && status.text === "Active" && (
                                    <div className="text-xs text-muted-foreground">{remainingMonths} months remaining</div>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">{parseFloat(stake.monthlyReturns).toFixed(6)} {stake.stakedAssetSymbol} /month</div>
                                  <div className="text-xs text-muted-foreground">Total: {parseFloat(stake.totalReturns).toFixed(6)} {stake.stakedAssetSymbol}</div>
                                </TableCell>
                                <TableCell>
                                  <Badge className={status.class}>
                                    {status.text}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">{formatDate(stake.dateStaked)}</div>
                                  <div className="text-xs text-muted-foreground">{getTimeAgo(stake.dateStaked)}</div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className={isDarkMode ? "bg-[#222] border-[#333] text-white" : ""}>
                                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => handleViewStaking(stake)}>
                                        View Details
                                      </DropdownMenuItem>
                                      {stake.partnerPaymentProof && (
                                        <DropdownMenuItem onClick={() => window.open(stake.partnerPaymentProof, "_blank")}>
                                          <span className="flex items-center">
                                            View Payment Proof <ExternalLink className="ml-2 h-3 w-3" />
                                          </span>
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
      
      {/* Staking Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className={`sm:max-w-md ${isDarkMode ? "bg-[#111] text-white border-[#333]" : ""}`}>
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription className={isDarkMode ? "text-gray-400" : ""}>
              {selectedStaking?.isJoint
                ? `Joint transaction with ${selectedStaking.isInitiator ? selectedStaking.partnerName : selectedStaking.initiatorName}`
                : "Solo transaction"}
            </DialogDescription>
          </DialogHeader>
          
          {selectedStaking && (
            <div className="py-4">
              <div className="flex items-center gap-x-3 mb-4">
                <Image
                  src={selectedStaking.stakedAssetImagePath}
                  alt={selectedStaking.stakedAsset}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <h3 className="font-medium text-lg">{selectedStaking.stakedAssetSymbol} Transaction</h3>
                  <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {selectedStaking.stakedAsset}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-y-2">
                  <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Status:</p>
                  <p className="text-right">
                    <Badge className={getStatusDisplay(selectedStaking).class}>
                      {getStatusDisplay(selectedStaking).text}
                    </Badge>
                  </p>
                  
                  {selectedStaking.isJoint && (
                    <>
                      <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {selectedStaking.isInitiator ? "Partner" : "Initiator"}:
                      </p>
                      <p className="text-right font-medium">
                        {selectedStaking.isInitiator ? selectedStaking.partnerName : selectedStaking.initiatorName}
                      </p>
                    </>
                  )}
                  
                  <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Total Amount:</p>
                  <p className="text-right font-medium">
                    {parseFloat(selectedStaking.stakedAmount).toFixed(6)} {selectedStaking.stakedAssetSymbol}
                  </p>
                  
                  {selectedStaking.isJoint && (
                    <>
                      <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Your Contribution:</p>
                      <p className="text-right font-medium">
                        {selectedStaking.isPartner 
                          ? parseFloat(selectedStaking.partnerContribution).toFixed(6) 
                          : parseFloat(selectedStaking.initiatorContribution).toFixed(6)} {selectedStaking.stakedAssetSymbol}
                        <span className="text-sm ml-1 opacity-70">
                          ({selectedStaking.isPartner 
                            ? selectedStaking.partnerPercentage 
                            : selectedStaking.initiatorPercentage}%)
                        </span>
                      </p>
                    </>
                  )}
                  
                  <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Duration:</p>
                  <p className="text-right font-medium">{selectedStaking.stakedDuration} months</p>
                  
                  <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Monthly Returns:</p>
                  <p className="text-right font-medium">
                    {parseFloat(selectedStaking.monthlyReturns).toFixed(6)} {selectedStaking.stakedAssetSymbol}
                  </p>
                  
                  <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Total Returns:</p>
                  <p className="text-right font-medium">
                    {parseFloat(selectedStaking.totalReturns).toFixed(6)} {selectedStaking.stakedAssetSymbol}
                  </p>
                  
                  <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Date Started:</p>
                  <p className="text-right font-medium">{formatDate(selectedStaking.dateStaked)}</p>
                  
                  {selectedStaking.partnerPaymentProof && (
                    <>
                      <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Payment Proof:</p>
                      <p className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => window.open(selectedStaking.partnerPaymentProof, "_blank")}
                          className="flex items-center"
                        >
                          View <ExternalLink className="ml-2 h-3 w-3" />
                        </Button>
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
