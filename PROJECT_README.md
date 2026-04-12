# Permian Basin Water Infrastructure App

## Project Overview

Mobile-first web application for tracking water infrastructure in the Permian Basin (Texas + New Mexico). Enables drivers, operators, and site managers to find water stations, brine points, SWDs (Salt Water Disposal), and water haulers - with real-time status updates and notifications.

## Scope of Work

### Features Planned

1. **User Authentication**
   - Email/password login
   - Google OAuth
   - Access control: public map view vs. signed-in detailed view

2. **Station Management**
   - Display map with all water infrastructure locations
   - Station types: Non-Potable Water, Fresh Water, Brine, SWD, Water Hauler
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
  - Water Hauler: 4

### To Do

- [ ] Set up Supabase Authentication (email/password + Google OAuth)
- [ ] Configure file storage for photo submissions
- [ ] Update frontend to fetch from Supabase instead of hardcoded data
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

## Technology Stack

- **Frontend**: HTML/CSS/JavaScript (mobile-first)
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Database**: Supabase PostgreSQL

## Supabase Configuration

- **Project URL**: https://cqfvypmrogoootehsdfh.supabase.co
- **API Keys**: (stored locally, not committed)

## Getting Started

1. Set up Supabase auth providers in Dashboard → Authentication → Providers
2. Enable file storage in Dashboard → Storage
3. Update frontend to use Supabase client
4. Deploy to hosting (Vercel, Netlify, etc.)

## Notes

- Stations without coordinates were not imported (field location codes with null lat/lng)
- Photo storage bucket needs to be created
- OCR processing will require Supabase Edge Functions or external service