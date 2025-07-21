import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

const requiredEnvVars = [
  'PORT',
  'NODE_ENV',
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_EXPIRE',
  'BCRYPT_ROUNDS'
];

const checkEnvironment = () => {
  console.log('🔍 Checking environment configuration...\n');
  
  // Check if .env file exists (go up one level from scripts folder)
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found!');
    console.log('📝 Please create a .env file in the root directory with the required variables.');
    console.log('💡 You can copy .env.example to .env and modify the values.');
    return false;
  }
  
  // Load environment variables
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  const envVars = {};
  
  envLines.forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });
  
  let allValid = true;
  
  console.log('📋 Checking required environment variables:\n');
  
  // Check required variables
  requiredEnvVars.forEach(varName => {
    if (!envVars[varName] || envVars[varName] === '') {
      console.error(`❌ Missing or empty: ${varName}`);
      allValid = false;
    } else {
      console.log(`✅ ${varName}: Set`);
    }
  });
  
  console.log('\n🔍 Validating specific variables:\n');
  
  // Validate specific variables
  if (envVars.JWT_SECRET) {
    if (envVars.JWT_SECRET.length < 32) {
      console.warn('⚠  JWT_SECRET should be at least 32 characters long for security');
    } else {
      console.log('✅ JWT_SECRET: Adequate length');
    }
  }
  
  if (envVars.MONGODB_URI) {
    if (!envVars.MONGODB_URI.startsWith('mongodb')) {
      console.error('❌ MONGODB_URI should start with "mongodb://" or "mongodb+srv://"');
      allValid = false;
    } else {
      console.log('✅ MONGODB_URI: Valid format');
    }
  }
  
  if (envVars.PORT) {
    const port = parseInt(envVars.PORT);
    if (isNaN(port) || port < 1000 || port > 65535) {
      console.warn('⚠  PORT should be a number between 1000 and 65535');
    } else {
      console.log('✅ PORT: Valid range');
    }
  }
  
  if (envVars.BCRYPT_ROUNDS) {
    const rounds = parseInt(envVars.BCRYPT_ROUNDS);
    if (isNaN(rounds) || rounds < 10 || rounds > 15) {
      console.warn('⚠  BCRYPT_ROUNDS should be between 10 and 15 for optimal security/performance');
    } else {
      console.log('✅ BCRYPT_ROUNDS: Optimal range');
    }
  }
  
  console.log('\n' + '='.repeat(50));
  if (allValid) {
    console.log('🎉 Environment configuration is valid!');
    console.log('🚀 You can now run: npm run dev');
  } else {
    console.log('❌ Please fix the above issues before starting the server.');
    console.log('📖 Refer to .env.example for the correct format.');
  }
  console.log('='.repeat(50));
  
  return allValid;
};

// Run the check
checkEnvironment();