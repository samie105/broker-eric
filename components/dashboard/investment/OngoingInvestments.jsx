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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { MoreHorizontal, ExternalLink, AlertCircle } from "lucide-react";
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
    if (activeTab === "completed") return investment.status === "completed";
    return true;
  }) || [];

  // Format date for display
  const formatDate = (dateString) => {
    try {
      if (!dateString) return "Not specified";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  // Format relative time
  const getTimeRemaining = (endDateString) => {
    try {
      if (!endDateString) return "Unknown";
      const endDate = new Date(endDateString);
      if (isNaN(endDate.getTime())) {
        return "Unknown";
      }
      return formatDistanceToNow(endDate, { addSuffix: true });
    } catch (error) {
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

  // Get status badge color and class
  const getStatusDisplay = (status) => {
    if (!status) return { text: "Unknown", class: "bg-gray-500" };
    
    status = status.toLowerCase();
    
    switch (status) {
      case "active":
        return { 
          text: "Active", 
          class: isDarkMode ? "bg-green-900/40 text-green-300" : "bg-green-100 text-green-800" 
        };
      case "pending":
        return { 
          text: "Pending", 
          class: isDarkMode ? "bg-yellow-900/40 text-yellow-300" : "bg-yellow-100 text-yellow-800" 
        };
      case "completed":
        return { 
          text: "Completed", 
          class: isDarkMode ? "bg-blue-900/40 text-blue-300" : "bg-blue-100 text-blue-800" 
        };
      case "rejected":
        return { 
          text: "Rejected", 
          class: isDarkMode ? "bg-red-900/40 text-red-300" : "bg-red-100 text-red-800" 
        };
      default:
        return { 
          text: status.charAt(0).toUpperCase() + status.slice(1), 
          class: isDarkMode ? "bg-gray-900/40 text-gray-300" : "bg-gray-100 text-gray-800" 
        };
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

  // Get count of different investment types
  const getCounts = () => {
    if (!details.investments) return { all: 0, sole: 0, joint: 0, pending: 0, active: 0, completed: 0 };
    
    return {
      all: details.investments.length,
      sole: details.investments.filter(inv => inv.type === "sole").length,
      joint: details.investments.filter(inv => inv.type === "joint").length,
      pending: details.investments.filter(inv => inv.status === "pending").length,
      active: details.investments.filter(inv => inv.status === "active").length,
      completed: details.investments.filter(inv => inv.status === "completed").length
    };
  };
  
  const counts = getCounts();

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
            className={`grid w-full grid-cols-6 mb-6 ${
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
              All ({counts.all})
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
              Sole ({counts.sole})
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
              Joint ({counts.joint})
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
              Pending ({counts.pending})
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
              Active ({counts.active})
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
              Completed ({counts.completed})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-0">
            <Card className={`${isDarkMode ? "bg-[#111] border-[#333]" : ""}`}>
              <CardContent className="p-0">
                {filteredInvestments.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className={`text-lg ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      No investments found in this category
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className={isDarkMode ? "bg-[#222]" : "bg-gray-50"}>
                        <TableRow>
                          <TableHead>Investment</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Return</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInvestments.map((investment) => {
                          const status = getStatusDisplay(investment.status);
                          const needsAction = requiresAction(investment);
                          
                          return (
                            <TableRow key={investment.id} className={isDarkMode ? "border-[#333] hover:bg-[#1a1a1a]" : "hover:bg-gray-50"}>
                              <TableCell>
                                <div className="font-medium">
                                  {investment.planName || "Custom Investment"}
                                </div>
                                {needsAction && (
                                  <div className="flex items-center text-xs text-amber-500 mt-1">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Action required
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                {investment.type === "joint" ? (
                                  <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800/50">
                                    Joint {isPartner(investment) ? "(Partner)" : "(Initiator)"}
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50">
                                    Sole
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">
                                  {investment.currency === "USD" ? "$" : ""}
                                  {typeof investment.amount === 'number' && !isNaN(investment.amount) 
                                    ? parseFloat(investment.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                    : "0.00"}
                                </div>
                                {investment.type === "joint" && (
                                  <div className="text-xs text-muted-foreground">
                                    Your share: 
                                    {isPartner(investment) 
                                      ? (typeof investment.partnerAmount === 'number' && !isNaN(investment.partnerAmount)
                                          ? parseFloat(investment.partnerAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                          : "0.00") 
                                      : (typeof investment.initiatorAmount === 'number' && !isNaN(investment.initiatorAmount)
                                          ? parseFloat(investment.initiatorAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                          : "0.00")}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                {investment.duration} {investment.duration === 1 ? "month" : "months"}
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {investment.currency === "USD" ? "$" : ""}
                                  {typeof investment.monthlyReturn === 'number' && !isNaN(investment.monthlyReturn)
                                    ? parseFloat(investment.monthlyReturn).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                    : "0.00"} / month
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Total: {investment.currency === "USD" ? "$" : ""}
                                  {typeof investment.totalReturn === 'number' && !isNaN(investment.totalReturn)
                                    ? parseFloat(investment.totalReturn).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                    : "0.00"}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={status.class}>
                                  {status.text}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">{formatDate(investment.dateCreated)}</div>
                                {investment.endDate && (
                                  <div className="text-xs text-muted-foreground">
                                    Ends: {formatDate(investment.endDate)}
                                  </div>
                                )}
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
                                    <DropdownMenuItem onClick={() => handleViewInvestment(investment)}>
                                      View Details
                                    </DropdownMenuItem>
                                    {needsAction && (
                                      <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem 
                                          onClick={() => handleInvestmentResponse(investment.id, "accept")}
                                          disabled={isLoading}
                                          className="text-green-600 dark:text-green-400"
                                        >
                                          Accept Investment
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={() => handleInvestmentResponse(investment.id, "decline")}
                                          disabled={isLoading}
                                          className="text-red-600 dark:text-red-400"
                                        >
                                          Decline Investment
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Investment Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className={`sm:max-w-md ${isDarkMode ? "bg-[#111] text-white border-[#333]" : ""}`}>
          <DialogHeader>
            <DialogTitle>Investment Details</DialogTitle>
            <DialogDescription className={isDarkMode ? "text-gray-400" : ""}>
              {selectedInvestment?.type === "joint"
                ? `Joint investment with ${isPartner(selectedInvestment) ? selectedInvestment.initiatorName : selectedInvestment.partnerName}`
                : "Solo investment"}
            </DialogDescription>
          </DialogHeader>
          
          {selectedInvestment && (
            <div className="py-4">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-y-2">
                  <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Investment Plan:</p>
                  <p className="text-right font-medium">
                    {selectedInvestment.planName || "Custom Investment"}
                  </p>
                  
                  <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Status:</p>
                  <p className="text-right">
                    <Badge className={getStatusDisplay(selectedInvestment.status).class}>
                      {getStatusDisplay(selectedInvestment.status).text}
                    </Badge>
                  </p>
                  
                  {selectedInvestment.type === "joint" && (
                    <>
                      <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {isPartner(selectedInvestment) ? "Initiator" : "Partner"}:
                      </p>
                      <p className="text-right font-medium">
                        {isPartner(selectedInvestment) ? selectedInvestment.initiatorName : selectedInvestment.partnerName}
                      </p>
                    </>
                  )}
                  
                  <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Total Amount:</p>
                  <p className="text-right font-medium">
                    {selectedInvestment.currency === "USD" ? "$" : ""}
                    {typeof selectedInvestment.amount === 'number' && !isNaN(selectedInvestment.amount)
                      ? parseFloat(selectedInvestment.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      : "0.00"}
                  </p>
                  
                  {selectedInvestment.type === "joint" && (
                    <>
                      <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Your Contribution:</p>
                      <p className="text-right font-medium">
                        {selectedInvestment.currency === "USD" ? "$" : ""}
                        {isPartner(selectedInvestment) 
                          ? (typeof selectedInvestment.partnerAmount === 'number' && !isNaN(selectedInvestment.partnerAmount)
                              ? parseFloat(selectedInvestment.partnerAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                              : "0.00")
                          : (typeof selectedInvestment.initiatorAmount === 'number' && !isNaN(selectedInvestment.initiatorAmount)
                              ? parseFloat(selectedInvestment.initiatorAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                              : "0.00")}
                        <span className="text-sm ml-1 opacity-70">
                          ({isPartner(selectedInvestment) 
                            ? selectedInvestment.partnerPercentage 
                            : selectedInvestment.initiatorPercentage}%)
                        </span>
                      </p>
                    </>
                  )}
                  
                  <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Duration:</p>
                  <p className="text-right font-medium">
                    {selectedInvestment.duration} {selectedInvestment.duration === 1 ? "month" : "months"}
                  </p>
                  
                  <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Monthly Returns:</p>
                  <p className="text-right font-medium">
                    {selectedInvestment.currency === "USD" ? "$" : ""}
                    {typeof selectedInvestment.monthlyReturn === 'number' && !isNaN(selectedInvestment.monthlyReturn)
                      ? parseFloat(selectedInvestment.monthlyReturn).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      : "0.00"}
                  </p>
                  
                  <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Total Returns:</p>
                  <p className="text-right font-medium">
                    {selectedInvestment.currency === "USD" ? "$" : ""}
                    {typeof selectedInvestment.totalReturn === 'number' && !isNaN(selectedInvestment.totalReturn)
                      ? parseFloat(selectedInvestment.totalReturn).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      : "0.00"}
                  </p>
                  
                  <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Start Date:</p>
                  <p className="text-right font-medium">{formatDate(selectedInvestment.dateCreated)}</p>
                  
                  {selectedInvestment.endDate && (
                    <>
                      <p className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>End Date:</p>
                      <p className="text-right font-medium">{formatDate(selectedInvestment.endDate)}</p>
                    </>
                  )}
                </div>
                
                {requiresAction(selectedInvestment) && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-medium mb-2">Action Required</h4>
                    <p className="text-sm mb-4">
                      You have been invited to join this investment. Do you want to accept or decline?
                    </p>
                    <div className="flex gap-x-2 justify-end">
                      <Button 
                        variant="outline" 
                        onClick={() => handleInvestmentResponse(selectedInvestment.id, "decline")}
                        disabled={isLoading}
                        className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
                      >
                        Decline
                      </Button>
                      <Button 
                        onClick={() => handleInvestmentResponse(selectedInvestment.id, "accept")}
                        disabled={isLoading}
                        className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                )}
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