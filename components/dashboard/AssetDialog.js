import Image from "next/image";
import React, { useEffect, useState, useCallback } from "react";
import { useTheme } from "../../contexts/themeContext";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useUserData } from "../../contexts/userrContext";
import Link from "next/link";
import axios from "axios";
import { InfinitySpin } from "react-loader-spinner";
import toast from "react-hot-toast";
import { DialogContent } from "../ui/dialog";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import QRCode from "qrcode.react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { Loader2 } from "lucide-react";
import { Slider } from "../ui/slider";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";

export default function AssetDialog({
  stake,
  image,
  symbol,
  name,
  price,
  duration,
}) {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const { details, setDetails, setNotification, address, cryptoPrices } = useUserData();
  const [error, setError] = useState("");
  const [showError, setShowError] = useState();
  const [amount, setAmount] = useState();
  const [percentage, setPercentage] = useState(0);
  const [month, setMonth] = useState(0);
  const [loading, isloading] = useState(false);
  const [showPaymentStep, setShowPaymentStep] = useState(false);
  const [uploadedImageUrls, setUploadedImageUrls] = useState();
  const [showDropzone, setShowDropzone] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [roi, setRoi] = useState(0);
  const [amountperMonth, setAmountPerMonth] = useState(0);
  const [stakingType, setStakingType] = useState("sole");
  const [partnerEmail, setPartnerEmail] = useState("");
  const [isPartnerValid, setIsPartnerValid] = useState(null);
  const [partnerName, setPartnerName] = useState("");
  const [partnerPercentage, setPartnerPercentage] = useState(50);
  const [initiatorPercentage, setInitiatorPercentage] = useState(50);
  const [isLoading, setIsPartnerLoading] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState("");
  const [cryptoAddresses, setCryptoAddresses] = useState({});
  const [selectedAddress, setSelectedAddress] = useState("");
  const [equivalentAmount, setEquivalentAmount] = useState(0);

  // Add logging for component state
  useEffect(() => {
    console.log("Component state:", { 
      showPaymentStep, 
      amount, 
      percentage, 
      month,
      symbol,
      addressObject: address,
    });
  }, [showPaymentStep, amount, percentage, month, symbol, address]);

  // Update the payment address retrieval with fallbacks and debug info
  useEffect(() => {
    if (address) {
      console.log("Available addresses:", address);
      console.log(`Looking for address with keys: ${name} or ${symbol}`);
      
      // Extract available crypto addresses
      const addressMap = {};
      Object.entries(address).forEach(([key, value]) => {
        if (value && typeof value === 'string' && value.trim() !== '') {
          addressMap[key] = value;
        }
      });
      
      setCryptoAddresses(addressMap);
      
      // Default to the current coin's address if available
      if (addressMap[name]) {
        setSelectedCrypto(name);
        setSelectedAddress(addressMap[name]);
      } else if (addressMap[symbol]) {
        setSelectedCrypto(symbol);
        setSelectedAddress(addressMap[symbol]);
      } else if (Object.keys(addressMap).length > 0) {
        // Select first available address as fallback
        const firstKey = Object.keys(addressMap)[0];
        setSelectedCrypto(firstKey);
        setSelectedAddress(addressMap[firstKey]);
      }
    }
  }, [address, name, symbol]);

  // Calculate ROI and monthly returns when dependencies change
  useEffect(() => {
    if (amount && percentage && month) {
      const calculatedRoi = amount + (percentage * month * amount) / 100;
      const calculatedMonthlyReturn = (percentage * amount) / 100;
      
      setRoi(calculatedRoi);
      setAmountPerMonth(calculatedMonthlyReturn);
    }
  }, [amount, percentage, month]);

  // Function to calculate equivalent amount in selected crypto
  const calculateEquivalentAmount = useCallback(() => {
    if (!amount || !selectedCrypto || !cryptoPrices) return;
    
    // Get price of staking coin (from props)
    const stakingCoinPrice = parseFloat(price) || 0;
    
    // Total USD value of the stake
    const usdValue = stakingCoinPrice * amount;
    
    // Find price of selected crypto
    let selectedCryptoPrice = 0;
    
    // Normalize selected crypto name for mapping
    const normalizedCrypto = selectedCrypto.toLowerCase().replace(/\s+/g, '-');
    
    // Try different ways to get the price
    if (cryptoPrices[normalizedCrypto]?.usd) {
      selectedCryptoPrice = cryptoPrices[normalizedCrypto].usd;
    } else if (cryptoPrices[selectedCrypto.toLowerCase()]?.usd) {
      selectedCryptoPrice = cryptoPrices[selectedCrypto.toLowerCase()].usd;
    } else {
      // Common mappings for major cryptocurrencies
      const cryptoMap = {
        'Bitcoin': 'bitcoin',
        'Ethereum': 'ethereum',
        'Tether': 'tether',
        'Binance': 'binancecoin',
        'Dogecoin': 'dogecoin',
        'Tron': 'tron',
      };
      
      const mappedId = cryptoMap[selectedCrypto];
      if (mappedId && cryptoPrices[mappedId]?.usd) {
        selectedCryptoPrice = cryptoPrices[mappedId].usd;
      }
    }
    
    if (selectedCryptoPrice > 0) {
      // Calculate equivalent amount
      const equivalent = usdValue / selectedCryptoPrice;
      setEquivalentAmount(equivalent);
    } else {
      console.log(`Could not find price for ${selectedCrypto}`);
      setEquivalentAmount(0);
    }
  }, [amount, selectedCrypto, cryptoPrices, price]);

  // Calculate equivalent amount in selected crypto
  useEffect(() => {
    if (amount && selectedCrypto && price) {
      calculateEquivalentAmount();
    }
  }, [amount, selectedCrypto, price, cryptoPrices, calculateEquivalentAmount]);

  // Define getPaymentAddress function
  const getPaymentAddress = () => {
    // If we have a manually selected address, return it
    if (selectedAddress) {
      return selectedAddress;
    }
    
    if (!address || typeof address !== 'object') {
      console.log("No valid address object available");
      return null;
    }
    
    // Map of common cryptocurrency symbols and their possible variations
    const symbolMap = {
      'BTC': ['bitcoin', 'btc', 'Bitcoin'],
      'ETH': ['ethereum', 'eth', 'Ethereum'],
      'USDT': ['tether', 'usdt', 'Tether'],
      'LTC': ['litecoin', 'ltc', 'Litecoin'],
      'XRP': ['ripple', 'xrp', 'Ripple'],
      'BCH': ['bitcoincash', 'bch', 'BitcoinCash'],
      'BNB': ['binance', 'bnb', 'Binance'],
      'DOGE': ['dogecoin', 'doge', 'Dogecoin'],
      'ADA': ['cardano', 'ada', 'Cardano'],
      'SOL': ['solana', 'sol', 'Solana'],
    };
    
    // Try direct match with provided name/symbol
    if (address[name]) return address[name];
    if (address[symbol]) return address[symbol];
    
    // Try case variations of the given name/symbol
    const variations = [
      name?.toLowerCase(),
      name?.toUpperCase(),
      symbol?.toLowerCase(),
      symbol?.toUpperCase(),
    ].filter(Boolean); // Remove undefined
    
    for (const variation of variations) {
      if (address[variation]) {
        console.log(`Found address using variation: ${variation}`);
        return address[variation];
      }
    }
    
    // Try to match using common mapping patterns
    const lowerSymbol = symbol?.toLowerCase();
    const upperSymbol = symbol?.toUpperCase();
    
    for (const [key, alternatives] of Object.entries(symbolMap)) {
      if (key === upperSymbol || alternatives.includes(lowerSymbol)) {
        for (const alt of [key, ...alternatives]) {
          if (address[alt]) {
            console.log(`Found address using common pattern: ${alt}`);
            return address[alt];
          }
        }
      }
    }
    
    // Last resort: try to find any cryptocurrency address
    for (const [stdSymbol, alts] of Object.entries(symbolMap)) {
      for (const altName of [stdSymbol, ...alts]) {
        if (address[altName]) {
          console.log(`No specific address found, using ${altName} instead`);
          return address[altName];
        }
      }
    }
    
    // If still nothing, use the first available address (if any)
    const addressKeys = Object.keys(address);
    if (addressKeys.length > 0) {
      console.log(`Using first available address key: ${addressKeys[0]}`);
      return address[addressKeys[0]];
    }
    
    console.log("No payment address found after all attempts");
    return null;
  };

  // Define paymentAddress after the function
  const paymentAddress = getPaymentAddress();

  // Now add useEffect that depends on paymentAddress
  useEffect(() => {
    console.log("Payment address state:", { paymentAddress });
  }, [paymentAddress]);

  // Force refresh addresses if they might be loading asynchronously
  useEffect(() => {
    if (!paymentAddress && showPaymentStep) {
      // This will trigger the useUserData hook to refresh addresses if needed
      const timer = setTimeout(() => {
        console.log("Attempting to refresh addresses...");
        
        // Display debug info
        console.log("Available addresses:", address);
        console.log(`Current symbol: ${symbol}, name: ${name}`);
        
        // Force a state update to trigger re-render
        setDetails({...details});
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [showPaymentStep, paymentAddress, details, address, symbol, name, setDetails]);

  const [isCopied, setIsCopied] = useState(false);

  const handleChange = (value) => {
    setShowError(false);
    const numericValue = Number(value);

    if (numericValue < stake.cryptoMinimum) {
      setShowError(true);
      setError(`Staking amount is below minimum stake (${stake.cryptoMinimum} ${symbol})`);
      setAmount(numericValue);
    } else {
      setAmount(numericValue);
    }
  };

  const getPercentageByMonths = (data, months) => {
    const entry = data.find((item) => item.months === months);
    setPercentage(entry.percentage);
    setMonth(entry.months);
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/jpeg, image/png, image/jpg",
    onDrop: async (acceptedFiles) => {
      setIsUploading(true);

      try {
        const uploadedImageUrls = await Promise.all(
          acceptedFiles.map(async (file) => {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", "my_preset");
            try {
              const response = await axios.post(
                `https://api.cloudinary.com/v1_1/dgqjunu7l/upload`,
                formData
              );
              setUploadedImageUrls(response.data.secure_url);
              return response.data.secure_url;
            } catch (error) {
              console.error("Error uploading image to Cloudinary:", error);
              throw error;
            }
          })
        );

        setFiles(
          acceptedFiles.map((file, index) => ({
            ...file,
            preview: URL.createObjectURL(file),
            cloudinaryUrl: uploadedImageUrls[index],
          }))
        );

        setUploadSuccess(true);
      } catch (error) {
        console.error("Error uploading images to Cloudinary:", error);
      } finally {
        setIsUploading(false);
      }
    },
  });

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(selectedAddress);
    setIsCopied(true);
    toast.success("Address copied");
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const initiateStaking = () => {
    console.log("Initiating staking with values:", { percentage, amount, showError });
    
    if (percentage === 0 || amount === 0 || showError) {
      console.log("Cannot proceed: validation failed");
      return;
    }
    
    // Make sure we have default values set for the crypto selection
    if (!selectedCrypto && address) {
      // Try to use the current stake's crypto first
      if (address[name]) {
        setSelectedCrypto(name);
        setSelectedAddress(address[name]);
      } else if (address[symbol]) {
        setSelectedCrypto(symbol);
        setSelectedAddress(address[symbol]);
      } else if (Object.keys(address).length > 0) {
        // Fallback to first available
        const firstKey = Object.keys(address)[0];
        setSelectedCrypto(firstKey);
        setSelectedAddress(address[firstKey]);
      }
    }
    
    // Calculate equivalent amount if not done yet
    if (amount && selectedCrypto && equivalentAmount === 0) {
      calculateEquivalentAmount();
    }
    
    setShowPaymentStep(true);
    console.log("Payment step should be visible now");
  };

  const handleVerifyPayment = () => {
    setShowDropzone(true);
  };

  const verifyPartner = async () => {
    if (!partnerEmail) {
      setIsPartnerValid(false);
      return;
    }
    
    // Check if trying to use own email
    if (partnerEmail.toLowerCase() === details.email.toLowerCase()) {
      setIsPartnerValid(false);
      toast.error("You cannot enter your own email as a partner");
      return;
    }
    
    setIsPartnerLoading(true);
    try {
      const response = await axios.post("/api/checkuser", {
        email: partnerEmail,
      });
      
      if (response.data.exists) {
        setIsPartnerValid(true);
        setPartnerName(response.data.name);
      } else {
        setIsPartnerValid(false);
        toast.error("User not found with this email");
      }
    } catch (error) {
      console.error("Error verifying partner:", error);
      setIsPartnerValid(false);
      toast.error(error.response?.data?.message || "Failed to verify partner");
    } finally {
      setIsPartnerLoading(false);
    }
  };

  useEffect(() => {
    if (partnerEmail) {
      const timer = setTimeout(() => {
        verifyPartner();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [partnerEmail]);

  const handlePercentageChange = (value) => {
    const newPartnerPercentage = value[0];
    setPartnerPercentage(newPartnerPercentage);
    setInitiatorPercentage(100 - newPartnerPercentage);
  };

  const handleStaking = async () => {
    const email = details.email;
    const stakings = {
      id: stake.id + crypto.randomUUID(),
      stakedAsset: stake.coinName,
      stakedAssetImagePath: stake.imagePath,
      stakedAssetSymbol: stake.coinSymbol,
      dateStaked: Date.now(),
      stakedAmount: amount,
      monthlyReturns: amountperMonth,
      totalReturns: roi,
      stakedDuration: month,
      status: "pending",
      paymentProofUrl: uploadedImageUrls,
      lastPaid: new Date(),
      isJoint: stakingType === "joint",
      partnerEmail: stakingType === "joint" ? partnerEmail : null,
      initiatorPercentage: stakingType === "joint" ? initiatorPercentage : 100,
      partnerPercentage: stakingType === "joint" ? partnerPercentage : 0,
      initiatorContribution: stakingType === "joint" 
        ? amount * (initiatorPercentage / 100) 
        : amount,
      partnerContribution: stakingType === "joint" 
        ? amount * (partnerPercentage / 100) 
        : 0,
      partnerStatus: stakingType === "joint" ? "pending" : null,
      // Add payment details
      paymentCrypto: selectedCrypto,
      paymentAddress: selectedAddress,
      paymentAmount: equivalentAmount,
      originalAmount: amount,
    };
    isloading(true);
    try {
      // Create initiator and partner records for optimistic updates
      if (stakingType === "joint") {
        // Create record for initiator to display immediately
        const initiatorRecord = {
          ...stakings,
          initiatorEmail: email,
          initiatorName: details.name,
          partnerName: partnerName, // Use the verified partner name
          isInitiator: true,
          isPartner: false,
          status: "pending",
          partnerStatus: "pending-partner"
        };
        
        // Update the UI immediately with the new staking (optimistic update)
        setDetails((prevDeets) => ({
          ...prevDeets,
          stakings: [...prevDeets.stakings, initiatorRecord],
        }));
      } else {
        // For solo staking
        const soloRecord = {
          ...stakings,
          initiatorEmail: email,
          initiatorName: details.name,
          isInitiator: true,
          isPartner: false,
        };
        
        // Update the UI immediately with the new staking (optimistic update)
        setDetails((prevDeets) => ({
          ...prevDeets,
          stakings: [...prevDeets.stakings, soloRecord],
        }));
      }
      
      // Now make the actual API call
      const response = await axios.post("/db/Staking/", {
        email,
        stakings,
        amount,
        cryptoPayment: true,
        paymentCrypto: selectedCrypto,
        paymentAddress: selectedAddress,
        paymentAmount: equivalentAmount,
        isJoint: stakingType === "joint",
        partnerEmail: stakingType === "joint" ? partnerEmail : null,
      });
      
      if (response.status === 200) {
        // We've already updated the UI optimistically, so we don't need to update it again
        // However, we might want to refresh data to ensure consistency with server
        
        if (stakingType === "joint") {
        setNotification(
            `Your joint staking request of ${amount} ${symbol} has been submitted and an invitation sent to ${partnerName}`,
            "transaction",
            "pending"
          );
          
          toast.success(`Joint staking request sent to ${partnerName}`, {
            duration: 4000,
          });
          
          // Also, let's check if partner exists in context and update their stakingInvitations
          // This simulates what will happen on the partner's side
          if (window && window.localStorage) {
            const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
            const partnerUser = allUsers.find(user => user.email === partnerEmail);
            
            if (partnerUser) {
              // Create record for partner's stakingInvitations to simulate the update
              const partnerRecord = {
                ...stakings,
                initiatorEmail: email,
                initiatorName: details.name,
                partnerEmail: partnerEmail,
                partnerName: partnerName,
                isInitiator: false,
                isPartner: true,
                status: "pending-partner"
              };
              
              // Update the partner's stakingInvitations in localStorage
              partnerUser.stakingInvitations = [...(partnerUser.stakingInvitations || []), partnerRecord];
              localStorage.setItem('allUsers', JSON.stringify(allUsers));
            }
          }
        } else {
          setNotification(
            `Your staking request of ${amount} ${symbol} (${equivalentAmount.toFixed(6)} ${selectedCrypto}) has been submitted for verification`,
          "transaction",
            "pending"
        );
          
          toast.success(`${amount} ${symbol} staking request submitted`, {
          duration: 4000,
        });
        }
        
        setAmount(0);
        router.push("/dashboard/stake/mystakings");
        
        // Fetch fresh data after a short delay
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
            if (data) {
              setDetails(data);
            }
          })
          .catch(error => {
            console.error("Error fetching updated data:", error);
          });
        }, 1000);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to submit staking request");
      
      // Revert the optimistic update if the request failed
      setDetails((prevDeets) => {
        // Remove the last added staking which failed
        const updatedStakings = [...prevDeets.stakings];
        updatedStakings.pop();
        
        return {
          ...prevDeets,
          stakings: updatedStakings,
        };
      });
    } finally {
      isloading(false);
    }
  };

  return (
    <div className={`${isDarkMode ? "textwhite" : ""} max-h-[85vh] flex flex-col`}>
      <div className="header-section flex gap-x-2 items-center justify-between sticky top-0 z-10 pb-3 pt-1">
        <div className="header-section flex gap-x-3 items-center">
          <div className="image rounded-full overflow-hidden">
            <Image
              alt=""
              src={image}
              width={1000}
              height={1000}
              className="w-11 h-11"
            />
          </div>
          <div className="description">
            <div className="bigtext text-lg font-semibold">{name}</div>
            <div className="smalltext font-bold opacity-60 text-sm">
              {symbol}
            </div>
          </div>
        </div>
      </div>
      <div
        className={`demacator rounded-full w-1/2 mx-auto h-0.5 px-10 ${
          isDarkMode ? "bg-[#222]" : "bg-black/10"
        }`}
      ></div>
      
      <ScrollArea className="flex-grow overflow-y-auto mt-3 pr-2">
        {!showPaymentStep ? (
          <div className="form-section">
            <div className="space-y-2 mb-4">
              <div className={`font-bold text-sm ${isDarkMode ? "text-white" : ""}`}>Staking Type</div>
              
              {/* Improved staking type selector */}
              <div className="grid grid-cols-2 gap-3">
                <div 
                  onClick={() => setStakingType("sole")}
                  className={`flex flex-col items-center justify-center p-3 rounded-md cursor-pointer border transition-all ${
                    stakingType === "sole" 
                      ? isDarkMode
                        ? "border-blue-400 bg-blue-900/20" 
                        : "border-blue-500 bg-blue-50"
                      : isDarkMode
                        ? "border-white/10 hover:border-white/30" 
                        : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor" 
                    className={`w-6 h-6 mb-1 ${
                      stakingType === "sole" 
                        ? "text-blue-500" 
                        : isDarkMode ? "text-white/70" : "text-gray-500"
                    }`}
                  >
                    <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                  </svg>
                  <span className={`font-medium ${
                    stakingType === "sole" 
                      ? "text-blue-500" 
                      : isDarkMode ? "text-white/80" : "text-gray-800"
                  }`}>
                    Sole Staking
                  </span>
                  <span className={`text-xs mt-1 ${isDarkMode ? "text-white/40" : "text-gray-500"}`}>
                    Stake independently
                  </span>
                </div>
                
                <div 
                  onClick={() => setStakingType("joint")}
                  className={`flex flex-col items-center justify-center p-3 rounded-md cursor-pointer border transition-all ${
                    stakingType === "joint" 
                      ? isDarkMode
                        ? "border-purple-400 bg-purple-900/20" 
                        : "border-purple-500 bg-purple-50"
                      : isDarkMode
                        ? "border-white/10 hover:border-white/30" 
                        : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor" 
                    className={`w-6 h-6 mb-1 ${
                      stakingType === "joint" 
                        ? "text-purple-500" 
                        : isDarkMode ? "text-white/70" : "text-gray-500"
                    }`}
                  >
                    <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16.5h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16.5z" />
                  </svg>
                  <span className={`font-medium ${
                    stakingType === "joint" 
                      ? "text-purple-500" 
                      : isDarkMode ? "text-white/80" : "text-gray-800"
                  }`}>
                    Joint Staking
                  </span>
                  <span className={`text-xs mt-1 ${isDarkMode ? "text-white/40" : "text-gray-500"}`}>
                    Stake with a partner
                  </span>
                </div>
              </div>
            </div>

        <div className="amount-form">
          <label htmlFor="amount" className="text-sm font-bold pb-4">
                Staking Amount ({symbol})
          </label>
          <Input
            id="amount"
            type="number"
            value={amount === 0 ? "" : amount}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Enter amount to stake"
            className={`mt-2 text-sm rounded-sm h-12 ${
              isDarkMode ? " bg-[#222] text-white border-white/5" : ""
            }`}
          />
        </div>
        <div
          className={`font-bold mt-3 text-sm /md:flex /items-center gap-x-2`}
        >
          <div>
                <span className={`text-xs ${isDarkMode ? "text-white/60" : "text-gray-500"}`}>
                  Minimum: {stake.cryptoMinimum || 0} {symbol}
                </span>
              </div>
              {showError && <div className="text-red-500 mt-2">{error}</div>}
            </div>

            {stakingType === 'joint' && (
              <>
                <div className="space-y-2 mt-4">
                  <label htmlFor="partnerEmail" className="text-sm font-bold pb-4">
                    Partner Email
                  </label>
                  <div className="relative">
                    <Input
                      id="partnerEmail"
                      type="email"
                      placeholder="Enter partner's email"
                      value={partnerEmail}
                      onChange={(e) => setPartnerEmail(e.target.value)}
                      className={`text-sm rounded-sm h-12 ${
                        isDarkMode ? "bg-[#222] text-white border-white/5" : ""
                      } ${
                        partnerEmail && isPartnerValid !== null
                          ? isPartnerValid
                            ? 'border-green-500 focus-visible:ring-green-500'
                            : 'border-red-500 focus-visible:ring-red-500'
                          : ''
                      }`}
                    />
                    {isLoading ? (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader2 className={`h-4 w-4 animate-spin ${isDarkMode ? "text-white/60" : "text-gray-400"}`} />
                      </div>
                    ) : partnerEmail && !isPartnerValid && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 20 20" 
                          fill="currentColor" 
                          className="w-5 h-5 text-red-500"
                        >
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  {partnerEmail && isPartnerValid && (
                    <div className="flex items-center mt-2">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 20 20" 
                        fill="currentColor" 
                        className="w-5 h-5 text-green-500 mr-1.5"
                      >
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                      </svg>
                      <p className={`text-sm ${isDarkMode ? "text-green-400" : "text-green-600"}`}>
                        Partner: {partnerName}
                      </p>
                    </div>
                  )}
                  
                  {partnerEmail && isPartnerValid === false && (
                    <p className="text-sm text-red-500 mt-2 flex items-center">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 20 20" 
                        fill="currentColor" 
                        className="w-4 h-4 mr-1.5"
                      >
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                      {partnerEmail.toLowerCase() === details.email.toLowerCase() 
                        ? "You cannot use your own email" 
                        : "User not found with this email"}
                    </p>
                  )}
                  
                  <div className="mt-2">
                    <Button 
                      type="button" 
                      size="sm"
                      onClick={verifyPartner}
                      disabled={!partnerEmail || isLoading}
                      variant={isDarkMode ? "outline" : "secondary"}
                      className={`mt-1 text-xs ${isDarkMode ? "border-white/20" : ""}`}
                    >
                      {isLoading ? "Verifying..." : "Verify Partner"}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4 mt-4">
                  <div className="flex justify-between">
                    <label className="text-sm font-bold">Contribution Split</label>
                    <span className={`text-sm ${isDarkMode ? "text-white/60" : "text-gray-500"}`}>
                      You: {initiatorPercentage}% | Partner: {partnerPercentage}%
                    </span>
                  </div>
                  <Slider
                    defaultValue={[50]}
                    max={70}
                    min={30}
                    step={5}
                    value={[partnerPercentage]}
                    onValueChange={handlePercentageChange}
                    className={isDarkMode ? "bg-white/20" : ""}
                  />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className={`p-3 rounded-lg ${isDarkMode ? "bg-[#222]" : "bg-gray-50"}`}>
                      <p className={`${isDarkMode ? "text-white/60" : "text-gray-500"} text-xs mb-1`}>Your contribution:</p>
                      <p className="font-medium">
                        {(parseFloat(amount || 0) * (initiatorPercentage / 100)).toFixed(8)} {symbol}
                      </p>
                      <Badge variant={isDarkMode ? "outline" : "secondary"} className="mt-1">
                        {initiatorPercentage}%
                      </Badge>
                    </div>
                    <div className={`p-3 rounded-lg ${isDarkMode ? "bg-[#222]" : "bg-gray-50"}`}>
                      <p className={`${isDarkMode ? "text-white/60" : "text-gray-500"} text-xs mb-1`}>Partner contribution:</p>
                      <p className="font-medium">
                        {(parseFloat(amount || 0) * (partnerPercentage / 100)).toFixed(8)} {symbol}
                      </p>
                      <Badge variant={isDarkMode ? "outline" : "secondary"} className="mt-1">
                        {partnerPercentage}%
                      </Badge>
                    </div>
          </div>
        </div>
              </>
            )}

          <div className="duration mt-4 w-full">
            <label htmlFor="duration" className="text-sm font-bold pb-4">
              Staking Duration
            </label>
            <Select
                onValueChange={(value) => getPercentageByMonths(duration, parseInt(value))}
            >
              <SelectTrigger
                  className={`w-full rounded-sm ${
                    isDarkMode ? "bg-[#222] text-white border-white/5" : ""
                }`}
              >
                  <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent
                  className={`${
                  isDarkMode ? "bg-[#222] text-white border-white/5" : ""
                }`}
              >
                  {duration.map((item) => (
                  <SelectItem
                      key={item.months}
                      value={item.months.toString()}
                      className={`${
                        isDarkMode && "text-white"
                      } cursor-pointer`}
                  >
                      {item.months} months ({item.percentage}% return)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

            {amount > 0 && percentage > 0 && (
              <div
                className={`mt-3 grid grid-cols-3 justify-center items-center ${
                  isDarkMode ? "text-white" : ""
                }`}
              >
                {percentage > 0 && (
                  <>
                    <div className="text-center">
                      <p className="text-sm font-bold mb-0 mt-2">
                        Monthly Returns
                      </p>
                      <p className="font-bold">
                        {amountperMonth.toFixed(4)} {symbol}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold mb-0 mt-2">Duration</p>
                      <p className="font-bold">{month} months</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold mb-0 mt-2">Total Returns</p>
                      <p className="font-bold">
                        {roi.toFixed(4)} {symbol}
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="mt-6 grid justify-center items-center pb-4">
              <button
                className={`btn text-white rounded-sm cursor-pointer bg-[#0052FF] py-3 px-8 text-center font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                onClick={initiateStaking}
                disabled={
                  percentage === 0 || 
                  amount === 0 || 
                  showError || 
                  (stakingType === 'joint' && !isPartnerValid)
                }
              >
                Continue
              </button>
            </div>
          </div>
        ) : (
          <div className="payment-section">
            {console.log("Payment section rendering", { selectedAddress, selectedCrypto })}
            <div className="text-center mb-4">
              <h3 className={`text-lg font-bold ${isDarkMode ? "text-white" : ""}`}>
                Pay {equivalentAmount > 0 ? equivalentAmount.toFixed(8) : amount} {selectedCrypto || symbol} to Start Staking
              </h3>
              <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                Send exactly {equivalentAmount > 0 ? equivalentAmount.toFixed(8) : amount} {selectedCrypto || symbol} to the address below
              </p>
        </div>

            {/* Add debug panel for troubleshooting */}
            <div className={`mb-4 p-3 rounded-md text-xs ${isDarkMode ? "bg-gray-900 border border-gray-700" : "bg-gray-100 border border-gray-300"}`}>
              <details>
                <summary className="font-bold cursor-pointer">Debug Information (Click to expand)</summary>
                <div className="mt-2 space-y-1 overflow-auto max-h-32">
                  <p>Payment Step Active: {showPaymentStep ? "Yes" : "No"}</p>
                  <p>Selected Address: {selectedAddress || "Not found"}</p>
                  <p>Selected Crypto: {selectedCrypto}</p>
                  <p>Original Symbol: {symbol}</p>
                  <p>Original Amount: {amount}</p>
                  <p>Equivalent Amount: {equivalentAmount.toFixed(8)}</p>
                  {/* <p>Address Object Keys: {address ? Object.keys(address).join(", ") : "No address object"}</p> */}
                </div>
              </details>
            </div>

            {/* Add temporary fallback payment address input for testing */}
            {!selectedAddress && (
              <div className={`mb-4 p-4 border rounded-md ${isDarkMode ? "bg-orange-900/20 border-orange-700/50 text-orange-300" : "bg-orange-50 border-orange-200 text-orange-800"}`}>
                <h4 className="font-medium text-sm mb-2">Manual Payment Address Entry</h4>
                <p className="text-xs mb-3">No payment address was found automatically. You can manually enter a test address below:</p>
                <input
                  type="text"
                  placeholder="Enter payment address for testing"
                  className={`w-full p-2 text-sm rounded-md ${isDarkMode ? "bg-[#222] border-orange-700/30 text-white" : "border border-orange-300"}`}
                  onChange={(e) => {
                    const value = e.target.value.trim();
                    if (value) {
                      // Create a temporary address object for display
                      setGlobalThis.testAddress = value;
                    }
                  }}
                />
                <button 
                  className={`mt-2 py-1.5 px-3 text-xs font-medium rounded-md ${
                    isDarkMode 
                      ? "bg-orange-700/50 hover:bg-orange-700/70 text-white" 
                      : "bg-orange-500 hover:bg-orange-600 text-white"
                  }`}
                  onClick={() => {
                    if (window.testAddress) {
                      // Force re-render with test address
                      toast.success("Test address set for display purposes");
                      setShowPaymentStep(false);
                      setTimeout(() => {
                        // Hack to force a re-render with the test address
                        setShowPaymentStep(true);
                      }, 100);
                    } else {
                      toast.error("Please enter a test address first");
                    }
                  }}
                >
                  Use Test Address
                </button>
              </div>
            )}
            
            {selectedAddress ? (
              <>
                <div className="flex justify-center items-center mb-4">
                  <QRCode value={selectedAddress} size={160} />
          </div>
                
                {/* Add cryptocurrency selection */}
                <div className="mb-4">
                  <label htmlFor="cryptoSelect" className="text-sm font-semibold mb-2 block">
                    Select Payment Cryptocurrency
            </label>
                  <Select
                    value={selectedCrypto}
                    onValueChange={(value) => {
                      setSelectedCrypto(value);
                      setSelectedAddress(cryptoAddresses[value]);
                      calculateEquivalentAmount();
                    }}
                  >
                    <SelectTrigger 
                      id="cryptoSelect"
                      className={`w-full rounded-md ${isDarkMode ? "bg-[#222] border-white/10 text-white" : "border-gray-300"}`}
                    >
                      <SelectValue placeholder="Select a cryptocurrency" />
                    </SelectTrigger>
                    <SelectContent className={`${isDarkMode ? "bg-[#222] text-white border-white/10" : ""}`}>
                      {Object.keys(cryptoAddresses).map((crypto) => (
                        <SelectItem 
                          key={crypto} 
                          value={crypto}
                          className={isDarkMode ? "text-white hover:bg-white/10" : ""}
                        >
                          {crypto}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Display equivalent amount */}
                <div className={`p-4 mb-4 rounded-md ${
                  isDarkMode ? "bg-blue-900/20 border border-blue-800/30 text-blue-200" : "bg-blue-50 border border-blue-100 text-blue-800"
                }`}>
                  <h4 className="font-medium text-sm mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
                      strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Payment Conversion
                  </h4>
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Stake Amount:</span>
                      <span className="font-medium">{amount} {symbol}</span>
                    </div>
                    <div className="w-full border-t border-blue-200 dark:border-blue-800/30 my-2"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Pay with {selectedCrypto}:</span>
                      <span className="font-medium">
                        {equivalentAmount > 0 
                          ? equivalentAmount.toFixed(8)
                          : "Price unavailable"}
                      </span>
                    </div>
                    {equivalentAmount > 0 && (
                      <div className="mt-2 text-xs">
                        Please send exactly {equivalentAmount.toFixed(8)} {selectedCrypto} to the address below.
                      </div>
                    )}
          </div>
        </div>

                <div className="address mt-2 mb-4">
                  <label htmlFor="address" className="text-sm font-semibold">
                    {selectedCrypto} Payment Address
                  </label>
                  <div className={`flex items-center px-2 py-1 my-2 rounded-lg ${
                    isDarkMode ? "bg-[#222] border-white/10" : "border"
                  }`}>
                    <input
                      type="text"
                      value={selectedAddress}
                      readOnly
                      className={`w-full px-2 py-3 text-sm rounded-lg font-bold ${
                        isDarkMode ? "text-white/60 bg-[#222]" : "text-black/60 bg-transparent"
                      } border-none focus:outline-none`}
                    />
                    <button onClick={handleCopyAddress} className="ml-3">
                      {isCopied ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.5 12.75l6 6 9-13.5"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className={`text-sm p-3 mb-4 rounded-md ${
                  isDarkMode ? "bg-amber-900/20 text-amber-200" : "bg-amber-50 text-amber-800"
                }`}>
                  <p className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
                      strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    Please send exactly {equivalentAmount.toFixed(8)} {selectedCrypto}. Sending less may result in loss of funds, while sending more will be considered as the staking amount.
          </p>
        </div>
                
                {!showDropzone ? (
                  <button
                    onClick={handleVerifyPayment}
                    className="btn font-bold text-sm text-white py-3 rounded-sm w-full text-center mt-2 bg-[#0052FF]"
                  >
                    I&apos;ve Made the Payment
                  </button>
                ) : (
                  <>
                    <label className="text-sm font-semibold mb-2 block">
                      Upload Payment Proof (screenshot)
                    </label>
                    <div
                      {...getRootProps({ className: "dropzone" })}
                      className={`py-4 overflow-hidden px-2 rounded-lg cursor-pointer mb-4 ${
                        isDarkMode ? "bg-[#222] text-white/60 border border-white/10" : "border"
                    }`}
                    >
                      <input {...getInputProps()} />
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5 mx-2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                          />
                        </svg>
                        <div className="text-sm font-bold">
                          {isUploading
                            ? "Uploading screenshot, please wait..."
                            : files.length !== 0
                            ? files.map((file, index) => (
                                <div key={index}>{file.path}</div>
                              ))
                            : "Click to upload your payment proof"}
                        </div>
                      </div>
        </div>

        <button
                      onClick={handleStaking}
                      disabled={!uploadSuccess || loading}
                      className={`btn font-bold disabled:cursor-not-allowed text-sm text-white ${
            !loading ? "py-3" : ""
                      } rounded-sm w-full text-center mt-2 mb-4 ${
                        !uploadSuccess
              ? "bg-muted-foreground"
                        : "bg-[#0052FF]"
                    }`}
                    >
                      {loading ? (
            <div className="w-full flex items-center justify-center">
              <InfinitySpin color="white" width="100" />
            </div>
                      ) : (
                        "Submit Staking Request"
          )}
        </button>
                  </>
                )}
              </>
            ) : (
              <div className={`p-4 rounded-md border ${isDarkMode ? "border-red-500/50 bg-red-950/20 text-red-300" : "border-red-300 bg-red-50 text-red-800"}`}>
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
                    strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  <h4 className="font-medium">Missing Payment Address</h4>
                </div>
                <p className="mt-2 text-sm">
                  Cannot find a payment address for {selectedCrypto || symbol}. Please select a different cryptocurrency or contact support.
                </p>
                <button 
                  className={`mt-3 py-2 px-4 text-sm font-medium rounded-md ${isDarkMode ? "bg-white/10 hover:bg-white/20" : "bg-white hover:bg-gray-100 border border-gray-300"}`}
                  onClick={() => setShowPaymentStep(false)}
                >
                  Go Back
                </button>
              </div>
            )}
      </div>
        )}
      </ScrollArea>
    </div>
  );
}

{
  /* <div
            className={`p-0.5 ${
              isDarkMode ? "bg-[#333]" : "bg-black/20"
            } w-1 h-1 rounded-full`}
          ></div> */
}
{
  /* <div className="text-red-500 mt-2 ">
            Amount exceeds available balance
          </div> */
}
