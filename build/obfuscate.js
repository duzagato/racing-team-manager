/**
 * Build script with code obfuscation for production
 * Obfuscates the main process code to protect game logic and algorithms
 */
import JavaScriptObfuscator from 'javascript-obfuscator';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const obfuscationOptions = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.75,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.4,
  debugProtection: false,
  debugProtectionInterval: 0,
  disableConsoleOutput: true,
  identifierNamesGenerator: 'hexadecimal',
  log: false,
  numbersToExpressions: true,
  renameGlobals: false,
  selfDefending: true,
  simplify: true,
  splitStrings: true,
  splitStringsChunkLength: 10,
  stringArray: true,
  stringArrayCallsTransform: true,
  stringArrayEncoding: ['base64'],
  stringArrayIndexShift: true,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayWrappersCount: 2,
  stringArrayWrappersChainedCalls: true,
  stringArrayWrappersParametersMaxCount: 4,
  stringArrayWrappersType: 'function',
  stringArrayThreshold: 0.75,
  transformObjectKeys: true,
  unicodeEscapeSequence: false
};

function obfuscateFile(filePath) {
  console.log(`Obfuscating: ${filePath}`);
  const code = fs.readFileSync(filePath, 'utf8');
  const obfuscated = JavaScriptObfuscator.obfuscate(code, obfuscationOptions);
  fs.writeFileSync(filePath, obfuscated.getObfuscatedCode());
}

function obfuscateDirectory(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      obfuscateDirectory(fullPath);
    } else if (file.name.endsWith('.js')) {
      // Skip preload script (needs to be readable for Electron)
      if (!fullPath.includes('preload')) {
        obfuscateFile(fullPath);
      }
    }
  }
}

// Only run obfuscation in production builds
if (process.env.NODE_ENV === 'production') {
  console.log('Starting code obfuscation...');
  const mainDir = path.join(__dirname, '..', 'dist', 'main');
  
  if (fs.existsSync(mainDir)) {
    obfuscateDirectory(mainDir);
    console.log('Code obfuscation completed!');
  } else {
    console.warn('Main process directory not found. Build first.');
  }
} else {
  console.log('Skipping obfuscation in development mode.');
}
