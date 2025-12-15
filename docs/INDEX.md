# BuildRight-ACO Documentation Index

**Last Updated:** 2025-12-15

## 📍 Start Here

- **[Current State](./CURRENT-STATE.md)** - Quick reference, current structure, key metrics
- **[Commands](./guides/COMMANDS.md)** - All available npm scripts
- **[Setup Guide](./guides/SETUP-GUIDE.md)** - Getting started

## 📚 Guides

- **[Commands](./guides/COMMANDS.md)** - Command reference
- **[Setup Guide](./guides/SETUP-GUIDE.md)** - Installation and configuration
- **[Quick Reference Card](./guides/QUICK-REFERENCE-CARD.md)** - Cheat sheet

## 🔌 API Documentation

- **[ACO Admin API Capabilities](./api/ACO-ADMIN-API-CAPABILITIES.md)** - What the Admin API can/cannot do
- **[ACO API Schema](./api/aco-api-schema.md)** - GraphQL schema reference
- **[ACO Query Behaviors](./ACO-QUERY-BEHAVIORS.md)** - Query patterns and gotchas

## 🏗️ Architecture

- **[Pricing Strategy](./architecture/PRICING-STRATEGY.md)** - Price book and pricing design
- **[BuildRight B2B Structure](./architecture/buildright-b2b-structure.md)** - Multi-tenant architecture
- **[Data Flows](../../buildright-commerce/docs/DATA-FLOWS.md)** - Complete system data flows (in Commerce repo)

## 🔧 Operations

- **[Metadata Ingestion Guide](./operations/METADATA-INGESTION-GUIDE.md)** - Attribute management
- **[Smart Deletion Implementation](./operations/SMART-DELETION-IMPLEMENTATION-COMPLETE.md)** - State-tracked deletion

## 📦 Archive

Historical implementation documentation:

- [ACO Cleanup Lessons Learned](./archive/ACO-CLEANUP-LESSONS-LEARNED.md)
- [ACO Full Implementation Complete](./archive/ACO-FULL-IMPLEMENTATION-COMPLETE.md)
- [Attribute Labels Added](./archive/ATTRIBUTE-LABELS-ADDED.md)
- [Implementation Complete Summary](./archive/IMPLEMENTATION-COMPLETE-SUMMARY.md)
- [Metadata Ingestion Complete](./archive/METADATA-INGESTION-COMPLETE.md)
- [Quick Wins Implementation Complete](./archive/QUICK-WINS-IMPLEMENTATION-COMPLETE.md)
- [Refactoring Summary](./archive/REFACTORING-SUMMARY.md)
- [State Tracker Deletion](./archive/STATE-TRACKER-DELETION.md)
- [Visual Summary](./archive/VISUAL-SUMMARY.md)
- [BuildRight Case Study](./archive/BUILDRIGHT-CASE-STUDY.md) (+ v1, v2, .html versions)

## 🔗 Related Documentation

### BuildRight Commerce
- [Commerce Data Flows](../../buildright-commerce/docs/DATA-FLOWS.md) - Master flow document
- [ACO Repository Audit](../../buildright-commerce/docs/ACO-REPOSITORY-AUDIT-2025-12-15.md) - This reorganization plan
- [ACO Ingestion Requirements](../../buildright-commerce/docs/ACO-INGESTION-REQUIREMENTS-2025-12-15.md) - What ACO ingests and format transformation

### BuildRight Service
- Service architecture and API documentation (in buildright-service repo)

---

## Quick Links by Task

### I want to...

**Deploy the demo:**
- [Commands Guide](./guides/COMMANDS.md) → `npm run import`

**Understand pricing:**
- [Pricing Strategy](./architecture/PRICING-STRATEGY.md)
- [Price Book Definitions](../data/prices/price-book-definitions.json)

**Debug ingestion:**
- [Metadata Ingestion Guide](./operations/METADATA-INGESTION-GUIDE.md)
- [ACO Admin API Capabilities](./api/ACO-ADMIN-API-CAPABILITIES.md)

**Extend the catalog:**
- [Data Flows](../../buildright-commerce/docs/DATA-FLOWS.md) - See Flow 5: Transform Commerce to ACO
- [ACO Ingestion Requirements](../../buildright-commerce/docs/ACO-INGESTION-REQUIREMENTS-2025-12-15.md)

**Delete everything:**
- [Commands Guide](./guides/COMMANDS.md) → `npm run delete`
- [Smart Deletion](./operations/SMART-DELETION-IMPLEMENTATION-COMPLETE.md)

