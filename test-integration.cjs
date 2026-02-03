// Test script to verify local routing integration
const http = require('http');

// Test data - route from Blue Area to F-6 Markaz in Islamabad
const testRoute = {
  start: [73.0479, 33.6844],
  end: [73.0931, 33.7294],
  mode: 'driving',
  alternatives: true
};

console.log('🧪 Testing Local Routing Integration\n');
console.log('=====================================\n');

// Test 1: GraphHopper Health
console.log('Test 1: GraphHopper Health Check');
const ghHealthReq = http.get('http://localhost:8989/health', (res) => {
  console.log(`✅ GraphHopper Status: ${res.statusCode}`);
  
  // Test 2: Backend Health
  console.log('\nTest 2: Backend API Health Check');
  const backendHealthReq = http.get('http://localhost:3001/api/health', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const health = JSON.parse(data);
      console.log(`✅ Backend Status: ${res.statusCode}`);
      console.log(`   GraphHopper: ${health.graphhopper}`);
      
      // Test 3: Route Calculation
      console.log('\nTest 3: Route Calculation');
      const postData = JSON.stringify(testRoute);
      const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/route',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': postData.length
        }
      };
      
      const routeReq = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) {
            const result = JSON.parse(data);
            console.log(`✅ Route Calculation: ${res.statusCode}`);
            console.log(`   Routes found: ${result.routes.length}`);
            console.log(`   Distance: ${(result.routes[0].distance / 1000).toFixed(2)} km`);
            console.log(`   Duration: ${(result.routes[0].duration / 60).toFixed(1)} min`);
            console.log(`   Steps: ${result.routes[0].steps.length}`);
            console.log('\n✅ All tests passed! Integration is working correctly.\n');
          } else {
            console.log(`❌ Route Calculation Failed: ${res.statusCode}`);
            console.log(data);
          }
        });
      });
      
      routeReq.on('error', (e) => {
        console.log(`❌ Route Calculation Error: ${e.message}`);
      });
      
      routeReq.write(postData);
      routeReq.end();
    });
  });
  
  backendHealthReq.on('error', (e) => {
    console.log(`❌ Backend Health Check Failed: ${e.message}`);
    console.log('   Make sure backend is running: cd backend && npm run dev');
  });
});

ghHealthReq.on('error', (e) => {
  console.log(`❌ GraphHopper Health Check Failed: ${e.message}`);
  console.log('   Make sure GraphHopper is running: cd graphhopper && start-graphhopper.bat');
});
