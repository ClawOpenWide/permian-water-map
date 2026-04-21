// Sync Tall City Brine live data to Supabase + history
// Fetches tank levels from tcbrine.com, updates stations and records history

const SUPABASE_URL = 'https://cqfvypmrogoootehsdfh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxZnZ5cG1yb2dvb290ZWhzZGZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2Mzk1ODcsImV4cCI6MjA5MTIxNTU4N30.rGxaQsZhyjy7gaw7ZHmAVyKW1phQP2Ea4ZhHuWBeH_Q';

// Station map with DB IDs
const STATION_MAP = {
  'South Midland': { id: 'dd63da37-fa63-4b1d-a9e5-a9cc84fe4312', name: 'Tall City Brine - South Midland' },
  'Big Spring': { id: '9196e169-084f-4bf4-be37-32bda675c5f1', name: 'Tall City Brine - Big Spring' },
  'Denver City': { id: 'c622b9ec-816b-4891-9a10-5e0ccc7e92ed', name: 'Tall City Brine - Denver City' },
  'Kermit': { id: '2878ea6a-ce0b-449a-a2ac-d8d0a344574a', name: 'Tall City Brine - Kermit' },
  'Levelland': { id: '5d0c1a63-ad3a-4db8-9e1a-874ffe6fad36', name: 'Tall City Brine - Levelland' },
  'Stanton': { id: '923fb50a-438b-49ca-9f3d-6388d3b311e4', name: 'Tall City Brine - Stanton' }
};

const STATIONS = [
  { name: 'South Midland', page: 'southmidlandlevels.php' },
  { name: 'Big Spring', page: 'bigspringlevels.php' },
  { name: 'Denver City', page: 'denvercitylevels.php' },
  { name: 'Kermit', page: 'kermitlevels.php' },
  { name: 'Levelland', page: 'levellandlevels.php' },
  { name: 'Stanton', page: 'stantonlevels.php' }
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
    barrels: data.barrels,
    percent: data.percent,
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