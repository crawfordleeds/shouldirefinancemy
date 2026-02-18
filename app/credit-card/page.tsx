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

interface BalanceTransferResult {
  shouldTransfer: boolean | null;
  confidence: "high" | "medium" | "low";
  currentMonthlyPayment: number;
  transferFeeAmount: number;
  interestDuringPromo: number;
  interestAfterPromo: number;
  totalInterestWithTransfer: number;
  totalInterestWithoutTransfer: number;
  totalSavings: number;
  monthsToPayoff: number;
  canPayOffInPromo: boolean;
  reasons: string[];
}

function calculateBalanceTransfer(
  balance: number,
  currentAPR: number,
  transferAPR: number,
  transferFeePercent: number,
  promoMonths: number,
  monthlyPayment: number
): BalanceTransferResult {
  const transferFeeAmount = balance * (transferFeePercent / 100);
  const totalTransferCost = balance + transferFeeAmount;
  
  // Calculate payoff without balance transfer
  const currentMonthlyRate = currentAPR / 100 / 12;
  let remainingBalance = balance;
  let totalInterestWithoutTransfer = 0;
  let monthsWithoutTransfer = 0;
  
  while (remainingBalance > 0 && monthsWithoutTransfer < 360) {
    const monthlyInterest = remainingBalance * currentMonthlyRate;
    const principal = Math.min(monthlyPayment - monthlyInterest, remainingBalance);
    
    if (principal <= 0) {
      // Payment doesn't cover interest
      monthsWithoutTransfer = Infinity;
      totalInterestWithoutTransfer = Infinity;
      break;
    }
    
    totalInterestWithoutTransfer += monthlyInterest;
    remainingBalance -= principal;
    monthsWithoutTransfer++;
  }
  
  // Calculate payoff with balance transfer
  const promoMonthlyRate = transferAPR / 100 / 12;
  let transferBalance = totalTransferCost;
  let interestDuringPromo = 0;
  let monthsInPromo = 0;
  
  // During promo period
  while (transferBalance > 0 && monthsInPromo < promoMonths) {
    const monthlyInterest = transferBalance * promoMonthlyRate;
    const principal = Math.min(monthlyPayment - monthlyInterest, transferBalance);
    
    if (principal <= 0) break;
    
    interestDuringPromo += monthlyInterest;
    transferBalance -= principal;
    monthsInPromo++;
  }
  
  const canPayOffInPromo = transferBalance <= 0;
  
  // After promo period (revert to similar high APR or slightly lower)
  const postPromoAPR = Math.max(currentAPR - 2, 15); // Assume slightly lower or same
  const postPromoMonthlyRate = postPromoAPR / 100 / 12;
  let interestAfterPromo = 0;
  let monthsAfterPromo = 0;
  
  while (transferBalance > 0 && monthsAfterPromo < 360) {
    const monthlyInterest = transferBalance * postPromoMonthlyRate;
    const principal = Math.min(monthlyPayment - monthlyInterest, transferBalance);
    
    if (principal <= 0) break;
    
    interestAfterPromo += monthlyInterest;
    transferBalance -= principal;
    monthsAfterPromo++;
  }
  
  const totalInterestWithTransfer = transferFeeAmount + interestDuringPromo + interestAfterPromo;
  const totalSavings = totalInterestWithoutTransfer - totalInterestWithTransfer;
  const monthsToPayoff = monthsInPromo + monthsAfterPromo;
  
  // Decision logic
  const reasons: string[] = [];
  let shouldTransfer: boolean | null = null;
  let confidence: "high" | "medium" | "low" = "medium";
  
  if (totalInterestWithoutTransfer === Infinity) {
    shouldTransfer = null;
    confidence = "low";
    reasons.push("⚠️ Your monthly payment doesn't cover the interest");
    reasons.push("You need to increase your monthly payment first");
  } else if (canPayOffInPromo && totalSavings > 100) {
    shouldTransfer = true;
    confidence = "high";
    reasons.push(`You can pay off the balance during the ${promoMonths}-month promo period`);
    reasons.push(`You'll save ${formatCurrency(totalSavings)} in interest`);
    reasons.push(`Transfer fee of ${formatCurrency(transferFeeAmount)} is worth it`);
  } else if (totalSavings > 200 && !canPayOffInPromo) {
    shouldTransfer = true;
    confidence = "medium";
    reasons.push(`You'll save ${formatCurrency(totalSavings)} even with remaining balance after promo`);
    reasons.push(`⚠️ You'll have ${formatCurrency(transferBalance)} remaining after promo period`);
    reasons.push("Try to pay more during the promo period if possible");
  } else if (totalSavings > 50 && canPayOffInPromo) {
    shouldTransfer = true;
    confidence = "low";
    reasons.push(`Small savings of ${formatCurrency(totalSavings)}, but you'll be debt-free sooner`);
  } else if (totalSavings <= 0) {
    shouldTransfer = false;
    confidence = "high";
    reasons.push("The balance transfer fee negates any interest savings");
    reasons.push(`Fee: ${formatCurrency(transferFeeAmount)} vs Potential savings: ${formatCurrency(totalInterestWithoutTransfer - interestDuringPromo - interestAfterPromo)}`);
  } else if (transferFeePercent >= 5 && !canPayOffInPromo) {
    shouldTransfer = false;
    confidence = "medium";
    reasons.push("High transfer fee and you can't pay off during promo period");
    reasons.push("Consider a card with a lower transfer fee instead");
  } else {
    shouldTransfer = null;
    confidence = "low";
    reasons.push("This is a borderline case");
    reasons.push("Savings are modest — consider if the hassle is worth it");
  }
  
  // Additional tips
  if (shouldTransfer === true || shouldTransfer === null) {
    if (promoMonths >= 12 && transferAPR === 0) {
      reasons.push("💡 Tip: 0% APR offers are excellent — maximize payments during promo");
    }
    if (!canPayOffInPromo) {
      const neededPayment = totalTransferCost / promoMonths;
      reasons.push(`💡 To pay off in promo: pay ${formatCurrencyPrecise(neededPayment)}/month`);
    }
  }
  
  return {
    shouldTransfer,
    confidence,
    currentMonthlyPayment: monthlyPayment,
    transferFeeAmount,
    interestDuringPromo,
    interestAfterPromo,
    totalInterestWithTransfer,
    totalInterestWithoutTransfer: totalInterestWithoutTransfer === Infinity ? 0 : totalInterestWithoutTransfer,
    totalSavings: totalSavings === Infinity ? 0 : totalSavings,
    monthsToPayoff,
    canPayOffInPromo,
    reasons,
  };
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is a balance transfer worth it?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A balance transfer is worth it if you can pay off most or all of the balance during the promotional 0% APR period, and the transfer fee is less than the interest you'd otherwise pay."
      }
    },
    {
      "@type": "Question",
      "name": "What is a typical balance transfer fee?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Balance transfer fees typically range from 3-5% of the transferred amount. Some cards occasionally offer no-fee transfers as promotional offers."
      }
    },
    {
      "@type": "Question",
      "name": "How long are 0% APR balance transfer offers?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Promotional 0% APR periods typically last 12-21 months. The best offers provide 18-21 months of 0% interest."
      }
    },
    {
      "@type": "Question",
      "name": "What happens after the balance transfer promo period ends?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "After the promotional period, any remaining balance will accrue interest at the card's regular APR, which is typically 15-25%. This is why it's important to pay off as much as possible during the promo period."
      }
    }
  ]
};

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Balance Transfer Calculator",
  "url": "https://shouldirefinancemy.com/credit-card",
  "description": "Calculate whether a credit card balance transfer is worth it with a clear YES or NO recommendation",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Any",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
};

export default function CreditCardBalanceTransferPage() {
  const [balance, setBalance] = useState<string>("5000");
  const [currentAPR, setCurrentAPR] = useState<string>("22");
  const [transferAPR, setTransferAPR] = useState<string>("0");
  const [transferFee, setTransferFee] = useState<string>("3");
  const [promoMonths, setPromoMonths] = useState<string>("18");
  const [monthlyPayment, setMonthlyPayment] = useState<string>("200");
  const [showResult, setShowResult] = useState(false);

  const result = useMemo(() => {
    const bal = parseFloat(balance) || 0;
    const curAPR = parseFloat(currentAPR) || 0;
    const transAPR = parseFloat(transferAPR) || 0;
    const fee = parseFloat(transferFee) || 0;
    const promo = parseInt(promoMonths) || 0;
    const payment = parseFloat(monthlyPayment) || 0;

    if (bal > 0 && curAPR > 0 && promo > 0 && payment > 0) {
      return calculateBalanceTransfer(bal, curAPR, transAPR, fee, promo, payment);
    }
    return null;
  }, [balance, currentAPR, transferAPR, transferFee, promoMonths, monthlyPayment]);

  const handleCalculate = () => {
    setShowResult(true);
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
              Should I Do a Balance Transfer?
            </h1>
            <p className="text-lg text-muted-foreground">
              See if transferring your credit card balance will save you money
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Input Form */}
            <Card>
              <CardHeader>
                <CardTitle>Your Current Credit Card</CardTitle>
                <CardDescription>Enter your existing balance and rate</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="balance">Current Balance ($)</Label>
                  <Input
                    id="balance"
                    type="number"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    placeholder="5000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentAPR">Current APR (%)</Label>
                  <Input
                    id="currentAPR"
                    type="number"
                    step="0.1"
                    value={currentAPR}
                    onChange={(e) => setCurrentAPR(e.target.value)}
                    placeholder="22"
                  />
                  <p className="text-xs text-muted-foreground">
                    Check your statement for your current APR
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyPayment">Monthly Payment You Can Make ($)</Label>
                  <Input
                    id="monthlyPayment"
                    type="number"
                    value={monthlyPayment}
                    onChange={(e) => setMonthlyPayment(e.target.value)}
                    placeholder="200"
                  />
                </div>
              </CardContent>

              <CardHeader className="pt-0">
                <CardTitle>Balance Transfer Offer</CardTitle>
                <CardDescription>Enter the transfer card details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="transferAPR">Promotional APR (%)</Label>
                  <Input
                    id="transferAPR"
                    type="number"
                    step="0.1"
                    value={transferAPR}
                    onChange={(e) => setTransferAPR(e.target.value)}
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground">
                    Usually 0% for promotional period
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transferFee">Balance Transfer Fee (%)</Label>
                  <Input
                    id="transferFee"
                    type="number"
                    step="0.1"
                    value={transferFee}
                    onChange={(e) => setTransferFee(e.target.value)}
                    placeholder="3"
                  />
                  <p className="text-xs text-muted-foreground">
                    Typically 3-5% of the transferred amount
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="promoMonths">Promotional Period (months)</Label>
                  <Input
                    id="promoMonths"
                    type="number"
                    value={promoMonths}
                    onChange={(e) => setPromoMonths(e.target.value)}
                    placeholder="18"
                  />
                  <p className="text-xs text-muted-foreground">
                    Common periods: 12, 15, 18, or 21 months
                  </p>
                </div>

                <Button onClick={handleCalculate} className="w-full mt-4" size="lg">
                  Should I Transfer?
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            <div className="space-y-6">
              {showResult && result && (
                <>
                  {/* Main Decision */}
                  <Card className={`border-2 ${
                    result.shouldTransfer === true 
                      ? "border-green-500 bg-green-50 dark:bg-green-950/20" 
                      : result.shouldTransfer === false
                      ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                      : "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20"
                  }`}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        {result.shouldTransfer === true ? (
                          <CheckCircle2 className="h-12 w-12 text-green-600" />
                        ) : result.shouldTransfer === false ? (
                          <XCircle className="h-12 w-12 text-red-600" />
                        ) : (
                          <AlertCircle className="h-12 w-12 text-yellow-600" />
                        )}
                        <div>
                          <h2 className="text-2xl font-bold">
                            {result.shouldTransfer === true 
                              ? "YES, Transfer" 
                              : result.shouldTransfer === false
                              ? "NO, Don't Transfer"
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
                            <p className="text-muted-foreground">Transfer Fee</p>
                            <p className="text-lg font-semibold">
                              {formatCurrency(result.transferFeeAmount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Payoff Timeline</p>
                            <p className="text-lg font-semibold">
                              {result.monthsToPayoff} months
                            </p>
                          </div>
                        </div>

                        <hr />

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Interest (Current Card)</p>
                            <p className="text-lg font-semibold text-red-600">
                              {formatCurrency(result.totalInterestWithoutTransfer)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Total Cost (Transfer)</p>
                            <p className="text-lg font-semibold">
                              {formatCurrency(result.totalInterestWithTransfer)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              (fee + interest)
                            </p>
                          </div>
                        </div>

                        <hr />

                        <div className="text-center">
                          <p className="text-muted-foreground">Total Savings</p>
                          <p className={`text-2xl font-bold ${
                            result.totalSavings > 0 ? "text-green-600" : "text-red-600"
                          }`}>
                            {formatCurrency(result.totalSavings)}
                          </p>
                          {result.canPayOffInPromo && (
                            <p className="text-sm text-green-600 mt-1">
                              ✓ Payoff during promo period
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {!showResult && (
                <Card className="border-dashed">
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    <p>Enter your credit card details and click &quot;Should I Transfer?&quot; to see your personalized recommendation.</p>
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
                <h3 className="font-semibold mb-2">Is a balance transfer worth it?</h3>
                <p className="text-muted-foreground">
                  A balance transfer is worth it if you can pay off most or all of the balance during 
                  the promotional 0% APR period, and the transfer fee is less than the interest you&apos;d 
                  otherwise pay.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">What is a typical balance transfer fee?</h3>
                <p className="text-muted-foreground">
                  Balance transfer fees typically range from 3-5% of the transferred amount. Some cards 
                  occasionally offer no-fee transfers as promotional offers.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">How long are 0% APR balance transfer offers?</h3>
                <p className="text-muted-foreground">
                  Promotional 0% APR periods typically last 12-21 months. The best offers provide 
                  18-21 months of 0% interest.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">What happens after the balance transfer promo period ends?</h3>
                <p className="text-muted-foreground">
                  After the promotional period, any remaining balance will accrue interest at the card&apos;s 
                  regular APR, which is typically 15-25%. This is why it&apos;s important to pay off as much 
                  as possible during the promo period.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
