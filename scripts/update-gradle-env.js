const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '../.env');
const gradlePropsPath = path.resolve(__dirname, '../android/gradle.properties');

const envConfig = dotenv.parse(fs.readFileSync(envPath));

const keysToInject = ['GOOGLE_API_KEY'];

const gradleLines = fs.existsSync(gradlePropsPath)
  ? fs.readFileSync(gradlePropsPath, 'utf8').split('\n')
  : [];

const filteredLines = gradleLines.filter(
  line => !keysToInject.some(key => line.startsWith(`${key}=`))
);

const updatedLines = [...filteredLines, ...keysToInject.map(key => `${key}=${envConfig[key]}`)];

fs.writeFileSync(gradlePropsPath, updatedLines.join('\n'));
console.log('✅ gradle.properties updated with API keys from .env');
