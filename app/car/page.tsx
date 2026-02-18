"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatCurrencyPrecise } from "@/lib/utils";
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface RefinanceResult {
  shouldRefinance: boolean | null;
  confidence: "high" | "medium" | "low";
  currentMonthlyPayment: number;
  newMonthlyPayment: number;
  monthlyPaymentChange: number;
  currentTotalInterest: number;
  newTotalInterest: number;
  totalInterestSavings: number;
  breakEvenMonths: number;
  netSavings: number;
  reasons: string[];
}

function calculateRefinance(
  loanBalance: number,
  currentRate: number,
  monthsRemaining: number,
  newRate: number,
  newTermMonths: number,
  refinanceFees: number
): RefinanceResult {
  // Calculate current loan details
  const currentMonthlyRate = currentRate / 100 / 12;
  const currentMonthlyPayment =
    (loanBalance * currentMonthlyRate * Math.pow(1 + currentMonthlyRate, monthsRemaining)) /
    (Math.pow(1 + currentMonthlyRate, monthsRemaining) - 1);
  const currentTotalPayments = currentMonthlyPayment * monthsRemaining;
  const currentTotalInterest = currentTotalPayments - loanBalance;

  // Calculate new loan details (balance + fees)
  const newLoanAmount = loanBalance + refinanceFees;
  const newMonthlyRate = newRate / 100 / 12;
  const newMonthlyPayment =
    (newLoanAmount * newMonthlyRate * Math.pow(1 + newMonthlyRate, newTermMonths)) /
    (Math.pow(1 + newMonthlyRate, newTermMonths) - 1);
  const newTotalPayments = newMonthlyPayment * newTermMonths;
  const newTotalInterest = newTotalPayments - newLoanAmount;

  // Calculate savings
  const monthlyPaymentChange = currentMonthlyPayment - newMonthlyPayment;
  const totalInterestSavings = currentTotalInterest - newTotalInterest;
  const netSavings = totalInterestSavings - refinanceFees;

  // Break-even calculation (months until fees are recovered through monthly savings)
  const breakEvenMonths = monthlyPaymentChange > 0 ? Math.ceil(refinanceFees / monthlyPaymentChange) : Infinity;

  // Decision logic
  const reasons: string[] = [];
  let shouldRefinance: boolean | null = null;
  let confidence: "high" | "medium" | "low" = "medium";

  const rateDifference = currentRate - newRate;

  if (netSavings > 500 && rateDifference >= 1) {
    shouldRefinance = true;
    confidence = "high";
    reasons.push(`You'll save ${formatCurrency(netSavings)} over the life of the loan`);
    reasons.push(`Rate drops ${rateDifference.toFixed(2)}% (${currentRate}% → ${newRate}%)`);
  } else if (netSavings > 200 && rateDifference >= 0.5) {
    shouldRefinance = true;
    confidence = "medium";
    reasons.push(`You'll save ${formatCurrency(netSavings)} over the life of the loan`);
    if (breakEvenMonths < monthsRemaining) {
      reasons.push(`You'll break even in ${breakEvenMonths} months`);
    }
  } else if (netSavings > 0 && breakEvenMonths < monthsRemaining / 2) {
    shouldRefinance = true;
    confidence = "low";
    reasons.push(`Small savings of ${formatCurrency(netSavings)}, but quick break-even`);
  } else if (netSavings <= 0) {
    shouldRefinance = false;
    confidence = "high";
    reasons.push("Refinancing would cost you more than you'd save");
    if (refinanceFees > totalInterestSavings) {
      reasons.push(`Fees (${formatCurrency(refinanceFees)}) exceed interest savings`);
    }
  } else if (breakEvenMonths >= monthsRemaining) {
    shouldRefinance = false;
    confidence = "high";
    reasons.push("You won't break even before the loan ends");
    reasons.push(`Break-even: ${breakEvenMonths} months, but only ${monthsRemaining} months left`);
  } else if (rateDifference < 0.5) {
    shouldRefinance = false;
    confidence = "medium";
    reasons.push("Rate difference is too small to justify refinancing");
    reasons.push("Generally need at least 0.5% rate reduction");
  } else {
    shouldRefinance = null;
    confidence = "low";
    reasons.push("This is a borderline case — consider your personal situation");
  }

  // Add context
  if (shouldRefinance && newTermMonths > monthsRemaining) {
    reasons.push(`⚠️ Note: New term is longer (${newTermMonths} vs ${monthsRemaining} months)`);
  }

  return {
    shouldRefinance,
    confidence,
    currentMonthlyPayment,
    newMonthlyPayment,
    monthlyPaymentChange,
    currentTotalInterest,
    newTotalInterest,
    totalInterestSavings,
    breakEvenMonths: breakEvenMonths === Infinity ? 0 : breakEvenMonths,
    netSavings,
    reasons,
  };
}

export default function CarRefinancePage() {
  const [loanBalance, setLoanBalance] = useState<string>("15000");
  const [currentRate, setCurrentRate] = useState<string>("8.5");
  const [monthsRemaining, setMonthsRemaining] = useState<string>("36");
  const [newRate, setNewRate] = useState<string>("5.5");
  const [newTermMonths, setNewTermMonths] = useState<string>("36");
  const [refinanceFees, setRefinanceFees] = useState<string>("250");
  const [showResult, setShowResult] = useState(false);

  const result = useMemo(() => {
    const balance = parseFloat(loanBalance) || 0;
    const curRate = parseFloat(currentRate) || 0;
    const remaining = parseInt(monthsRemaining) || 0;
    const nRate = parseFloat(newRate) || 0;
    const newTerm = parseInt(newTermMonths) || 0;
    const fees = parseFloat(refinanceFees) || 0;

    if (balance > 0 && curRate > 0 && remaining > 0 && nRate > 0 && newTerm > 0) {
      return calculateRefinance(balance, curRate, remaining, nRate, newTerm, fees);
    }
    return null;
  }, [loanBalance, currentRate, monthsRemaining, newRate, newTermMonths, refinanceFees]);

  const handleCalculate = () => {
    setShowResult(true);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to all calculators
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl mb-2">
            Should I Refinance My Car Loan?
          </h1>
          <p className="text-lg text-muted-foreground">
            Enter your loan details and get a clear answer
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle>Your Current Loan</CardTitle>
              <CardDescription>Enter your existing auto loan details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="loanBalance">Current Loan Balance ($)</Label>
                <Input
                  id="loanBalance"
                  type="number"
                  value={loanBalance}
                  onChange={(e) => setLoanBalance(e.target.value)}
                  placeholder="15000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentRate">Current Interest Rate (%)</Label>
                <Input
                  id="currentRate"
                  type="number"
                  step="0.1"
                  value={currentRate}
                  onChange={(e) => setCurrentRate(e.target.value)}
                  placeholder="8.5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthsRemaining">Months Remaining</Label>
                <Input
                  id="monthsRemaining"
                  type="number"
                  value={monthsRemaining}
                  onChange={(e) => setMonthsRemaining(e.target.value)}
                  placeholder="36"
                />
              </div>
            </CardContent>

            <CardHeader className="pt-0">
              <CardTitle>New Loan Offer</CardTitle>
              <CardDescription>Enter the refinance terms you qualify for</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newRate">New Interest Rate (%)</Label>
                <Input
                  id="newRate"
                  type="number"
                  step="0.1"
                  value={newRate}
                  onChange={(e) => setNewRate(e.target.value)}
                  placeholder="5.5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newTermMonths">New Loan Term (months)</Label>
                <Input
                  id="newTermMonths"
                  type="number"
                  value={newTermMonths}
                  onChange={(e) => setNewTermMonths(e.target.value)}
                  placeholder="36"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="refinanceFees">Refinance Fees ($)</Label>
                <Input
                  id="refinanceFees"
                  type="number"
                  value={refinanceFees}
                  onChange={(e) => setRefinanceFees(e.target.value)}
                  placeholder="250"
                />
                <p className="text-xs text-muted-foreground">
                  Typical auto refi fees: $0-$500. Check with your lender.
                </p>
              </div>

              <Button onClick={handleCalculate} className="w-full mt-4" size="lg">
                Should I Refinance?
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="space-y-6">
            {showResult && result && (
              <>
                {/* Main Decision */}
                <Card className={`border-2 ${
                  result.shouldRefinance === true 
                    ? "border-green-500 bg-green-50 dark:bg-green-950/20" 
                    : result.shouldRefinance === false
                    ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                    : "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20"
                }`}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      {result.shouldRefinance === true ? (
                        <CheckCircle2 className="h-12 w-12 text-green-600" />
                      ) : result.shouldRefinance === false ? (
                        <XCircle className="h-12 w-12 text-red-600" />
                      ) : (
                        <AlertCircle className="h-12 w-12 text-yellow-600" />
                      )}
                      <div>
                        <h2 className="text-2xl font-bold">
                          {result.shouldRefinance === true 
                            ? "YES, Refinance" 
                            : result.shouldRefinance === false
                            ? "NO, Don't Refinance"
                            : "It's a Close Call"}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Confidence: {result.confidence}
                        </p>
                      </div>
                    </div>
                    <ul className="mt-4 space-y-2">
                      {result.reasons.map((reason, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="mt-1">•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Detailed Numbers */}
                <Card>
                  <CardHeader>
                    <CardTitle>The Numbers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Current Payment</p>
                          <p className="text-lg font-semibold">
                            {formatCurrencyPrecise(result.currentMonthlyPayment)}/mo
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">New Payment</p>
                          <p className="text-lg font-semibold">
                            {formatCurrencyPrecise(result.newMonthlyPayment)}/mo
                          </p>
                        </div>
                      </div>

                      <hr />

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Monthly Change</p>
                          <p className={`text-lg font-semibold ${
                            result.monthlyPaymentChange > 0 ? "text-green-600" : "text-red-600"
                          }`}>
                            {result.monthlyPaymentChange > 0 ? "-" : "+"}
                            {formatCurrencyPrecise(Math.abs(result.monthlyPaymentChange))}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Break-Even</p>
                          <p className="text-lg font-semibold">
                            {result.breakEvenMonths > 0 
                              ? `${result.breakEvenMonths} months`
                              : "N/A"}
                          </p>
                        </div>
                      </div>

                      <hr />

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Total Interest Savings</p>
                          <p className="text-lg font-semibold">
                            {formatCurrency(result.totalInterestSavings)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Net Savings (after fees)</p>
                          <p className={`text-lg font-semibold ${
                            result.netSavings > 0 ? "text-green-600" : "text-red-600"
                          }`}>
                            {formatCurrency(result.netSavings)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {!showResult && (
              <Card className="border-dashed">
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <p>Enter your loan details and click &quot;Should I Refinance?&quot; to see your personalized recommendation.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
