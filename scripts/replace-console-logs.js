#!/usr/bin/env node

/**
 * Script zum automatischen Ersetzen von console.log Statements
 * durch strukturiertes Logging
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mapping von Datei-Pfaden zu Logger-Typen
const loggerMapping = {
  'server/routes/': 'apiLogger',
  'server/services/': 'businessLogger',
  'server/middleware/': 'apiLogger',
  'server/controllers/': 'apiLogger',
  'auth': 'authLogger',
  'database': 'dbLogger',
  'security': 'securityLogger',
  'performance': 'performanceLogger'
};

// Patterns für verschiedene console.log Typen
const patterns = [
  {
    // console.log('[API] message')
    regex: /console\.log\(['"`]\[([^\]]+)\]\s*([^'"`]+)['"`]\)/g,
    replacement: (match, prefix, message) => {
      const logger = getLoggerForPrefix(prefix);
      return `${logger}.info('${message.trim()}', { context: '${prefix}' })`;
    }
  },
  {
    // console.error('[API] message')
    regex: /console\.error\(['"`]\[([^\]]+)\]\s*([^'"`]+)['"`]\)/g,
    replacement: (match, prefix, message) => {
      const logger = getLoggerForPrefix(prefix);
      return `${logger}.error('${message.trim()}', { context: '${prefix}' })`;
    }
  },
  {
    // console.warn('[API] message')
    regex: /console\.warn\(['"`]\[([^\]]+)\]\s*([^'"`]+)['"`]\)/g,
    replacement: (match, prefix, message) => {
      const logger = getLoggerForPrefix(prefix);
      return `${logger}.warn('${message.trim()}', { context: '${prefix}' })`;
    }
  },
  {
    // console.log('message', data)
    regex: /console\.log\(['"`]([^'"`]+)['"`],\s*([^)]+)\)/g,
    replacement: (match, message, data) => {
      return `logger.info('${message}', ${data})`;
    }
  },
  {
    // console.error('message', data)
    regex: /console\.error\(['"`]([^'"`]+)['"`],\s*([^)]+)\)/g,
    replacement: (match, message, data) => {
      return `logger.error('${message}', ${data})`;
    }
  },
  {
    // console.log('simple message')
    regex: /console\.log\(['"`]([^'"`]+)['"`]\)/g,
    replacement: (match, message) => {
      return `logger.info('${message}')`;
    }
  },
  {
    // console.error('simple message')
    regex: /console\.error\(['"`]([^'"`]+)['"`]\)/g,
    replacement: (match, message) => {
      return `logger.error('${message}')`;
    }
  },
  {
    // console.warn('simple message')
    regex: /console\.warn\(['"`]([^'"`]+)['"`]\)/g,
    replacement: (match, message) => {
      return `logger.warn('${message}')`;
    }
  }
];

function getLoggerForPrefix(prefix) {
  const lowerPrefix = prefix.toLowerCase();
  
  if (lowerPrefix.includes('auth') || lowerPrefix.includes('login')) {
    return 'authLogger';
  }
  if (lowerPrefix.includes('db') || lowerPrefix.includes('database') || lowerPrefix.includes('sql')) {
    return 'dbLogger';
  }
  if (lowerPrefix.includes('security') || lowerPrefix.includes('rate')) {
    return 'securityLogger';
  }
  if (lowerPrefix.includes('performance') || lowerPrefix.includes('perf')) {
    return 'performanceLogger';
  }
  if (lowerPrefix.includes('api') || lowerPrefix.includes('route')) {
    return 'apiLogger';
  }
  
  return 'logger';
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let hasChanges = false;

    // Determine logger type based on file path
    let loggerType = 'logger';
    for (const [pathPrefix, logger] of Object.entries(loggerMapping)) {
      if (filePath.includes(pathPrefix)) {
        loggerType = logger;
        break;
      }
    }

    // Apply replacements
    patterns.forEach(pattern => {
      const matches = newContent.match(pattern.regex);
      if (matches && matches.length > 0) {
        newContent = newContent.replace(pattern.regex, pattern.replacement);
        hasChanges = true;
      }
    });

    // Add import statement if changes were made and import doesn't exist
    if (hasChanges && !newContent.includes('import') && !newContent.includes('require')) {
      const importStatement = `import { ${loggerType}, LoggingUtils } from '../utils/logger';\n`;
      newContent = importStatement + newContent;
    } else if (hasChanges && !newContent.includes('from \'../utils/logger\'')) {
      // Add to existing imports
      newContent = newContent.replace(
        /(import.*from.*['"];?\n)/,
        `$1import { ${loggerType}, LoggingUtils } from '../utils/logger';\n`
      );
    }

    if (hasChanges) {
      fs.writeFileSync(filePath, newContent);
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dirPath) {
  let totalFiles = 0;
  let updatedFiles = 0;

  function walkDir(currentPath) {
    const files = fs.readdirSync(currentPath);
    
    files.forEach(file => {
      const fullPath = path.join(currentPath, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        walkDir(fullPath);
      } else if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.js'))) {
        totalFiles++;
        if (processFile(fullPath)) {
          updatedFiles++;
        }
      }
    });
  }

  walkDir(dirPath);
  return { totalFiles, updatedFiles };
}

// Main execution
function main() {
  const targetDirs = ['server', 'client/src'];
  let totalProcessed = 0;
  let totalUpdated = 0;

  console.log('🚀 Starting console.log replacement...\n');

  targetDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      console.log(`📁 Processing directory: ${dir}`);
      const result = processDirectory(dir);
      totalProcessed += result.totalFiles;
      totalUpdated += result.updatedFiles;
      console.log(`   📊 Files processed: ${result.totalFiles}, Updated: ${result.updatedFiles}\n`);
    } else {
      console.log(`⚠️  Directory not found: ${dir}\n`);
    }
  });

  console.log('🎉 Console.log replacement completed!');
  console.log(`📈 Total files processed: ${totalProcessed}`);
  console.log(`✅ Total files updated: ${totalUpdated}`);
  console.log(`📉 Console.log statements remaining: ${totalProcessed - totalUpdated}`);
}

// Run main function if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { processFile, processDirectory };
