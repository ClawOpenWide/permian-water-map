// Sync Tall City Brine live data to Supabase
// Fetches tank levels from tcbrine.com and updates the database

const SUPABASE_URL = 'https://cqfvypmrogoootehsdfh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxZnZ5cG1yb2dvb290ZWhzZGZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2Mzk1ODcsImV4cCI6MjA5MTIxNTU4N30.rGxaQsZhyjy7gaw7ZHmAVyKW1phQP2Ea4ZhHuWBeH_Q';

// Map scraped station names to database station names/IDs
// Database IDs from the stations table
const STATION_MAP = {
  'South Midland': { id: 'dd63da37-fa63-4b1d-a9e5-a9cc84fe4312', name: 'Tall City Brine - South Midland' },
  'St Lawrence (137)': { id: null, name: 'Tall City Brine - St Lawrence (137)' },  // Not in DB (no coords)
  'Tarzan (176)': { id: null, name: 'Tall City Brine - Tarzan (176)' },
  'Midland Co (1379)': { id: null, name: 'Tall City Brine - Midland Co (1379)' },
  'Pecos (1450)': { id: null, name: 'Tall City Brine - Pecos (1450)' },
  'Upton Co (1492)': { id: null, name: 'Tall City Brine - Upton Co (1492)' },
  'Barstow': { id: null, name: 'Tall City Brine - Barstow' },
  'Big Spring': { id: '9196e169-084f-4bf4-be37-32bda675c5f1', name: 'Tall City Brine - Big Spring' },
  'Coyanosa': { id: null, name: 'Tall City Brine - Coyanosa' },
  'Denver City': { id: 'c622b9ec-816b-4891-9a10-5e0ccc7e92ed', name: 'Tall City Brine - Denver City' },
  'Garden City': { id: null, name: 'Tall City Brine - Garden City' },
  'Grady': { id: null, name: 'Tall City Brine - Grady' },
  'JBS (338)': { id: null, name: 'Tall City Brine - JBS (338)' },
  'Kermit': { id: '2878ea6a-ce0b-449a-a2ac-d8d0a344574a', name: 'Tall City Brine - Kermit' },
  'Knott': { id: null, name: 'Tall City Brine - Knott' },
  'Levelland': { id: '5d0c1a63-ad3a-4db8-9e1a-874ffe6fad36', name: 'Tall City Brine - Levelland' },
  'Midkiff': { id: null, name: 'Tall City Brine - Midkiff' },
  'North Big Lake': { id: null, name: 'Tall City Brine - North Big Lake' },
  'North Odessa': { id: null, name: 'Tall City Brine - North Odessa' },
  'North Pecos (285)': { id: null, name: 'Tall City Brine - North Pecos (285)' },
  'Orla': { id: null, name: 'Tall City Brine - Orla' },
  'Orla 448': { id: null, name: 'Tall City Brine - Orla 448' },
  'Patricia': { id: null, name: 'Tall City Brine - Patricia' },
  'South Pecos (17)': { id: null, name: 'Tall City Brine - South Pecos (17)' },
  'Spraberry': { id: null, name: 'Tall City Brine - Spraberry' },
  'Stanton': { id: '923fb50a-438b-49ca-9f3d-6388d3b311e4', name: 'Tall City Brine - Stanton' },
  'West Mentone': { id: null, name: 'Tall City Brine - West Mentone' },
  'West Monahans': { id: null, name: 'Tall City Brine - West Monahans' }
};

const STATIONS = [
  { name: 'South Midland', slug: 'southmidlandlevels', page: 'southmidlandlevels.php' },
  { name: 'St Lawrence (137)', slug: '137', page: '137.php' },
  { name: 'Tarzan (176)', slug: '176', page: '176.php' },
  { name: 'Midland Co (1379)', slug: '1379', page: '1379.php' },
  { name: 'Pecos (1450)', slug: '1450', page: '1450levels.php' },
  { name: 'Upton Co (1492)', slug: '1492', page: '1492levels.php' },
  { name: 'Barstow', slug: 'barstow', page: 'barstow.php' },
  { name: 'Big Spring', slug: 'bigspring', page: 'bigspringlevels.php' },
  { name: 'Coyanosa', slug: 'coyanosa', page: 'coyanosa.php' },
  { name: 'Denver City', slug: 'denvercity', page: 'denvercity.php' },
  { name: 'Garden City', slug: 'gardencity', page: 'gardencity.php' },
  { name: 'Grady', slug: 'grady', page: 'grady.php' },
  { name: 'JBS (338)', slug: 'jbs', page: 'jbslevels.php' },
  { name: 'Kermit', slug: 'kermit', page: 'kermit.php' },
  { name: 'Knott', slug: 'knott', page: 'knottlevels.php' },
  { name: 'Levelland', slug: 'levelland', page: 'levelland.php' },
  { name: 'Midkiff', slug: 'midkiff', page: 'midkifflevels.php' },
  { name: 'North Big Lake', slug: 'nbiglake', page: 'nbiglake.php' },
  { name: 'North Odessa', slug: 'northodessa', page: 'northodessalevels.php' },
  { name: 'North Pecos (285)', slug: 'northpecos', page: 'northpecos.php' },
  { name: 'Orla', slug: 'orla', page: 'northorla.php' },
  { name: 'Orla 448', slug: 'orla448', page: 'orla448.php' },
  { name: 'Patricia', slug: 'patricia', page: 'patricia.php' },
  { name: 'South Pecos (17)', slug: 'southpecos', page: 'southpecos.php' },
  { name: 'Spraberry', slug: 'spraberry', page: 'spraberry.php' },
  { name: 'Stanton', slug: 'stanton', page: 'stanton.php' },
  { name: 'West Mentone', slug: 'mentone', page: 'mentone.php' },
  { name: 'West Monahans', slug: 'monahans', page: 'monahans.php' }
];

const BASE_URL = 'https://tcbrine.com';

async function fetchStationData(page) {
  const response = await fetch(`${BASE_URL}/${page}`);
  const html = await response.text();
  
  const data = { lastUpdated: null, level: null, barrels: null, percent: null };
  
  // Last updated
  const updatedMatch = html.match(/Last Updated:\s*(\d{2}\/\d{2}\s*\d{1,2}:\d{2}\s*[AP]M)/i);
  if (updatedMatch) data.lastUpdated = updatedMatch[1].trim();
  
  // Water Level
  const waterLevelMatch = html.match(/Water Level:[\s\S]*?<h4>([\d\.]+)/i);
  if (waterLevelMatch) data.level = parseFloat(waterLevelMatch[1]);
  
  // Barrels
  const barrelsMatch = html.match(/Barrels Available:[\s\S]*?<h4>(\d+)/i);
  if (barrelsMatch) data.barrels = parseInt(barrelsMatch[1]);
  
  // Percent
  const percentMatch = html.match(/Current Tank Level:[\s\S]*?<h3>([\d\.]+)/i);
  if (percentMatch) data.percent = parseFloat(percentMatch[1]);
  
  return data;
}

async function updateStation(id, data) {
  // Determine status based on percent
  let status = 'open';
  let hasWater = true;
  
  if (data.percent === 0 || data.barrels === 0) {
    status = 'closed';
    hasWater = false;
  } else if (data.percent < 10) {
    status = 'low';
    hasWater = true;
  }
  
  const update = {
    level: data.level,
    status: status,
    has_water: hasWater,
    updated_at: new Date().toISOString()
  };
  
  const response = await fetch(`${SUPABASE_URL}/rest/v1/stations?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(update)
  });
  
  return response.ok;
}

async function main() {
  console.log('Fetching Tall City Brine live data and syncing to database...\n');
  
  let updated = 0;
  let skipped = 0;
  
  for (const station of STATIONS) {
    const mapped = STATION_MAP[station.name];
    
    if (!mapped || !mapped.id) {
      console.log(`[SKIP] ${station.name} - not in database (no coordinates)`);
      skipped++;
      continue;
    }
    
    console.log(`Fetching ${station.name}...`);
    try {
      const data = await fetchStationData(station.page);
      
      if (data.level && data.percent !== null) {
        const success = await updateStation(mapped.id, data);
        if (success) {
          console.log(`  -> Updated: ${data.level} ft, ${data.barrels} bbl, ${data.percent}%`);
          updated++;
        } else {
          console.log(`  -> FAILED to update database`);
        }
      } else {
        console.log(`  -> No data found on page`);
      }
    } catch (err) {
      console.error(`  -> Error: ${err.message}`);
    }
  }
  
  console.log(`\n--- Summary ---`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped (no DB entry): ${skipped}`);
}

main().catch(console.error);