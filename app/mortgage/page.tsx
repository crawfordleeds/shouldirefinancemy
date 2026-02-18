"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Script from "next/script";
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
  currentPMI: number;
  newPMI: number;
}

function calculateRefinance(
  loanBalance: number,
  homeValue: number,
  currentRate: number,
  monthsRemaining: number,
  newRate: number,
  newTermMonths: number,
  closingCosts: number
): RefinanceResult {
  // Calculate LTV for PMI
  const currentLTV = (loanBalance / homeValue) * 100;
  const currentPMI = currentLTV > 80 ? (loanBalance * 0.005) / 12 : 0; // ~0.5% annual PMI

  // Calculate current loan details
  const currentMonthlyRate = currentRate / 100 / 12;
  const currentPrincipalInterest =
    (loanBalance * currentMonthlyRate * Math.pow(1 + currentMonthlyRate, monthsRemaining)) /
    (Math.pow(1 + currentMonthlyRate, monthsRemaining) - 1);
  const currentMonthlyPayment = currentPrincipalInterest + currentPMI;
  const currentTotalPayments = currentPrincipalInterest * monthsRemaining;
  const currentTotalInterest = currentTotalPayments - loanBalance;

  // Calculate new loan details
  const newLoanAmount = loanBalance; // Don't roll in closing costs for mortgage comparison
  const newLTV = (newLoanAmount / homeValue) * 100;
  const newPMI = newLTV > 80 ? (newLoanAmount * 0.005) / 12 : 0;
  
  const newMonthlyRate = newRate / 100 / 12;
  const newPrincipalInterest =
    (newLoanAmount * newMonthlyRate * Math.pow(1 + newMonthlyRate, newTermMonths)) /
    (Math.pow(1 + newMonthlyRate, newTermMonths) - 1);
  const newMonthlyPayment = newPrincipalInterest + newPMI;
  const newTotalPayments = newPrincipalInterest * newTermMonths;
  const newTotalInterest = newTotalPayments - newLoanAmount;

  // Calculate savings
  const monthlyPaymentChange = currentMonthlyPayment - newMonthlyPayment;
  const totalInterestSavings = currentTotalInterest - newTotalInterest;
  const netSavings = totalInterestSavings - closingCosts;

  // Break-even calculation
  const breakEvenMonths = monthlyPaymentChange > 0 ? Math.ceil(closingCosts / monthlyPaymentChange) : Infinity;

  // Decision logic for mortgages
  const reasons: string[] = [];
  let shouldRefinance: boolean | null = null;
  let confidence: "high" | "medium" | "low" = "medium";

  const rateDifference = currentRate - newRate;

  // Mortgages typically need at least 0.5-1% rate drop due to high closing costs
  if (netSavings > 5000 && rateDifference >= 0.75 && breakEvenMonths <= 36) {
    shouldRefinance = true;
    confidence = "high";
    reasons.push(`You'll save ${formatCurrency(netSavings)} over the life of the loan`);
    reasons.push(`Rate drops ${rateDifference.toFixed(2)}% (${currentRate}% → ${newRate}%)`);
    reasons.push(`Break-even in ${breakEvenMonths} months — well within typical ownership period`);
  } else if (netSavings > 2000 && rateDifference >= 0.5 && breakEvenMonths <= 48) {
    shouldRefinance = true;
    confidence = "medium";
    reasons.push(`You'll save ${formatCurrency(netSavings)} over the life of the loan`);
    reasons.push(`Break-even in ${breakEvenMonths} months`);
    if (currentPMI > 0 && newPMI === 0) {
      reasons.push(`Bonus: You'll eliminate PMI (${formatCurrency(currentPMI * 12)}/year savings)`);
    }
  } else if (netSavings > 0 && breakEvenMonths < monthsRemaining / 3) {
    shouldRefinance = true;
    confidence = "low";
    reasons.push(`Modest savings of ${formatCurrency(netSavings)}, but reasonable break-even`);
    reasons.push("Consider if you plan to stay in the home long-term");
  } else if (netSavings <= 0) {
    shouldRefinance = false;
    confidence = "high";
    reasons.push("Closing costs exceed your potential savings");
    reasons.push(`Closing costs: ${formatCurrency(closingCosts)} vs Interest savings: ${formatCurrency(totalInterestSavings)}`);
  } else if (breakEvenMonths >= 60) {
    shouldRefinance = false;
    confidence = "medium";
    reasons.push(`Break-even period too long: ${breakEvenMonths} months (${(breakEvenMonths / 12).toFixed(1)} years)`);
    reasons.push("Only refinance if you're certain you'll stay that long");
  } else if (rateDifference < 0.5) {
    shouldRefinance = false;
    confidence = "medium";
    reasons.push("Rate difference is too small for a mortgage refinance");
    reasons.push("Generally need at least 0.5-0.75% rate reduction to justify closing costs");
  } else {
    shouldRefinance = null;
    confidence = "low";
    reasons.push("This is a borderline case");
    reasons.push("Consider how long you plan to stay in the home");
  }

  // PMI considerations
  if (currentPMI > 0 && newPMI === 0) {
    reasons.push(`✓ Good news: Refinancing eliminates your PMI`);
  } else if (currentPMI === 0 && newPMI > 0) {
    reasons.push(`⚠️ Warning: This would add PMI to your payment`);
  }

  // Term extension warning
  if (shouldRefinance && newTermMonths > monthsRemaining + 12) {
    reasons.push(`⚠️ Note: New term extends your payoff by ${Math.round((newTermMonths - monthsRemaining) / 12)} years`);
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
    currentPMI,
    newPMI,
  };
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "When should I refinance my mortgage?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Generally, refinancing makes sense when you can lower your rate by at least 0.5-0.75%, your break-even point is within 3-4 years, and you plan to stay in the home long enough to recoup closing costs."
      }
    },
    {
      "@type": "Question",
      "name": "How much does it cost to refinance a mortgage?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Mortgage refinance closing costs typically range from 2-5% of the loan amount. For a $300,000 loan, expect $6,000-$15,000 in closing costs."
      }
    },
    {
      "@type": "Question",
      "name": "What is a good mortgage refinance rate?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A good refinance rate is one that's at least 0.5-0.75% lower than your current rate. The exact rate depends on market conditions, your credit score, and loan-to-value ratio."
      }
    },
    {
      "@type": "Question",
      "name": "Can I refinance to remove PMI?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! If your home has appreciated and your loan-to-value ratio is now below 80%, refinancing can eliminate PMI. This calculator factors in PMI savings automatically."
      }
    }
  ]
};

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Mortgage Refinance Calculator",
  "url": "https://shouldirefinancemy.com/mortgage",
  "description": "Calculate whether you should refinance your mortgage with a clear YES or NO recommendation",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Any",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
};

export default function MortgageRefinancePage() {
  const [loanBalance, setLoanBalance] = useState<string>("300000");
  const [homeValue, setHomeValue] = useState<string>("400000");
  const [currentRate, setCurrentRate] = useState<string>("7.5");
  const [monthsRemaining, setMonthsRemaining] = useState<string>("300");
  const [newRate, setNewRate] = useState<string>("6.5");
  const [newTermMonths, setNewTermMonths] = useState<string>("360");
  const [closingCosts, setClosingCosts] = useState<string>("9000");
  const [showResult, setShowResult] = useState(false);

  const result = useMemo(() => {
    const balance = parseFloat(loanBalance) || 0;
    const home = parseFloat(homeValue) || 0;
    const curRate = parseFloat(currentRate) || 0;
    const remaining = parseInt(monthsRemaining) || 0;
    const nRate = parseFloat(newRate) || 0;
    const newTerm = parseInt(newTermMonths) || 0;
    const costs = parseFloat(closingCosts) || 0;

    if (balance > 0 && home > 0 && curRate > 0 && remaining > 0 && nRate > 0 && newTerm > 0) {
      return calculateRefinance(balance, home, curRate, remaining, nRate, newTerm, costs);
    }
    return null;
  }, [loanBalance, homeValue, currentRate, monthsRemaining, newRate, newTermMonths, closingCosts]);

  const handleCalculate = () => {
    setShowResult(true);
  };

  // Auto-calculate closing costs as 3% of loan when balance changes
  const handleBalanceChange = (value: string) => {
    setLoanBalance(value);
    const balance = parseFloat(value) || 0;
    if (balance > 0) {
      setClosingCosts(Math.round(balance * 0.03).toString());
    }
  };

  return (
    <>
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Script
        id="webapp-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
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
              Should I Refinance My Mortgage?
            </h1>
            <p className="text-lg text-muted-foreground">
              Enter your mortgage details and get a clear answer with savings breakdown
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Input Form */}
            <Card>
              <CardHeader>
                <CardTitle>Your Current Mortgage</CardTitle>
                <CardDescription>Enter your existing home loan details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="loanBalance">Current Loan Balance ($)</Label>
                  <Input
                    id="loanBalance"
                    type="number"
                    value={loanBalance}
                    onChange={(e) => handleBalanceChange(e.target.value)}
                    placeholder="300000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="homeValue">Current Home Value ($)</Label>
                  <Input
                    id="homeValue"
                    type="number"
                    value={homeValue}
                    onChange={(e) => setHomeValue(e.target.value)}
                    placeholder="400000"
                  />
                  <p className="text-xs text-muted-foreground">
                    Used to calculate loan-to-value ratio for PMI
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentRate">Current Interest Rate (%)</Label>
                  <Input
                    id="currentRate"
                    type="number"
                    step="0.125"
                    value={currentRate}
                    onChange={(e) => setCurrentRate(e.target.value)}
                    placeholder="7.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthsRemaining">Months Remaining</Label>
                  <Input
                    id="monthsRemaining"
                    type="number"
                    value={monthsRemaining}
                    onChange={(e) => setMonthsRemaining(e.target.value)}
                    placeholder="300"
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
                    step="0.125"
                    value={newRate}
                    onChange={(e) => setNewRate(e.target.value)}
                    placeholder="6.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newTermMonths">New Loan Term (months)</Label>
                  <Input
                    id="newTermMonths"
                    type="number"
                    value={newTermMonths}
                    onChange={(e) => setNewTermMonths(e.target.value)}
                    placeholder="360"
                  />
                  <p className="text-xs text-muted-foreground">
                    Common terms: 180 (15yr), 240 (20yr), 360 (30yr)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="closingCosts">Estimated Closing Costs ($)</Label>
                  <Input
                    id="closingCosts"
                    type="number"
                    value={closingCosts}
                    onChange={(e) => setClosingCosts(e.target.value)}
                    placeholder="9000"
                  />
                  <p className="text-xs text-muted-foreground">
                    Typically 2-5% of loan amount. Includes appraisal, title, origination fees.
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
                            {result.currentPMI > 0 && (
                              <p className="text-xs text-muted-foreground">
                                (includes {formatCurrency(result.currentPMI)} PMI)
                              </p>
                            )}
                          </div>
                          <div>
                            <p className="text-muted-foreground">New Payment</p>
                            <p className="text-lg font-semibold">
                              {formatCurrencyPrecise(result.newMonthlyPayment)}/mo
                            </p>
                            {result.newPMI > 0 && (
                              <p className="text-xs text-muted-foreground">
                                (includes {formatCurrency(result.newPMI)} PMI)
                              </p>
                            )}
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
                            <p className="text-muted-foreground">Net Savings (after costs)</p>
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
                    <p>Enter your mortgage details and click &quot;Should I Refinance?&quot; to see your personalized recommendation.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* FAQ Section */}
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">When should I refinance my mortgage?</h3>
                <p className="text-muted-foreground">
                  Generally, refinancing makes sense when you can lower your rate by at least 0.5-0.75%, 
                  your break-even point is within 3-4 years, and you plan to stay in the home long enough 
                  to recoup closing costs.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">How much does it cost to refinance a mortgage?</h3>
                <p className="text-muted-foreground">
                  Mortgage refinance closing costs typically range from 2-5% of the loan amount. 
                  For a $300,000 loan, expect $6,000-$15,000 in closing costs.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">What is a good mortgage refinance rate?</h3>
                <p className="text-muted-foreground">
                  A good refinance rate is one that&apos;s at least 0.5-0.75% lower than your current rate. 
                  The exact rate depends on market conditions, your credit score, and loan-to-value ratio.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Can I refinance to remove PMI?</h3>
                <p className="text-muted-foreground">
                  Yes! If your home has appreciated and your loan-to-value ratio is now below 80%, 
                  refinancing can eliminate PMI. This calculator factors in PMI savings automatically.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
