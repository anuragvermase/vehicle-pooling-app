import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

const createEnvExample = () => {
  const envExamplePath = path.join(__dirname, '..', '.env.example');
  const envExampleContent = `# Server Configuration
PORT=5001
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/poolride

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_secure_at_least_32_characters
JWT_EXPIRE=30d

# Security Configuration
BCRYPT_ROUNDS=12

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
`;

  if (!fs.existsSync(envExamplePath)) {
    fs.writeFileSync(envExamplePath, envExampleContent);
    console.log('✅ Created .env.example file');
  } else {
    console.log('📁 .env.example already exists');
  }
};

const createEnvFile = () => {
  const envPath = path.join(__dirname, '..', '.env');
  const envExamplePath = path.join(__dirname, '..', '.env.example');
  
  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ Created .env file from .env.example');
      console.log('⚠  Please update the values in .env file, especially:');
      console.log('   - JWT_SECRET (make it unique and secure)');
      console.log('   - MONGODB_URI (if using a different database)');
    } else {
      console.log('❌ .env.example not found. Please create it first.');
    }
  } else {
    console.log('📁 .env file already exists');
  }
};

const checkNodeVersion = () => {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  console.log(`📊 Node.js version: ${nodeVersion}`);
  
  if (majorVersion < 16) {
    console.warn('⚠  Warning: Node.js 16 or higher is recommended');
  } else {
    console.log('✅ Node.js version is compatible');
  }
};

const createDirectories = () => {
  const directories = ['logs', 'uploads', 'temp'];
  
  directories.forEach(dir => {
    const dirPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`✅ Created ${dir} directory`);
    } else {
      console.log(`📁 ${dir} directory already exists`);
    }
  });
};

const installDependencies = () => {
  console.log('📦 Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log('✅ Dependencies installed successfully');
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    return false;
  }
  return true;
};

const runSetup = async () => {
  console.log('🚀 Setting up PoolRide Backend...\n');
  
  // Check Node.js version
  checkNodeVersion();
  console.log();
  
  // Create necessary directories
  console.log('📁 Creating directories...');
  createDirectories();
  console.log();
  
  // Create .env.example
  console.log('📝 Setting up environment files...');
  createEnvExample();
  
  // Create .env from example
  createEnvFile();
  console.log();
  
  // Install dependencies
  if (!installDependencies()) {
    process.exit(1);
  }
  console.log();
  
  // Check environment
  console.log('🔍 Validating environment configuration...');
  try {
    execSync('node scripts/check-env.js', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  } catch (error) {
    console.log('\n❌ Environment validation failed. Please fix the issues above.');
    process.exit(1);
  }
  
  console.log('\n🎉 Setup completed successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Review and update your .env file if needed');
  console.log('2. Make sure MongoDB is running');
  console.log('3. Run: npm run dev');
  console.log('\n🔗 Useful commands:');
  console.log('   npm run dev     - Start development server');
  console.log('   npm start       - Start production server');
  console.log('   npm run check   - Check environment configuration');
};

// Run setup
runSetup().catch(console.error);