'use client';

import { useState, useEffect } from 'react';
import { useUserData } from '@/contexts/userrContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import InvestmentModal from '@/components/dashboard/InvestmentModal';
import InvestmentRequests from '@/components/dashboard/investment/InvestmentRequests';
import { formatCurrency } from '@/lib/utils';
import { Loader2, TrendingUp, Users, Clock } from 'lucide-react';

export default function InvestmentsPage() {
  const { details: user, loading } = useUserData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [investments, setInvestments] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    if (user) {
      // Filter investments by status
      const userInvestments = user.investments || [];
      
      // Active investments
      const active = userInvestments.filter(inv => inv.status === 'active');
      
      // Pending investments (either sent by user or received by user)
      const pending = userInvestments.filter(inv => 
        inv.status === 'pending' && 
        (inv.initiatorEmail === user.email || inv.partnerEmail === user.email)
      );
      
      setInvestments(active);
      setPendingRequests(pending);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const calculateTimeLeft = (endDate) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end - now;
    
    if (diffTime <= 0) return 'Completed';
    
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    
    if (diffMonths > 0) {
      return `${diffMonths} month${diffMonths > 1 ? 's' : ''} left`;
    } else {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} left`;
    }
  };

  const handleDeleteRequest = async (investmentId) => {
    try {
      const response = await fetch('/api/investment/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          investmentId
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Update the UI by filtering out the deleted request
        setPendingRequests(pendingRequests.filter(req => req.id !== investmentId));
      }
    } catch (error) {
      console.error('Error deleting investment request:', error);
    }
  };

  const handleRespondToRequest = async (investmentId, response) => {
    try {
      const res = await fetch('/api/investment/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          investmentId,
          response
        }),
      });

      const data = await res.json();
      
      if (data.success) {
        // Update the UI by filtering out the responded request
        setPendingRequests(pendingRequests.filter(req => req.id !== investmentId));
        
        // If accepted, add to active investments
        if (response === 'accept') {
          const updatedRequest = pendingRequests.find(req => req.id === investmentId);
          if (updatedRequest) {
            const activeRequest = {...updatedRequest, status: 'active'};
            setInvestments([...investments, activeRequest]);
          }
        }
      }
    } catch (error) {
      console.error('Error responding to investment request:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Investments</h1>
        <Button onClick={() => setIsModalOpen(true)}>New Investment</Button>
      </div>

      <Tabs defaultValue="active" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">
            Active Investments
          </TabsTrigger>
          <TabsTrigger value="requests">
            Requests {pendingRequests.length > 0 && (
              <Badge variant="destructive" className="ml-2">{pendingRequests.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history">
            History
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-4">
          {investments.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No active investments found.</p>
                <Button onClick={() => setIsModalOpen(true)} className="mt-4">
                  Start Investing
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {investments.map((investment) => (
                <Card key={investment.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>{investment.duration} Plan</CardTitle>
                      <Badge variant={investment.type === 'sole' ? 'default' : 'outline'}>
                        {investment.type === 'sole' ? 'Sole' : 'Joint'}
                      </Badge>
                    </div>
                    <CardDescription>
                      Started on {new Date(investment.startDate).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Investment</span>
                        <span className="font-medium">
                          {formatCurrency(investment.type === 'sole' ? investment.amount : 
                            (investment.initiatorEmail === user.email ? investment.initiatorAmount : investment.partnerAmount))}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ROI</span>
                        <span className="font-medium">{investment.roi * 100}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Expected Return</span>
                        <span className="font-medium text-green-600 dark:text-green-400">
                          {formatCurrency(investment.type === 'sole' ? 
                            investment.expectedReturn : 
                            (investment.initiatorEmail === user.email ? 
                              investment.initiatorAmount + (investment.initiatorAmount * investment.roi) : 
                              investment.partnerAmount + (investment.partnerAmount * investment.roi))
                          )}
                        </span>
                      </div>
                      {investment.type === 'joint' && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Partner</span>
                          <span className="font-medium">
                            {investment.initiatorEmail === user.email ? 
                              investment.partnerEmail.split('@')[0] : 
                              investment.initiatorEmail.split('@')[0]}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="mr-1 h-4 w-4" />
                      {calculateTimeLeft(investment.endDate)}
                    </div>
                    <div className="flex items-center text-green-600 dark:text-green-400">
                      <TrendingUp className="mr-1 h-4 w-4" />
                      Active
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="requests" className="mt-4">
          <InvestmentRequests />
        </TabsContent>
        
        <TabsContent value="history" className="mt-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Investment history coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <InvestmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        userEmail={user?.email}
        userBalance={user?.tradingBalance || 0}
      />
    </div>
  );
}
