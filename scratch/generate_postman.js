const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../backend/src');
const collectionFile = path.join(__dirname, '../Wheedle_API_Postman_Collection.json');

function findFiles(dir, ext, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findFiles(filePath, ext, fileList);
    } else if (filePath.endsWith(ext)) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const controllerFiles = findFiles(srcDir, '.controller.ts');

const collection = {
  info: {
    name: 'Wheedle API',
    description: 'Auto-generated Postman Collection for all backend APIs',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
  },
  item: []
};

// Simple Regex to extract controller route and methods
// Example: @Controller('auth') -> captures auth
const controllerRegex = /@Controller\(\s*(['"`]?)(.*?)\1\s*\)/;
const methodRegex = /@(Get|Post|Put|Patch|Delete)\(\s*(['"`]?)(.*?)\2\s*\)/g;

const folders = {};

for (const file of controllerFiles) {
  const content = fs.readFileSync(file, 'utf8');
  
  // Find @Controller
  const ctrlMatch = content.match(controllerRegex);
  if (!ctrlMatch) continue;
  
  let basePath = ctrlMatch[2] || '';
  if (basePath.startsWith('/')) basePath = basePath.slice(1);
  
  const folderName = path.basename(file, '.controller.ts');
  if (!folders[folderName]) {
    folders[folderName] = {
      name: folderName.charAt(0).toUpperCase() + folderName.slice(1),
      item: []
    };
    collection.item.push(folders[folderName]);
  }
  
  // Find all methods
  let match;
  while ((match = methodRegex.exec(content)) !== null) {
    const httpMethod = match[1].toUpperCase();
    let subPath = match[3] || '';
    if (subPath.startsWith('/')) subPath = subPath.slice(1);
    
    let fullPath = `{{baseUrl}}/${basePath}${subPath ? '/' + subPath : ''}`;
    // Cleanup double slashes
    fullPath = fullPath.replace(/([^:]\/)\/+/g, "$1");
    
    // Extract a name from the function definition roughly
    const lineIndex = content.substring(0, match.index).split('\n').length;
    const followingLines = content.split('\n').slice(lineIndex, lineIndex + 3).join(' ');
    const funcMatch = followingLines.match(/async\s+([a-zA-Z0-9_]+)\s*\(/) || followingLines.match(/([a-zA-Z0-9_]+)\s*\(/);
    const funcName = funcMatch ? funcMatch[1] : `${httpMethod} ${subPath || '/'}`;
    
    folders[folderName].item.push({
      name: funcName,
      request: {
        method: httpMethod,
        header: [
          {
            key: 'Authorization',
            value: 'Bearer {{token}}',
            type: 'text'
          }
        ],
        url: {
          raw: fullPath,
          host: ['{{baseUrl}}'],
          path: fullPath.replace('{{baseUrl}}/', '').split('/')
        }
      },
      response: []
    });
  }
}

// Add variables
collection.variable = [
  {
    key: 'baseUrl',
    value: 'http://wheedletechnologies.tech/ai/api',
    type: 'string'
  },
  {
    key: 'token',
    value: 'YOUR_AUTH_TOKEN_HERE',
    type: 'string'
  }
];

fs.writeFileSync(collectionFile, JSON.stringify(collection, null, 2));
console.log(`Generated Postman collection at: ${collectionFile}`);
