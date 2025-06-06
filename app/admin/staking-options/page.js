"use client";

import React, { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { InfinitySpin } from "react-loader-spinner";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { useRouter } from "next/navigation";

// Preset durations array
const PRESET_DURATIONS = [
  { months: 1, label: "1 Month" },
  { months: 3, label: "3 Months" },
  { months: 6, label: "6 Months" },
  { months: 12, label: "1 Year" },
  { months: 24, label: "2 Years" }
];

export default function StakingOptionsPage() {
  const [stakingOptions, setStakingOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Form state for editing
  const [editForm, setEditForm] = useState({
    id: "",
    coinName: "",
    coinSymbol: "",
    description: "",
    cryptoMinimum: 0.001,
    durations: []
  });

  useEffect(() => {
    fetchStakingOptions();
  }, []);

  const fetchStakingOptions = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/staking-options");
      if (response.ok) {
        const data = await response.json();
        setStakingOptions(data.options || []);
      } else {
        toast.error("Failed to load staking options");
      }
    } catch (error) {
      console.error("Error fetching staking options:", error);
      toast.error("Failed to load staking options");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (option) => {
    setSelectedOption(option);
    setEditForm({
      id: option.id,
      coinName: option.coinName,
      coinSymbol: option.coinSymbol,
      description: option.description || "",
      cryptoMinimum: option.cryptoMinimum || 0.001,
      durations: [...option.durations]
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (option) => {
    setSelectedOption(option);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/staking-options/delete?id=${selectedOption.id}`, {
        method: "DELETE"
      });
      
      if (response.ok) {
        toast.success("Staking option deleted successfully");
        setIsDeleteDialogOpen(false);
        fetchStakingOptions();
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to delete staking option");
      }
    } catch (error) {
      console.error("Error deleting staking option:", error);
      toast.error("Failed to delete staking option");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditInputChange = (field, value) => {
    setEditForm({
      ...editForm,
      [field]: value
    });
  };

  const handleDurationChange = (index, field, value) => {
    const updatedDurations = [...editForm.durations];
    updatedDurations[index][field] = field === "months" ? parseInt(value) : parseFloat(value);
    setEditForm({
      ...editForm,
      durations: updatedDurations
    });
  };

  const addDuration = () => {
    setEditForm({
      ...editForm,
      durations: [...editForm.durations, { months: 1, percentage: 5 }]
    });
  };

  const removeDuration = (index) => {
    if (editForm.durations.length <= 1) {
      toast.error("At least one duration is required");
      return;
    }
    
    const updatedDurations = editForm.durations.filter((_, i) => i !== index);
    setEditForm({
      ...editForm,
      durations: updatedDurations
    });
  };

  // Add this function to calculate the percentage range
  const calculatePercentageRange = (durations) => {
    if (durations.length === 0) return "";
    if (durations.length === 1) return `${durations[0].percentage}%`;
    
    const percentages = durations.map(d => d.percentage);
    const min = Math.min(...percentages);
    const max = Math.max(...percentages);
    
    return min === max ? `${min}%` : `${min}% - ${max}%`;
  };

  // Update handleSubmitEdit to auto-calculate percentage range
  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Calculate percentage range
      const percentageRage = calculatePercentageRange(editForm.durations);
      
      const response = await fetch("/api/admin/staking-options/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...editForm,
          percentageRage
        })
      });
      
      if (response.ok) {
        toast.success("Staking option updated successfully");
        setIsEditDialogOpen(false);
        fetchStakingOptions();
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to update staking option");
      }
    } catch (error) {
      console.error("Error updating staking option:", error);
      toast.error("Failed to update staking option");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter staking options based on search query
  const filteredOptions = stakingOptions.filter(option => 
    option.coinName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    option.coinSymbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[400px] w-full flex items-center justify-center">
        <InfinitySpin
          visible={true}
          width="200"
          color="#0052FF"
          ariaLabel="infinity-spin-loading"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-16 text-black bg-white">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Staking Options</h1>
        <div className="flex space-x-2">
          <Link href="/admin">
            <Button variant="outline" className="border-gray-300 hover:bg-gray-100">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="w-5 h-5 sm:mr-2 md:hidden"
              >
                <path fillRule="evenodd" d="M7.28 7.72a.75.75 0 010 1.06l-2.47 2.47H21a.75.75 0 010 1.5H4.81l2.47 2.47a.75.75 0 11-1.06 1.06l-3.75-3.75a.75.75 0 010-1.06l3.75-3.75a.75.75 0 011.06 0z" clipRule="evenodd" />
              </svg>
              <span className="hidden md:inline">Back to Admin</span>
            </Button>
          </Link>
          <Link href="/admin/stakes/create">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="w-5 h-5 sm:mr-2 md:hidden"
              >
                <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
              </svg>
              <span className="hidden md:inline">Create New Option</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search by coin name or symbol..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full border-gray-300"
        />
      </div>

      {stakingOptions.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500 mb-4">No staking options have been created yet.</p>
          <Link href="/admin/stakes/create">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="w-5 h-5 sm:mr-2 md:hidden"
              >
                <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
              </svg>
              <span className="hidden md:inline">Create Your First Staking Option</span>
              <span className="md:hidden">Create First Option</span>
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOptions.map((option) => (
            <div 
              key={option.id} 
              className="rounded-lg border border-gray-200 shadow-sm overflow-hidden bg-white"
            >
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="w-12 h-12 flex-shrink-0">
                    <Image 
                      src={option.imagePath}
                      alt={option.coinName}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-bold text-lg">{option.coinName}</h3>
                    <p className="text-gray-500">{option.coinSymbol}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-xs text-gray-500">Min. Investment</p>
                    <p className="font-semibold">{option.cryptoMinimum} {option.coinSymbol}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-xs text-gray-500">ROI Range</p>
                    <p className="font-semibold">
                      {option.percentageRage && option.percentageRage.includes('-') 
                        ? option.percentageRage 
                        : `${option.percentageRage || '0%'}`}
                    </p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">{option.description}</p>
                
                <div className="border-t border-gray-100 pt-3">
                  <p className="text-sm font-medium mb-2">Durations:</p>
                  <div className="space-y-1">
                    {option.durations.map((duration, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        {duration.months} month{duration.months > 1 ? 's' : ''} - {duration.percentage}% return
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between">
                <Button 
                  variant="outline" 
                  className="border-gray-300 hover:bg-gray-100"
                  onClick={() => handleEdit(option)}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="currentColor" 
                    className="w-4 h-4 sm:mr-2 md:hidden"
                  >
                    <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" />
                  </svg>
                  <span className="hidden md:inline">Edit</span>
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => handleDelete(option)}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="currentColor" 
                    className="w-4 h-4 sm:mr-2 md:hidden"
                  >
                    <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clipRule="evenodd" />
                  </svg>
                  <span className="hidden md:inline">Delete</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white text-black max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Edit Staking Option</DialogTitle>
            <DialogDescription>
              Update the details for this staking option.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmitEdit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="coinName">Coin Name</Label>
                  <Input
                    id="coinName"
                    value={editForm.coinName}
                    onChange={(e) => handleEditInputChange("coinName", e.target.value)}
                    className="border-gray-300"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="coinSymbol">Coin Symbol</Label>
                  <Input
                    id="coinSymbol"
                    value={editForm.coinSymbol}
                    onChange={(e) => handleEditInputChange("coinSymbol", e.target.value)}
                    className="border-gray-300"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editForm.description}
                  onChange={(e) => handleEditInputChange("description", e.target.value)}
                  className="border-gray-300"
                />
              </div>
              
              <div>
                <Label htmlFor="cryptoMinimum">Minimum Investment ({editForm.coinSymbol})</Label>
                <Input
                  id="cryptoMinimum"
                  type="number"
                  value={editForm.cryptoMinimum}
                  onChange={(e) => handleEditInputChange("cryptoMinimum", Number(e.target.value))}
                  min="0.00000001"
                  step="0.00000001"
                  className="border-gray-300"
                  required
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="font-medium">Staking Durations</Label>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={addDuration}
                    className="border-gray-300"
                  >
                    Add Duration
                  </Button>
                </div>
                
                <div className="mb-4">
                  <Label className="mb-2 block text-sm font-medium text-gray-600">Quick Add Duration:</Label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_DURATIONS.map((preset) => (
                      <Button
                        key={preset.months}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-blue-200 bg-blue-50 hover:bg-blue-100"
                        onClick={() => {
                          // Check if this duration already exists
                          const exists = editForm.durations.some(d => d.months === preset.months);
                          if (!exists) {
                            setEditForm({
                              ...editForm,
                              durations: [...editForm.durations, { months: preset.months, percentage: 5 }]
                            });
                          } else {
                            toast.success(`${preset.label} duration already exists`);
                          }
                        }}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-md mb-4">
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-blue-600">
                        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-sm text-blue-700">
                      <span className="font-medium">ROI Range: </span>
                      {calculatePercentageRange(editForm.durations) || "No durations added"}
                    </p>
                  </div>
                </div>
                
                {editForm.durations.map((duration, index) => (
                  <div key={index} className="flex flex-col md:flex-row md:items-end gap-4 mb-4 p-4 rounded-md border border-dashed bg-gray-50 bg-opacity-50">
                    <div className="flex-1">
                      <Label htmlFor={`months-${index}`} className="flex items-center">
                        <span>Duration (Months)</span>
                      </Label>
                      <div className="flex items-center">
                        <Input
                          id={`months-${index}`}
                          type="number"
                          value={duration.months}
                          onChange={(e) => handleDurationChange(index, "months", e.target.value)}
                          min="1"
                          max="60"
                          className="border-gray-300"
                          required
                        />
                        <span className="ml-2 text-sm text-gray-500">
                          {duration.months === 1 ? '1 month' : 
                           duration.months === 12 ? '1 year' : 
                           duration.months === 24 ? '2 years' : 
                           duration.months === 36 ? '3 years' : 
                           `${duration.months} months`}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <Label htmlFor={`percentage-${index}`} className="flex items-center">
                        <span>ROI Percentage (%)</span>
                      </Label>
                      <div className="flex items-center">
                        <Input
                          id={`percentage-${index}`}
                          type="number"
                          value={duration.percentage}
                          onChange={(e) => handleDurationChange(index, "percentage", e.target.value)}
                          min="0.1"
                          step="0.1"
                          className="border-gray-300"
                          required
                        />
                        <span className="ml-2 text-sm text-gray-500">{duration.percentage}% return</span>
                      </div>
                    </div>
                    
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeDuration(index)}
                      className="md:mb-0 mt-2 md:mt-0"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                {editForm.durations.length === 0 && (
                  <div className="text-center py-8 border border-dashed rounded-md">
                    <p className="text-gray-400">No durations added yet. Add at least one duration for this staking option.</p>
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
                className="border-gray-300"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting || editForm.durations.length === 0}
              >
                {isSubmitting ? "Updating..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white text-black">
          <DialogHeader>
            <DialogTitle>Delete Staking Option</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the {selectedOption?.coinName} staking option? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="mt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-gray-300"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 