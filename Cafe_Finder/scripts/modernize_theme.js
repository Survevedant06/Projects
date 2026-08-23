const fs = require('fs');
const path = require('path');

function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walk(filePath, fileList);
    } else if (/\.(tsx|ts|jsx|js|css)$/.test(file)) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const files = walk(path.join(__dirname, '../src'));

const replacements = [
  ['#F5C518', '#0EA5E9'],
  ['#FFD700', '#38BDF8'],
  ['#D4A800', '#0284C7'],
  ['#0A0A0A', '#090D16'],
  ['#111111', '#0F172A'],
  ['#1A1A1A', '#1E293B'],
  ['#2A2A2A', '#243247'],
  ['rgba(245,197,24,', 'rgba(14,165,233,'],
  ['rgba(245, 197, 24,', 'rgba(14, 165, 233,'],
  ['text-[#F5C518]', 'text-nomad-teal-400'],
  ['bg-[#F5C518]', 'bg-nomad-teal-600'],
  ['border-[#F5C518]', 'border-nomad-teal-500'],
];

let updatedCount = 0;
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  for (const [from, to] of replacements) {
    content = content.split(from).join(to);
  }
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    updatedCount++;
    console.log(`Updated theme in: ${path.relative(path.join(__dirname, '..'), file)}`);
  }
}

console.log(`\nTheme modernization complete! Updated ${updatedCount} files.`);
