/**
 * Extract POIs from Pakistan PBF file
 * This script extracts Points of Interest from the OSM PBF file
 * and saves them as GeoJSON for fast querying
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PBF_FILE = path.join(__dirname, '../../graphhopper/data/pakistan-latest.osm.pbf');
const OUTPUT_DIR = path.join(__dirname, '../data/pois');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// POI categories to extract
const POI_CATEGORIES = {
  hospital: {
    tags: ['amenity=hospital', 'amenity=clinic', 'healthcare=hospital'],
    output: 'hospitals.geojson'
  },
  school: {
    tags: ['amenity=school', 'amenity=university', 'amenity=college'],
    output: 'schools.geojson'
  },
  fuel: {
    tags: ['amenity=fuel'],
    output: 'fuel_stations.geojson'
  },
  restaurant: {
    tags: ['amenity=restaurant', 'amenity=cafe', 'amenity=fast_food'],
    output: 'restaurants.geojson'
  },
  mosque: {
    tags: ['amenity=place_of_worship', 'religion=muslim'],
    output: 'mosques.geojson'
  },
  bank: {
    tags: ['amenity=bank', 'amenity=atm'],
    output: 'banks.geojson'
  },
  police: {
    tags: ['amenity=police'],
    output: 'police_stations.geojson'
  },
  park: {
    tags: ['leisure=park', 'leisure=garden'],
    output: 'parks.geojson'
  }
};

console.log('🚀 Starting POI extraction from Pakistan PBF file...');
console.log(`📁 Input: ${PBF_FILE}`);
console.log(`📂 Output: ${OUTPUT_DIR}`);
console.log('');

// Check if osmium is installed
try {
  execSync('osmium --version', { stdio: 'ignore' });
} catch (error) {
  console.error('❌ Error: osmium-tool is not installed!');
  console.error('');
  console.error('Please install osmium-tool:');
  console.error('  Windows: Download from https://osmcode.org/osmium-tool/');
  console.error('  Linux: sudo apt-get install osmium-tool');
  console.error('  macOS: brew install osmium-tool');
  process.exit(1);
}

// Extract POIs for each category
Object.entries(POI_CATEGORIES).forEach(([category, config]) => {
  console.log(`📍 Extracting ${category}...`);
  
  const outputFile = path.join(OUTPUT_DIR, config.output);
  const tagFilter = config.tags.map(tag => `n/${tag}`).join(' ');
  
  try {
    // Use osmium to extract and convert to GeoJSON
    const command = `osmium tags-filter ${PBF_FILE} ${tagFilter} -o ${outputFile} -f geojson --overwrite`;
    
    execSync(command, { stdio: 'inherit' });
    
    // Check file size
    const stats = fs.statSync(outputFile);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`  ✅ Saved ${config.output} (${sizeMB} MB)`);
  } catch (error) {
    console.error(`  ❌ Error extracting ${category}:`, error.message);
  }
  
  console.log('');
});

console.log('✨ POI extraction complete!');
console.log('');
console.log('Next steps:');
console.log('1. Start the backend server: npm run dev');
console.log('2. POIs will be served from /api/pois/:category');
