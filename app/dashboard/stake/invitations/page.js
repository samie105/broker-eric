"use client";

import React from "react";
import StakingRequests from "../../../../components/dashboard/stake/StakingRequests";

export default function InvitationsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Transaction Invitations</h1>
      <StakingRequests />
    </div>
  );
} 