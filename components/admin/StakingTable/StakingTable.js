"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { InfinitySpin } from "react-loader-spinner";
import STable from "../../../components/admin/StakingTable/STable";
import { Input } from "../../../components/ui/input";

export default function StakingTable() {
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState("");
  const [data, setData] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastPaid, setLastPaid] = useState(Date.now());
  const [searchQuery, setSearchQuery] = useState("");

  const getAlluserInvestments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/db/getUser/api`);
      setUsers(response.data.users);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    getAlluserInvestments();
  }, [lastPaid]);

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    if (!searchQuery) return user.stakings && user.stakings.length > 0;
    
    return (
      (user.stakings && user.stakings.length > 0) && 
      (user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()))
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
    <div className="mt-20 px-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Stakings</h2>
        <button 
          onClick={() => window.location.href = '/admin/stakes/create'}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create New Staking Option
        </button>
      </div>
      
      {/* Search input */}
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search by user name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full border-gray-300 mb-2"
        />
      </div>
      
      {/* User staking selection */}
      <select
        onChange={(e) => {
          if (e.target.value !== "") {
            const selectedData = users.find(
              (user) => user.email === e.target.value
            );
            setEmail(e.target.value);
            setName(selectedData.name);
            setData(selectedData.stakings || []);
          }
        }}
        className="py-2 px-4 border rounded-sm w-full"
      >
        <option value="">Select a user</option>
        {filteredUsers.map((user, i) => (
          <option key={i} value={user.email}>
            {user.name} ({user.email})
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
          <p className="text-lg">No stakings found for this user.</p>
        </div>
      )}
    </div>
  );
}
