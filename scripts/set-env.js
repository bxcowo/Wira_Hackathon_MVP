const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Define the target environment file path
const targetPath = './src/environments/environment.ts';
const targetPathProd = './src/environments/environment.prod.ts';

// Load environment variables with fallback values
const envConfigFile = `export const environment = {
  production: false,
  googleMapsApiKey: '${process.env.GOOGLE_MAPS_API_KEY || 'your-google-maps-api-key-here'}'
};
`;

const envConfigFileProd = `export const environment = {
  production: true,
  googleMapsApiKey: '${process.env.GOOGLE_MAPS_API_KEY || 'your-google-maps-api-key-here'}'
};
`;

console.log('Setting up environment variables...');

// Write environment files
fs.writeFileSync(targetPath, envConfigFile, { encoding: 'utf8' });
fs.writeFileSync(targetPathProd, envConfigFileProd, { encoding: 'utf8' });

console.log('Environment variables set successfully!');
console.log(`Development environment: ${targetPath}`);
console.log(`Production environment: ${targetPathProd}`);