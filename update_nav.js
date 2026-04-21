const fs = require('fs');
const path = require('path');

const BASE = 'C:\\Users\\User\\Claude Code website';

const rootFiles = fs.readdirSync(BASE).filter(f => f.endsWith('.html')).map(f => path.join(BASE, f));
const locationFiles = fs.readdirSync(path.join(BASE, 'locations')).filter(f => f.endsWith('.html')).map(f => path.join(BASE, 'locations', f));
const serviceFiles = fs.readdirSync(path.join(BASE, 'services')).filter(f => f.endsWith('.html')).map(f => path.join(BASE, 'services', f));

function updateLocation(content) {
  // Remove flea/mole/armyworm from Lawn Services dropdown
  content = content.replace(
    /\s*<li><a href="\.\.\/services\/flea-tick-control\.html">Flea &amp; Tick Control<\/a><\/li>\s*<li><a href="\.\.\/services\/mole-control\.html">Mole Control<\/a><\/li>\s*<li><a href="\.\.\/services\/armyworm-control\.html">Armyworm Control<\/a><\/li>/g,
    ''
  );
  // Add to Pest Control dropdown
  content = content.replace(
    '<li><a href="../services/perimeter-pest-control.html">Perimeter Pest Control</a></li>',
    `<li><a href="../services/perimeter-pest-control.html">Perimeter Pest Control</a></li>
            <li><a href="../services/flea-tick-control.html">Flea &amp; Tick Control</a></li>
            <li><a href="../services/mole-control.html">Mole Control</a></li>
            <li><a href="../services/armyworm-control.html">Armyworm Control</a></li>
            <li><a href="../services/mosquito-control.html">Mosquito Control</a></li>`
  );
  // Fix footer links too
  content = content.replace(
    /(\s*<li><a href="\.\.\/services\/flea-tick-control\.html">Flea &amp; Tick Control<\/a><\/li>\s*<li><a href="\.\.\/services\/mole-control\.html">Mole Control<\/a><\/li>\s*<li><a href="\.\.\/services\/armyworm-control\.html">Armyworm Control<\/a><\/li>\s*<li><a href="\.\.\/services\/pest-control\.html">Pest Control<\/a><\/li>\s*<li><a href="\.\.\/services\/perimeter-pest-control\.html">Perimeter Pest Control<\/a><\/li>)/g,
    `\n            <li><a href="../services/pest-control.html">Pest Control</a></li>
            <li><a href="../services/perimeter-pest-control.html">Perimeter Pest Control</a></li>
            <li><a href="../services/flea-tick-control.html">Flea &amp; Tick Control</a></li>
            <li><a href="../services/mole-control.html">Mole Control</a></li>
            <li><a href="../services/armyworm-control.html">Armyworm Control</a></li>
            <li><a href="../services/mosquito-control.html">Mosquito Control</a></li>`
  );
  return content;
}

function updateRoot(content) {
  // Remove flea/mole/armyworm from Lawn Services dropdown
  content = content.replace(
    /\s*<li><a href="services\/flea-tick-control\.html">Flea &amp; Tick Control<\/a><\/li>\s*<li><a href="services\/mole-control\.html">Mole Control<\/a><\/li>\s*<li><a href="services\/armyworm-control\.html">Armyworm Control<\/a><\/li>/g,
    ''
  );
  // Add to Pest Control dropdown
  content = content.replace(
    '<li><a href="services/perimeter-pest-control.html">Perimeter Pest Control</a></li>',
    `<li><a href="services/perimeter-pest-control.html">Perimeter Pest Control</a></li>
            <li><a href="services/flea-tick-control.html">Flea &amp; Tick Control</a></li>
            <li><a href="services/mole-control.html">Mole Control</a></li>
            <li><a href="services/armyworm-control.html">Armyworm Control</a></li>
            <li><a href="services/mosquito-control.html">Mosquito Control</a></li>`
  );
  return content;
}

function updateService(content) {
  // Remove flea/mole/armyworm from Lawn Services dropdown
  content = content.replace(
    /\s*<li><a href="flea-tick-control\.html">Flea &amp; Tick Control<\/a><\/li>\s*<li><a href="mole-control\.html">Mole Control<\/a><\/li>\s*<li><a href="armyworm-control\.html">Armyworm Control<\/a><\/li>/g,
    ''
  );
  // Add to Pest Control dropdown
  content = content.replace(
    '<li><a href="perimeter-pest-control.html">Perimeter Pest Control</a></li>',
    `<li><a href="perimeter-pest-control.html">Perimeter Pest Control</a></li>
            <li><a href="flea-tick-control.html">Flea &amp; Tick Control</a></li>
            <li><a href="mole-control.html">Mole Control</a></li>
            <li><a href="armyworm-control.html">Armyworm Control</a></li>
            <li><a href="mosquito-control.html">Mosquito Control</a></li>`
  );
  return content;
}

rootFiles.forEach(f => {
  const original = fs.readFileSync(f, 'utf8');
  const updated = updateRoot(original);
  if (updated !== original) { fs.writeFileSync(f, updated, 'utf8'); console.log('Updated:', f); }
  else { console.log('No change:', f); }
});

locationFiles.forEach(f => {
  const original = fs.readFileSync(f, 'utf8');
  const updated = updateLocation(original);
  if (updated !== original) { fs.writeFileSync(f, updated, 'utf8'); console.log('Updated:', f); }
  else { console.log('No change:', f); }
});

serviceFiles.forEach(f => {
  const original = fs.readFileSync(f, 'utf8');
  const updated = updateService(original);
  if (updated !== original) { fs.writeFileSync(f, updated, 'utf8'); console.log('Updated:', f); }
  else { console.log('No change:', f); }
});

console.log('Done.');
