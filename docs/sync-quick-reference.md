# CSV to Supabase Sync - Quick Reference

## 🚀 Quick Start

### Initial Setup

```bash
# 1. Create table in Supabase SQL editor (see main docs)
# 2. Run full sync
npm run sync:csv
```

### Regular Updates

```bash
# Replace CSV file, then run incremental sync
npm run sync:csv:robust
```

## 📋 Available Commands

| Command                        | Purpose                      | When to Use                          |
| ------------------------------ | ---------------------------- | ------------------------------------ |
| `npm run sync:csv`             | Full sync (complete rewrite) | Initial setup, data reset            |
| `npm run sync:csv:incremental` | Basic incremental sync       | Small updates, reliable connection   |
| `npm run sync:csv:robust`      | Enhanced incremental sync    | Large updates, unreliable connection |
| `npm run monitor:sync`         | Check current status         | Verify sync completion               |
| `npm run monitor:sync:live`    | Live progress monitoring     | Watch sync in real-time              |
| `npm run sync:diagnostics`     | Troubleshoot issues          | Debug problems                       |

## 🔄 Sync Flow

### Search Priority (Application)

1. **Supabase** `csv_games` table (fastest)
2. **BGG API** (for new games)
3. **CSV file** (offline fallback)

### Sync Strategies

- **Full**: Delete all → Insert all (slow, reliable)
- **Incremental**: Compare → Update only changes (fast, efficient)
- **Robust**: Incremental + error handling + rate limiting (most reliable)

## 📊 Performance

| Method      | Speed     | Database Load | Best For        |
| ----------- | --------- | ------------- | --------------- |
| Full Sync   | ⏱️ Slow   | 🔥 High       | Initial setup   |
| Incremental | ⚡ Fast   | 💚 Low        | Regular updates |
| Robust      | 🐌 Medium | 💚 Low        | Large datasets  |

## 🛠️ Troubleshooting

### Common Issues

| Error                           | Solution                 |
| ------------------------------- | ------------------------ |
| `Environment variable required` | Check `.env.local` file  |
| `Too many requests`             | Use `sync:csv:robust`    |
| `Permission denied`             | Verify service role key  |
| `Request timeout`               | Check network connection |

### Diagnostic Steps

```bash
# 1. Check environment
npm run sync:diagnostics

# 2. Monitor progress
npm run monitor:sync:live

# 3. Verify completion
npm run monitor:sync
```

## 📁 File Structure

```
lib/
├── supabase-csv-sync.ts              # Full sync
├── supabase-csv-sync-incremental.ts  # Basic incremental
├── supabase-csv-sync-incremental-robust.ts  # Enhanced incremental
├── monitor-sync.ts                   # Status check
├── live-monitor-sync.ts              # Live monitoring
└── sync-diagnostics.ts               # Troubleshooting

public/
└── boardgames_ranks.csv              # Source CSV file
```

## 🗄️ Database Schema

### Required Columns

- `id` (Primary Key)
- `name`
- `yearpublished`
- `rank`
- `bayesaverage`
- `is_expansion`
- `abstracts_rank`
- `cgs_rank`
- `childrensgames_rank`
- `familygames_rank`
- `partygames_rank`
- `strategygames_rank`
- `thematic_rank`
- `wargames_rank`

### Ignored Columns (from CSV)

- `average` (using `bayesaverage` instead)
- `usersrated` (not used in app)

## 🔧 Maintenance

### Regular Tasks

- [ ] Monitor sync performance
- [ ] Update CSV file as needed
- [ ] Run incremental syncs
- [ ] Check database health

### Cleanup

```sql
-- Remove unused columns
ALTER TABLE csv_games DROP COLUMN average;
ALTER TABLE csv_games DROP COLUMN usersrated;
```

## 📞 Support

1. Run diagnostics: `npm run sync:diagnostics`
2. Check logs for errors
3. Verify environment variables
4. Test Supabase connectivity

## 🎯 Best Practices

- ✅ Use incremental sync for regular updates
- ✅ Monitor large syncs with live monitoring
- ✅ Use robust sync for unreliable connections
- ✅ Keep CSV file in `public/boardgames_ranks.csv`
- ✅ Verify sync completion before proceeding
