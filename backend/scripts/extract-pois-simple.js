/**
 * Simple POI extractor using osm-pbf-parser
 * Extracts POIs from Pakistan PBF file without requiring osmium
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PBF_FILE = path.join(__dirname, '../../graphhopper/data/pakistan-latest.osm.pbf');
const OUTPUT_DIR = path.join(__dirname, '../data/pois');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// POI categories with OSM tags
const POI_FILTERS = {
  hospitals: {
    amenity: ['hospital', 'clinic', 'doctors'],
    healthcare: ['hospital', 'clinic', 'doctor']
  },
  schools: {
    amenity: ['school', 'university', 'college', 'kindergarten']
  },
  fuel_stations: {
    amenity: ['fuel']
  },
  restaurants: {
    amenity: ['restaurant', 'cafe', 'fast_food', 'food_court']
  },
  mosques: {
    amenity: ['place_of_worship'],
    religion: ['muslim']
  },
  banks: {
    amenity: ['bank', 'atm']
  },
  police: {
    amenity: ['police']
  },
  parks: {
    leisure: ['park', 'garden', 'playground']
  },
  hotels: {
    tourism: ['hotel', 'motel', 'guest_house']
  },
  shops: {
    shop: ['supermarket', 'mall', 'convenience']
  }
};

console.log('🚀 POI Extraction Tool');
console.log('='.repeat(50));
console.log(`📁 Input: ${PBF_FILE}`);
console.log(`📂 Output: ${OUTPUT_DIR}`);
console.log('');

// Check if PBF file exists
if (!fs.existsSync(PBF_FILE)) {
  console.error('❌ Error: PBF file not found!');
  console.error(`   Expected: ${PBF_FILE}`);
  process.exit(1);
}

console.log('📦 Installing required package: osm-pbf-parser');
console.log('   This may take a moment...');
console.log('');

// Install osm-pbf-parser if not already installed
const installProcess = spawn('npm', ['install', 'osm-pbf-parser', '--no-save'], {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit',
  shell: true
});

installProcess.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Failed to install osm-pbf-parser');
    process.exit(1);
  }
  
  console.log('✅ Package installed successfully');
  console.log('');
  
  // Now run the extraction
  extractPOIs();
});

function extractPOIs() {
  console.log('🔍 Starting POI extraction...');
  console.log('   This will take several minutes for the full Pakistan dataset');
  console.log('');
  
  try {
    const through2 = require('through2');
    const parseOSM = require('osm-pbf-parser');
    
    const osm = parseOSM();
    const pois = {};
    
    // Initialize POI arrays
    Object.keys(POI_FILTERS).forEach(category => {
      pois[category] = [];
    });
    
    let nodeCount = 0;
    let poiCount = 0;
    
    // Parse the PBF file
    fs.createReadStream(PBF_FILE)
      .pipe(osm)
      .pipe(through2.obj((items, enc, next) => {
        items.forEach(item => {
          if (item.type === 'node' && item.tags) {
            nodeCount++;
            
            // Check each POI category
            Object.entries(POI_FILTERS).forEach(([category, filters]) => {
              let matches = false;
              
              // Check if node matches any filter
              Object.entries(filters).forEach(([key, values]) => {
                if (item.tags[key] && values.includes(item.tags[key])) {
                  matches = true;
                }
              });
              
              if (matches) {
                pois[category].push({
                  type: 'Feature',
                  geometry: {
                    type: 'Point',
                    coordinates: [item.lon, item.lat]
                  },
                  properties: {
                    id: item.id,
                    name: item.tags.name || item.tags['name:en'] || 'Unnamed',
                    ...item.tags
                  }
                });
                poiCount++;
              }
            });
            
            // Progress indicator
            if (nodeCount % 100000 === 0) {
              process.stdout.write(`\r   Processed ${(nodeCount / 1000000).toFixed(1)}M nodes, found ${poiCount} POIs...`);
            }
          }
        });
        next();
      }))
      .on('finish', () => {
        console.log(`\n\n✅ Extraction complete!`);
        console.log(`   Total nodes processed: ${nodeCount.toLocaleString()}`);
        console.log(`   Total POIs found: ${poiCount.toLocaleString()}`);
        console.log('');
        
        // Save each category as GeoJSON
        Object.entries(pois).forEach(([category, features]) => {
          if (features.length > 0) {
            const geojson = {
              type: 'FeatureCollection',
              features: features
            };
            
            const outputFile = path.join(OUTPUT_DIR, `${category}.geojson`);
            fs.writeFileSync(outputFile, JSON.stringify(geojson, null, 2));
            
            const sizeMB = (fs.statSync(outputFile).size / (1024 * 1024)).toFixed(2);
            console.log(`📍 ${category.padEnd(20)} ${features.length.toString().padStart(6)} POIs (${sizeMB} MB)`);
          }
        });
        
        console.log('');
        console.log('✨ All POIs extracted successfully!');
        console.log('');
        console.log('Next steps:');
        console.log('1. Start the backend server: cd backend && npm run dev');
        console.log('2. POIs will be served from /api/pois/:category');
      })
      .on('error', (err) => {
        console.error('❌ Error during extraction:', err);
        process.exit(1);
      });
      
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('');
    console.error('Make sure you have Node.js installed and try again.');
    process.exit(1);
  }
}
