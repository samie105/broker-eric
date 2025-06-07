"use client";
import React, { useState, useEffect } from "react";
import { useTheme } from "../../../contexts/themeContext";
import { useUserData } from "../../../contexts/userrContext";
import { Card, CardContent } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Button } from "../../ui/button";
import Link from "next/link";
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

export default function DashboardInvestments() {
  const { isDarkMode } = useTheme();
  const { details } = useUserData();
  const [activeTab, setActiveTab] = useState("active");
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
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
    return investment.type === "joint" && investment.partnerEmail === details.email;
  };

  // Check if investment requires action from the user
  const requiresAction = (investment) => {
    return investment.status === "pending" && isPartner(investment);
  };

  // Filter investments based on active tab
  const getFilteredInvestments = () => {
    if (!details.investments || !Array.isArray(details.investments)) return [];
    
    switch (activeTab) {
      case "active":
        return details.investments.filter(inv => inv.status === "active");
      case "pending":
        return details.investments.filter(inv => inv.status === "pending");
      case "completed":
        return details.investments.filter(inv => inv.status === "completed");
      default:
        return details.investments;
    }
  };

  const filteredInvestments = getFilteredInvestments();
  
  // Limit the number of investments shown to keep dashboard clean
  const displayInvestments = filteredInvestments.slice(0, 5);
  
  // Check if we have more than we're showing
  const hasMoreInvestments = filteredInvestments.length > 5;

  return (
    <div>
      <Card className={`${isDarkMode ? "bg-[#111] border-[#333]" : ""}`}>
        <CardContent className="p-0">
          <Tabs 
            defaultValue="active" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList 
              className={`grid w-full grid-cols-3 ${
                isDarkMode 
                  ? "bg-[#222] text-white/80" 
                  : "bg-gray-100"
              }`}
            >
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
                Completed
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-0">
              <div className="overflow-x-auto">
                {displayInvestments.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className={`text-lg ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      No investments found
                    </p>
                    <Button 
                      className="mt-4" 
                      onClick={() => window.location.href = "/dashboard/investment"}
                    >
                      View Investment Plans
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader className={isDarkMode ? "bg-[#222]" : "bg-gray-50"}>
                      <TableRow>
                        <TableHead>Investment</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Return</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayInvestments.map((investment) => {
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
                                  Joint
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
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {investment.currency === "USD" ? "$" : ""}
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
                                    <DropdownMenuItem onClick={() => window.location.href = "/dashboard/investment?tab=requests"}>
                                      <span className="flex items-center">
                                        Respond to Request <ExternalLink className="ml-2 h-3 w-3" />
                                      </span>
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
                
                {hasMoreInvestments && (
                  <div className="py-3 text-center">
                    <Link href="/dashboard/investment" passHref>
                      <Button variant="outline" size="sm">
                        View All Investments
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
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
                          ? parseFloat(selectedInvestment.partnerAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          : parseFloat(selectedInvestment.initiatorAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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