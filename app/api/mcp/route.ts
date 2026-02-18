import { NextRequest, NextResponse } from "next/server";

// Types for MCP responses
interface RefinanceResult {
  decision: "yes" | "no" | "maybe";
  confidence: "high" | "medium" | "low";
  reasons: string[];
  savings: number;
  breakEvenMonths: number;
  monthlyPaymentChange: number;
  currentMonthlyPayment: number;
  newMonthlyPayment: number;
}

// Calculation functions
function calculateCarRefinance(
  loanBalance: number,
  currentRate: number,
  monthsRemaining: number,
  newRate: number,
  newTermMonths: number,
  refinanceFees: number
): RefinanceResult {
  const currentMonthlyRate = currentRate / 100 / 12;
  const currentMonthlyPayment =
    (loanBalance * currentMonthlyRate * Math.pow(1 + currentMonthlyRate, monthsRemaining)) /
    (Math.pow(1 + currentMonthlyRate, monthsRemaining) - 1);
  const currentTotalInterest = currentMonthlyPayment * monthsRemaining - loanBalance;

  const newLoanAmount = loanBalance + refinanceFees;
  const newMonthlyRate = newRate / 100 / 12;
  const newMonthlyPayment =
    (newLoanAmount * newMonthlyRate * Math.pow(1 + newMonthlyRate, newTermMonths)) /
    (Math.pow(1 + newMonthlyRate, newTermMonths) - 1);
  const newTotalInterest = newMonthlyPayment * newTermMonths - newLoanAmount;

  const monthlyPaymentChange = currentMonthlyPayment - newMonthlyPayment;
  const totalInterestSavings = currentTotalInterest - newTotalInterest;
  const netSavings = totalInterestSavings - refinanceFees;
  const breakEvenMonths = monthlyPaymentChange > 0 ? Math.ceil(refinanceFees / monthlyPaymentChange) : Infinity;

  const rateDifference = currentRate - newRate;
  const reasons: string[] = [];
  let decision: "yes" | "no" | "maybe" = "maybe";
  let confidence: "high" | "medium" | "low" = "medium";

  if (netSavings > 500 && rateDifference >= 1) {
    decision = "yes";
    confidence = "high";
    reasons.push(`Save $${Math.round(netSavings)} over the life of the loan`);
    reasons.push(`Rate drops ${rateDifference.toFixed(2)}%`);
  } else if (netSavings > 200 && rateDifference >= 0.5) {
    decision = "yes";
    confidence = "medium";
    reasons.push(`Save $${Math.round(netSavings)} over the life of the loan`);
  } else if (netSavings <= 0) {
    decision = "no";
    confidence = "high";
    reasons.push("Refinancing would cost more than you'd save");
  } else if (breakEvenMonths >= monthsRemaining) {
    decision = "no";
    confidence = "high";
    reasons.push("Won't break even before loan ends");
  } else if (rateDifference < 0.5) {
    decision = "no";
    confidence = "medium";
    reasons.push("Rate difference too small");
  }

  return {
    decision,
    confidence,
    reasons,
    savings: Math.round(netSavings),
    breakEvenMonths: breakEvenMonths === Infinity ? 0 : breakEvenMonths,
    monthlyPaymentChange: Math.round(monthlyPaymentChange * 100) / 100,
    currentMonthlyPayment: Math.round(currentMonthlyPayment * 100) / 100,
    newMonthlyPayment: Math.round(newMonthlyPayment * 100) / 100,
  };
}

function calculateMortgageRefinance(
  loanBalance: number,
  homeValue: number,
  currentRate: number,
  monthsRemaining: number,
  newRate: number,
  newTermMonths: number,
  closingCosts: number
): RefinanceResult {
  const currentLTV = (loanBalance / homeValue) * 100;
  const currentPMI = currentLTV > 80 ? (loanBalance * 0.005) / 12 : 0;

  const currentMonthlyRate = currentRate / 100 / 12;
  const currentPrincipalInterest =
    (loanBalance * currentMonthlyRate * Math.pow(1 + currentMonthlyRate, monthsRemaining)) /
    (Math.pow(1 + currentMonthlyRate, monthsRemaining) - 1);
  const currentMonthlyPayment = currentPrincipalInterest + currentPMI;
  const currentTotalInterest = currentPrincipalInterest * monthsRemaining - loanBalance;

  const newLTV = (loanBalance / homeValue) * 100;
  const newPMI = newLTV > 80 ? (loanBalance * 0.005) / 12 : 0;
  const newMonthlyRate = newRate / 100 / 12;
  const newPrincipalInterest =
    (loanBalance * newMonthlyRate * Math.pow(1 + newMonthlyRate, newTermMonths)) /
    (Math.pow(1 + newMonthlyRate, newTermMonths) - 1);
  const newMonthlyPayment = newPrincipalInterest + newPMI;
  const newTotalInterest = newPrincipalInterest * newTermMonths - loanBalance;

  const monthlyPaymentChange = currentMonthlyPayment - newMonthlyPayment;
  const totalInterestSavings = currentTotalInterest - newTotalInterest;
  const netSavings = totalInterestSavings - closingCosts;
  const breakEvenMonths = monthlyPaymentChange > 0 ? Math.ceil(closingCosts / monthlyPaymentChange) : Infinity;

  const rateDifference = currentRate - newRate;
  const reasons: string[] = [];
  let decision: "yes" | "no" | "maybe" = "maybe";
  let confidence: "high" | "medium" | "low" = "medium";

  if (netSavings > 5000 && rateDifference >= 0.75 && breakEvenMonths <= 36) {
    decision = "yes";
    confidence = "high";
    reasons.push(`Save $${Math.round(netSavings)} over the life of the loan`);
    reasons.push(`Break even in ${breakEvenMonths} months`);
  } else if (netSavings > 2000 && rateDifference >= 0.5 && breakEvenMonths <= 48) {
    decision = "yes";
    confidence = "medium";
    reasons.push(`Save $${Math.round(netSavings)} over the life of the loan`);
  } else if (netSavings <= 0) {
    decision = "no";
    confidence = "high";
    reasons.push("Closing costs exceed potential savings");
  } else if (breakEvenMonths >= 60) {
    decision = "no";
    confidence = "medium";
    reasons.push(`Break-even period too long: ${breakEvenMonths} months`);
  } else if (rateDifference < 0.5) {
    decision = "no";
    confidence = "medium";
    reasons.push("Rate difference too small for mortgage refinance");
  }

  return {
    decision,
    confidence,
    reasons,
    savings: Math.round(netSavings),
    breakEvenMonths: breakEvenMonths === Infinity ? 0 : breakEvenMonths,
    monthlyPaymentChange: Math.round(monthlyPaymentChange * 100) / 100,
    currentMonthlyPayment: Math.round(currentMonthlyPayment * 100) / 100,
    newMonthlyPayment: Math.round(newMonthlyPayment * 100) / 100,
  };
}

function calculatePersonalLoanRefinance(
  loanBalance: number,
  currentRate: number,
  monthsRemaining: number,
  newRate: number,
  newTermMonths: number,
  refinanceFees: number
): RefinanceResult {
  // Same logic as car but with different thresholds for personal loans
  const currentMonthlyRate = currentRate / 100 / 12;
  const currentMonthlyPayment =
    (loanBalance * currentMonthlyRate * Math.pow(1 + currentMonthlyRate, monthsRemaining)) /
    (Math.pow(1 + currentMonthlyRate, monthsRemaining) - 1);
  const currentTotalInterest = currentMonthlyPayment * monthsRemaining - loanBalance;

  const newLoanAmount = loanBalance + refinanceFees;
  const newMonthlyRate = newRate / 100 / 12;
  const newMonthlyPayment =
    (newLoanAmount * newMonthlyRate * Math.pow(1 + newMonthlyRate, newTermMonths)) /
    (Math.pow(1 + newMonthlyRate, newTermMonths) - 1);
  const newTotalInterest = newMonthlyPayment * newTermMonths - newLoanAmount;

  const monthlyPaymentChange = currentMonthlyPayment - newMonthlyPayment;
  const totalInterestSavings = currentTotalInterest - newTotalInterest;
  const netSavings = totalInterestSavings - refinanceFees;
  const breakEvenMonths = monthlyPaymentChange > 0 ? Math.ceil(refinanceFees / monthlyPaymentChange) : Infinity;

  const rateDifference = currentRate - newRate;
  const reasons: string[] = [];
  let decision: "yes" | "no" | "maybe" = "maybe";
  let confidence: "high" | "medium" | "low" = "medium";

  if (netSavings > 300 && rateDifference >= 2) {
    decision = "yes";
    confidence = "high";
    reasons.push(`Save $${Math.round(netSavings)} over the life of the loan`);
  } else if (netSavings > 150 && rateDifference >= 1) {
    decision = "yes";
    confidence = "medium";
    reasons.push(`Save $${Math.round(netSavings)} over the life of the loan`);
  } else if (netSavings <= 0) {
    decision = "no";
    confidence = "high";
    reasons.push("Refinancing would cost more than you'd save");
  } else if (rateDifference < 1) {
    decision = "no";
    confidence = "medium";
    reasons.push("Rate difference too small for personal loan");
  }

  return {
    decision,
    confidence,
    reasons,
    savings: Math.round(netSavings),
    breakEvenMonths: breakEvenMonths === Infinity ? 0 : breakEvenMonths,
    monthlyPaymentChange: Math.round(monthlyPaymentChange * 100) / 100,
    currentMonthlyPayment: Math.round(currentMonthlyPayment * 100) / 100,
    newMonthlyPayment: Math.round(newMonthlyPayment * 100) / 100,
  };
}

function calculateBalanceTransfer(
  balance: number,
  currentAPR: number,
  transferAPR: number,
  transferFeePercent: number,
  promoMonths: number,
  monthlyPayment: number
): RefinanceResult {
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
    if (principal <= 0) break;
    totalInterestWithoutTransfer += monthlyInterest;
    remainingBalance -= principal;
    monthsWithoutTransfer++;
  }
  
  // Calculate with transfer
  const promoMonthlyRate = transferAPR / 100 / 12;
  let transferBalance = totalTransferCost;
  let interestDuringPromo = 0;
  let monthsInPromo = 0;
  
  while (transferBalance > 0 && monthsInPromo < promoMonths) {
    const monthlyInterest = transferBalance * promoMonthlyRate;
    const principal = Math.min(monthlyPayment - monthlyInterest, transferBalance);
    if (principal <= 0) break;
    interestDuringPromo += monthlyInterest;
    transferBalance -= principal;
    monthsInPromo++;
  }
  
  const canPayOffInPromo = transferBalance <= 0;
  
  // After promo
  const postPromoAPR = Math.max(currentAPR - 2, 15);
  const postPromoMonthlyRate = postPromoAPR / 100 / 12;
  let interestAfterPromo = 0;
  
  while (transferBalance > 0) {
    const monthlyInterest = transferBalance * postPromoMonthlyRate;
    const principal = Math.min(monthlyPayment - monthlyInterest, transferBalance);
    if (principal <= 0) break;
    interestAfterPromo += monthlyInterest;
    transferBalance -= principal;
  }
  
  const totalInterestWithTransfer = transferFeeAmount + interestDuringPromo + interestAfterPromo;
  const totalSavings = totalInterestWithoutTransfer - totalInterestWithTransfer;

  const reasons: string[] = [];
  let decision: "yes" | "no" | "maybe" = "maybe";
  let confidence: "high" | "medium" | "low" = "medium";

  if (canPayOffInPromo && totalSavings > 100) {
    decision = "yes";
    confidence = "high";
    reasons.push(`Can pay off during ${promoMonths}-month promo period`);
    reasons.push(`Save $${Math.round(totalSavings)} in interest`);
  } else if (totalSavings > 200 && !canPayOffInPromo) {
    decision = "yes";
    confidence = "medium";
    reasons.push(`Save $${Math.round(totalSavings)} even with remaining balance after promo`);
  } else if (totalSavings <= 0) {
    decision = "no";
    confidence = "high";
    reasons.push("Transfer fee negates interest savings");
  } else if (transferFeePercent >= 5 && !canPayOffInPromo) {
    decision = "no";
    confidence = "medium";
    reasons.push("High transfer fee and cannot pay off during promo");
  }

  return {
    decision,
    confidence,
    reasons,
    savings: Math.round(totalSavings),
    breakEvenMonths: 0,
    monthlyPaymentChange: 0,
    currentMonthlyPayment: monthlyPayment,
    newMonthlyPayment: monthlyPayment,
  };
}

// MCP Tool definitions
const tools = [
  {
    name: "shouldIRefinanceCar",
    description: "Calculate whether to refinance an auto/car loan",
    inputSchema: {
      type: "object",
      properties: {
        loanBalance: { type: "number", description: "Current loan balance in dollars" },
        currentRate: { type: "number", description: "Current interest rate as percentage (e.g., 8.5)" },
        monthsRemaining: { type: "number", description: "Months remaining on current loan" },
        newRate: { type: "number", description: "New interest rate as percentage" },
        newTermMonths: { type: "number", description: "New loan term in months" },
        refinanceFees: { type: "number", description: "Refinance fees in dollars" },
      },
      required: ["loanBalance", "currentRate", "monthsRemaining", "newRate", "newTermMonths", "refinanceFees"],
    },
  },
  {
    name: "shouldIRefinanceMortgage",
    description: "Calculate whether to refinance a mortgage/home loan",
    inputSchema: {
      type: "object",
      properties: {
        loanBalance: { type: "number", description: "Current loan balance in dollars" },
        homeValue: { type: "number", description: "Current home value in dollars" },
        currentRate: { type: "number", description: "Current interest rate as percentage" },
        monthsRemaining: { type: "number", description: "Months remaining on current loan" },
        newRate: { type: "number", description: "New interest rate as percentage" },
        newTermMonths: { type: "number", description: "New loan term in months" },
        closingCosts: { type: "number", description: "Estimated closing costs in dollars" },
      },
      required: ["loanBalance", "homeValue", "currentRate", "monthsRemaining", "newRate", "newTermMonths", "closingCosts"],
    },
  },
  {
    name: "shouldIRefinancePersonalLoan",
    description: "Calculate whether to refinance a personal loan",
    inputSchema: {
      type: "object",
      properties: {
        loanBalance: { type: "number", description: "Current loan balance in dollars" },
        currentRate: { type: "number", description: "Current interest rate as percentage" },
        monthsRemaining: { type: "number", description: "Months remaining on current loan" },
        newRate: { type: "number", description: "New interest rate as percentage" },
        newTermMonths: { type: "number", description: "New loan term in months" },
        refinanceFees: { type: "number", description: "Refinance/origination fees in dollars" },
      },
      required: ["loanBalance", "currentRate", "monthsRemaining", "newRate", "newTermMonths", "refinanceFees"],
    },
  },
  {
    name: "shouldIBalanceTransfer",
    description: "Calculate whether to do a credit card balance transfer",
    inputSchema: {
      type: "object",
      properties: {
        balance: { type: "number", description: "Current credit card balance in dollars" },
        currentAPR: { type: "number", description: "Current APR as percentage" },
        transferAPR: { type: "number", description: "Promotional transfer APR as percentage (often 0)" },
        transferFeePercent: { type: "number", description: "Balance transfer fee as percentage (e.g., 3)" },
        promoMonths: { type: "number", description: "Promotional period in months" },
        monthlyPayment: { type: "number", description: "Monthly payment amount in dollars" },
      },
      required: ["balance", "currentAPR", "transferAPR", "transferFeePercent", "promoMonths", "monthlyPayment"],
    },
  },
];

// JSON-RPC 2.0 handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // JSON-RPC 2.0 validation
    if (body.jsonrpc !== "2.0") {
      return NextResponse.json({
        jsonrpc: "2.0",
        error: { code: -32600, message: "Invalid Request: jsonrpc must be '2.0'" },
        id: body.id || null,
      });
    }

    const { method, params, id } = body;

    // Handle MCP methods
    switch (method) {
      case "initialize":
        return NextResponse.json({
          jsonrpc: "2.0",
          result: {
            protocolVersion: "2024-11-05",
            capabilities: { tools: {} },
            serverInfo: {
              name: "shouldirefinancemy-mcp",
              version: "1.0.0",
            },
          },
          id,
        });

      case "tools/list":
        return NextResponse.json({
          jsonrpc: "2.0",
          result: { tools },
          id,
        });

      case "tools/call":
        const { name, arguments: args } = params || {};
        let result: RefinanceResult;

        switch (name) {
          case "shouldIRefinanceCar":
            result = calculateCarRefinance(
              args.loanBalance,
              args.currentRate,
              args.monthsRemaining,
              args.newRate,
              args.newTermMonths,
              args.refinanceFees
            );
            break;

          case "shouldIRefinanceMortgage":
            result = calculateMortgageRefinance(
              args.loanBalance,
              args.homeValue,
              args.currentRate,
              args.monthsRemaining,
              args.newRate,
              args.newTermMonths,
              args.closingCosts
            );
            break;

          case "shouldIRefinancePersonalLoan":
            result = calculatePersonalLoanRefinance(
              args.loanBalance,
              args.currentRate,
              args.monthsRemaining,
              args.newRate,
              args.newTermMonths,
              args.refinanceFees
            );
            break;

          case "shouldIBalanceTransfer":
            result = calculateBalanceTransfer(
              args.balance,
              args.currentAPR,
              args.transferAPR,
              args.transferFeePercent,
              args.promoMonths,
              args.monthlyPayment
            );
            break;

          default:
            return NextResponse.json({
              jsonrpc: "2.0",
              error: { code: -32601, message: `Unknown tool: ${name}` },
              id,
            });
        }

        return NextResponse.json({
          jsonrpc: "2.0",
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
          },
          id,
        });

      default:
        return NextResponse.json({
          jsonrpc: "2.0",
          error: { code: -32601, message: `Method not found: ${method}` },
          id,
        });
    }
  } catch (error) {
    return NextResponse.json({
      jsonrpc: "2.0",
      error: {
        code: -32700,
        message: "Parse error",
        data: error instanceof Error ? error.message : "Unknown error",
      },
      id: null,
    });
  }
}

// GET endpoint for documentation
export async function GET() {
  return NextResponse.json({
    name: "ShouldIRefinanceMy MCP Server",
    version: "1.0.0",
    description: "MCP server for refinance decision calculations",
    endpoint: "/api/mcp",
    protocol: "JSON-RPC 2.0",
    tools: tools.map((t) => ({ name: t.name, description: t.description })),
    documentation: "https://shouldirefinancemy.com/docs/mcp",
    manifest: "https://shouldirefinancemy.com/mcp.json",
  });
}
