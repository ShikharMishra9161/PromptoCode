# 📊 AIUIX Metrics System Architecture

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      INCOMING REQUEST                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │ metricsMiddleware              │
        │ - Record start time            │
        │ - Intercept response           │
        │ - Calculate duration           │
        └────────────────┬────────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │ Request Handlers               │
        ├────────────────────────────────┤
        │ Auth Controller:               │
        │  - trackDbRead() on lookup     │
        │  - trackDbWrite() on create    │
        │                                │
        │ Generate Controller:           │
        │  - Gemini API returns tokens   │
        │  - trackDbWrite() on History   │
        │                                │
        │ History Controller:            │
        │  - trackDbRead() on queries    │
        │  - trackDbWrite() on updates   │
        └────────────────┬────────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │ Error Handler                  │
        │ - Captures all errors          │
        │ - Records status code          │
        └────────────────┬────────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │ Response Sent                  │
        │ Metrics recorded in memory:    │
        │ - endpoint                     │
        │ - method                       │
        │ - statusCode                   │
        │ - responseTime                 │
        │ - timestamp                    │
        │ - userId                       │
        └────────────────┬────────────────┘
                         │
                         ▼
    ┌────────────────────────────────────┐
    │ metricsCollector (In-Memory)       │
    │ - Stores last 10,000 requests     │
    │ - Tracks db reads/writes          │
    └────────────────┬───────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
  ┌──────────────┐          ┌──────────────┐
  │ GET /metrics │          │ GET /logs    │
  │ (Aggregated) │          │ (Raw logs)   │
  └──────────────┘          └──────────────┘
```

---

## Metrics Collection Points

```
┌─────────────────────────────────────────────────────────────┐
│                   AIUIX BACKEND FLOWS                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 1. AUTH FLOW                                            │ │
│ │                                                         │ │
│ │ POST /auth/register                                     │ │
│ │  ├─ User.findOne() → trackDbRead()                      │ │
│ │  ├─ User.create() → trackDbWrite()                      │ │
│ │  ├─ Response time tracked                               │ │
│ │  └─ Success/error recorded                              │ │
│ │                                                         │ │
│ │ POST /auth/login                                        │ │
│ │  ├─ User.findByEmail() → trackDbRead()                  │ │
│ │  ├─ password.compare() [CPU work]                       │ │
│ │  ├─ JWT signed                                          │ │
│ │  └─ Metrics: response time, statusCode                  │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 2. PROTECTED REQUESTS (middleware/auth.ts)              │ │
│ │                                                         │ │
│ │ protect middleware (on ALL protected requests)          │ │
│ │  ├─ JWT.verify()                                        │ │
│ │  ├─ User.findById() → trackDbRead()                     │ │
│ │  └─ Metrics: Each protected request costs 1 db read     │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 3. UI GENERATION FLOW                                   │ │
│ │                                                         │ │
│ │ POST /api/generate/ui                                   │ │
│ │  ├─ generateUI() calls Gemini API                       │ │
│ │  │  └─ response.usageMetadata.totalTokenCount           │ │
│ │  │     [captured → tokensUsed]                          │ │
│ │  ├─ History.create() → trackDbWrite()                   │ │
│ │  │  └─ saves: prompt, framework, style, theme, tokens  │ │
│ │  ├─ Response time tracked (includes API latency)        │ │
│ │  └─ Metrics: longest endpoint (~3-5 seconds)            │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 4. HISTORY OPERATIONS                                   │ │
│ │                                                         │ │
│ │ GET /api/history (paginated)                            │ │
│ │  ├─ History.find() → trackDbRead()                      │ │
│ │  ├─ History.countDocuments() → trackDbRead()            │ │
│ │  └─ Metrics: userId, page, limit                        │ │
│ │                                                         │ │
│ │ DELETE /api/history/:id                                 │ │
│ │  ├─ History.findOneAndDelete() → trackDbWrite()         │ │
│ │  └─ Metrics: authorization, not found errors            │ │
│ │                                                         │ │
│ │ PATCH /api/history/:id/favorite                         │ │
│ │  ├─ History.findOne() → trackDbRead()                   │ │
│ │  ├─ entry.save() → trackDbWrite()                       │ │
│ │  └─ Metrics: toggle action                              │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 5. ERROR TRACKING (errorHandler middleware)             │ │
│ │                                                         │ │
│ │ Any error caught:                                       │ │
│ │  ├─ 400 Bad Request (validation)                        │ │
│ │  ├─ 401 Unauthorized (no/bad token)                     │ │
│ │  ├─ 404 Not Found (missing resource)                    │ │
│ │  ├─ 409 Conflict (duplicate email)                      │ │
│ │  ├─ 500 Server Error (unhandled)                        │ │
│ │  └─ 503 Service Error (Gemini API down)                 │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Model: What Gets Stored

```
┌─────────────────────────────────────────────────────────────┐
│                   HISTORY COLLECTION                         │
│                 (Metrics Data Source)                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Document Example:                                           │
│ {                                                           │
│   _id: ObjectId(...),                                       │
│   userId: ObjectId(...),         ◄── User ID              │
│   prompt: "A pricing table...",  ◄── User Input           │
│   style: "minimal",              ◄── UI Choice            │
│   theme: "dark",                 ◄── UI Choice            │
│   framework: "react",            ◄── UI Choice            │
│   colorScheme: "indigo & amber", ◄── User Input           │
│   generatedCode: "...",          ◄── Generated Output      │
│   explanation: "...",            ◄── Generated Output      │
│   tokensUsed: 2850,              ◄── Gemini API Data       │
│   isFavorite: false,             ◄── User Action          │
│   createdAt: ISODate(...),       ◄── Timestamp            │
│   updatedAt: ISODate(...)        ◄── Timestamp            │
│ }                                                           │
│                                                              │
│ Metrics Aggregations From This:                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 1. Token Usage:                                         │ │
│ │    Sum($tokensUsed) → Total tokens                      │ │
│ │    Avg($tokensUsed) → Average per generation            │ │
│ │                                                          │ │
│ │ 2. Framework Popularity:                                │ │
│ │    Count(framework="react")                             │ │
│ │    Count(framework="html")                              │ │
│ │    Count(framework="vue")                               │ │
│ │                                                          │ │
│ │ 3. Style Popularity:                                    │ │
│ │    Count(style="minimal")                               │ │
│ │    Count(style="material")                              │ │
│ │    Count(style="glassmorphism")                         │ │
│ │    etc...                                               │ │
│ │                                                          │ │
│ │ 4. User Engagement:                                     │ │
│ │    Count(distinct userId)                               │ │
│ │    Count(userId with count > 1)                         │ │
│ │                                                          │ │
│ │ 5. Generation Success Rate:                             │ │
│ │    Count(createdAt > date)                              │ │
│ │                                                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Metrics Aggregation Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│              METRICS CONTROLLER                              │
│          (GET /api/metrics Handler)                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Input Sources:                                             │
│  ├─ metricsCollector.getMetrics()     [In-memory requests] │
│  ├─ History.aggregate()               [Database queries]   │
│  └─ User.countDocuments()             [User count]         │
│                                                              │
│  Processing:                                                │
│  ├─ getAverageResponseTimes()         ▶ responseTimeAvg    │
│  ├─ getMinResponseTimes()             ▶ responseTimeMin    │
│  ├─ getMaxResponseTimes()             ▶ responseTimeMax    │
│  ├─ getP95ResponseTimes()             ▶ responseTimeP95    │
│  ├─ getRequestCounts()                ▶ requestCount      │
│  ├─ getErrorCounts()                  ▶ errorCount        │
│  ├─ getErrorRate()                    ▶ errorRate         │
│  ├─ History.aggregate([tokens])       ▶ totalTokensUsed   │
│  ├─ History.aggregate([framework])    ▶ frameworkPopular  │
│  ├─ History.aggregate([style])        ▶ stylePopular      │
│  └─ History.aggregate([theme])        ▶ themePopular      │
│                                                              │
│  Output: Complete MetricsAggregation object                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Request Tracking Lifecycle

```
Each Request Goes Through:

1. [ENTER] Express app.use(metricsMiddleware)
   │
   ├─ Start Timer (Date.now())
   └─ Intercept res.json() to capture when response happens
      
2. [PROCESS] Request handler
   │
   ├─ Auth handlers may call trackDbRead/trackDbWrite()
   ├─ Generate handler calls trackDbWrite()
   ├─ History handlers call trackDbRead/trackDbWrite()
   └─ Error handler catches errors
      
3. [EXIT] Response sent via res.json()
   │
   ├─ Stop Timer (Date.now() - startTime)
   ├─ Create RequestMetric object:
   │  {
   │    endpoint: "POST /api/auth/login",
   │    method: "POST",
   │    statusCode: 200,
   │    responseTime: 152,
   │    timestamp: new Date(),
   │    userId: req.user._id
   │  }
   │
   └─ Call metricsCollector.recordRequest(metric)
      
4. [STORE] In-memory storage
   │
   ├─ requestMetrics array updated
   ├─ Keep last 10,000 requests
   └─ Ready for aggregation

5. [ACCESS] GET /api/metrics
   │
   └─ Aggregation functions calculate:
      - Averages per endpoint
      - Error rates
      - Popular choices
      - Token usage
      etc.
```

---

## Metrics Types & Formulas

```
┌────────────────────────────────────────────────────────────────┐
│                    CALCULATION FORMULAS                        │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ 1. AVERAGE RESPONSE TIME                                       │
│    Formula: Σ(response times) ÷ count of requests              │
│    Example: (152 + 145 + 168) ÷ 3 = 155ms                      │
│                                                                │
│ 2. MIN/MAX RESPONSE TIME                                       │
│    Formula: Lowest/Highest value in dataset                    │
│    Example: Min = 95ms, Max = 890ms                            │
│                                                                │
│ 3. 95TH PERCENTILE                                             │
│    Formula: Sort values, find position at 95%                  │
│    Meaning: 95% of requests are faster than this               │
│    Example: 750ms (95% of logins faster than 750ms)            │
│                                                                │
│ 4. ERROR RATE                                                  │
│    Formula: (Count of 4xx/5xx) ÷ Total × 100                   │
│    Example: 25 errors ÷ 1000 requests × 100 = 2.5%             │
│                                                                │
│ 5. REQUEST RATE (Per Minute)                                   │
│    Formula: Requests in last minute ÷ 60 seconds               │
│    Example: 60 requests ÷ 60s = 1 req/s                        │
│                                                                │
│ 6. AVERAGE TOKENS PER GENERATION                               │
│    Formula: Total tokens used ÷ Number of generations          │
│    Example: 450,320 tokens ÷ 92 gens = 4,895 tokens/gen        │
│                                                                │
│ 7. ESTIMATED COST (Gemini API)                                 │
│    Formula: (Total tokens ÷ 1,000,000) × $0.075                │
│    Example: (450,320 ÷ 1M) × $0.075 = $0.0338                  │
│                                                                │
│ 8. POPULARITY PERCENTAGE                                       │
│    Formula: (Framework count ÷ Total) × 100                    │
│    Example: (45 React ÷ 89 total) × 100 = 50.6%                │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Data Retention

```
┌─────────────────────────────────────────────────────────────┐
│              CURRENT STORAGE MODEL                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ REQUEST METRICS (In-Memory)                                  │
│ ├─ Last 10,000 requests stored                              │
│ ├─ Cleared on server restart                                │
│ ├─ Memory usage: ~500KB (estimated)                         │
│ └─ Use: Real-time debugging and metrics aggregation         │
│                                                              │
│ DATABASE METRICS (Persistent)                                │
│ ├─ History collection: ALL records kept                     │
│ ├─ Unlimited tokens data                                    │
│ ├─ Unlimited framework/style/theme choices                  │
│ └─ Can query: MongoDB aggregation pipelines                 │
│                                                              │
│ RECOMMENDED PRODUCTION SETUP:                                │
│ ├─ Keep last 7 days of detailed request logs (InfluxDB)     │
│ ├─ Hourly aggregations (permanent)                          │
│ ├─ Alert on error rate > 5%                                 │
│ └─ Alert on response time > 2s (avg)                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Integration Summary

```
                    COMPLETE METRICS ECOSYSTEM
                    
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  ┌──────────────────┐                                        │
│  │  Express App     │                                        │
│  │  (app.ts)        │                                        │
│  └────────┬─────────┘                                        │
│           │                                                  │
│           ▼                                                  │
│  ┌──────────────────────────────────┐                        │
│  │ metricsMiddleware                │ ◄─ Response Times     │
│  │ (middleware/metrics.ts)          │                        │
│  └────────┬─────────────────────────┘                        │
│           │                                                  │
│           ▼                                                  │
│  ┌──────────────────────────────────┐                        │
│  │ Auth/Generate/History Handlers   │ ◄─ DB Operations     │
│  │ (controllers/*.ts)               │    (dbMetrics.ts)     │
│  └────────┬─────────────────────────┘                        │
│           │                                                  │
│           ▼                                                  │
│  ┌──────────────────────────────────┐                        │
│  │ metricsCollector                 │ ◄─ In-Memory Store   │
│  │ (utils/metrics.ts)               │                        │
│  └────────┬─────────────────────────┘                        │
│           │                                                  │
│      ┌────┴─────┬─────────┐                                  │
│      │           │         │                                 │
│      ▼           ▼         ▼                                  │
│  ┌────────┐ ┌─────────┐ ┌──────────────┐                     │
│  │ Logs   │ │ Metrics │ │ DB Queries   │                    │
│  │ GET /  │ │ GET /   │ │ (Aggregates)│                    │
│  │metrics │ │metrics  │ │              │                    │
│  │/logs   │ │         │ │ tokensUsed  │                    │
│  └────────┘ └─────────┘ │ frameworks  │                    │
│                         │ styles     │                    │
│                         │ themes     │                    │
│                         └──────────────┘                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Files & Their Roles

```
server/src/
├── middleware/
│   ├── metrics.ts             ◄─ Response time tracking
│   ├── auth.ts                ◄─ DB read tracking
│   └── errorHandler.ts        ◄─ Error aggregation
│
├── utils/
│   ├── metrics.ts             ◄─ Core metrics logic
│   │                          - metricsCollector
│   │                          - aggregation functions
│   │
│   └── dbMetrics.ts           ◄─ DB operation tracking
│                              - trackDbRead()
│                              - trackDbWrite()
│
├── controllers/
│   ├── auth.controller.ts     ◄─ Uses dbMetrics
│   ├── generate.controller.ts ◄─ Uses dbMetrics + token data
│   ├── history.controller.ts  ◄─ Uses dbMetrics
│   └── metrics.controller.ts  ◄─ Aggregates & serves
│
├── routes/
│   └── metrics.routes.ts      ◄─ Endpoints:
│                              - GET /metrics
│                              - GET /metrics/logs
│                              - POST /metrics/clear
│
└── app.ts                     ◄─ Integrates all above
```
