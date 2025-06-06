"use client";
import React, { useState, useEffect } from "react";
import { useTheme } from "../../../contexts/themeContext";
import { Input } from "../../ui/input";
import Image from "next/image";
import { useUserData } from "../../../contexts/userrContext";
import { Dialog, DialogContent, DialogTrigger } from "../../ui/dialog";
import AssetDialog from "../AssetDialog";
import { InfinitySpin } from "react-loader-spinner";
import toast from "react-hot-toast";
import axios from "axios";
import { cryptos } from "../MarketsPage/data/cryptos";

// CoinGecko ID mapping for common cryptocurrencies
const COINGECKO_ID_MAP = {
  "BTC": "bitcoin",
  "ETH": "ethereum",
  "USDT": "tether",
  "BNB": "binancecoin",
  "SOL": "solana",
  "XRP": "ripple",
  "DOGE": "dogecoin",
  "ADA": "cardano",
  "AVAX": "avalanche-2",
  "DOT": "polkadot",
  "LTC": "litecoin",
  "SHIB": "shiba-inu",
  "MATIC": "matic-network",
  "TRX": "tron",
  "LINK": "chainlink",
  "BCH": "bitcoin-cash"
};

export default function Staking() {
  const { isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [stakingOptions, setStakingOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coinPrices, setCoinPrices] = useState({});
  const [pricesLoading, setPricesLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});

  const { cryptoPrices } = useUserData();
  
  useEffect(() => {
    const fetchStakingOptions = async () => {
      try {
        const response = await fetch("/api/admin/staking-options");
        if (response.ok) {
          const data = await response.json();
          setStakingOptions(data.options || []);
          
          // After getting staking options, fetch prices for all coins
          if (data.options && data.options.length > 0) {
            fetchAllCoinPrices(data.options);
          }
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
    
    fetchStakingOptions();
  }, []);
  
  // Helper function to get the correct CoinGecko ID
  const getCoinGeckoId = (coinSymbol, coinName) => {
    // Try the hardcoded map first for common cryptocurrencies
    if (COINGECKO_ID_MAP[coinSymbol]) {
      return [COINGECKO_ID_MAP[coinSymbol]];
    }
    
    // Try different formats
    const formats = [
      coinName.toLowerCase().replace(/ /g, "-"),
      coinSymbol.toLowerCase(),
      coinName.toLowerCase(),
      coinSymbol.toLowerCase().replace(/ /g, "-")
    ];
    
    return formats;
  };
  
  const fetchAllCoinPrices = async (options) => {
    setPricesLoading(true);
    const debug = {};
    
    try {
      // Collect all possible IDs to try
      const allPossibleIds = [];
      options.forEach(option => {
        const ids = getCoinGeckoId(option.coinSymbol, option.coinName);
        allPossibleIds.push(...ids);
        debug[option.coinSymbol] = { tried: ids };
      });
      
      // Make one API call with all IDs
      const uniqueIds = [...new Set(allPossibleIds)];
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${uniqueIds.join(",")}&vs_currencies=usd`
      );
      
      const priceData = response.data;
      setCoinPrices(priceData);
      
      // Update debug info
      options.forEach(option => {
        const ids = getCoinGeckoId(option.coinSymbol, option.coinName);
        for (const id of ids) {
          if (priceData[id]) {
            debug[option.coinSymbol].foundWith = id;
            debug[option.coinSymbol].price = priceData[id].usd;
            break;
          }
        }
      });
      
      setDebugInfo(debug);
      console.log("Price debug info:", debug);
      
    } catch (error) {
      console.error("Error fetching coin prices:", error);
      toast.error("Error fetching prices. Please try again.");
    } finally {
      setPricesLoading(false);
    }
  };

  const filteredStakingOptions = stakingOptions.filter((stake) =>
    stake.coinName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stake.coinSymbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };
  
  // Get price for a coin
  const getCoinPrice = (stake) => {
    const ids = getCoinGeckoId(stake.coinSymbol, stake.coinName);
    
    // Try each possible ID format
    for (const id of ids) {
      // Check directly fetched prices
      if (coinPrices[id]?.usd) {
        return coinPrices[id].usd;
      }
      
      // Check context prices
      if (cryptoPrices[id]?.usd) {
        return cryptoPrices[id].usd;
      }
    }
    
    // If no price found through IDs, check context prices with symbol as fallback
    const normalizedSymbol = stake.coinSymbol.toLowerCase();
    if (cryptoPrices[normalizedSymbol]?.usd) {
      return cryptoPrices[normalizedSymbol].usd;
    }
    
    return null;
  };
  
  const refreshPrices = async () => {
    setPricesLoading(true);
    try {
      if (stakingOptions.length > 0) {
        await fetchAllCoinPrices(stakingOptions);
        toast.success("Prices refreshed successfully");
      }
    } catch (error) {
      console.error("Price refresh error:", error);
      toast.error("Failed to refresh prices");
    } finally {
      setPricesLoading(false);
    }
  };
  
  // For debugging
  const getPriceDebugInfo = (stake) => {
    return debugInfo[stake.coinSymbol] || {};
  };
  
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
    <div className="">
      <div className="searchbar">
        <div className="flex justify-between items-center mt-5 mb-3">
          <div
            className={`rounded-md flex items-center px-3 capitalize flex-1 ${
              isDarkMode
                ? "bg-[#222] border border-white/10 text-white"
                : "bg-black/5"
            }`}
          >
            <Input
              type="text"
              onChange={handleSearchInputChange}
              placeholder="Search Crypto Pool"
              className="bg-transparent font-bold border-0 h-12 ring-0 hover:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 opacity-50"
            >
              <path
                fillRule="evenodd"
                d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          
          <button 
            onClick={refreshPrices}
            className={`ml-2 p-3 rounded-md ${pricesLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-black/5"} ${
              isDarkMode ? "text-white hover:bg-white/5" : ""
            }`}
            disabled={pricesLoading}
            title="Refresh prices"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className={`w-5 h-5 ${pricesLoading ? "animate-spin" : ""}`}
            >
              <path fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className={`${isDarkMode ? "text-white" : ""}`}>
          {stakingOptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 mt-5 rounded-md border border-dashed">
              <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-blue-50">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="#0052FF" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="w-8 h-8"
                >
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Staking Options Available</h3>
              <p className="text-gray-500 text-center max-w-md mb-6">There are currently no staking options available. Please check back later for new opportunities.</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md font-medium hover:bg-blue-100 transition-colors"
              >
                Refresh Options
              </button>
            </div>
          ) : filteredStakingOptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 mt-5 rounded-md border border-dashed">
              <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-amber-50">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="#F59E0B" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="w-8 h-8"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Results Found</h3>
              <p className="text-gray-500 text-center max-w-md">We couldn't find any staking options matching your search. Try a different keyword or clear your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-3">
              {filteredStakingOptions.map((stake) => (
                <div
                  key={stake.id}
                  className={`p-4 rounded-sm border ${
                    isDarkMode ? "bg-[#111] border-white/5" : "bg-black/5"
                  }`}
                >
                  <div className="header-section flex gap-x-2 items-center justify-between">
                    <div className="header-section flex gap-x-3 items-center">
                      <div className="image rounded-full overflow-hidden">
                        <Image
                          alt={stake.coinName}
                          src={stake.imagePath}
                          width={1000}
                          height={1000}
                          className="w-11 h-11"
                        />
                      </div>
                      <div className="description">
                        <div className="bigtext text-lg font-semibold">
                          {stake.coinName}
                        </div>
                        <div className="smalltext font-bold opacity-60 text-sm">
                          {stake.coinSymbol}
                        </div>
                      </div>
                    </div>

                    <div className="price">
                      {" "}
                      <div
                        className={`border ${
                          isDarkMode
                            ? "bg-[#222] text-white border-white/5"
                            : "bg-black/5"
                        } font-bold text-sm py-1 px-2 rounded-sm ${pricesLoading ? "animate-pulse" : ""}`}
                      >
                        {pricesLoading ? (
                          <span>Loading...</span>
                        ) : getCoinPrice(stake) ? 
                          `$${getCoinPrice(stake).toLocaleString()}` : 
                          "Price unavailable"
                        }
                      </div>
                    </div>
                  </div>
                  <div className="detail-section mt-5">
                    <div className="deet-cont grid grid-cols-3 gap-x-3 md:grid-cols-2 md:gap-3 lg:grid-cols-3  mt-2">
                      <div
                        className={`${
                          isDarkMode
                            ? "bg-[#222] border border-white/5"
                            : "bg-[#00000009] border"
                        } rounded-sm p-3 /text-center`}
                      >
                        <p className={`font-bold text-sm `}>Minimum</p>
                        <p className="text-sm font-bold opacity-80">
                          {stake.cryptoMinimum} {stake.coinSymbol}
                        </p>
                      </div>
                      <div
                        className={`${
                          isDarkMode
                            ? "bg-[#222] border border-white/5"
                            : "bg-[#00000009] border"
                        } rounded-sm p-3 /text-center`}
                      >
                        <p className={`font-bold text-sm `}>ROI</p>
                        <p className="text-sm font-bold opacity-80">
                          {stake.percentageRage}
                        </p>
                      </div>
                      <div
                        className={`${
                          isDarkMode
                            ? "bg-[#222] border border-white/5"
                            : "bg-[#00000009] border"
                        } rounded-sm p-3 /text-center`}
                      >
                        <p className={`font-bold text-sm `}>Cycle</p>
                        <p className="text-sm font-bold opacity-80">
                          {stake.cycle || "Monthly"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="btn-section mt-5">
                    <Dialog className={`${isDarkMode ? "bg-[#111]" : ""}`}>
                      <DialogTrigger className="w-full">
                        <div className="btn rounded-sm cursor-pointer text-white bg-[#0052FF] w-full py-3 text-center font-bold text-sm">
                          Stake {stake.coinName}
                        </div>
                      </DialogTrigger>
                      <DialogContent
                        side="bottom"
                        className={`${
                          isDarkMode
                            ? "bg-[#111] border-white/5 text-white"
                            : ""
                        }`}
                      >
                        <AssetDialog
                          stake={stake}
                          name={stake.coinName}
                          symbol={stake.coinSymbol}
                          image={stake.imagePath}
                          price={getCoinPrice(stake)?.toString() || "0"}
                          duration={stake.durations}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
