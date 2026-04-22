# Permian Basin Water Infrastructure App

## Project Overview

Mobile-first web application for tracking water infrastructure in the Permian Basin (Texas + New Mexico). Enables drivers, operators, and site managers to find water stations, brine points, SWDs (Salt Water Disposal), and water haulers - with real-time status updates and notifications.

## Development Procedures

### Standard Operating Procedures

1. **Double-check code before pushing**
   - Review git diff before committing
   - Verify no unintended changes
   - Test locally if possible

2. **Wait for confirmation before pushing**
   - Show user the changes first
   - Wait for user confirmation before git push
   - Don't push until user says "push it"

3. **Small incremental changes**
   - Make one small change at a time
   - Test each change before moving to next
   - Revert immediately if something breaks

4. **Always have a working fallback**
   - Keep hardcoded data as fallback
   - Never break the initial render
   - If database fails, page should still work

## Scope of Work

### Features Planned

1. **User Authentication**
   - Email/password login
   - Google OAuth
   - Access control: public map view vs. signed-in detailed view

2. **Station Management**
   - Display map with all water infrastructure locations
   - Station types: Non-Potable Water, Fresh Water, Brine, SWD
   - Add new station listing (user-submitted)
   - Manual data input for non-automated stations

3. **Station Status Tracking**
   - Open/closed status
   - Water availability (has water / depleted)
   - SWD load acceptance (accepting loads / not accepting)
   - Water level (feet or barrels)
   - Status history for historical charts

4. **Driver Photo Submissions**
   - In-app camera capture of station display screens
   - OCR/image processing to extract status data
   - Auto-delete photos after 90 days

5. **User Features**
   - Pin top 3 favorite stations
   - Follow stations for notifications
   - Wait time tracking (queue entry + pump arrival timestamps)

6. **Notifications**
   - Email alerts when stations open/close
   - Email alerts when water available/depleted
   - Email alerts when SWDs stop/start accepting loads

7. **Historical Data**
   - 3-day charts
   - 7-day charts

8. **Internationalization**
   - English/Spanish language toggle

9. **Admin Dashboard**
   - User management
   - Station moderation (approve user submissions)
   - Photo submission review
   - System monitoring

## Current Status

### Completed ✅

- [x] **Database Setup** - Created 8 tables in Supabase:
  - `profiles` - User profiles linked to auth
  - `stations` - Water infrastructure locations
  - `station_status_history` - Historical status data
  - `user_pins` - Pinned stations (max 3 per user)
  - `user_follows` - Followed stations
  - `wait_times` - Queue wait time tracking
  - `photo_submissions` - Driver photo uploads
  - `station_submissions` - User-submitted new stations

- [x] **Station Data Import** - Imported 41 stations from existing map:
  - Water (Non-Potable): 15
  - Fresh Water: 1
  - Brine: 6
  - SWD: 15

- [x] **Database Integration** - Using native fetch API:
  - Stats update from database after page loads
  - Fallback hardcoded data ensures page always works
  - Uses setTimeout delay to prevent render conflicts
  - Station data loaded from database (level, status, has_water)
  - Tall City Brine live data synced (6 stations with coordinates)

- [x] **Tall City Brine Integration** - Live data from tcbrine.com:
  - Web scraper fetches tank levels (feet, barrels, %)
  - Sync script updates Supabase database every run
  - 28 stations tracked, 20+ have GPS coordinates, water availability, and location descriptions in database
  - Created scrape_tall_city_brine.js and sync_tall_city_brine.js

## Known Issues / To Fix

- (All previously reported issues have been resolved)

## Recent Changes (2026-04-21)

- Fixed menu to show only Sign In or Log Out (not both)
- Station card taps now open detail modal on mobile
- Added station detail screen with:
  - Current level and status
  - 3 Day / 7 Day line graph toggle with animated pulsing dot
  - Get Directions button (opens Google Maps app on mobile)
- Set up hourly cron job to scrape Tall City Brine data and build history
- Created scripts/sync_tall_city_brine.js for data sync

## Previous Changes (2026-04-13)

- Added login modal with Google and email options
- Added "Sign In" to menu (should toggle to "Log Out" when authenticated)
- Added station detail modal (login-gated content with levels/charts/wait times)
- Supabase auth loads dynamically (not on page load to avoid breaking map)

### To Do

- [ ] Set up Supabase Authentication (email/password + Google OAuth)
- [ ] Configure file storage for photo submissions
- [ ] Load station data from database (not just counts)
- [ ] Implement authentication flow
- [ ] Build station detail view (requires sign-in)
- [ ] Add pin/follow functionality
- [ ] Build photo submission feature
- [ ] Set up OCR processing pipeline
- [ ] Implement email notification system
- [ ] Add wait time tracking
- [ ] Create historical charts (3-day, 7-day)
- [ ] Add English/Spanish toggle
- [ ] Build admin dashboard

## Technical Notes

### Database Access Pattern
- Use native **fetch API** instead of Supabase client library
- Client library causes issues on mobile browsers
- Keep API keys in code (using anon key is safe for read operations)

```javascript
// Working pattern - fetch with delay
setTimeout(() => {
    fetch(API_URL + '/rest/v1/stations?select=type', {
        headers: { 'apikey': API_KEY, 'Authorization': 'Bearer ' + API_KEY }
    }).then(r => r.json()).then(data => {
        // Update stats
    });
}, 2000);
```

### Lessons Learned
1. Don't replace core data arrays mid-render
2. Use native fetch instead of Supabase client when possible
3. Always have fallback data that loads immediately
4. Use setTimeout to delay database updates
5. Only update stats/counts, not full station lists

## Technology Stack

- **Frontend**: HTML/CSS/JavaScript (mobile-first)
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Database**: Supabase PostgreSQL

## Supabase Configuration

- **Project URL**: https://cqfvypmrogoootehsdfh.supabase.co
- **API Keys**: (stored in code - anon key for public reads)

## Getting Started

1. Set up Supabase auth providers in Dashboard → Authentication → Providers
2. Enable file storage in Dashboard → Storage
3. Deploy to hosting (Vercel, Netlify, etc.)

## Notes

- Stations without coordinates were not imported (field location codes with null lat/lng)
- Photo storage bucket needs to be created
- OCR processing will require Supabase Edge Functions or external service
- GPS location can be captured when drivers submit photos to help fill in missing coordinates