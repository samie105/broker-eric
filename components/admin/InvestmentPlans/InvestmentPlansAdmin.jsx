"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "../../ui/dialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../ui/card";
import { Trash, Edit, Plus } from "lucide-react";

export default function InvestmentPlansAdmin() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    roi: "",
    minAmount: "",
    color: "#0052FF",
    duration: ""
  });
  
  // Fetch all investment plans
  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/admin/investment-plans");
      if (response.data.success) {
        setPlans(response.data.plans);
      }
    } catch (error) {
      console.error("Error fetching investment plans:", error);
      toast.error("Failed to fetch investment plans");
    } finally {
      setLoading(false);
    }
  };
  
  // Load plans on component mount
  useEffect(() => {
    fetchPlans();
  }, []);
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Open form for creating a new plan
  const handleOpenCreateForm = () => {
    setCurrentPlan(null);
    setFormData({
      title: "",
      description: "",
      roi: "",
      minAmount: "",
      color: "#0052FF",
      duration: ""
    });
    setFormOpen(true);
  };
  
  // Open form for editing an existing plan
  const handleOpenEditForm = (plan) => {
    setCurrentPlan(plan);
    setFormData({
      title: plan.title,
      description: plan.description,
      roi: plan.roi.toString(),
      minAmount: plan.minAmount.toString(),
      color: plan.color,
      duration: plan.duration
    });
    setFormOpen(true);
  };
  
  // Handle form submission (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (!formData.title || !formData.description || !formData.roi || !formData.minAmount || !formData.color || !formData.duration) {
        toast.error("Please fill in all required fields");
        return;
      }
      
      let response;
      
      if (currentPlan) {
        // Update existing plan
        response = await axios.put(`/api/admin/investment-plans/${currentPlan._id}`, formData);
        if (response.data.success) {
          toast.success("Investment plan updated successfully");
          setPlans(plans.map(plan => 
            plan._id === currentPlan._id ? response.data.plan : plan
          ));
        }
      } else {
        // Create new plan
        response = await axios.post("/api/admin/investment-plans", formData);
        if (response.data.success) {
          toast.success("Investment plan created successfully");
          setPlans([response.data.plan, ...plans]);
        }
      }
      
      setFormOpen(false);
    } catch (error) {
      console.error("Error saving investment plan:", error);
      toast.error(error.response?.data?.message || "Failed to save investment plan");
    }
  };
  
  // Handle plan deletion
  const handleDelete = async (planId) => {
    if (!confirm("Are you sure you want to delete this investment plan?")) {
      return;
    }
    
    try {
      const response = await axios.delete(`/api/admin/investment-plans/${planId}`);
      if (response.data.success) {
        toast.success("Investment plan deleted successfully");
        setPlans(plans.filter(plan => plan._id !== planId));
      }
    } catch (error) {
      console.error("Error deleting investment plan:", error);
      toast.error("Failed to delete investment plan");
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Investment Plans Management</h1>
        <Button onClick={handleOpenCreateForm} className="flex items-center">
          <Plus className="mr-2 h-4 w-4" /> Add New Plan
        </Button>
      </div>
      
      {loading ? (
        <div className="text-center py-8">Loading investment plans...</div>
      ) : plans.length === 0 ? (
        <div className="text-center py-8">
          <p className="mb-4">No investment plans found</p>
          <Button onClick={handleOpenCreateForm}>Create your first investment plan</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan._id} className="hover:shadow-md transition-all">
              <CardHeader>
                <CardTitle 
                  className="text-xl font-bold"
                  style={{ color: plan.color }}
                >
                  {plan.title}
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div 
                    className="text-4xl font-bold mb-2"
                    style={{ color: plan.color }}
                  >
                    {plan.roi}%
                  </div>
                  <p className="text-sm text-gray-500">Expected ROI</p>
                </div>
                <div className="p-3 rounded-md bg-gray-50 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Min. Investment</span>
                    <span className="font-bold">${plan.minAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-500">Duration</span>
                    <span className="font-bold">{plan.duration}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleOpenEditForm(plan)}
                  className="flex items-center"
                >
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDelete(plan._id)}
                  className="flex items-center"
                >
                  <Trash className="mr-2 h-4 w-4" /> Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {currentPlan ? "Edit Investment Plan" : "Create Investment Plan"}
            </DialogTitle>
            <DialogDescription>
              {currentPlan 
                ? "Update the details of this investment plan." 
                : "Fill in the details to create a new investment plan."}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input 
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. 3 Months"
                    required
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea 
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Short description of the plan"
                    required
                  />
                </div>
                
                <div className="col-span-1">
                  <Label htmlFor="roi">ROI (%) *</Label>
                  <Input 
                    id="roi"
                    name="roi"
                    type="number"
                    min="0"
                    value={formData.roi}
                    onChange={handleChange}
                    placeholder="15"
                    required
                  />
                </div>
                
                <div className="col-span-1">
                  <Label htmlFor="minAmount">Min Amount ($) *</Label>
                  <Input 
                    id="minAmount"
                    name="minAmount"
                    type="number"
                    min="0"
                    value={formData.minAmount}
                    onChange={handleChange}
                    placeholder="1000"
                    required
                  />
                </div>
                
                <div className="col-span-1">
                  <Label htmlFor="duration">Duration *</Label>
                  <Input 
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="e.g. 3 Months"
                    required
                  />
                </div>
                
                <div className="col-span-1">
                  <Label htmlFor="color">Color *</Label>
                  <div className="flex items-center space-x-2">
                    <Input 
                      id="color"
                      name="color"
                      type="color"
                      value={formData.color}
                      onChange={handleChange}
                      className="w-12 h-10 p-0"
                      required
                    />
                    <Input 
                      value={formData.color}
                      onChange={handleChange}
                      name="color"
                      className="flex-1"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setFormOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {currentPlan ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 