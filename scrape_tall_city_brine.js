// Scraper for Tall City Brine station data
// Fetches live tank levels from tcbrine.com and imports to Supabase

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
  
  // Extract data from the HTML
  const data = {
    lastUpdated: null,
    brine: { level: null, barrels: null, percent: null },
    freshWater: { level: null, barrels: null, percent: null }
  };
  
  // Find last updated time
  const updatedMatch = html.match(/Last Updated:\s*(\d{2}\/\d{2}\s*\d{1,2}:\d{2}\s*[AP]M)/i);
  if (updatedMatch) {
    data.lastUpdated = updatedMatch[1].trim();
  }
  
  // Find Brine Tank section - look for h4 tags after specific labels
  // Water Level is in h4 after "Water Level:"
  const waterLevelMatch = html.match(/Water Level:[\s\S]*?<h4>([\d\.]+)/i);
  if (waterLevelMatch) data.brine.level = waterLevelMatch[1];
  
  // Barrels Available is in h4 after "Barrels Available:"
  const barrelsMatch = html.match(/Barrels Available:[\s\S]*?<h4>(\d+)/i);
  if (barrelsMatch) data.brine.barrels = parseInt(barrelsMatch[1]);
  
  // Percent is in h3 after "Current Tank Level:"  
  const percentMatch = html.match(/Current Tank Level:[\s\S]*?<h3>([\d\.]+)/i);
  if (percentMatch) data.brine.percent = parseFloat(percentMatch[1]);
  
  return data;
}

async function main() {
  console.log('Fetching Tall City Brine station data...\n');
  
  const results = [];
  
  for (const station of STATIONS) {
    console.log(`Fetching ${station.name}...`);
    try {
      const data = await fetchStationData(station.page);
      results.push({
        station: station.name,
        slug: station.slug,
        ...data
      });
      console.log(`  Brine: ${data.brine.level}' (${data.brine.barrels} bbl, ${data.brine.percent}%)`);
      console.log(`  Fresh: ${data.freshWater.level}' (${data.freshWater.barrels} bbl, ${data.freshWater.percent}%)`);
    } catch (err) {
      console.error(`  Error: ${err.message}`);
    }
  }
  
  console.log('\n--- Results ---');
  console.log(JSON.stringify(results, null, 2));
}

main().catch(console.error);