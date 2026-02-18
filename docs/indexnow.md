# IndexNow Integration

This site supports IndexNow for instant Bing/Yandex indexing of new or updated pages.

## API Key

```
0e721005c62d33d6b1f45c0e02761fff
```

Key verification file: https://shouldirefinancemy.com/0e721005c62d33d6b1f45c0e02761fff.txt

## Trigger Indexing

### Submit All Pages

```bash
curl -X POST https://shouldirefinancemy.com/api/indexnow \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Submit Specific URLs

```bash
curl -X POST https://shouldirefinancemy.com/api/indexnow \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [
      "https://shouldirefinancemy.com/car",
      "https://shouldirefinancemy.com/mortgage"
    ]
  }'
```

## Default URLs

When no URLs are specified, these pages are submitted:
- https://shouldirefinancemy.com/
- https://shouldirefinancemy.com/car
- https://shouldirefinancemy.com/mortgage
- https://shouldirefinancemy.com/personal-loan
- https://shouldirefinancemy.com/credit-card

## Response

Success (HTTP 200 or 202):
```json
{
  "success": true,
  "message": "URLs submitted to IndexNow",
  "urls": ["..."],
  "status": 202
}
```

## When to Use

- After deploying new calculator pages
- After making significant content updates
- After fixing SEO-related issues
