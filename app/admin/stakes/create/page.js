"use client";
import { useState, useEffect } from "react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";
import { useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";
import { InfinitySpin } from "react-loader-spinner";
import Link from "next/link";
import Image from "next/image";

// Add preset durations array
const PRESET_DURATIONS = [
  { months: 1, label: "1 Month" },
  { months: 3, label: "3 Months" },
  { months: 6, label: "6 Months" },
  { months: 12, label: "1 Year" },
  { months: 24, label: "2 Years" }
];

export default function CreateStakePage() {
  const router = useRouter();
  const pathname = usePathname();
  const [availableCoins, setAvailableCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [stakeData, setStakeData] = useState({
    coinName: "",
    coinSymbol: "",
    description: "",
    percentageRage: "",
    cryptoMinimum: 0.001,
    durations: [
      { months: 1, percentage: 5 }
    ]
  });

  useEffect(() => {
    // Fetch available coins based on images in public directory
    const fetchAvailableCoins = async () => {
      try {
        const response = await fetch("/api/admin/available-coins");
        if (response.ok) {
          const data = await response.json();
          setAvailableCoins(data.coins);
        } else {
          toast.error("Failed to load available coins");
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching available coins:", error);
        toast.error("Failed to load available coins");
        setLoading(false);
      }
    };
    
    fetchAvailableCoins();
  }, []);

  const handleSelectCoin = (coin) => {
    setStakeData({
      ...stakeData,
      coinName: coin.name,
      coinSymbol: coin.symbol
    });
  };

  const handleInputChange = (field, value) => {
    setStakeData({
      ...stakeData,
      [field]: value
    });
  };

  const handleDurationChange = (index, field, value) => {
    const updatedDurations = [...stakeData.durations];
    updatedDurations[index][field] = field === "months" ? parseInt(value) : parseFloat(value);
    setStakeData({
      ...stakeData,
      durations: updatedDurations
    });
  };

  const addDuration = () => {
    setStakeData({
      ...stakeData,
      durations: [...stakeData.durations, { months: 1, percentage: 5 }]
    });
  };

  const removeDuration = (index) => {
    if (stakeData.durations.length <= 1) {
      toast.error("At least one duration is required");
      return;
    }
    
    const updatedDurations = stakeData.durations.filter((_, i) => i !== index);
    setStakeData({
      ...stakeData,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!stakeData.coinName || !stakeData.coinSymbol || stakeData.durations.length === 0) {
      toast.error("Please fill all required fields");
      return;
    }
    
    // Calculate percentage range
    const percentageRage = calculatePercentageRange(stakeData.durations);
    
    setSubmitting(true);
    
    try {
      const response = await fetch("/api/admin/stakes/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...stakeData,
          percentageRage
        })
      });
      
      if (response.ok) {
        toast.success("Staking option created successfully");
        router.push("/admin");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to create staking option");
      }
    } catch (error) {
      console.error("Error creating staking option:", error);
      toast.error("Failed to create staking option");
    } finally {
      setSubmitting(false);
    }
  };

  // Filter coins based on search query
  const filteredCoins = availableCoins.filter(coin => 
    coin.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
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
    <div className="container mx-auto px-4 py-8 text-black bg-white">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Create New Staking Option</h1>
        <Link href="/admin/staking-options">
          <Button variant="outline" className="border-gray-300 hover:bg-gray-100">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className="w-5 h-5 sm:mr-2 md:hidden"
            >
              <path fillRule="evenodd" d="M7.28 7.72a.75.75 0 010 1.06l-2.47 2.47H21a.75.75 0 010 1.5H4.81l2.47 2.47a.75.75 0 11-1.06 1.06l-3.75-3.75a.75.75 0 010-1.06l3.75-3.75a.75.75 0 011.06 0z" clipRule="evenodd" />
            </svg>
            <span className="hidden md:inline">Back to Stakings</span>
          </Button>
        </Link>
      </div>

      <div className="rounded-lg p-6 bg-white border border-gray-200 shadow-sm">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <Label className="text-lg font-medium mb-2 block">Select Cryptocurrency</Label>
              <div className="mb-4">
                <Input
                  type="text"
                  placeholder="Search coins by name or symbol..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border-gray-300 mb-4"
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-2">
                {filteredCoins.map((coin) => (
                  <div 
                    key={coin.symbol}
                    className={`p-4 rounded-lg cursor-pointer flex flex-col items-center justify-center ${
                      stakeData.coinSymbol === coin.symbol 
                        ? "bg-blue-50 border-2 border-blue-500"
                        : "bg-gray-50 border border-gray-200 hover:border-blue-500/50"
                    }`}
                    onClick={() => handleSelectCoin(coin)}
                  >
                    <Image
                      src={`/assets/markets/crypto/${coin.symbol}.svg`} 
                      alt={coin.name} 
                      width={64}
                      height={64}
                      className="mb-2 w-12 h-12"
                    />
                    <span className="font-medium text-center">{coin.name}</span>
                    <span className="text-sm text-gray-500">{coin.symbol}</span>
                  </div>
                ))}
              </div>
              {filteredCoins.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No cryptocurrencies found matching your search.
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="coinName">Coin Name</Label>
                <Input
                  id="coinName"
                  value={stakeData.coinName}
                  onChange={(e) => handleInputChange("coinName", e.target.value)}
                  placeholder="Bitcoin"
                  required
                  className="border-gray-300"
                />
              </div>
              
              <div>
                <Label htmlFor="coinSymbol">Coin Symbol</Label>
                <Input
                  id="coinSymbol"
                  value={stakeData.coinSymbol}
                  onChange={(e) => handleInputChange("coinSymbol", e.target.value)}
                  placeholder="BTC"
                  required
                  className="border-gray-300"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={stakeData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Stake your Bitcoin and earn rewards."
                className="border-gray-300"
              />
            </div>

            <div>
              <Label htmlFor="cryptoMinimum">Minimum Investment ({stakeData.coinSymbol || "Crypto"})</Label>
              <Input
                id="cryptoMinimum"
                type="number"
                value={stakeData.cryptoMinimum}
                onChange={(e) => handleInputChange("cryptoMinimum", Number(e.target.value))}
                min="0.00000001"
                step="0.00000001"
                className="border-gray-300"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label className="text-lg font-medium">Staking Durations</Label>
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
                        const exists = stakeData.durations.some(d => d.months === preset.months);
                        if (!exists) {
                          setStakeData({
                            ...stakeData,
                            durations: [...stakeData.durations, { months: preset.months, percentage: 5 }]
                          });
                        } else {
                          toast.info(`${preset.label} duration already exists`);
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
                    {calculatePercentageRange(stakeData.durations) || "No durations added"}
                  </p>
                </div>
              </div>
              
              {stakeData.durations.map((duration, index) => (
                <div key={index} className="flex flex-col lg:flex-row lg:items-end gap-4 mb-4 p-4 rounded-md border border-dashed bg-gray-50 bg-opacity-50">
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
                      />
                      <span className="ml-2 text-sm text-gray-500">{duration.percentage}% return</span>
                    </div>
                  </div>
                  
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeDuration(index)}
                    className="lg:mb-0 mt-2 lg:mt-0"
                  >
                    Remove
                  </Button>
                </div>
              ))}
              {stakeData.durations.length === 0 && (
                <div className="text-center py-8 border border-dashed rounded-md">
                  <p className="text-gray-400">No durations added yet. Add at least one duration for this staking option.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8">
            <Button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 w-full"
              disabled={submitting || stakeData.durations.length === 0}
            >
              {submitting ? (
                <div className="flex items-center justify-center">
                  <InfinitySpin width="100" color="#ffffff" />
                </div>
              ) : (
                "Create Staking Option"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 