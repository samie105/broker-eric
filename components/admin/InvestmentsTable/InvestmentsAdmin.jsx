"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useTheme } from "../../../contexts/themeContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Badge } from "../../ui/badge";
import { InfinitySpin } from "react-loader-spinner";

export default function InvestmentsAdmin() {
  const { isDarkMode } = useTheme();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch all investments
  const fetchInvestments = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/db/getUser/api");
      
      if (response.data.users) {
        // Collect all investments from all users
        const allInvestments = [];
        
        response.data.users.forEach(user => {
          if (user.investments && user.investments.length > 0) {
            const userInvestments = user.investments.map(investment => ({
              ...investment,
              userEmail: user.email,
              userName: user.name,
            }));
            allInvestments.push(...userInvestments);
          }
        });
        
        setInvestments(allInvestments);
      }
    } catch (error) {
      console.error("Error fetching investments:", error);
      toast.error("Failed to fetch investments");
    } finally {
      setLoading(false);
    }
  };

  // Load investments on component mount
  useEffect(() => {
    fetchInvestments();
  }, []);

  // Filter investments based on active tab
  const filteredInvestments = investments.filter(investment => {
    if (activeTab === "all") return true;
    if (activeTab === "sole") return investment.type === "sole";
    if (activeTab === "joint") return investment.type === "joint";
    if (activeTab === "pending") return investment.status === "pending";
    if (activeTab === "active") return investment.status === "active";
    if (activeTab === "completed") return investment.status === "completed";
    return true;
  });

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid date";
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
      case "terminated":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Handle investment action (terminate, terminate with profit)
  const handleInvestmentAction = async (action) => {
    if (!selectedInvestment) return;
    
    const confirmMessage = action === "terminate" 
      ? "Are you sure you want to terminate this investment without paying profits?" 
      : "Are you sure you want to terminate this investment and pay profits to the investor?";
    
    if (!confirm(confirmMessage)) return;
    
    setActionLoading(true);
    
    try {
      const payload = {
        investmentId: selectedInvestment.id,
        userEmail: selectedInvestment.userEmail,
        action,
      };
      
      const response = await axios.post("/api/admin/investments/action", payload);
      
      if (response.data.success) {
        toast.success(response.data.message || "Investment action completed successfully");
        fetchInvestments();
        setDetailsOpen(false);
      } else {
        toast.error(response.data.message || "Failed to process action");
      }
    } catch (error) {
      console.error("Error processing investment action:", error);
      toast.error(error.response?.data?.message || "Failed to process action");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Investments Management</h1>
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full md:w-auto"
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="sole">Sole</TabsTrigger>
            <TabsTrigger value="joint">Joint</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <InfinitySpin width="100" color="#000" />
        </div>
      ) : filteredInvestments.length === 0 ? (
        <div className="text-center py-8">
          <p className="mb-4">No investments found for the selected filter.</p>
        </div>
      ) : (
        <div className="rounded-md border border-gray-200 bg-white overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow className="border-gray-200">
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>ROI</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvestments.map((investment) => (
                <TableRow 
                  key={investment.id} 
                  className="hover:bg-gray-50 border-gray-200"
                >
                  <TableCell className="font-medium">
                    {investment.id?.substring(0, 8) || "N/A"}
                  </TableCell>
                  <TableCell>{investment.userName || "N/A"}</TableCell>
                  <TableCell>{investment.userEmail || "N/A"}</TableCell>
                  <TableCell>
                    {investment.type === "joint" ? (
                      <span className="flex items-center">
                        Joint
                        <Badge variant="outline" className="ml-2">
                          {investment.partnerEmail?.substring(0, 10)}...
                        </Badge>
                      </span>
                    ) : (
                      "Sole"
                    )}
                  </TableCell>
                  <TableCell>
                    ${investment.totalAmount 
                      ? investment.totalAmount.toLocaleString() 
                      : (investment.amount ? investment.amount.toLocaleString() : '0')
                    }
                  </TableCell>
                  <TableCell>{investment.duration}</TableCell>
                  <TableCell>{investment.roi || 0}%</TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(investment.status)} text-white`}>
                      {investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(investment.startDate)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedInvestment(investment);
                        setDetailsOpen(true);
                      }}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Investment Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Investment Details</DialogTitle>
            <DialogDescription>
              View and manage investment details
            </DialogDescription>
          </DialogHeader>
          
          {selectedInvestment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">User</p>
                  <p className="font-medium">{selectedInvestment.userName || selectedInvestment.userEmail}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium capitalize">{selectedInvestment.type}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-medium">
                    ${selectedInvestment.totalAmount 
                      ? selectedInvestment.totalAmount.toLocaleString() 
                      : (selectedInvestment.amount ? selectedInvestment.amount.toLocaleString() : '0')
                    }
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-medium">{selectedInvestment.duration}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge className={`${getStatusColor(selectedInvestment.status)} text-white`}>
                    {selectedInvestment.status.charAt(0).toUpperCase() + selectedInvestment.status.slice(1)}
                  </Badge>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">ROI</p>
                  <p className="font-medium">{selectedInvestment.roi || 0}%</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="font-medium">{formatDate(selectedInvestment.startDate)}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">End Date</p>
                  <p className="font-medium">{formatDate(selectedInvestment.endDate)}</p>
                </div>
                
                {selectedInvestment.type === "joint" && (
                  <>
                    <div className="col-span-2 h-px bg-gray-200 my-2"></div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Initiator</p>
                      <p className="font-medium">{selectedInvestment.initiatorEmail}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Initiator Amount</p>
                      <p className="font-medium">
                        ${selectedInvestment.initiatorAmount?.toLocaleString() || '0'} 
                        ({selectedInvestment.initiatorPercentage || 0}%)
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Partner</p>
                      <p className="font-medium">{selectedInvestment.partnerEmail}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Partner Amount</p>
                      <p className="font-medium">
                        ${selectedInvestment.partnerAmount?.toLocaleString() || '0'} 
                        ({selectedInvestment.partnerPercentage || 0}%)
                      </p>
                    </div>
                  </>
                )}
                
                <div className="col-span-2 h-px bg-gray-200 my-2"></div>
                
                <div className="space-y-1 col-span-2">
                  <p className="text-sm text-gray-500">Expected Return</p>
                  <p className="font-medium text-green-500">
                    ${selectedInvestment.expectedReturn?.toLocaleString() || 
                      ((selectedInvestment.amount || 0) * (1 + (selectedInvestment.roi || 0) / 100)).toLocaleString()}
                  </p>
                </div>
              </div>
              
              {selectedInvestment.status === "active" && (
                <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 pt-4">
                  <Button 
                    variant="destructive" 
                    className="flex-1"
                    onClick={() => handleInvestmentAction("terminate")}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <InfinitySpin width="100" color="#ffffff" />
                    ) : (
                      "Terminate Investment"
                    )}
                  </Button>
                  
                  <Button 
                    variant="default" 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleInvestmentAction("terminate_with_profit")}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <InfinitySpin width="100" color="#ffffff" />
                    ) : (
                      "Terminate & Pay Profits"
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDetailsOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 