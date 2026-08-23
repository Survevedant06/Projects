const fs = require('fs');
const path = require('path');

const mockDataPath = path.join(__dirname, '../src/lib/mockData.ts');
let content = fs.readFileSync(mockDataPath, 'utf8');

// Fix unescaped single quotes in Maharashtra's, O'Chef, etc.
content = content.replace(/Maharashtra's/g, "Maharashtra\\'s");
content = content.replace(/O'Chef/g, "O\\'Chef");
content = content.replace(/Ratnagiri's/g, "Ratnagiri\\'s");
content = content.replace(/Chiplun's/g, "Chiplun\\'s");
content = content.replace(/isn't/g, "isn\\'t");

fs.writeFileSync(mockDataPath, content, 'utf8');
console.log('Fixed quotes in mockData.ts');
