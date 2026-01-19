"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Currency formatter for USD
const formatUSD = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
};

// Number formatter without currency
const formatNumber = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(amount);
};

interface MortgageCalculatorProps {
  defaultPrice: number;
}

export function MortgageCalculator({ defaultPrice }: MortgageCalculatorProps) {
  const [price, setPrice] = useState(defaultPrice);
  const [downPaymentPercent, setDownPaymentPercent] = useState(25);
  const [interestRate, setInterestRate] = useState(5.5);
  const [termYears, setTermYears] = useState(25);

  // Calculate mortgage details using standard amortization formula
  const calculations = useMemo(() => {
    const principal = price * (1 - downPaymentPercent / 100);
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = termYears * 12;

    // Handle edge case where interest rate is 0
    let monthlyPayment: number;
    if (monthlyRate === 0) {
      monthlyPayment = principal / numPayments;
    } else {
      monthlyPayment =
        (principal *
          (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
        (Math.pow(1 + monthlyRate, numPayments) - 1);
    }

    const totalPayment = monthlyPayment * numPayments;
    const totalInterest = totalPayment - principal;
    const downPayment = price * (downPaymentPercent / 100);

    return {
      principal,
      monthlyPayment,
      totalPayment,
      totalInterest,
      downPayment,
    };
  }, [price, downPaymentPercent, interestRate, termYears]);

  // Handle price input change
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setPrice(Number(value) || 0);
  };

  // Handle interest rate change
  const handleInterestRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 30) {
      setInterestRate(value);
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-6">
      <h3 className="font-semibold">Mortgage Calculator</h3>
      {/* Input Fields */}
      <div className="space-y-4">
        {/* Property Price */}
        <div className="space-y-2">
          <Label htmlFor="price">Property Price</Label>
          <div className="relative">
            <span className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              $
            </span>
            <Input
              id="price"
              type="text"
              value={formatNumber(price)}
              onChange={handlePriceChange}
              className="ps-7"
            />
          </div>
        </div>

        {/* Down Payment */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Down Payment</Label>
            <span className="text-sm text-muted-foreground">
              {downPaymentPercent}% ({formatUSD(calculations.downPayment)})
            </span>
          </div>
          <Slider
            value={[downPaymentPercent]}
            onValueChange={(values) => setDownPaymentPercent(values[0])}
            min={10}
            max={50}
            step={5}
          />
        </div>

        {/* Interest Rate */}
        <div className="space-y-2">
          <Label htmlFor="interestRate">Interest Rate (%)</Label>
          <Input
            id="interestRate"
            type="number"
            value={interestRate}
            onChange={handleInterestRateChange}
            step={0.1}
            min={0}
            max={30}
          />
        </div>

        {/* Loan Term */}
        <div className="space-y-2">
          <Label htmlFor="termYears">Loan Term</Label>
          <Select
            value={termYears.toString()}
            onValueChange={(value) => setTermYears(Number(value))}
          >
            <SelectTrigger id="termYears" className="w-full">
              <SelectValue placeholder="Select term" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 years</SelectItem>
              <SelectItem value="20">20 years</SelectItem>
              <SelectItem value="25">25 years</SelectItem>
              <SelectItem value="30">30 years</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Section */}
      <div className="pt-4 border-t space-y-4">
        {/* Monthly Payment - Prominent */}
        <div className="text-center p-4 bg-primary/10 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Monthly Payment</p>
          <p className="text-3xl font-bold text-primary">
            {formatUSD(calculations.monthlyPayment)}
          </p>
        </div>

        {/* Other metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Loan Amount</p>
            <p className="font-semibold">{formatUSD(calculations.principal)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Interest</p>
            <p className="font-semibold">{formatUSD(calculations.totalInterest)}</p>
          </div>
          <div className="col-span-2 space-y-1">
            <p className="text-sm text-muted-foreground">Total Payment</p>
            <p className="font-semibold">{formatUSD(calculations.totalPayment)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
