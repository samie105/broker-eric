'use client';

import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Check, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import axios from 'axios';

export default function InvestmentModal({ isOpen, onClose, userEmail, userBalance }) {
  const [investmentType, setInvestmentType] = useState('sole');
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('3 months');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [partnerPercentage, setPartnerPercentage] = useState(50);
  const [initiatorPercentage, setInitiatorPercentage] = useState(50);
  const [isPartnerValid, setIsPartnerValid] = useState(null);
  const [partnerName, setPartnerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Calculate ROI based on duration
  const calculateRoi = () => {
    switch (duration) {
      case '3 months':
        return 0.15; // 15%
      case '6 months':
        return 0.30; // 30%
      case '1 year':
        return 0.65; // 65%
      default:
        return 0.15;
    }
  };

  // Calculate expected return
  const calculateExpectedReturn = () => {
    const roi = calculateRoi();
    const amountValue = parseFloat(amount) || 0;
    return amountValue + (amountValue * roi);
  };

  // Handle percentage slider change
  const handlePercentageChange = (value) => {
    const newPartnerPercentage = value[0];
    setPartnerPercentage(newPartnerPercentage);
    setInitiatorPercentage(100 - newPartnerPercentage);
  };

  // Verify partner email
  useEffect(() => {
    const verifyPartner = async () => {
      if (!partnerEmail || partnerEmail === userEmail) {
        setIsPartnerValid(false);
        setPartnerName('');
        return;
      }

      try {
        setIsLoading(true);
        const response = await axios.post('/api/investment/user', { 
          email: partnerEmail 
        });

        if (response.data.success) {
          setIsPartnerValid(true);
          setPartnerName(response.data.user.name);
        } else {
          setIsPartnerValid(false);
          setPartnerName('');
        }
      } catch (error) {
        console.error('Error verifying partner:', error);
        setIsPartnerValid(false);
        setPartnerName('');
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the verification
    const timer = setTimeout(() => {
      if (partnerEmail && investmentType === 'joint') {
        verifyPartner();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [partnerEmail, userEmail, investmentType]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate form
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const amountValue = parseFloat(amount);

    if (amountValue > userBalance) {
      setError('Insufficient balance');
      return;
    }

    if (investmentType === 'joint') {
      if (!partnerEmail) {
        setError('Please enter partner email');
        return;
      }

      if (!isPartnerValid) {
        setError('Invalid partner email');
        return;
      }

      const initiatorAmount = (amountValue * initiatorPercentage) / 100;
      if (initiatorAmount > userBalance) {
        setError('Your contribution exceeds your available balance');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      
      const response = await axios.post('/api/investment', {
        investmentType,
        amount: amountValue,
        duration,
        email: userEmail,
        partnerEmail: investmentType === 'joint' ? partnerEmail : null,
        initiatorPercentage,
        partnerPercentage
      });

      if (response.data.success) {
        setSuccess('Investment created successfully');
        
        // Reset form
        setAmount('');
        setPartnerEmail('');
        setInvestmentType('sole');
        setDuration('3 months');
        setPartnerPercentage(50);
        setInitiatorPercentage(50);
        
        // Close modal after a short delay
        setTimeout(() => {
          onClose();
          setSuccess('');
        }, 1500);
      } else {
        setError(response.data.message || 'Failed to create investment');
      }
    } catch (error) {
      console.error('Error creating investment:', error);
      setError(error.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setAmount('');
    setPartnerEmail('');
    setInvestmentType('sole');
    setDuration('3 months');
    setPartnerPercentage(50);
    setInitiatorPercentage(50);
    setError('');
    setSuccess('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Investment</DialogTitle>
          <DialogDescription>
            Grow your assets with our investment plans
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900">
                <Check className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="investmentType">Investment Type</Label>
              <RadioGroup
                id="investmentType"
                value={investmentType}
                onValueChange={setInvestmentType}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sole" id="sole" />
                  <Label htmlFor="sole">Sole Investment</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="joint" id="joint" />
                  <Label htmlFor="joint">Joint Investment</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">
                Amount (Available: {formatCurrency(userBalance)})
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                step="0.01"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <RadioGroup
                id="duration"
                value={duration}
                onValueChange={setDuration}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3 months" id="3months" />
                  <Label htmlFor="3months">3 Months (15% ROI)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="6 months" id="6months" />
                  <Label htmlFor="6months">6 Months (30% ROI)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1 year" id="1year" />
                  <Label htmlFor="1year">1 Year (65% ROI)</Label>
                </div>
              </RadioGroup>
            </div>
            
            {investmentType === 'joint' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="partnerEmail">Partner Email</Label>
                  <div className="relative">
                    <Input
                      id="partnerEmail"
                      type="email"
                      placeholder="Enter partner's email"
                      value={partnerEmail}
                      onChange={(e) => setPartnerEmail(e.target.value)}
                      className={`${
                        partnerEmail && isPartnerValid !== null
                          ? isPartnerValid
                            ? 'border-green-500 focus-visible:ring-green-500'
                            : 'border-red-500 focus-visible:ring-red-500'
                          : ''
                      }`}
                    />
                    {isLoading && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  {partnerEmail && isPartnerValid && (
                    <p className="text-sm text-green-600">Partner: {partnerName}</p>
                  )}
                  {partnerEmail && isPartnerValid === false && (
                    <p className="text-sm text-red-500">User not found</p>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Label>Contribution Split</Label>
                    <span className="text-sm text-muted-foreground">
                      You: {initiatorPercentage}% | Partner: {partnerPercentage}%
                    </span>
                  </div>
                  <Slider
                    defaultValue={[50]}
                    max={90}
                    min={10}
                    step={5}
                    value={[partnerPercentage]}
                    onValueChange={handlePercentageChange}
                  />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Your contribution:</p>
                      <p className="font-medium">
                        {formatCurrency(parseFloat(amount || 0) * (initiatorPercentage / 100))}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Partner contribution:</p>
                      <p className="font-medium">
                        {formatCurrency(parseFloat(amount || 0) * (partnerPercentage / 100))}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Investment Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Investment Amount:</span>
                    <span>{formatCurrency(parseFloat(amount))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ROI:</span>
                    <span>{calculateRoi() * 100}%</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Expected Return:</span>
                    <span className="text-green-600 dark:text-green-400">
                      {formatCurrency(calculateExpectedReturn())}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting || (investmentType === 'joint' && !isPartnerValid)}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing
                </>
              ) : (
                'Create Investment'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 