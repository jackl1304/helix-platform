// Simple API test to verify data flow
const http = require('http');

// Test backend API
console.log('Testing Backend API...');
http.get('http://localhost:3000/api/dashboard/stats', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('✅ Backend API Response:', JSON.stringify(JSON.parse(data), null, 2));
  });
}).on('error', (err) => {
  console.log('❌ Backend API Error:', err.message);
});

// Test frontend proxy after delay
setTimeout(() => {
  console.log('\nTesting Frontend Proxy...');
  http.get('http://localhost:5173/api/dashboard/stats', (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('✅ Frontend Proxy Response:', JSON.stringify(JSON.parse(data), null, 2));
    });
  }).on('error', (err) => {
    console.log('❌ Frontend Proxy Error:', err.message);
  });
}, 2000);