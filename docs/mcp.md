# ShouldIRefinanceMy.com MCP Server

This site provides an MCP (Model Context Protocol) server that allows AI agents and LLMs to programmatically calculate refinance decisions.

## Endpoint

```
POST https://shouldirefinancemy.com/api/mcp
Content-Type: application/json
```

## Protocol

The server implements JSON-RPC 2.0 following the MCP specification.

## Manifest

The MCP manifest is available at:
```
https://shouldirefinancemy.com/mcp.json
```

## Available Tools

### 1. shouldIRefinanceCar

Calculate whether to refinance an auto/car loan.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| loanBalance | number | Current loan balance in dollars |
| currentRate | number | Current interest rate (e.g., 8.5 for 8.5%) |
| monthsRemaining | number | Months remaining on current loan |
| newRate | number | New interest rate as percentage |
| newTermMonths | number | New loan term in months |
| refinanceFees | number | Refinance fees in dollars |

### 2. shouldIRefinanceMortgage

Calculate whether to refinance a mortgage/home loan.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| loanBalance | number | Current loan balance in dollars |
| homeValue | number | Current home value (for LTV/PMI calculation) |
| currentRate | number | Current interest rate as percentage |
| monthsRemaining | number | Months remaining on current loan |
| newRate | number | New interest rate as percentage |
| newTermMonths | number | New loan term in months |
| closingCosts | number | Estimated closing costs (typically 2-5% of loan) |

### 3. shouldIRefinancePersonalLoan

Calculate whether to refinance a personal loan.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| loanBalance | number | Current loan balance in dollars |
| currentRate | number | Current interest rate as percentage |
| monthsRemaining | number | Months remaining on current loan |
| newRate | number | New interest rate as percentage |
| newTermMonths | number | New loan term in months |
| refinanceFees | number | Refinance/origination fees in dollars |

### 4. shouldIBalanceTransfer

Calculate whether to do a credit card balance transfer.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| balance | number | Current credit card balance in dollars |
| currentAPR | number | Current APR as percentage |
| transferAPR | number | Promotional APR (often 0) |
| transferFeePercent | number | Transfer fee percentage (e.g., 3) |
| promoMonths | number | Promotional period in months |
| monthlyPayment | number | Monthly payment amount in dollars |

## Response Format

All tools return a consistent response format:

```json
{
  "decision": "yes" | "no" | "maybe",
  "confidence": "high" | "medium" | "low",
  "reasons": ["Array of explanation strings"],
  "savings": 1234,
  "breakEvenMonths": 12,
  "monthlyPaymentChange": 45.67,
  "currentMonthlyPayment": 456.78,
  "newMonthlyPayment": 411.11
}
```

## Example Usage

### Initialize Connection

```bash
curl -X POST https://shouldirefinancemy.com/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "initialize",
    "params": {},
    "id": 1
  }'
```

### List Available Tools

```bash
curl -X POST https://shouldirefinancemy.com/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "params": {},
    "id": 2
  }'
```

### Call a Tool

```bash
curl -X POST https://shouldirefinancemy.com/api/mcp \
  -H "Content-Type: application/json" \
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
    "id": 3
  }'
```

### Example Response

```json
{
  "jsonrpc": "2.0",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\"decision\":\"yes\",\"confidence\":\"high\",\"reasons\":[\"Save $847 over the life of the loan\",\"Rate drops 3.00%\"],\"savings\":847,\"breakEvenMonths\":5,\"monthlyPaymentChange\":46.23,\"currentMonthlyPayment\":473.36,\"newMonthlyPayment\":427.13}"
      }
    ]
  },
  "id": 3
}
```

## Integration with Claude Desktop

Add to your Claude Desktop config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "shouldirefinancemy": {
      "url": "https://shouldirefinancemy.com/api/mcp"
    }
  }
}
```

## Rate Limits

This is a free public API. Please be reasonable with request frequency. For high-volume usage, please contact us.

## Error Handling

Standard JSON-RPC 2.0 error codes:
- `-32700`: Parse error
- `-32600`: Invalid Request
- `-32601`: Method not found
- `-32602`: Invalid params
- `-32603`: Internal error
