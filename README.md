# One-Pick Voting System

A quarterly voting system using order IDs as authentication credentials.

## Overview

A minimalist voting platform where users vote for their one pick each quarter using order numbers as proof of purchase. No login, no screenshots, fully transparent.

## Key Features

- **Order ID Authentication** - Purchase order number as sole credential
- **Quarterly Cycles** - Independent voting periods per quarter
- **One Vote Per Season** - Each order ID gets one pick per quarter
- **Limited Modifications** - Change your vote once per quarter using a secret key
- **Public Verification** - Anyone can verify votes using order IDs
- **Zero Overhead** - No image uploads, no manual review, no user accounts

## Core Rules

### Binding Rules
- One order ID ↔ one anonymous identity (permanent)
- First-come-first-served binding

### Voting Rules (per quarter)
- One pick per order ID
- One modification allowed (requires secret key)
- Key rotates after each change

### Change Key System
- Generated after initial vote and each modification
- Shown only once (cannot be recovered)
- Previous key invalidates when new key is issued

## Tech Stack

- **Frontend + API**: Vercel (Serverless Functions)
- **Database**: Neon Postgres
- **DNS**: Cloudflare

## User Flow

1. **Submit** - Enter order ID + select candidate → Get change key
2. **Verify** - Check vote status with order ID
3. **Modify** - Change vote using order ID + change key → Get new key
4. **Dashboard** - View rankings and trends

## Data Schema

- `OnePickSeason` - Quarterly periods
- `OrderBinding` - Order ID ↔ anonymous ID mapping
- `OnePickVote` - Vote records (unique per season + order)
- `ChangeKey` - Latest valid key per order/season
- `OnePickChangeLog` - Modification history

## API Endpoints

```
POST   /api/one-pick/submit      # Submit vote
POST   /api/one-pick/change      # Modify vote
GET    /api/one-pick/verify      # Check vote
GET    /api/one-pick/leaderboard # View rankings
```

# Technical Description

## One-Pick Voting System - Technical Overview

A serverless, quarter-based voting platform demonstrating secure authentication without traditional user accounts, built with modern edge computing and PostgreSQL.

### Architecture Highlights

**Serverless-First Design**
- Deployed on Vercel Edge/Serverless Functions for zero-ops scaling
- Stateless API design with JWT-like token rotation mechanism
- Neon Postgres serverless database with connection pooling
- Cloudflare CDN for global low-latency access

**Security & Authentication**
- **Passwordless Auth Pattern**: Order ID validation via regex matching
- **Cryptographic Key Rotation**: SHA-256 hashed change keys with single-use display
- **Anonymous Identity Management**: UUID-based PIDs stored in browser (cookie + localStorage)
- **Replay Attack Prevention**: Unique constraints at database level (season_id + order_id)

### Technical Challenges Solved

**1. Stateless Modification Control**
- Implemented rotating secret keys without session storage
- One-time key display enforced at application layer
- Key invalidation through database replacement (not deletion)

**2. Constraint Enforcement**
- Database-level unique constraints for vote integrity
- Transactional consistency for vote modifications
- Optimistic locking for concurrent update prevention

**3. Identity Binding**
- Irreversible one-to-one mapping between anonymous PIDs and order IDs
- Client-side identity persistence with server-side validation
- No PII storage or recovery mechanism

**4. Temporal Data Modeling**
- Season-based partitioning for quarterly cycles
- Status-driven state machine (upcoming → active → closed)
- Change log tracking for audit trail and analytics

### Database Schema Design

```sql
-- Enforces 1:1 binding permanence
OrderBinding (pid UNIQUE, order_id UNIQUE)

-- Ensures one vote per season per order
OnePickVote (UNIQUE(season_id, order_id))

-- Latest key only (upsert pattern)
ChangeKey (order_id, season_id) -- composite lookup
```

### API Design Patterns

- **Idempotency**: Vote submissions return existing vote if duplicate
- **Atomic Operations**: Vote + key generation in single transaction
- **Read-Optimized Queries**: Leaderboard uses aggregated views with status filtering
- **Validation Pipeline**: Multi-stage checks (format → binding → quota → season state)

### Performance Considerations

- Indexed lookups on `order_id` and `season_id` composite keys
- Query optimization for dashboard aggregations (COUNT GROUP BY with status filter)
- Edge function deployment for sub-100ms API response times
- Minimal client-side state (only PID persistence)

### Key Technical Decisions

1. **No Authentication Server**: Order ID regex validation replaces OAuth/JWT
2. **No File Storage**: Pure relational data model (no S3/blob storage)
3. **No Cache Layer**: Direct database queries (Neon's connection pooling suffices)
4. **Client-Side Identity**: Browser storage for PID (server validates binding)

### Deployment & DevOps

- **Zero-Config Deployment**: Git push → Vercel auto-deploy
- **Database Migrations**: Prisma/Drizzle ORM with versioned migrations
- **Monitoring**: Vercel Analytics + Neon query insights
- **Cost**: ~$0 for MVP (free tiers: Vercel Hobby + Neon Free + Cloudflare Free)

---

**Stack**: Next.js 14 (App Router), TypeScript, Prisma/Drizzle ORM, Neon Postgres, Vercel Edge Functions, Cloudflare DNS

**Demonstrates**: Serverless architecture, cryptographic key management, constraint-based security, temporal data modeling, anonymous authentication patterns

## License

MIT
