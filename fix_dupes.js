const fs = require('fs');
const path = require('path');

const BASE = 'C:\\Users\\User\\Claude Code website';
const serviceFiles = fs.readdirSync(path.join(BASE, 'services')).filter(f => f.endsWith('.html')).map(f => path.join(BASE, 'services', f));

serviceFiles.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  // Fix duplicate mosquito entries (relative paths)
  content = content.replace(
    /(<li><a href="mosquito-control\.html">Mosquito Control<\/a><\/li>)\s*\n\s*<li><a href="mosquito-control\.html">Mosquito Control<\/a><\/li>/g,
    '$1'
  );
  // Fix duplicate flea/mole/armyworm/mosquito blocks
  content = content.replace(
    /(<li><a href="flea-tick-control\.html">Flea &amp; Tick Control<\/a><\/li>\s*\n\s*<li><a href="mole-control\.html">Mole Control<\/a><\/li>\s*\n\s*<li><a href="armyworm-control\.html">Armyworm Control<\/a><\/li>\s*\n\s*<li><a href="mosquito-control\.html">Mosquito Control<\/a><\/li>)\s*\n\s*<li><a href="flea-tick-control\.html">Flea &amp; Tick Control<\/a><\/li>\s*\n\s*<li><a href="mole-control\.html">Mole Control<\/a><\/li>\s*\n\s*<li><a href="armyworm-control\.html">Armyworm Control<\/a><\/li>\s*\n\s*<li><a href="mosquito-control\.html">Mosquito Control<\/a><\/li>/g,
    '$1'
  );
  fs.writeFileSync(f, content, 'utf8');
  console.log('Fixed:', f);
});
console.log('Done.');
