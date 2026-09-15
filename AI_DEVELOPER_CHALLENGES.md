# Advanced Engineering Challenges & Developer Evaluation Benchmark
> **Objective:** Real-world problem statements for evaluating Senior Full-Stack & AI Engineers. These tasks are specifically designed so that standard AI coding tools (ChatGPT, Claude, Cursor, Copilot) cannot solve them out-of-the-box without deep human architectural design, distributed systems expertise, and performance tuning.

---

## Task 1: Distributed Real-Time Budget Engine & Hard Circuit Breaker (Digital Marketing / Ad Platform)

### Context & Problem Statement
In automated digital marketing platforms, multiple background AI agents, automated bidding routines, and incoming webhooks trigger concurrent budget allocations and ad spend adjustments. If multiple processes concurrently attempt to modify a campaign's daily spend cap (e.g., ₹25,000/day limit), naive implementations suffer from race conditions, dirty reads, and catastrophic over-spending.

### Detailed Requirements
1. **Distributed Lock & Idempotency:**
   - Implement a Redis-backed distributed lock (e.g., Redlock algorithm or single-instance Redis Lua script with automatic renewal lease).
   - Ensure complete idempotency for duplicate incoming webhooks or retried job triggers via UUID idempotency keys with TTL.
2. **Hard Circuit Breaker & Fallback:**
   - Integrate an in-memory + persistent circuit breaker pattern (e.g., Closed -> Open -> Half-Open state machine).
   - If Meta/Google Ads API returns `429 Too Many Requests` or `5xx Server Error` over an SLA threshold (e.g., > 10% errors in a 30s window), instantly trip the circuit breaker, pause outbound mutating calls, and safely rollback in-flight transactions without data corruption.
3. **Database Concurrency Control:**
   - Implement database-level isolation (`SERIALIZABLE` or `SELECT ... FOR UPDATE` row locks) with optimistic concurrency fallback (`version` / timestamp column check).
4. **Audit Trail:**
   - Immutable append-only ledger for every single rupee allocated, spent, or rolled back.

### AI Failure Modes (Why AI prompts fail here)
* AI typically generates naive `redis.set(key, val)` without atomicity or TTL heartbeat lease extension, leading to deadlocks if a process crashes mid-execution.
* AI misses partial failure rollbacks (e.g., DB updated, but external API failed, leaving DB in a dirty state).
* AI misses out-of-order webhook delivery handling and clock drift between distributed servers.

### Evaluation Criteria for Candidate
- [ ] Are race conditions handled using atomic Lua scripts or atomic DB locks?
- [ ] What happens when Redis crashes or a worker process is `SIGKILL`ed holding a lock?
- [ ] Is there an end-to-end integration test with simulated concurrent workers (e.g., 50 parallel threads hitting the same budget)?

---

## Task 2: Autonomous Multi-Armed Bandit (MAB) with Bayesian Thompson Sampling (Ad Optimization)

### Context & Problem Statement
Traditional A/B testing wastes 50% of the marketing budget on underperforming variants during the test duration. The system needs an autonomous self-optimizing engine that balances exploration (trying new ad headlines/creatives) and exploitation (allocating the majority of the budget to high-converting variants).

### Detailed Requirements
1. **Bayesian Thompson Sampling Engine:**
   - Model the Click-Through Rate (CTR) and Conversion Rate (CR) of each ad creative using a Beta distribution: $Beta(\alpha + 1, \beta + 1)$ where $\alpha$ is successes (conversions) and $\beta$ is failures (clicks without conversion).
   - Draw random samples every 15 minutes to redistribute dynamic daily budget percentages across active ad sets.
2. **Cold Start & Statistical Significance Floor:**
   - Handle the cold-start problem (zero impressions) with a minimum statistical observation floor before Bayesian redistribution takes over.
   - Enforce minimum and maximum budget allocation boundaries (e.g., no single ad set can exceed 70% of total budget; no active ad set drops below 5% exploration budget).
3. **LLM Creative Policy Validator Sandbox:**
   - AI-generated copy must pass an automated AST/schema validator that strictly verifies Meta/Google advertising policies (e.g., prohibited keywords, punctuation abuse, character lengths) before entering the MAB pool.

### AI Failure Modes (Why AI prompts fail here)
* AI hallucinates standard formulas but fails to handle real-world asynchronous metric delays (Meta ad attribution reports conversions up to 24-72 hours later; naive Thompson sampling assumes instantaneous feedback).
* AI fails to handle budget volatility, causing frequent budget update API rate-limits from Meta/Google.

### Evaluation Criteria for Candidate
- [ ] How does the candidate handle delayed attribution in the Beta distribution updates?
- [ ] How are API rate limits (Meta Graph API calls) throttled while adjusting budgets?
- [ ] Is mathematical simulation code provided showing convergence towards optimal regret minimization?

---

## Task 3: Offline-First Real-Time State Sync with Conflict Resolution (Realtor Mobile + Backend)

### Context & Problem Statement
Real estate agents on the mobile app (React Native) frequently visit properties with zero cellular coverage (basements, elevators, high-rise shells). Two agents may attempt to claim, lock, or update notes/slots on the exact same property or lead simultaneously—one while offline, one while online.

### Detailed Requirements
1. **Local Persistent Storage & Mutation Queue:**
   - All mutations while offline must be recorded in an encrypted transactional mutation queue (e.g., SQLite / WatermelonDB) with causality tracking (monotonic counters or vector clocks).
2. **Optimistic UI with Graceful Rollback:**
   - Immediate UI feedback (e.g., property marked as "Reserved").
   - If the server rejects the lock upon reconnection due to an earlier timestamp from another agent, the client must trigger an undo state transition without crashing or losing user unsaved input.
3. **Conflict Resolution Strategy (LWW vs CRDT):**
   - For structured tabular data (lead assignments): Deterministic conflict resolution strategy with server reconciliation.
   - For free-text collaborative notes: Character-level or block-level operational transformation (OT) / CRDT.
4. **Resilient WebSocket / SSE Connection Lifecycle:**
   - Heartbeat ping/pong, exponential jittered backoff, and state catchup mechanism requesting delta changes since `last_known_sequence_id`.

### AI Failure Modes (Why AI prompts fail here)
* AI typically suggests simple `AsyncStorage` with `last-write-wins` based on client timestamps (which breaks completely due to mobile device clock skew).
* AI code misses packet deduplication and socket reconnect flood storms (thundering herd problem).

### Evaluation Criteria for Candidate
- [ ] Did the candidate rely on client timestamps (fail) or server sequence/vector clocks (pass)?
- [ ] How is the local mutation queue drained and retried when network toggles rapidly?
- [ ] Is there proper unit testing for network drop simulation during an active mutation?

---

## Task 4: 60 FPS Native Geospatial Clustering (50,000+ Properties on Mobile Map)

### Context & Problem Statement
The Realtor mobile app dashboard displays available inventory across entire metropolitan areas. Rendering tens of thousands of individual pins directly crashes the mobile app (out of memory / bridge thread saturation).

### Detailed Requirements
1. **Hierarchical Spatial Indexing (QuadTree / SuperCluster):**
   - Implement spatial clustering using GeoJSON / Geohash bounding boxes.
   - Clustered marker generation must happen off the main JS thread (Web Worker / native thread or backend vector tiles).
2. **Viewport-Aware Dynamic Fetching:**
   - As the user pans and zooms the map, calculate the viewport bounding box $[minLng, minLat, maxLng, maxLat]$ and query backend with debounce.
   - Backend spatial query (PostGIS `ST_MakeEnvelope` or Redis `GEORADIUS`) returning aggregated cluster counts at low zoom levels and individual markers only at zoom level $\ge 16$.
3. **Zero UI Thread Jank:**
   - Profile using React Native Performance Monitor / Flipper: Zero frame drops (solid 60 FPS) during rapid pinch-to-zoom across 50,000 records.
   - Prevent React component re-render thrashing through memoized custom native marker pins.

### AI Failure Modes (Why AI prompts fail here)
* AI typically feeds an array of 50k items directly into `<MapView>` pins, which instantly freezes the mobile application.
* AI cannot natively profile bridge traffic or memory allocation without hands-on debugging.

### Evaluation Criteria for Candidate
- [ ] Are cluster calculations offloaded off the React Native JavaScript thread?
- [ ] Is PostGIS spatial indexing (`ST_ClusterKMeans` or geohash grid aggregation) utilized effectively?
- [ ] Can the candidate demonstrate FPS and RAM profiling graphs on real devices/emulators?

---

## 🎯 Interviewer Question Guide (To verify human vs AI-generated answers)

When reviewing the candidate's implementation, ask these specific operational questions:
1. **On Edge Cases:** *"Agar mobile app offline hai aur user ne phone restart kar diya, toh unsynced queue kahan persist hoti hai aur decrypt kaise hogi?"*
2. **On Thundering Herd:** *"Jab server restart hota hai aur 5,000 mobile clients ek saath reconnect karte hain, toh DB crash hone se bachane ke liye tune kya lagaya?"*
3. **On API Failures:** *"Agar Meta Ads API continuous 30 minutes tak 503 Service Unavailable de, toh system ka state kya hoga aur manual intervention kaise trigger hoga?"*
