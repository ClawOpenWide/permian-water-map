# Debug Report: Database Integration Issues

## Problem
Adding Supabase client library and database integration kept breaking the page - map, listings, and menu would stop working.

## Root Causes Found

### 1. Supabase Client Library Conflict
- The `@supabase/supabase-js` client library caused the page to break on mobile devices
- Even wrapped in try/catch, initializing the client broke page rendering
- **Solution:** Use native fetch API instead of the Supabase client library

### 2. Data Loading Timing Issues  
- Attempting to replace the `stations` array and call `renderStations()` broke the page
- The initial render needs to complete before any database updates
- **Solution:** 
  - Keep the hardcoded data as fallback (renders immediately)
  - Load from database after a delay (setTimeout 2 seconds)
  - Only update stats, not the full station list

## Working Pattern (Final)
```javascript
// 1. Page loads with hardcoded fallback data (always works)
// 2. After 2 seconds, fetch data from API
// 3. Update only the stats (counts), not stations array
setTimeout(() => {
    fetch(API_URL + '/rest/v1/stations?select=type', {
        headers: { 'apikey': API_KEY, 'Authorization': 'Bearer ' + API_KEY }
    }).then(r => r.json()).then(data => {
        // Update stats only
        document.querySelector('.stat-num').textContent = count;
    });
}, 2000);
```

## Lessons Learned
1. Don't replace core data arrays mid-render
2. Use native fetch instead of client libraries when possible
3. Always have fallback data that loads immediately
4. Test incremental changes step by step
5. Don't push until user confirms working state

## What Works Now
- Map displays with fallback data
- Stats update from database after 2 seconds
- Mobile and desktop both work