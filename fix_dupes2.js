const fs = require('fs');
const path = require('path');
const BASE = 'C:\\Users\\User\\Claude Code website';

const rootFiles = fs.readdirSync(BASE).filter(f => f.endsWith('.html')).map(f => path.join(BASE, f));

rootFiles.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  const before = content;
  content = content.replace(
    /(<li><a href="services\/mosquito-control\.html">Mosquito Control<\/a><\/li>)\s*\n\s*<li><a href="services\/mosquito-control\.html">Mosquito Control<\/a><\/li>/g,
    '$1'
  );
  if (content !== before) {
    fs.writeFileSync(f, content, 'utf8');
    console.log('Fixed:', path.basename(f));
  }
});
console.log('Done.');
