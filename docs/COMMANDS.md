# ACO Commands Reference

> **Simple, consistent commands for ACO data management**

## Primary Commands

### Delete All Data
```bash
npm run delete
```
Deletes all ACO data (products, variants, price books, prices, metadata) with validation.

### Import All Data
```bash
npm run import
```
Imports all ACO data with state tracking and polling verification.

---

## Granular Commands

### Delete

```bash
npm run delete              # Delete everything
npm run delete:products     # Delete products only (keep pricing)
```

### Import

```bash
npm run import              # Import everything
npm run import:metadata     # Import metadata (attributes) only
npm run import:products     # Import simple products only
npm run import:variants     # Import product variants only
npm run import:price-books  # Import price books only
npm run import:prices       # Import prices only
```

---

## Typical Workflow

```bash
# 1. Clean slate
npm run delete

# 2. Fresh import
npm run import
```

**Result:** 255 products in ACO (154 simple + 101 variants) with verified state tracking

---

## What Changed?

| Old Command | New Command | Notes |
|-------------|-------------|-------|
| `reset:all` | `delete` | Consistent verb across repos |
| `ingest:all` | `import` | Consistent verb across repos |
| `reset:products` | `delete:products` | Clearer intent |
| `ingest:metadata` | `import:metadata` | Consistent verb |
| `ingest:products` | `import:products` | Consistent verb |
| `ingest:variants` | `import:variants` | Consistent verb |
| `ingest:prices` | `import:prices` | Consistent verb |

---

## Features

### Smart State Tracking
- State cleared at start of import
- Rebuilt after polling confirms products in ACO
- Prevents duplicate imports

### Polling Verification
- **Import:** Waits for products to appear in ACO (up to 200s)
- **Delete:** Waits for products to disappear from ACO (up to 150s)
- Real-time progress bars

### Clean Output
- Single-line progress bars
- No verbose logging by default
- Professional CLI experience

---

## Integration with Commerce Orchestrator

From the **buildright-commerce** repo, you can orchestrate both systems:

```bash
npm run delete    # Delete Commerce + ACO
npm run import    # Import to Commerce + ACO
```

The orchestrator automatically handles cross-repo coordination.

---

## Examples

### Full Reset
```bash
npm run delete
npm run import
# Result: Fresh ACO with 255 verified products
```

### Products Only
```bash
npm run delete:products
npm run import:products
npm run import:variants
# Result: Fresh products, pricing unchanged
```

### Metadata Only
```bash
npm run import:metadata
# Result: Fresh metadata (attributes), products unchanged
```

---

## Under the Hood

- `delete` → `scripts/reset-all.js`
- `import` → `scripts/ingest-all.js`
- State tracking → `.buildright-state/aco-ingest-state.json`
- Polling → Catalog Service GraphQL queries
- Validation → Smart detector with multi-strategy detection

