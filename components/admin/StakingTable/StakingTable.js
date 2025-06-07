"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { InfinitySpin } from "react-loader-spinner";
import STable from "../../../components/admin/StakingTable/STable";
import { Input } from "../../../components/ui/input";

export default function StakingTable({ filterStatus = "all" }) {
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState("");
  const [data, setData] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastPaid, setLastPaid] = useState(Date.now());
  const [searchQuery, setSearchQuery] = useState("");
  const [allStakings, setAllStakings] = useState([]);
  const [viewMode, setViewMode] = useState("users"); // users or all

  const getAlluserInvestments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/db/getUser/api`);
      setUsers(response.data.users);
      
      // Collect all stakings from all users for the "all stakings" view
      const stakings = [];
      response.data.users.forEach(user => {
        if (user.stakings && user.stakings.length > 0) {
          // Add user information to each staking
          const userStakings = user.stakings.map(staking => ({
            ...staking,
            userName: user.name,
            userEmail: user.email
          }));
          stakings.push(...userStakings);
        }
      });
      setAllStakings(stakings);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    getAlluserInvestments();
  }, [lastPaid]);

  // Filter stakings based on status
  const filterStakingsByStatus = (stakings) => {
    if (!stakings) return [];
    if (filterStatus === "all") return stakings;
    
    return stakings.filter(staking => {
      const status = staking.status?.toLowerCase();
      
      switch (filterStatus) {
        case "pending":
          return status === "pending" || status === "awaiting_verification";
        case "active":
          return status === "active" || status === "ongoing";
        case "completed":
          return status === "completed";
        default:
          return true;
      }
    });
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    if (!searchQuery) {
      const stakings = filterStakingsByStatus(user.stakings);
      return stakings && stakings.length > 0;
    }
    
    const stakings = filterStakingsByStatus(user.stakings);
    return (
      (stakings && stakings.length > 0) && 
      (user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });
  
  // Filter all stakings based on search query and status
  const filteredAllStakings = filterStakingsByStatus(allStakings).filter(staking => {
    if (!searchQuery) return true;
    
    return (
      staking.userName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      staking.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staking.stakedAsset?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staking.stakedAssetSymbol?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

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
    <div className="mt-6 px-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Transactions</h2>
        <div className="flex gap-4">
          <button 
            onClick={() => setViewMode("users")}
            className={`px-4 py-2 rounded-md ${viewMode === "users" 
              ? "bg-blue-600 text-white" 
              : "bg-gray-200 text-gray-700"}`}
          >
            View by User
          </button>
          <button 
            onClick={() => setViewMode("all")}
            className={`px-4 py-2 rounded-md ${viewMode === "all" 
              ? "bg-blue-600 text-white" 
              : "bg-gray-200 text-gray-700"}`}
          >
            View All Transactions
          </button>
          <button 
            onClick={() => window.location.href = '/admin/stakes/create'}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            Create New Transaction Option
          </button>
        </div>
      </div>
      
      {/* Search input */}
      <div className="mb-4">
        <Input
          type="text"
          placeholder={viewMode === "users" 
            ? "Search by user name or email..." 
            : "Search by user, asset name or symbol..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full border-gray-300 mb-2"
        />
      </div>

      {viewMode === "users" ? (
        <>
          {/* User staking selection */}
          <select
            onChange={(e) => {
              if (e.target.value !== "") {
                const selectedData = users.find(
                  (user) => user.email === e.target.value
                );
                setEmail(e.target.value);
                setName(selectedData.name);
                setData(filterStakingsByStatus(selectedData.stakings || []));
              }
            }}
            className="py-2 px-4 border rounded-sm w-full"
          >
            <option value="">Select a user</option>
            {filteredUsers.map((user, i) => (
              <option key={i} value={user.email}>
                {user.name} ({user.email}) - {filterStakingsByStatus(user.stakings).length} transactions
              </option>
            ))}
          </select>
          
          {filteredUsers.length === 0 && searchQuery && (
            <div className="py-4 text-center text-gray-500">
              No users found matching your search.
            </div>
          )}

          {data.length > 0 && (
            <STable
              data={data}
              setData={setData}
              email={email}
              name={name}
              setLastPaid={setLastPaid}
            />
          )}
          {data.length === 0 && email && (
            <div className="py-16 text-center">
              <p className="text-lg">No transactions found for this user.</p>
            </div>
          )}
        </>
      ) : (
        <>
          {/* View all stakings */}
          {filteredAllStakings.length > 0 ? (
            <STable
              data={filteredAllStakings}
              setData={(updatedData) => {
                // When a staking is updated, update both the allStakings array and the user's stakings
                setAllStakings(prev => {
                  return prev.map(staking => {
                    const updatedStaking = updatedData.find(s => s.id === staking.id);
                    return updatedStaking || staking;
                  });
                });
                
                // Also update the specific user's data if it's currently selected
                if (email) {
                  const userStakings = updatedData.filter(staking => staking.userEmail === email);
                  if (userStakings.length > 0) {
                    setData(userStakings);
                  }
                }
                
                // Update the users array to reflect changes
                setUsers(prev => {
                  return prev.map(user => {
                    const userStakings = updatedData.filter(staking => staking.userEmail === user.email);
                    if (userStakings.length > 0) {
                      return {
                        ...user,
                        stakings: user.stakings.map(staking => {
                          const updatedStaking = userStakings.find(s => s.id === staking.id);
                          return updatedStaking || staking;
                        })
                      };
                    }
                    return user;
                  });
                });
              }}
              showUserInfo={true}
              setLastPaid={setLastPaid}
            />
          ) : (
            <div className="py-16 text-center">
              <p className="text-lg">No transactions found matching your criteria.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
