# 📊 AIUIX Metrics Quick Reference

## One-Line Summary
**All measurable system metrics are now automatically collected. Access them at `GET /api/metrics`**

---

## What's Measured?

| Metric | Details | Access |
|--------|---------|--------|
| **Response Time** | Avg, Min, Max, P95 per endpoint | `GET /api/metrics` → `responseTimeAvg/Min/Max/P95` |
| **Request Volume** | Count per endpoint, total requests | `GET /api/metrics` → `requestCount`, `totalRequests` |
| **Errors** | Count by status code (401, 404, 500, etc.) | `GET /api/metrics` → `errorCount`, `errorRate` |
| **Token Usage** | Total & average from Gemini API | `GET /api/metrics` → `totalTokensUsed`, `avgTokensPerGeneration` |
| **DB Operations** | Count of reads and writes | `GET /api/metrics` → `dbReads`, `dbWrites` |
| **User Actions** | Registrations, logins, generations | `GET /api/metrics` → `registrations`, `logins`, `uiGenerations` |
| **Popular Choices** | Most used frameworks, styles, themes | `GET /api/metrics` → `frameworkPopularity`, `stylePopularity`, `themePopularity` |
| **Detailed Logs** | Individual request details for debugging | `GET /api/metrics/logs?limit=50` |

---

## Quick Start

### View All Metrics
```bash
curl http://localhost:3000/api/metrics | jq
```

### View Recent Request Details
```bash
curl http://localhost:3000/api/metrics/logs?limit=20 | jq '.data.logs'
```

### Clear Metrics (Testing)
```bash
curl -X POST http://localhost:3000/api/metrics/clear
```

---

## Metric Examples

### Response Times
```json
"responseTimeAvg": {
  "POST /api/auth/login": 152,      // ms
  "POST /api/generate/ui": 3850,    // ms (slower - API call + DB)
  "GET /api/history": 85            // ms
}
```

### Error Tracking
```json
"errorCount": {
  "401": 5,    // Unauthorized (bad tokens)
  "404": 2,    // Not found (deleted history)
  "409": 1,    // Conflict (duplicate email)
  "503": 1     // Service error (Gemini API down)
},
"errorRate": 0.8  // % of all requests
```

### Token Usage
```json
"totalTokensUsed": 450320,           // Tokens
"avgTokensPerGeneration": 4875,      // Tokens per UI generation
"uiGenerations": 92                  // Total generations
```

### Popular Choices
```json
"frameworkPopularity": {
  "react": 45,  // Most popular
  "html": 28,
  "vue": 16
},
"stylePopularity": {
  "minimal": 31,
  "material": 25,
  "glassmorphism": 18
}
```

---

## Code Integration Points

### Where Metrics Are Collected:

1. **Response Times** - Every request via [middleware/metrics.ts](server/src/middleware/metrics.ts)
2. **Database Ops** - Auth, Generate, History controllers via [utils/dbMetrics.ts](server/src/utils/dbMetrics.ts)
3. **Token Usage** - Already stored in History model
4. **Popular Choices** - Already stored in History model
5. **Errors** - Caught in [middleware/errorHandler.ts](server/src/middleware/errorHandler.ts)

### Files Created:
- `server/src/utils/metrics.ts` - Core metrics logic
- `server/src/utils/dbMetrics.ts` - DB tracking helpers
- `server/src/middleware/metrics.ts` - Response time tracking
- `server/src/controllers/metrics.controller.ts` - API handlers
- `server/src/routes/metrics.routes.ts` - Routes
- `client/src/utils/analytics.ts` - Client-side tracking (optional)

---

## Calculating Key Statistics

### Average Response Time for Generate Endpoint
```bash
curl http://localhost:3000/api/metrics | jq '.data.responseTimeAvg["POST /api/generate/ui"]'
# Output: 3850.2
```

### Error Rate Percentage
```bash
curl http://localhost:3000/api/metrics | jq '.data.errorRate'
# Output: 2.4
```

### Most Popular Framework
```bash
curl http://localhost:3000/api/metrics | jq '.data.frameworkPopularity | to_entries | max_by(.value)'
# Output: {"key": "react", "value": 45}
```

### Total Tokens Used (Cost Estimation)
```bash
curl http://localhost:3000/api/metrics | jq '.data | {totalTokens: .totalTokensUsed, avgPerGen: .avgTokensPerGeneration, generations: .uiGenerations}'
# Estimate cost: (totalTokens / 1000000) * $0.075 (Gemini pricing)
```

---

## Real-Time Monitoring

```bash
# Watch metrics update every 5 seconds
watch -n 5 'curl -s http://localhost:3000/api/metrics | jq ".data | {requests: .totalRequests, errors: .errorRate, avgResponseTime: .responseTimeAvg}"'
```

---

## Database Queries (If Stored in MongoDB)

### Total Tokens Used Today
```javascript
db.histories.aggregate([
  { 
    $match: { 
      createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) }
    } 
  },
  { $group: { _id: null, total: { $sum: "$tokensUsed" } } }
])
```

### User's Generation Patterns
```javascript
db.histories.aggregate([
  { $match: { userId: ObjectId("...") } },
  { 
    $group: { 
      _id: { framework: "$framework", style: "$style" }, 
      count: { $sum: 1 } 
    } 
  },
  { $sort: { count: -1 } }
])
```

---

## Performance Baselines

Typical response times (in milliseconds):

| Endpoint | Typical | Acceptable | Slow |
|----------|---------|-----------|------|
| POST /auth/login | ~150ms | <300ms | >1000ms |
| POST /auth/register | ~150ms | <300ms | >1000ms |
| GET /history | ~80ms | <200ms | >1000ms |
| DELETE /history/:id | ~100ms | <300ms | >1000ms |
| POST /generate/ui | ~3800ms | <5000ms | >8000ms |

(Gemini API is slowest - this is expected)

---

## Troubleshooting

### High Error Rate?
```bash
# Check error breakdown
curl http://localhost:3000/api/metrics | jq '.data.errorCount'

# View failed requests
curl http://localhost:3000/api/metrics/logs?limit=100 | jq '.data.logs | map(select(.statusCode >= 400))'
```

### Slow Response Times?
```bash
# Identify slowest endpoints
curl http://localhost:3000/api/metrics | jq '.data.responseTimeMax'

# View individual slow requests
curl http://localhost:3000/api/metrics/logs?limit=100 | jq '.data.logs | sort_by(-.responseTime) | .[0:5]'
```

### Database Performance Issues?
```bash
# Check read/write counts
curl http://localhost:3000/api/metrics | jq '{dbReads: .data.dbReads, dbWrites: .data.dbWrites}'
```

---

## Next Steps

1. ✅ Metrics are automatically collected
2. 📊 View at `GET /api/metrics`
3. 📈 Build dashboard with metrics
4. 🚨 Set up alerts for error rate > 5%
5. 📦 Export to monitoring tools (optional)

---

## Further Reading

- Full guide: [METRICS_GUIDE.md](METRICS_GUIDE.md)
- Metrics implementation: [server/src/utils/metrics.ts](server/src/utils/metrics.ts)
- Database tracking: [server/src/utils/dbMetrics.ts](server/src/utils/dbMetrics.ts)
