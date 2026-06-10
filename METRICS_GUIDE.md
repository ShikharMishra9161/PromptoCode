# 📊 METRICS COLLECTION IMPLEMENTATION GUIDE

## Overview

This guide documents all measurable system metrics implemented in the AIUIX codebase and how to use them.

---

## **IMPLEMENTED METRICS**

### **1. API RESPONSE TIME TRACKING** ✅

**Files:**
- [server/src/middleware/metrics.ts](../../server/src/middleware/metrics.ts) - Response time measurement
- [server/src/utils/metrics.ts](../../server/src/utils/metrics.ts) - Aggregation functions

**What's Measured:**
- Time from request received → response sent (in milliseconds)
- Tracked for all 9 endpoints

**How to Access:**
```bash
GET /api/metrics
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "responseTimeAvg": {
      "POST /api/auth/register": 125.5,
      "POST /api/auth/login": 152.3,
      "POST /api/generate/ui": 3850.2
    },
    "responseTimeMin": {
      "POST /api/auth/register": 98,
      "POST /api/auth/login": 120,
      "POST /api/generate/ui": 3200
    },
    "responseTimeMax": {
      "POST /api/auth/register": 245,
      "POST /api/auth/login": 890,
      "POST /api/generate/ui": 5100
    },
    "responseTimeP95": {
      "POST /api/auth/register": 210,
      "POST /api/auth/login": 750,
      "POST /api/generate/ui": 4800
    }
  }
}
```

---

### **2. API REQUEST FREQUENCY** ✅

**Files:**
- [server/src/middleware/metrics.ts](../../server/src/middleware/metrics.ts)
- [server/src/utils/metrics.ts](../../server/src/utils/metrics.ts)

**What's Measured:**
- Count of requests per endpoint
- Total requests since server start
- Success vs error rates

**How to Access:**
```bash
GET /api/metrics
```

**Response (excerpt):**
```json
{
  "requestCount": {
    "POST /api/auth/register": 24,
    "POST /api/auth/login": 156,
    "POST /api/generate/ui": 89,
    "GET /api/history": 312,
    "DELETE /api/history/:id": 45
  },
  "totalRequests": 1250,
  "errorRate": 2.4
}
```

---

### **3. GEMINI TOKEN USAGE** ✅ ALREADY TRACKED

**Files:**
- [server/src/services/gemini.service.ts](../../server/src/services/gemini.service.ts) - Captures from API
- [server/src/models/History.model.ts](../../server/src/models/History.model.ts) - Stores in DB
- [server/src/controllers/metrics.controller.ts](../../server/src/controllers/metrics.controller.ts) - Aggregates

**What's Measured:**
- Total tokens used across all generations
- Average tokens per generation
- Can be queried by user, framework, style

**Database Query Examples:**

Total tokens used (all time):
```javascript
db.histories.aggregate([
  { $group: { _id: null, totalTokens: { $sum: "$tokensUsed" } } }
])
```

Average tokens per generation:
```javascript
db.histories.aggregate([
  { $group: { _id: null, avgTokens: { $avg: "$tokensUsed" } } }
])
```

Tokens by framework:
```javascript
db.histories.aggregate([
  { $group: { _id: "$framework", totalTokens: { $sum: "$tokensUsed" }, count: { $sum: 1 } } }
])
```

**API Response (excerpt):**
```json
{
  "totalTokensUsed": 450320,
  "avgTokensPerGeneration": 4875,
  "uiGenerations": 92
}
```

---

### **4. DATABASE OPERATIONS** ✅

**Files:**
- [server/src/utils/dbMetrics.ts](../../server/src/utils/dbMetrics.ts) - Tracking functions
- [server/src/controllers/auth.controller.ts](../../server/src/controllers/auth.controller.ts) - Auth ops
- [server/src/controllers/generate.controller.ts](../../server/src/controllers/generate.controller.ts) - Generation ops
- [server/src/controllers/history.controller.ts](../../server/src/controllers/history.controller.ts) - History ops
- [server/src/middleware/auth.ts](../../server/src/middleware/auth.ts) - Auth reads

**What's Measured:**

**Writes:**
- User registration: `User.create()`
- UI generation stored: `History.create()`
- Favorite toggle: `entry.save()`

**Reads:**
- Check duplicate email: `User.findOne()`
- User login: `User.findByEmail()`
- Auth middleware: `User.findById()` (runs on every protected request)
- History pagination: `History.find()` + `History.countDocuments()`
- Favorite toggle lookup: `History.findOne()`

**How to Access:**
```bash
GET /api/metrics
```

**Response (excerpt):**
```json
{
  "dbWrites": 234,
  "dbReads": 2105
}
```

---

### **5. USER ACTIONS & EVENTS** ✅

**Files:**
- [server/src/controllers/auth.controller.ts](../../server/src/controllers/auth.controller.ts) - Auth events
- [server/src/controllers/generate.controller.ts](../../server/src/controllers/generate.controller.ts) - Generation events
- [server/src/controllers/history.controller.ts](../../server/src/controllers/history.controller.ts) - History events

**What's Tracked:**

| Event | Measurement | Location |
|-------|-------------|----------|
| Registrations | Count of successful User.create() | auth.controller register |
| Logins | Count of auth.controller login calls | auth.controller login |
| UI Generations | Count of History.create() calls | generate.controller |
| History Deletions | Count of deleteHistory calls | history.controller |
| Favorite Toggles | Count of toggleFavorite calls | history.controller |

**How to Access:**
```bash
GET /api/metrics
```

**Response (excerpt):**
```json
{
  "registrations": 42,
  "logins": 156,
  "uiGenerations": 89
}
```

---

### **6. ERROR TRACKING** ✅

**Files:**
- [server/src/middleware/errorHandler.ts](../../server/src/middleware/errorHandler.ts) - Catches all errors
- [server/src/utils/metrics.ts](../../server/src/utils/metrics.ts) - Aggregates error counts

**What's Tracked:**

| Status | Meaning | Typical Trigger |
|--------|---------|-----------------|
| 400 | Bad Request | Validation errors |
| 401 | Unauthorized | Missing/invalid token |
| 404 | Not Found | History entry not found |
| 409 | Conflict | Duplicate email on register |
| 500 | Server Error | Unhandled exceptions |
| 503 | Service Error | Gemini API failure |

**How to Access:**
```bash
GET /api/metrics
```

**Response (excerpt):**
```json
{
  "errorCount": {
    "401": 23,
    "404": 8,
    "409": 2,
    "503": 3
  },
  "errorRate": 2.4
}
```

---

### **7. POPULAR CHOICES** ✅ FULLY AVAILABLE

**Files:**
- [server/src/models/History.model.ts](../../server/src/models/History.model.ts) - Data stored here
- [server/src/controllers/metrics.controller.ts](../../server/src/controllers/metrics.controller.ts) - Aggregated

**What's Tracked:**
- Framework popularity (React vs HTML vs Vue)
- UI style popularity (minimal, glassmorphism, etc.)
- Theme preferences (light, dark, auto)

**How to Access:**
```bash
GET /api/metrics
```

**Response (excerpt):**
```json
{
  "frameworkPopularity": {
    "react": 45,
    "html": 28,
    "vue": 16
  },
  "stylePopularity": {
    "minimal": 31,
    "material": 25,
    "glassmorphism": 18,
    "neumorphic": 12,
    "brutalist": 3
  },
  "themePopularity": {
    "dark": 62,
    "light": 22,
    "auto": 5
  }
}
```

**Custom Database Queries:**

Most popular framework + style combination:
```javascript
db.histories.aggregate([
  { 
    $group: { 
      _id: { framework: "$framework", style: "$style" }, 
      count: { $sum: 1 } 
    } 
  },
  { $sort: { count: -1 } },
  { $limit: 10 }
])
```

---

## **METRICS API ENDPOINTS**

### **1. Get Aggregated Metrics**
```
GET /api/metrics
```

Returns all aggregated metrics (response times, request counts, token usage, errors, popular choices).

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "responseTimeAvg": { ... },
    "responseTimeMin": { ... },
    "responseTimeMax": { ... },
    "responseTimeP95": { ... },
    "requestCount": { ... },
    "totalRequests": 1250,
    "errorCount": { ... },
    "errorRate": 2.4,
    "dbWrites": 234,
    "dbReads": 2105,
    "totalTokensUsed": 450320,
    "avgTokensPerGeneration": 4875,
    "registrations": 42,
    "logins": 156,
    "uiGenerations": 89,
    "frameworkPopularity": { ... },
    "stylePopularity": { ... },
    "themePopularity": { ... }
  }
}
```

---

### **2. Get Detailed Request Logs**
```
GET /api/metrics/logs?limit=50
```

Returns detailed logs of individual requests for debugging.

**Query Parameters:**
- `limit`: Number of recent requests to return (default 50, max 500)

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "endpoint": "POST /api/auth/login",
        "method": "POST",
        "statusCode": 200,
        "responseTime": 152,
        "timestamp": "2026-06-03T10:30:45.123Z",
        "userId": "507f1f77bcf86cd799439011"
      },
      {
        "endpoint": "POST /api/generate/ui",
        "method": "POST",
        "statusCode": 201,
        "responseTime": 3850,
        "timestamp": "2026-06-03T10:31:12.456Z",
        "userId": "507f1f77bcf86cd799439011"
      }
    ],
    "total": 2105
  }
}
```

---

### **3. Clear All Metrics**
```
POST /api/metrics/clear
```

Clears all collected metrics (useful for testing or resetting).

**Response:**
```json
{
  "success": true,
  "data": { "message": "Metrics cleared" }
}
```

---

## **CLIENT-SIDE ANALYTICS** (Optional)

### **Setup**
See [client/src/utils/analytics.ts](../../client/src/utils/analytics.ts)

### **Available Tracking Functions**
```typescript
// Track page views
trackPageView('GeneratePage')

// Track generation lifecycle
trackGenerationStart({ framework: 'react', style: 'minimal', theme: 'dark' })
trackGenerationSuccess({ 
  framework: 'react', 
  style: 'minimal', 
  theme: 'dark', 
  tokensUsed: 2850, 
  duration: 3850 
})
trackGenerationError('Generation failed', 3850)

// Track history actions
trackHistoryDelete(historyId)
trackHistoryFavorite(historyId, true)
trackHistoryView(historyId)

// Track auth events
trackLogin()
trackRegister()
trackLogout()

// Manual flush
flushEvents()

// Setup periodic auto-flush
setupPageUnloadTracking()
startAutoFlush(30000) // Every 30 seconds
```

---

## **INTEGRATION CHECKLIST**

- ✅ Metrics middleware added to [app.ts](../../server/src/app.ts)
- ✅ Response time tracking middleware created
- ✅ Database operation tracking added to all controllers
- ✅ Metrics aggregation functions implemented
- ✅ Metrics API endpoints created
- ✅ Token usage aggregation (was already stored)
- ✅ Popular choices tracking (was already stored)
- ✅ Client-side analytics utilities created

---

## **NEXT STEPS (Optional Enhancements)**

1. **Create Admin Dashboard**
   - Display metrics in real-time
   - Charts for response time trends
   - Request volume graphs

2. **Implement Backend Analytics Endpoint**
   - Receive client-side events
   - Store in separate analytics collection
   - Aggregate user session data

3. **Add Alerts**
   - Alert if error rate > 5%
   - Alert if avg response time > 2s
   - Alert if token usage exceeds budget

4. **Export Metrics**
   - CSV export for reporting
   - Scheduled reports to email
   - Integration with monitoring tools (DataDog, New Relic, etc.)

5. **Retention Policies**
   - Keep last 7 days of detailed logs
   - Aggregate to hourly/daily after that
   - Prevent unbounded memory growth

---

## **TESTING**

```bash
# Generate some requests first
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# View metrics
curl http://localhost:3000/api/metrics | jq

# View recent requests
curl http://localhost:3000/api/metrics/logs?limit=10 | jq

# Clear metrics
curl -X POST http://localhost:3000/api/metrics/clear
```

---

## **FILES MODIFIED/CREATED**

### Created:
- `server/src/utils/metrics.ts` - Metrics collection and aggregation
- `server/src/utils/dbMetrics.ts` - Database operation tracking
- `server/src/middleware/metrics.ts` - Request/response timing middleware
- `server/src/controllers/metrics.controller.ts` - Metrics API handlers
- `server/src/routes/metrics.routes.ts` - Metrics routes
- `client/src/utils/analytics.ts` - Client-side event tracking

### Modified:
- `server/src/app.ts` - Added metrics middleware and routes
- `server/src/controllers/auth.controller.ts` - Added db tracking
- `server/src/controllers/generate.controller.ts` - Added db tracking
- `server/src/controllers/history.controller.ts` - Added db tracking
- `server/src/middleware/auth.ts` - Added db tracking

---

## **STORAGE CONSIDERATIONS**

### In-Memory Storage
- Metrics are stored in-memory (default: last 10,000 requests)
- Cleared on server restart
- Suitable for development/debugging

### For Production:
Consider persistent storage options:
- **MongoDB**: Store metrics in separate collection
- **InfluxDB**: Time-series database for metrics
- **Redis**: Fast in-memory with persistence
- **Cloud Services**: DataDog, New Relic, Prometheus

---

## **CALCULATING KEY METRICS**

### Average Response Time per Endpoint
```
Sum of all response times / Count of requests
```

### 95th Percentile Response Time
```
Sort response times → Get value at 95% position
(Useful for understanding worst-case performance)
```

### Error Rate
```
(Count of errors / Total requests) × 100
```

### Token Efficiency
```
Average tokens per generation = Total tokens / Number of generations
Cost per generation = (Average tokens / Model pricing per 1M tokens) × Model cost
```

### User Engagement
```
Active users = Distinct userId with generations in last 24h
Repeat user rate = Users with 2+ generations / Total users
```

---

## **EXAMPLE: MONITORING IN REAL-TIME**

```bash
# Watch metrics every 5 seconds
watch -n 5 'curl -s http://localhost:3000/api/metrics | jq ".data | {totalRequests, errorRate, responseTimeAvg}"'

# Output:
# {
#   "totalRequests": 1250,
#   "errorRate": 2.4,
#   "responseTimeAvg": {
#     "POST /api/auth/login": 152.3,
#     "POST /api/generate/ui": 3850.2
#   }
# }
```

---

## **SUPPORT**

For issues or questions:
1. Check detailed request logs: `GET /api/metrics/logs`
2. Review error counts: `GET /api/metrics` → `errorCount`
3. Check individual response times: `GET /api/metrics` → `responseTimeAvg`
