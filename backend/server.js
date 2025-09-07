// Legacy server.js - redirects to new optimized structure
// This file is kept for backward compatibility
// The new server is located at src/server.js

console.log('⚠️  This is the legacy server.js file.');
console.log('📁 The new optimized server is located at src/server.js');
console.log('🚀 Please run: npm start (which uses src/server.js)');
console.log('🔧 Or run: npm run dev (for development with nodemon)');

// Import and start the new server
import ('./src/server.js').catch((error) => {
    console.error('❌ Failed to start new server:', error);
    console.error('💡 Make sure you have installed dependencies: npm install');
    process.exit(1);
});