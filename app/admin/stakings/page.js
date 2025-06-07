"use client";

import React from "react";
import StakingTable from "../../../components/admin/StakingTable/StakingTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";

export default function StakingsAdmin() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Transaction Management</h1>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="all">All Transactions</TabsTrigger>
          <TabsTrigger value="pending">Pending Verification</TabsTrigger>
          <TabsTrigger value="active">Active Transactions</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>
                View and manage all transactions in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StakingTable filterStatus="all" />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Verification</CardTitle>
              <CardDescription>
                Transactions awaiting verification by admin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StakingTable filterStatus="pending" />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Transactions</CardTitle>
              <CardDescription>
                Currently active transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StakingTable filterStatus="active" />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Transactions</CardTitle>
              <CardDescription>
                Transactions that have been completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StakingTable filterStatus="completed" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 