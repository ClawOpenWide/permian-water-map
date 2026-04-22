// Sync Tall City Brine live data to Supabase + history
// Fetches tank levels from tcbrine.com, updates stations and records history

const SUPABASE_URL = 'https://cqfvypmrogoootehsdfh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxZnZ5cG1yb2dvb290ZWhzZGZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2Mzk1ODcsImV4cCI6MjA5MTIxNTU4N30.rGxaQsZhyjy7gaw7ZHmAVyKW1phQP2Ea4ZhHuWBeH_Q';

// Station map with DB IDs
const STATION_MAP = {
  'South Midland': { id: 'dd63da37-fa63-4b1d-a9e5-a9cc84fe4312', name: 'Tall City Brine - South Midland' },
  'Big Spring': { id: '9196e169-084f-4bf4-be37-32bda675c5f1', name: 'Tall City Brine - Big Spring' },
  '1450': { id: 'f332fe6e-8550-4478-ada5-a13e0e7736d7', name: 'Tall City Brine - 1450 (Pecos)' },
  '1492': { id: '3b1ad555-7811-4b1c-be2a-6537b2f78733', name: 'Tall City Brine - 1492 (Upton Co)' },
  'JBS': { id: 'cebb53fa-d7de-429e-88d6-4db7609f9982', name: 'Tall City Brine - JBS (338)' },
  'Knott': { id: '6be2518b-e4fc-42dd-a2d7-118e8f2a1c60', name: 'Tall City Brine - Knott' },
  'Midkiff': { id: '7410e1d5-b2d5-46aa-9f88-7dddc26cc536', name: 'Tall City Brine - Midkiff' },
  'North Odessa': { id: '5c79993e-2815-4370-bcd9-b1aeb4f83dd8', name: 'Tall City Brine - North Odessa' }
};

// All working TC Brine pages (8 total)
const STATIONS = [
  { name: 'South Midland', page: 'southmidlandlevels.php' },
  { name: 'Big Spring', page: 'bigspringlevels.php' },
  { name: '1450', page: '1450levels.php' },
  { name: '1492', page: '1492levels.php' },
  { name: 'JBS', page: 'jbslevels.php' },
  { name: 'Knott', page: 'knottlevels.php' },
  { name: 'Midkiff', page: 'midkifflevels.php' },
  { name: 'North Odessa', page: 'northodessalevels.php' }
];

const BASE_URL = 'https://tcbrine.com';

async function fetchStationData(page) {
  const response = await fetch(`${BASE_URL}/${page}`);
  const html = await response.text();
  
  const data = { level: null, barrels: null, percent: null };
  
  const waterLevelMatch = html.match(/Water Level:[\s\S]*?<h4>([\d\.]+)/i);
  if (waterLevelMatch) data.level = parseFloat(waterLevelMatch[1]);
  
  const barrelsMatch = html.match(/Barrels Available:[\s\S]*?<h4>(\d+)/i);
  if (barrelsMatch) data.barrels = parseInt(barrelsMatch[1]);
  
  const percentMatch = html.match(/Current Tank Level:[\s\S]*?<h3>([\d\.]+)/i);
  if (percentMatch) data.percent = parseFloat(percentMatch[1]);
  
  return data;
}

async function updateStation(id, data) {
  let status = 'open';
  let hasWater = true;
  
  if (data.percent === 0 || data.barrels === 0) {
    status = 'closed';
    hasWater = false;
  } else if (data.percent < 10) {
    status = 'low';
  }
  
  const update = {
    level: data.level,
    status: status,
    has_water: hasWater
  };
  
  await fetch(`${SUPABASE_URL}/rest/v1/stations?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(update)
  });
}

async function recordHistory(stationId, data) {
  const record = {
    station_id: stationId,
    level: data.level,
    status: data.percent > 0 ? 'open' : 'closed',
    recorded_at: new Date().toISOString()
  };
  
  await fetch(`${SUPABASE_URL}/rest/v1/station_status_history`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(record)
  });
}

async function main() {
  console.log(`[${new Date().toISOString()}] Syncing Tall City Brine data...`);
  
  let updated = 0;
  
  for (const station of STATIONS) {
    const mapped = STATION_MAP[station.name];
    if (!mapped) continue;
    
    try {
      const data = await fetchStationData(station.page);
      
      if (data.level && data.percent !== null) {
        await updateStation(mapped.id, data);
        await recordHistory(mapped.id, data);
        console.log(`  ${station.name}: ${data.level}ft, ${data.percent}%`);
        updated++;
      }
    } catch (err) {
      console.error(`  Error ${station.name}: ${err.message}`);
    }
  }
  
  console.log(`Completed: ${updated} stations updated`);
}

main().catch(console.error);