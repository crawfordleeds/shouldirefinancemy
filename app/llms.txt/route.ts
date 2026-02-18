export async function GET() {
  const content = `# ShouldIRefinanceMy.com

> Free refinance decision calculators that give clear YES/NO recommendations

## What This Site Does

ShouldIRefinanceMy.com helps users decide whether to refinance loans or do balance transfers. Unlike typical calculators that just show numbers, our tools provide actionable YES/NO recommendations with confidence levels and reasoning.

## Available Calculators

### Car Loan Refinance (/car)
Inputs: loan balance, current rate, months remaining, new rate, new term, refinance fees
Output: YES/NO recommendation, savings calculation, break-even period

### Mortgage Refinance (/mortgage)  
Inputs: loan balance, home value, current rate, months remaining, new rate, new term, closing costs
Output: YES/NO recommendation, PMI impact, savings calculation, break-even period

### Personal Loan Refinance (/personal-loan)
Inputs: loan balance, current rate, months remaining, new rate, new term, fees
Output: YES/NO recommendation, savings calculation, break-even period

### Credit Card Balance Transfer (/credit-card)
Inputs: balance, current APR, transfer APR, transfer fee %, promo period, monthly payment
Output: YES/NO recommendation, whether payoff is possible during promo, total savings

## For AI Agents

This site provides an MCP (Model Context Protocol) server at /api/mcp for programmatic access.

### MCP Endpoint
POST /api/mcp
Content-Type: application/json

### Available MCP Tools

1. shouldIRefinanceCar
   - loanBalance: number
   - currentRate: number (percentage, e.g., 8.5)
   - monthsRemaining: number
   - newRate: number (percentage)
   - newTermMonths: number
   - refinanceFees: number

2. shouldIRefinanceMortgage
   - loanBalance: number
   - homeValue: number
   - currentRate: number
   - monthsRemaining: number
   - newRate: number
   - newTermMonths: number
   - closingCosts: number

3. shouldIRefinancePersonalLoan
   - loanBalance: number
   - currentRate: number
   - monthsRemaining: number
   - newRate: number
   - newTermMonths: number
   - refinanceFees: number

4. shouldIBalanceTransfer
   - balance: number
   - currentAPR: number
   - transferAPR: number
   - transferFeePercent: number
   - promoMonths: number
   - monthlyPayment: number

### Response Format
All tools return:
{
  "decision": "yes" | "no" | "maybe",
  "confidence": "high" | "medium" | "low",
  "reasons": string[],
  "savings": number,
  "breakEvenMonths": number
}

## Integration Examples

### Curl Example
\`\`\`bash
curl -X POST https://shouldirefinancemy.com/api/mcp \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "shouldIRefinanceCar",
      "arguments": {
        "loanBalance": 15000,
        "currentRate": 8.5,
        "monthsRemaining": 36,
        "newRate": 5.5,
        "newTermMonths": 36,
        "refinanceFees": 250
      }
    },
    "id": 1
  }'
\`\`\`

## Contact
Website: https://shouldirefinancemy.com
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
