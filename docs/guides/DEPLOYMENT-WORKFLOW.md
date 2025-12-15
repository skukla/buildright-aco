# ACO Deployment Workflow

**For locked demo deployment** - Data is pre-generated and committed to git

## Quick Deploy (Most Common)

**Use Case:** Deploy pre-built demo dataset to a fresh ACO instance

```bash
cd buildright-aco
npm run import
```

**Duration:** ~90 seconds  
**What it does:**
- Ingests 5 pre-generated files from `output/buildright/`
- Populates ACO with products, variants, attributes, and pricing

---

## Full Rebuild (Rare)

**Use Case:** Regenerate from Commerce source of truth

### Step 1: Generate Commerce Datapack

```bash
cd buildright-commerce
npm run generate              # Generate Commerce ACCS datapack (5s)
npm run transform:aco         # Transform to ACO format (1s)
```

**Outputs:**
- `buildright-aco/output/buildright/metadata.json`
- `buildright-aco/output/buildright/products.json`
- `buildright-aco/output/buildright/variants.json`

### Step 2: Generate ACO Pricing

```bash
cd buildright-aco
npm run generate:all          # Generate price-books.json & prices.json (1s)
```

**Outputs:**
- `output/buildright/price-books.json`
- `output/buildright/prices.json`

### Step 3: Deploy to ACO

```bash
npm run import                # Ingest all 5 files (90s)
```

### Step 4: Commit Changes (if expanding catalog)

```bash
git add output/buildright/
git commit -m "data: updated demo dataset"
git push
```

---

## Delete Demo Data

**Use Case:** Clean ACO instance before re-import

```bash
npm run delete                # Delete all products, variants, and pricing
```

**Duration:** ~60 seconds  
**What it does:**
- State-tracked deletion (no orphans)
- Removes products, variants, metadata, and pricing
- Retains system configuration

**Delete products only (keep pricing):**

```bash
npm run delete:products
```

---

## Individual Component Deployment

```bash
# Step-by-step ingestion
npm run import:metadata       # Product attributes (5s)
npm run import:products       # Simple products (30s)
npm run import:variants       # Configurable variants (30s)
npm run import:price-books    # Price book structure (5s)
npm run import:prices         # SKU-level pricing (20s)
```

---

## Data Flow Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    COMMERCE REPO                             │
│  data/*.json (configs) → generate → transform               │
│  └──> buildright-aco/output/buildright/{metadata,          │
│       products, variants}.json                              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      ACO REPO                                │
│  data/prices/*.json (configs) → generate:all                │
│  └──> output/buildright/{price-books, prices}.json         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│           INGESTION (npm run import)                         │
│  output/buildright/*.json → ACO via Admin API               │
│  • metadata.json (42 attributes)                            │
│  • products.json (146 simple products)                      │
│  • variants.json (135 variants)                             │
│  • price-books.json (5 price books)                         │
│  • prices.json (1,405 price rules)                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Troubleshooting

### Import Fails

**Symptom:** Products not appearing in ACO

**Check:**
1. API credentials configured? (`.env` file)
2. Files exist? (`ls -lh output/buildright/`)
3. Valid JSON? (`npm run validate:schema`)
4. Network access? (`npm run fetch:catalog-views`)

**Fix:**
```bash
npm run delete      # Clean slate
npm run import      # Try again
```

### Orphaned Data

**Symptom:** Old data remains after delete

**Fix:**
```bash
npm run delete      # Automatic orphan cleanup
npm run validate:ingestion  # Verify clean state
```

### Price Book Issues

**Symptom:** Prices not showing for personas

**Check:**
1. Price books created? (`npm run fetch:catalog-views`)
2. Prices ingested? (check logs: `npm run import:prices`)

**Fix:**
```bash
npm run generate:price-books  # Regenerate
npm run import:price-books    # Re-import
npm run import:prices         # Re-import prices
```

---

## Environment Variables

Required in `.env`:

```env
ACO_API_URL=https://your-aco-instance.adobe.io
ACO_CLIENT_ID=your-client-id
ACO_CLIENT_SECRET=your-secret
ACO_ORG_ID=your-org-id
ACO_API_KEY=your-api-key
```

---

## Related Documentation

- **[Commands Reference](./COMMANDS.md)** - All npm scripts
- **[Setup Guide](./SETUP-GUIDE.md)** - Initial configuration
- **[Data Flows](../../../buildright-commerce/docs/DATA-FLOWS.md)** - Complete system data flows

---

## Locked Demo Workflow Summary

**For daily operations:**
```bash
npm run import      # Deploy committed dataset (90s)
```

**For catalog expansion:**
```bash
# In buildright-commerce
npm run generate && npm run transform:aco  # (6s)

# In buildright-aco
npm run generate:all && npm run import     # (91s)
git add output/ && git commit && git push  # Commit new dataset
```

**For cleanup:**
```bash
npm run delete      # Clean ACO (60s)
```

This locked demo workflow ensures:
- ✅ Fast daily deployment (no generation needed)
- ✅ Single source of truth (Commerce)
- ✅ Version-controlled demo data
- ✅ No drift between environments

